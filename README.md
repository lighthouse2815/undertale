# UNDERTALE — bản chạy web độc lập

Trang chính chạy **bytecode và dữ liệu Undertale gốc** bằng runtime mã nguồn mở
[Butterscotch](https://github.com/ButterscotchRunner/Butterscotch). Dự án đã nhập
336 phòng, 1.709 đối tượng, 2.583 sprite, 443 mục âm thanh và toàn bộ logic gốc;
6.272 mục mã GML đã được xuất ra để chỉnh sửa.

Dữ liệu nền, 212 tệp âm thanh ngoài và runtime đều đi kèm repository. Khi chạy,
không cần `Undertale-AnkerGames/`, bản cài Undertale hay file thực thi gốc.
`data.win` trong `assets/undertale/` chứa bytecode, bản đồ và tài nguyên nhúng;
logic gốc được thực thi từ đây, không được thay bằng các trận đấu tự viết.

## Chạy

Cần Node.js 18+ và trình duyệt hỗ trợ WebGL 2, WebAssembly JSPI, OPFS (Chrome/Chromium
có JSPI). Bật JavaScript và cho phép trình duyệt lưu dữ liệu của trang.

```bash
npm run dev
```

Mở http://localhost:5173, chờ tải khoảng 150 MB dữ liệu và chọn **CHƠI**.
Tiến trình Undertale được lưu trong OPFS của trình duyệt tại cùng origin;
đổi trình duyệt, địa chỉ hoặc cổng sẽ dùng kho lưu khác.

| Điều khiển | Tác dụng |
| --- | --- |
| ↑ ↓ ← → | Di chuyển, chọn |
| Z / Enter | Xác nhận |
| X / Shift | Hủy, bỏ qua chữ |
| C / Ctrl | Menu |
| F4 / nút Toàn màn hình | Bật/tắt toàn màn hình |
| Giữ Esc | Đóng game theo logic gốc |

Có nút cảm ứng ↑ ↓ ← →, Z, X, C. Bản Dưới Đất trước đây được giữ ở
http://localhost:5173/duoi-dat.html; xem [hướng dẫn Dưới Đất](docs/duoi-dat.md).

## Chỉnh sửa logic gốc

Sửa GML trong `game/code/`, sau đó biên dịch bằng UndertaleModTool:

```bash
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run build:game
```

Server tự ưu tiên `build/undertale/data.win` khi có bản build. Tải lại trang để chơi
logic đã sửa. Dữ liệu nền trong Git được giữ nguyên; mỗi lần build tái áp dụng các
mục GML đã sửa lên dữ liệu nền, kể cả khi hoàn tác source.
Xem [hướng dẫn GML và build](game/README.md).

## Kiểm thử

```bash
npm ci
npm run check
CHROME_PATH="/đường/dẫn/chrome" npm test
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run test:build
```

`check` kiểm tra JavaScript, dữ liệu Dưới Đất, danh mục GML, checksum dữ liệu Undertale
và runtime. Kiểm thử trình duyệt chạy từ bản sao chỉ có các tệp của dự án, không có
thư mục cài game gốc. `test:build` biên dịch GML thật, giải biên dịch để xác nhận,
kiểm tra lỗi cú pháp và hoàn tác.

Butterscotch có thể khác runner GameMaker ở một số hành vi. Việc nhập đủ dữ liệu
không đồng nghĩa đã kiểm thử mọi phòng, trận đấu và cả ba tuyến đến kết thúc;
không khẳng định bản web giống tuyệt đối trong tất cả tình huống.

## Cấu trúc

```
index.html                  trang chạy Undertale
src/undertale.js             tải dữ liệu, lưu OPFS, điều khiển runtime
src/undertale.css            bố cục trang Undertale
assets/undertale/            dữ liệu nền, âm thanh và danh mục tải
game/code/                  6.272 mục GML gốc, chỉnh sửa được
game/resources.json         danh mục 336 phòng và 1.709 đối tượng
game/manifest.json          checksum dữ liệu nền và GML trước chỉnh sửa
scripts/build-game.mjs       biên dịch GML đã sửa bằng UndertaleModTool
vendor/butterscotch/         runtime, mã nguồn và giấy phép upstream
build/undertale/             dữ liệu sau biên dịch (không commit)
duoi-dat.html                bản Dưới Đất trước đây
src/{main,world,battle,...}  logic JavaScript của Dưới Đất
```

## Nguồn và giấy phép

Tài nguyên, nội dung và mã trò chơi được nhập từ bản Undertale do người dùng cung
cấp, giữ quyền sở hữu của tác giả gốc; xem [credit gốc](game/CREDITS.txt).
Butterscotch dùng AGPL-3.0; mã nguồn runtime tại đúng revision và giấy phép các
thư viện được giữ trong [vendor/butterscotch](vendor/butterscotch/README.md).
Font Handjet dùng [SIL Open Font License](assets/fonts/OFL.txt).
