// Chạy trên dữ liệu trống do UndertaleModCli new tạo; không đọc game/data.win gốc.
using System;
using System.IO;
using System.Linq;
using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ImageMagick;
using UndertaleModLib;
using UndertaleModLib.Models;
using UndertaleModLib.Project;
using UndertaleModLib.Util;

class SourceStrings : JsonConverter
{
    readonly UndertaleData data;
    public SourceStrings(UndertaleData value) { data = value; }
    public override bool CanConvert(Type type) => type == typeof(UndertaleString);
    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) => throw new NotSupportedException();
    public override object ReadJson(JsonReader reader, Type type, object existing, JsonSerializer serializer) => reader.Value == null ? null : data.Strings.MakeString((string)reader.Value);
}

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;
var root = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(ScriptPath), ".."));
var output = Environment.GetEnvironmentVariable("UNDERTALE_BUILD_OUTPUT");
var projectFile = Environment.GetEnvironmentVariable("UNDERTALE_BUILD_PROJECT");
if (String.IsNullOrWhiteSpace(output) || String.IsNullOrWhiteSpace(projectFile)) throw new Exception("Thiếu UNDERTALE_BUILD_OUTPUT/UNDERTALE_BUILD_PROJECT.");
var settings = new JsonSerializerSettings { Converters = { new SourceStrings(Data) }, ObjectCreationHandling = ObjectCreationHandling.Replace };
foreach (var item in new (string File, object Target)[] { ("general", Data.GeneralInfo), ("options", Data.Options), ("language", Data.Language) })
    JsonConvert.PopulateObject(File.ReadAllText(Path.Combine(root, "project", item.File + ".json")), item.Target, settings);

// Tạo trước danh mục theo ID gốc: GML có các tham chiếu tài nguyên bằng số.
var order = JObject.Parse(File.ReadAllText(Path.Combine(root, "project/order.json")));
foreach (var prop in order.Properties().Where(p => p.Name != "RoomOrder"))
{
    var list = Data[prop.Name];
    var type = list.GetType().GetGenericArguments()[0];
    list.Clear();
    foreach (string name in prop.Value)
    {
        var asset = (UndertaleNamedResource)Activator.CreateInstance(type);
        asset.Name = Data.Strings.MakeString(name);
        list.Add(asset);
        if (asset is UndertaleCode code) UndertaleCodeLocals.CreateEmptyEntry(Data, code.Name);
    }
}
foreach (var item in JArray.Parse(File.ReadAllText(Path.Combine(root, "project/empty-backgrounds.json"))))
    JsonConvert.PopulateObject(item.ToString(), Data.Backgrounds.ByName((string)item["Name"]), settings);
foreach (string name in order["RoomOrder"])
    Data.GeneralInfo.RoomOrder.Add(new() { Resource = Data.Rooms.ByName(name) });
Data.BuiltinList = new UndertaleModLib.Compiler.BuiltinList(Data);
uint lastObj = Data.GeneralInfo.LastObj, lastTile = Data.GeneralInfo.LastTile;
var roomSources = Directory.EnumerateFiles(Path.Combine(root, "assets/rooms"), "*.json", SearchOption.AllDirectories)
    .Select(file => (Name: Path.GetFileNameWithoutExtension(file), Json: JObject.Parse(File.ReadAllText(file)))).ToArray();
foreach (var source in roomSources)
{
    foreach (var item in source.Json["GameObjects"])
        if ((uint?)item["InstanceID"] is uint id) lastObj = Math.Max(lastObj, id);
    foreach (var item in source.Json["Tiles"])
        if ((uint?)item["InstanceID"] is uint id) lastTile = Math.Max(lastTile, id);
}
Data.GeneralInfo.LastObj = lastObj;
var project = ProjectContext.CreateWithDataFilePaths(FilePath, output, projectFile);
project.Import(Data); // Compiler GML, importer asset và texture packer chính thức.

// Nén PNG không mất dữ liệu bằng ImageMagick đã có trong UndertaleModTool.
foreach (var texture in Data.EmbeddedTextures)
{
    using var png = new MemoryStream();
    texture.TextureData.Image.SavePng(png);
    using var image = new MagickImage(png.ToArray());
    image.Settings.SetDefine(MagickFormat.Png, "compression-level", 9);
    image.Settings.SetDefine(MagickFormat.Png, "compression-filter", 5);
    image.Settings.SetDefine(MagickFormat.Png, "compression-strategy", 0);
    image.Settings.SetDefine(MagickFormat.Png, "exclude-chunk", "date,time");
    texture.TextureData.Image = GMImage.FromPng(image.ToByteArray(MagickFormat.Png32));
}

// Importer tạo ID mới; phục hồi ID khai báo trong JSON và cấp ID cho tile mới.
foreach (var source in roomSources)
{
    var json = source.Json;
    var room = Data.Rooms.ByName((string)json["DataName"] ?? source.Name);
    for (int i = 0; i < room.GameObjects.Count; i++)
    {
        if ((uint?)json["GameObjects"][i]["InstanceID"] is uint id) room.GameObjects[i].InstanceID = id;
        lastObj = Math.Max(lastObj, room.GameObjects[i].InstanceID);
    }
    for (int i = 0; i < room.Tiles.Count; i++)
    {
        room.Tiles[i].InstanceID = (uint?)json["Tiles"][i]["InstanceID"] ?? ++lastTile;
        lastTile = Math.Max(lastTile, room.Tiles[i].InstanceID);
    }
}
Data.GeneralInfo.LastObj = lastObj;
Data.GeneralInfo.LastTile = lastTile;
Console.WriteLine($"Đã biên dịch {Data.Code.Count} GML, {Data.Rooms.Count} phòng từ nguồn rời.");
