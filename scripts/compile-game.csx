// Build chỉ các mục GML đã chỉnh sửa; lỗi biên dịch phải làm CLI trả mã lỗi.
using System;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;
using UndertaleModLib.Compiler;

var patches = JsonConvert.DeserializeObject<Dictionary<string, string>>(
    File.ReadAllText(Environment.GetEnvironmentVariable("UNDERTALE_PATCH_FILE")));
var group = new CodeImportGroup(Data);
foreach (var patch in patches)
    group.QueueReplace(patch.Key, File.ReadAllText(patch.Value));
var result = group.Import();
if (!result.Successful)
    throw new Exception(result.PrintAllErrors(false));
Console.WriteLine("Đã biên dịch " + patches.Count + " mục GML.");
