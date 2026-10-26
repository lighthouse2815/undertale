# Undertale Web — source độc lập

Đây là thư mục ứng dụng chính. Có thể copy nguyên `game/` sang vị trí khác rồi chạy
và chỉnh sửa, không cần repository cha, thư mục cài Undertale hay `data.win` nền.
Cách tổ chức source, asset và bản xuất tham khảo dự án Fear & Hunger Web.

```bash
npm start              # http://localhost:5173
npm run dev            # chạy source như npm start
npm run check          # JavaScript, GML, JSON và liên kết tài nguyên
npm run build:game     # dựng game từ GML/JSON/PNG/WAV và cấu hình
npm run build:game -- --force # biên dịch lại dù đã có cache
npm run build          # ../dist/undertale-web/
```

Source cần Node.js 18+ và UndertaleModTool CLI có project importer (đã kiểm thử
với 0.9.2.0) để build lần đầu hoặc sau khi sửa nguồn. Bản xuất có sẵn dữ liệu
chạy chỉ cần Node.js, không cần CLI hay npm install. Trình duyệt phải có WebGL 2,
WebAssembly JSPI và OPFS (Chrome/Chromium hỗ trợ JSPI). Chờ tải rồi bấm CHƠI.
Save nằm trong OPFS theo địa chỉ/cổng trình duyệt; giữ origin để tiếp tục save.

## Sửa gì, mở đâu?

| Nội dung | Vị trí |
| --- | --- |
| Di chuyển nhân vật | `code/gml_Object_obj_mainchara_Step_0.gml` |
| Khởi tạo chỉ số và hành trình | `code/gml_Script_SCR_GAMESTART.gml` |
| Lưu game | `code/gml_Script_scr_save.gml` |
| Hội thoại tiếng Anh | `code/gml_Script_textdata_en.gml` |
| Logic NPC, trùm, trận đấu và đạn | Các sự kiện `code/gml_Object_*.gml` |
| 336 phòng: tile, vị trí đối tượng, view, mã khởi tạo | `assets/rooms/*.json` |
| 1.709 đối tượng: sprite, cha, va chạm, sự kiện GML | `assets/objects/*.json` |
| 2.583 sprite: PNG từng khung, mask và điểm neo | `assets/sprites/<tên>/` |
| 197 nền có ảnh | `assets/backgrounds/<tên>/` |
| 443 âm thanh: 227 WAV, 216 OGG, âm lượng và cao độ | `assets/sounds/<tên>/` |
| 20 font bitmap: ảnh và bảng glyph | `assets/fonts/<tên>/` |
| 45 đường đi và 238 khai báo script | `assets/paths/`, `assets/scripts/` |
| Giao diện web, bàn phím và nút cảm ứng | `web/app.mjs`, `web/undertale.css`, `web/style.css` |
| Runtime và nguồn C của Butterscotch | `vendor/butterscotch/` |
| Biên dịch GML, nhập tài nguyên và đóng gói web | `tools/` (cần để build từ nguồn) |
| Cấu hình GameMaker, cửa sổ, tùy chọn | `project/general.json`, `project/options.json` |
| ID tài nguyên và thứ tự chạy phòng | `project/order.json` |

Có **6.333 khung sprite PNG**; tổng **9.141 PNG** gồm cả mask, nền và font.
52 mục nền không có ảnh được khai báo trong `project/empty-backgrounds.json`.
Không tạo ảnh giả cho các mục trống này.
`assets/` dùng định dạng project chính thức của UndertaleModTool, với các file
JSON có trường `$type`. Asset rời là nơi sửa chính; không cần tự trích từ data.win.

## Quy trình phát triển

Giao diện web có thể sửa rồi tải lại trang. Khi sửa GML, JSON, PNG hay âm thanh,
chạy `build:game` hoặc tải lại trang qua server để dựng lại dữ liệu GameMaker.
Khi đổi kích thước/số khung sprite, sửa cả JSON và mask tương ứng.

Ví dụ: sửa `Caption` trong `assets/rooms/room_area1.json`, hoặc thay
`assets/sprites/spr_maincharad/spr_maincharad_0.png`, rồi biên dịch:

```bash
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run build:game
```

Công cụ: [UndertaleModTool CLI](https://github.com/UnderminersTeam/UndertaleModTool).
Có thể dùng file thực thi `UndertaleModCli` trên PATH hoặc đặt `UNDERTALE_MOD_CLI`.
DLL cần phiên bản .NET phù hợp. Cần CLI cho cả lần build đầu tiên từ source;
chạy gói đã xuất hoặc dùng lại build khớp checksum không cần CLI.

Build dùng `UndertaleModCli new` tạo game trống, nạp cấu hình và tạo danh mục
tài nguyên theo `project/order.json`, sau đó dùng compiler/importer/texture
packer chính thức cho toàn bộ nguồn. PNG atlas được nén không mất dữ liệu bằng
ImageMagick có sẵn trong CLI. Kết quả nằm trong `build/undertale/data.win`;
checksum nguồn và bản build ở `build/undertale/source.json` giúp tránh build lại
khi không cần. Lỗi nguồn không ghi đè bản build thành công trước đó.

Thêm GML/asset mới thì thêm tên vào cuối danh mục tương ứng trong
`project/order.json`; tránh đổi vị trí mục cũ vì GML còn tham chiếu ID bằng số.
`RoomOrder` là thứ tự chuyển phòng của runner. Các mục không có ảnh nằm ở
`project/empty-backgrounds.json`, không cần PNG.

JSON phòng có `InstanceID` cho từng instance và tile. Giữ ID khi sửa hoặc di
chuyển mục cũ; khi thêm mục mới có thể bỏ `InstanceID` để build tự cấp ID không
trùng. Cờ uint64 lớn được lưu dưới dạng chuỗi để trình sửa JSON không làm tròn số.
Hoàn tác nguồn rồi build lại sẽ hoàn tác dữ liệu chạy, không cần bản nền cũ.

## Bản web xuất riêng

`npm run build` tạo `../dist/undertale-web/`. Gói chứa source, asset rời, công cụ
build, cấu hình project, runtime và dữ liệu chạy đã biên dịch. Không kèm file nền
hay đường dẫn tới bản cài gốc.

Có thể copy gói sang máy khác và chạy `npm start` ngay trong đó, hoặc phục vụ toàn
bộ bằng hosting HTTP(S), kể cả dưới đường dẫn con. `runtime.json` và
`runtime/game.win` được tạo cho hosting tĩnh; không mở trực tiếp qua `file://`.
Có thể tiếp tục sửa code/asset và build từ gói đã copy bằng CLI. `runtime/source.json`
cho phép dùng lại dữ liệu chạy của bản xuất nếu nguồn chưa thay đổi.

## Nguồn và giới hạn kiểm thử

Nội dung, GML và tài nguyên vẫn thuộc tác giả Undertale; xem `CREDITS.txt`.
Butterscotch dùng AGPL-3.0, có mã nguồn và giấy phép tại `vendor/butterscotch/`.
Font Handjet của giao diện dùng OFL trong `assets/ui/fonts/`.

Runtime có thể khác runner GameMaker ở một số hành vi. Test kiểm tra source,
đóng gói, intro, đặt tên, di chuyển/va chạm, lưu/nạp, cảm ứng và trận Toriel;
chưa khẳng định đã kiểm thử mọi nhánh và cả ba tuyến đến kết thúc.
