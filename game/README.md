# Undertale Web — source độc lập

Đây là thư mục ứng dụng chính. Có thể copy nguyên `game/` sang vị trí khác rồi chạy
và chỉnh sửa, không cần repository cha hoặc thư mục cài Undertale gốc.
Cách tổ chức source, asset và bản xuất tham khảo dự án Fear & Hunger Web.

```bash
npm start              # http://localhost:5173
npm run dev            # chạy source như npm start
npm run check          # JavaScript, GML, JSON và liên kết tài nguyên
npm run build:game     # biên dịch GML/JSON/PNG/WAV đã sửa
npm run build          # ../dist/undertale-web/
```

Chạy web chỉ cần Node.js 18+, không cần npm install. Trình duyệt phải có WebGL 2,
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

Có **6.333 khung sprite PNG**; tổng **9.141 PNG** gồm cả mask, nền và font.
52 mục nền không có ảnh của bản gốc vẫn được giữ trong dữ liệu nền;
danh sách trong `resources.json`. Không tạo ảnh giả cho các mục trống này.
`assets/` dùng định dạng project chính thức của UndertaleModTool, với các file
JSON có trường `$type`. Asset rời là nơi sửa chính; không cần tự trích từ data.win.

## Quy trình phát triển

Giao diện web và tệp OGG ngoài có thể sửa rồi tải lại trang. Thay đổi GML, JSON,
PNG và âm thanh nhúng cần chạy `build:game` để đưa vào dữ liệu GameMaker.
Khi đổi kích thước/số khung sprite, sửa cả JSON và mask tương ứng.

Ví dụ: sửa `Caption` trong `assets/rooms/room_area1.json`, hoặc thay
`assets/sprites/spr_maincharad/spr_maincharad_0.png`, rồi biên dịch:

```bash
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run build:game
```

Công cụ: [UndertaleModTool CLI](https://github.com/UnderminersTeam/UndertaleModTool).
Có thể dùng file thực thi `UndertaleModCli` trên PATH hoặc đặt `UNDERTALE_MOD_CLI`.
DLL cần phiên bản .NET phù hợp. Chỉ cần công cụ này khi biên dịch thay đổi, không
cần để chơi hay đóng gói source nguyên bản.

Build dùng importer chính thức, chỉ nhập những asset/GML thay đổi lên
`base/data.win` rồi ghi `build/undertale/data.win`. Server tự dùng bản đã biên dịch;
tải lại trang để thấy thay đổi. Lỗi biên dịch không ghi đè bản thành công trước đó.
Hoàn tác source rồi build lại sẽ hoàn tác hành vi tương ứng.

`base/data.win`, `manifest.json` và `asset-baseline.json` là nền/checksum khi nhập,
không chỉnh tay. Chúng giữ các dữ liệu VM và mục chưa thay đổi một cách nguyên vẹn.
Mã GML, ảnh, âm thanh và dữ liệu phòng/đối tượng đã có file rời để phát triển.

## Bản web xuất riêng

`npm run build` tạo `../dist/undertale-web/`. Gói chứa source, asset rời, công cụ
build, runtime và dữ liệu chạy đã biên dịch. Không chứa đường dẫn tới bản cài gốc.

Có thể copy gói sang máy khác và chạy `npm start` ngay trong đó, hoặc phục vụ toàn
bộ bằng hosting HTTP(S), kể cả dưới đường dẫn con. `runtime.json` và
`runtime/game.win` được tạo cho hosting tĩnh; không mở trực tiếp qua `file://`.
Có thể tiếp tục sửa code/asset và build từ gói đã copy.

## Nguồn và giới hạn kiểm thử

Nội dung, GML và tài nguyên vẫn thuộc tác giả Undertale; xem `CREDITS.txt`.
Butterscotch dùng AGPL-3.0, có mã nguồn và giấy phép tại `vendor/butterscotch/`.
Font Handjet của giao diện dùng OFL trong `assets/ui/fonts/`.

Runtime có thể khác runner GameMaker ở một số hành vi. Test kiểm tra source,
đóng gói, intro, đặt tên, di chuyển/va chạm, lưu/nạp, cảm ứng và trận Toriel;
chưa khẳng định đã kiểm thử mọi nhánh và cả ba tuyến đến kết thúc.
