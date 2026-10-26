// Xuất cấu hình và ID cần để dựng lại game từ nguồn, không giữ dữ liệu nhị phân nền.
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UndertaleModLib.Models;

class SourceStrings : JsonConverter
{
    public override bool CanConvert(Type type) => type == typeof(UndertaleString);
    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) => writer.WriteValue(((UndertaleString)value)?.Content);
    public override object ReadJson(JsonReader reader, Type type, object existing, JsonSerializer serializer) => throw new NotSupportedException();
}

var root = Path.GetFullPath(Environment.GetEnvironmentVariable("UNDERTALE_SOURCE_OUT") ?? Path.Combine(Path.GetDirectoryName(ScriptPath), ".."));
// Những danh mục này không có trong bản Undertale đang nhập. Không âm thầm bỏ dữ liệu mới.
if (Data.Extensions.Count != 0 || Data.AudioGroups.Count != 0 || Data.Shaders.Count != 0 ||
    Data.Timelines.Count != 0 || Data.GlobalInitScripts.Count != 0 || Data.Code.Any(c => c.WeirdLocalFlag) ||
    Data.Options.BackImage.Texture != null || Data.Options.FrontImage.Texture != null || Data.Options.LoadImage.Texture != null)
    throw new Exception("Bản game có loại dữ liệu chưa được hỗ trợ bởi bộ xuất project này.");

var serializer = JsonSerializer.Create(new JsonSerializerSettings { Converters = { new SourceStrings() } });
Directory.CreateDirectory(Path.Combine(root, "project"));
void Save(string path, object value) => File.WriteAllText(Path.Combine(root, path), JsonConvert.SerializeObject(value, Formatting.Indented, new SourceStrings()) + "\n");
var general = new JObject();
foreach (var prop in Data.GeneralInfo.GetType().GetProperties().Where(p => p.CanRead && p.CanWrite && p.Name != "RoomOrder"))
{
    var value = prop.GetValue(Data.GeneralInfo);
    general[prop.Name] = value is ulong wide && wide > 9007199254740991
        ? new JValue(wide.ToString(CultureInfo.InvariantCulture)) : JToken.FromObject(value, serializer);
}
Save("project/general.json", general);
Save("project/options.json", Data.Options);
Save("project/language.json", Data.Language);
var order = new Dictionary<string, object>();
foreach (var name in new[] { "Sprites", "Backgrounds", "Sounds", "Paths", "Scripts", "Fonts", "GameObjects", "Rooms", "Code" })
    order[name] = Data[name].Cast<UndertaleNamedResource>().Select(a => a.Name.Content).ToArray();
order["RoomOrder"] = Data.GeneralInfo.RoomOrder.Select(r => r.Resource.Name.Content).ToArray();
Save("project/order.json", order);
Save("project/empty-backgrounds.json", Data.Backgrounds.Where(b => b.Texture == null).Select(b => new {
    Name = b.Name.Content, b.Transparent, b.Smooth, b.Preload
}));
foreach (var room in Data.Rooms)
{
    string path = Path.Combine("assets/rooms", room.Name.Content + ".json");
    var json = JObject.Parse(File.ReadAllText(Path.Combine(root, path)));
    for (int i = 0; i < room.GameObjects.Count; i++) json["GameObjects"][i]["InstanceID"] = room.GameObjects[i].InstanceID;
    for (int i = 0; i < room.Tiles.Count; i++) json["Tiles"][i]["InstanceID"] = room.Tiles[i].InstanceID;
    // Giữ mảng tile trên một dòng theo serializer project chính thức.
    json["Tiles"] = new JRaw(json["Tiles"].ToString(Formatting.None));
    Save(path, json);
}
Console.WriteLine("Đã xuất cấu hình, thứ tự tài nguyên và ID instance/tile vào nguồn project.");
