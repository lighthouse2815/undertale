# Undertale — viết lại bằng JavaScript

Mục tiêu: giữ nội dung, hình ảnh và cách chơi Undertale, chuyển bộ chạy và
gameplay thành mã JavaScript chỉnh sửa trực tiếp. Dùng Phaser 3.90.0 (MIT) cho
hiển thị, tải ảnh, bàn phím và co giãn canvas. Không dùng Butterscotch, WASM,
GameMaker VM, file `.win` hay thực thi GML trong bản viết lại.

## Phạm vi đã thực hiện

- Dựng nền và tile của phòng đầu `room_area1` từ JSON/PNG gốc.
- Mở đầu theo từng khung gốc, logo tiêu đề và nhập tên nhân vật tối đa 6 ký tự.
- Nhân vật bốn hướng, animation, bước 3 pixel ở 30 Hz, camera cuộn theo phòng.
- Cửa phải của phòng đầu chuyển sang `room_area1_2`, cửa dưới quay lại và đặt nhân vật tại marker gốc.
- Đối tượng nhìn thấy và vùng đọc được lấy từ object JSON; Z mở hộp thoại theo đối tượng và khóa di chuyển tạm thời.
- Khung chiến đấu đầu tiên: menu FIGHT/ACT/ITEM/MERCY, SOUL, đạn, HP và kết thúc lượt; mở qua `__remake.startBattle()` để kiểm thử engine.
- Save/nạp phiên bản đầu lưu tên, phòng, vị trí và HP qua localStorage; `scene.saveGame()` và `scene.restoreGame()` dùng chung format.
- Vật cản chữ nhật dài/cao và mask PNG của bốn góc chéo.
- Bàn phím, cảm ứng, thả phím khi mất tiêu điểm, toàn màn hình.
- Tải JSON và PNG của phòng khi mở; giữ cache trong phiên chơi.
- Đóng gói hosting tĩnh, chạy dưới đường dẫn con, không cần compiler GML.

**Đây mới là bộ mở đầu, hiển thị và di chuyển ở phòng đầu, chưa phải Undertale đầy đủ.**
Chưa chuyển cửa chuyển phòng, hội thoại đầy đủ, Flowey/Toriel, menu đầy đủ,
ACT/ITEM/MERCY theo từng quái, lưu/nạp, những khu vực và nhánh kết thúc khác.
Va chạm chéo hiện dùng mask để chặn; hành vi trượt dọc góc của code gốc chưa được chuyển.
Các đối tượng/sự kiện GML trong phòng không được tự động coi là đã hỗ trợ.

Bản `game/` hiện tại là bản tham chiếu chạy bằng Butterscotch, vẫn được giữ để
đối chiếu. Không đổi bản công khai thành bản viết lại trước khi chuyển đủ nội dung.

## Chạy và kiểm tra

Tại gốc repository, cài dependency bằng `npm ci`, rồi chạy:

```bash
npm run dev:remake     # http://127.0.0.1:5191
npm run check:remake
CHROME_PATH=/đường/dẫn/chrome npm run test:remake
npm run build:remake   # dist/undertale-remake/
```

Gói đã xuất phục vụ được bằng hosting tĩnh HTTP(S), hoặc chạy
`node server.mjs` trong thư mục xuất. Không cần .NET, UndertaleModTool, bản cài
Undertale hay trình duyệt hỗ trợ JSPI. Các hình ảnh và dữ liệu gốc đi kèm vẫn
thuộc tác giả Undertale; xem `CREDITS.txt` trong gói xuất.

## Cấu trúc mã

| Tệp | Trách nhiệm |
| --- | --- |
| `src/main.mjs` | Vòng lặp phòng, vẽ, camera và điều khiển |
| `src/room-assets.mjs` | Tải dữ liệu và ảnh theo phòng, cache trong phiên |
| `src/movement.mjs` | Di chuyển, animation, va chạm hình chữ nhật/mask |
| `server.mjs` | Phục vụ mã và tài nguyên rời khi phát triển/chạy gói xuất |
| `build.mjs` | Đóng gói mã, Phaser, giấy phép và tài nguyên rời |

Chuyển tiếp theo: intro/tiêu đề/đặt tên → hội thoại và chuyển phòng → chuỗi sự
kiện Ruins → chiến đấu/ACT/ITEM/MERCY → lưu/nạp → Snowdin, Waterfall, Hotland,
CORE, New Home → các tuyến và kết thúc. Mỗi hệ thống phải có kiểm thử hành vi;
render được một phòng không đồng nghĩa đã chuyển gameplay của phòng đó.
