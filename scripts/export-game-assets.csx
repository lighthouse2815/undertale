// Xuất source tài nguyên bằng serializer chính thức của UndertaleModTool.
using System;
using System.IO;
using UndertaleModLib.Project;

var output = Environment.GetEnvironmentVariable("UNDERTALE_SOURCE_OUT");
if (String.IsNullOrWhiteSpace(output)) throw new Exception("Thiếu UNDERTALE_SOURCE_OUT.");
output = Path.GetFullPath(output);
var project = new ProjectContext(Data, FilePath, Path.Combine(output, "compiled.win"),
    Path.Combine(output, "project.json"), "UNDERTALE Web");
foreach (var asset in Data.Sprites) project.MarkAssetForExport(asset);
foreach (var asset in Data.Backgrounds) project.MarkAssetForExport(asset);
foreach (var asset in Data.Sounds) project.MarkAssetForExport(asset);
foreach (var asset in Data.Fonts) project.MarkAssetForExport(asset);
foreach (var asset in Data.Paths) project.MarkAssetForExport(asset);
foreach (var asset in Data.Scripts) project.MarkAssetForExport(asset);
foreach (var asset in Data.GameObjects) project.MarkAssetForExport(asset);
foreach (var asset in Data.Rooms) project.MarkAssetForExport(asset);
project.Export(true);
Console.WriteLine("Đã xuất sprite, nền, âm thanh, font, đường đi, script, đối tượng và phòng vào " + output);
