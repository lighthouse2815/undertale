# Dữ liệu và logic Undertale

`assets/undertale/` chứa dữ liệu nền `data.win`, `credits.txt` và toàn bộ 212 tệp âm thanh ngoài
được nhập từ bản game do người dùng cung cấp. Sprite, font, âm thanh nhúng, bản đồ,
đối tượng và bytecode gốc nằm trong dữ liệu nền; không cần bản cài Undertale khi chạy.
`resources.json` liệt kê 336 phòng và 1.709 đối tượng để tra cứu theo tên và ID.
`CREDITS.txt` giữ thông tin tác giả từ bản game.

## Chỉnh sửa logic

`code/` chứa toàn bộ 6.272 mục mã GML được giải biên dịch bằng UndertaleModTool.
120 tệp trống tương ứng với các mục không có lệnh trong dữ liệu gốc.

Một số điểm bắt đầu:

- `gml_Object_obj_mainchara_Step_0.gml`: di chuyển nhân vật.
- `gml_Script_SCR_GAMESTART.gml`: khởi tạo hành trình.
- `gml_Script_scr_save.gml`: lưu game.
- `gml_Script_textdata_en.gml`: nội dung hội thoại tiếng Anh.
- Các mục `gml_Object_...`: sự kiện của NPC, trận đấu, đạn và cảnh truyện.

Sau khi sửa GML, chạy:

```bash
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run build:game
```

Có thể dùng CLI thực thi trên PATH hoặc đặt `UNDERTALE_MOD_CLI` tới file thực thi.
Nếu dùng DLL, cần .NET tương ứng với phiên bản UndertaleModTool đã cài.
Công cụ chính thức: https://github.com/UnderminersTeam/UndertaleModTool

Build chỉ biên dịch những mục khác hash nền trong `manifest.json`, rồi ghi
`build/undertale/data.win`. Mỗi lần build đều bắt đầu từ dữ liệu nền trong repo;
hoàn tác GML và build lại cũng hoàn tác hành vi. Lỗi biên dịch giữ nguyên bản build
thành công trước đó. Thư mục build không được commit.

`assets/undertale/data.win` là dữ liệu nền bất biến; không sửa trực tiếp khi đang
dùng quy trình biên dịch GML. Có thể mở bản sao bằng UndertaleModTool để nghiên cứu
sprite, phòng, đối tượng và sự kiện.

Kiểm tra dữ liệu và kiểm thử quy trình biên dịch:

```bash
npm run check
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run test:build
```

Tài nguyên và mã trò chơi giữ nguồn gốc từ Undertale; việc chuyển vào repo không
làm thay đổi quyền sở hữu của tác giả gốc. Runtime và các thành phần bên thứ ba có
giấy phép riêng.
