# UNDERTALE — bản chạy web độc lập

Trang chính chạy **bytecode và dữ liệu Undertale gốc** bằng runtime mã nguồn mở
[Butterscotch](https://github.com/ButterscotchRunner/Butterscotch). Dự án đã nhập
336 phòng, 1.709 đối tượng, 2.583 sprite, 443 mục âm thanh và toàn bộ logic gốc;
6.272 mục mã GML đã được xuất ra để chỉnh sửa.

Dữ liệu nền, 212 tệp âm thanh ngoài và runtime đều đi kèm repository. Khi chạy,
không cần `Undertale-AnkerGames/`, bản cài Undertale hay file thực thi gốc.
`game/base/data.win` chứa bytecode, bản đồ và tài nguyên nhúng;
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

Có nút cảm ứng ↑ ↓ ← →, Z, X, C.

## Chỉnh sửa logic gốc

Sửa GML trong `game/code/`, sau đó biên dịch bằng UndertaleModTool:

```bash
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run build:game
```

Sprite PNG, âm thanh WAV/OGG, phòng và đối tượng JSON nằm trong `game/assets/`,
có thể chỉnh sửa trực tiếp rồi chạy cùng lệnh build. Server tự ưu tiên
`game/build/undertale/data.win` khi có bản build. Tải lại trang để chơi thay đổi.
Dữ liệu nền trong Git được giữ nguyên; mỗi lần build tái áp dụng GML và asset
đã sửa lên dữ liệu nền, kể cả khi hoàn tác source.
Xem [hướng dẫn GML và build](game/README.md).

## Đóng gói và chạy độc lập

Thư mục `game/` chứa đủ source, asset và công cụ để copy sang nơi khác rồi chạy
`npm start` ngay trong đó, không cần `npm install` hay repository cha.

```bash
npm run build       # xuất dist/undertale-web/
npm run preview     # chạy gói đã xuất tại http://localhost:5173
```

Gói xuất giữ source chỉnh sửa được, kèm `runtime.json` và `runtime/game.win`
để đưa lên hosting tĩnh HTTP(S), kể cả dưới đường dẫn con. Không mở bằng `file://`.
Build tự biên dịch các thay đổi trước khi đóng gói; cần UndertaleModTool khi
GML hoặc asset nhúng đã được sửa. Thư mục xuất có sẵn phải có marker của công cụ.

## Kiểm thử

```bash
npm ci
npm run check
CHROME_PATH="/đường/dẫn/chrome" npm test
UNDERTALE_MOD_CLI="/đường/dẫn/UndertaleModCli.dll" npm run test:build
```

`check` kiểm tra JavaScript, liên kết asset, danh mục GML,
checksum dữ liệu Undertale và runtime. Kiểm thử trình duyệt chạy trên gói xuất
độc lập, kiểm tra build lại từ bản copy và hosting tĩnh dưới đường dẫn con;
không có thư mục cài game gốc. `test:build` biên dịch GML, JSON phòng, PNG sprite
và WAV thật, đọc lại dữ liệu để xác nhận, kiểm tra lỗi và hoàn tác.

Butterscotch có thể khác runner GameMaker ở một số hành vi. Việc nhập đủ dữ liệu
không đồng nghĩa đã kiểm thử mọi phòng, trận đấu và cả ba tuyến đến kết thúc;
không khẳng định bản web giống tuyệt đối trong tất cả tình huống.

## Cấu trúc

```
game/index.html             trang chạy Undertale
game/server.mjs             server ứng dụng, mặc định cổng 5173
game/web/                   giao diện, tải dữ liệu, lưu OPFS, điều khiển runtime
game/base/data.win          dữ liệu GameMaker nền giữ nguyên
game/assets/                PNG, WAV/OGG, JSON phòng/đối tượng/font/... để sửa
game/code/                  6.272 mục GML gốc, chỉnh sửa được
game/resources.json         danh mục 336 phòng và 1.709 đối tượng
game/manifest.json          checksum dữ liệu nền và GML trước chỉnh sửa
game/tools/                 biên dịch GML/asset và đóng gói web
game/vendor/butterscotch/    runtime, mã nguồn và giấy phép upstream
game/build/undertale/        dữ liệu sau biên dịch (không commit)
dist/undertale-web/          gói web độc lập (không commit)
tests/                      kiểm thử Undertale và server tĩnh dùng trong test
```

## Dọn dẹp và chỉnh sửa về sau

Bản Dưới Đất cũ và tài nguyên riêng của bản đó đã được gỡ khỏi source hiện tại.
Chỉ cần giữ `game/`, các file cấu hình, tài liệu và kiểm thử trong repository
để tiếp tục phát triển. Bản cài `Undertale-AnkerGames/` không còn cần thiết.

`build/`, `game/build/`, `dist/`, cache và báo cáo kiểm thử không đưa lên GitHub.
Có thể xóa các bản build rồi tạo lại bằng `npm run build`; sau khi dọn `dist/`,
cần build lại trước khi chạy `npm run preview`. `node_modules/` cũng không được
commit; dùng `npm ci` để cài lại khi cần chạy kiểm thử.

Giữ nguyên `game/code/`, `game/assets/`, `game/base/`, các manifest và công cụ
trong `game/tools/`: đây là nguồn để sửa logic, hình ảnh, âm thanh và build lại.
Giữ runtime, mã nguồn thư viện và giấy phép trong `game/vendor/` đi kèm dự án.
Bản cũ đã commit vẫn có thể khôi phục từ lịch sử Git.

## Nguồn và giấy phép

Tài nguyên, nội dung và mã trò chơi được nhập từ bản Undertale do người dùng cung
cấp, giữ quyền sở hữu của tác giả gốc; xem [credit gốc](game/CREDITS.txt).
Butterscotch dùng AGPL-3.0; mã nguồn runtime tại đúng revision và giấy phép các
thư viện được giữ trong [game/vendor/butterscotch](game/vendor/butterscotch/README.md).
Font Handjet dùng [SIL Open Font License](game/assets/ui/fonts/OFL.txt).
