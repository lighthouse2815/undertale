// Từ game/: UndertaleModCli load base/data.win --scripts tools/export-game-index.csx
using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

var destination = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(ScriptPath), "../resources.json"));
var resources = new {
    name = Data.GeneralInfo.Name.Content,
    bytecodeVersion = Data.GeneralInfo.BytecodeVersion,
    sounds = Data.Sounds.Count,
    sprites = Data.Sprites.Count,
    backgrounds = Data.Backgrounds.Count,
    emptyBackgrounds = Data.Backgrounds.Where(background => background.Texture == null).Select(background => background.Name.Content),
    scripts = Data.Scripts.Count,
    codeEntries = Data.Code.Count,
    rooms = Data.Rooms.Select((room, id) => new {
        id, name = room.Name.Content, width = room.Width, height = room.Height, fps = room.Speed,
        creationCode = room.CreationCodeId?.Name?.Content
    }),
    objects = Data.GameObjects.Select((obj, id) => new {
        id, name = obj.Name.Content, sprite = obj.Sprite?.Name?.Content
    })
};
Directory.CreateDirectory(Path.GetDirectoryName(destination));
File.WriteAllText(destination, JsonConvert.SerializeObject(resources, Formatting.Indented) + "\n");
Console.WriteLine("Đã xuất danh mục phòng và đối tượng: " + destination);
