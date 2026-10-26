# Undertale — viết lại bằng JavaScript

Mục tiêu: giữ nội dung, hình ảnh và cách chơi Undertale, chuyển bộ chạy và
gameplay thành mã JavaScript chỉnh sửa trực tiếp. Dùng Phaser 3.90.0 (MIT) cho
hiển thị, tải ảnh, bàn phím và co giãn canvas. Không dùng Butterscotch, WASM,
GameMaker VM, file `.win` hay thực thi GML trong bản viết lại.

## Phạm vi đã thực hiện

- Dựng nền và tile của phòng đầu `room_area1` từ JSON/PNG gốc.
- Mở đầu theo từng khung gốc, logo tiêu đề và nhập tên nhân vật tối đa 6 ký tự.
- Nhân vật bốn hướng, animation, bước 3 pixel ở 30 Hz, camera cuộn theo phòng.
- Nối hai chiều `room_area1` ↔ `room_area1_2` ↔ `room_ruins1` ↔ `room_ruins2` ↔ `room_ruins3` ↔ `room_ruins4`, dùng vùng cửa và marker gốc; giữ hướng nhìn, khóa di chuyển khi mờ chuyển phòng.
- Cảnh công tắc tại `room_ruins2`: Toriel chào, đi theo hai path JSON gốc, đạp bốn nút sàn, bật công tắc tường và mở cửa; giải thích xong đặt `plot = 3`, đợi Frisk tới gần rồi rời phòng. Quay lại hoặc nạp tiến trình giữ cửa mở. Biển hướng dẫn dùng lời thoại gốc.
- Hai công tắc tại `room_ruins3`: Toriel đi trước và nhắc khi được hỏi; công tắc đầu gỡ tường chặn, công tắc sau hạ gai và rung màn hình. Hỗ trợ công tắc sai, ghi chú, hướng tương tác, va chạm Toriel đứng chờ và nạp lại ở các mốc `plot = 4 / 4.5 / 5`. Có lời thoại và ẩn ghi chú theo tên FRISK; các hệ thống Hard Mode khác chưa chuyển.
- Savepoint đầu Ruins hồi HP, hiện lời thoại gốc rồi mở Save/Return; X hoặc Return giữ file cũ, Save hiện xác nhận khi ghi thành công. Menu dùng font bitmap, con trỏ trái tim và âm thanh gốc.
- Đối tượng nhìn thấy và vùng đọc được lấy từ object JSON; Z mở hộp thoại theo đối tượng và khóa di chuyển tạm thời.
- Phòng rơi xuống không vẽ trùng Frisk; chỉ cho đọc hoa sau mốc mở đầu và hiện Toriel ở mốc `plot = 25` của tuyến thường. Lời thoại hoa dùng nội dung gốc. Phòng savepoint Ruins không có trận ngẫu nhiên.
- Nền chiến đấu: FIGHT có thanh đánh/sát thương, ACT Check/Talk, ITEM Monster Candy hồi HP, MERCY, SOUL, đạn, HP và kết thúc lượt; mở qua `__remake.startBattle()` để kiểm thử engine.
- Save/nạp phiên bản đầu lưu tên, phòng, vị trí, HP, LV, thời gian chơi và mốc cốt truyện qua localStorage; `scene.saveGame()` và `scene.restoreGame()` dùng chung format, đọc được file trước khi thêm metadata.
- Vật cản chữ nhật dài/cao và mask PNG của bốn góc chéo.
- Bàn phím, cảm ứng, thả phím khi mất tiêu điểm, toàn màn hình.
- Tải JSON và PNG của phòng khi mở; giữ cache trong phiên chơi.
- Đóng gói hosting tĩnh, chạy dưới đường dẫn con, không cần compiler GML.

**Đây mới là nền tảng mở đầu, chiến đấu và cảnh công tắc đầu Ruins, chưa phải Undertale đầy đủ.**
Chưa chuyển sự kiện tại `room_ruins4`, các cửa ngoài chuỗi phòng trên, hội thoại đầy đủ, Flowey và các cảnh Toriel khác, menu đầy đủ,
ACT/ITEM/MERCY theo từng quái, toàn bộ trạng thái lưu/nạp và menu Continue, những khu vực và nhánh kết thúc khác.
Va chạm chéo hiện dùng mask để chặn; hành vi trượt dọc góc của code gốc chưa được chuyển.
Các đối tượng/sự kiện GML trong phòng không được tự động coi là đã hỗ trợ.
Hộp thoại hiện hiển thị cả trang; chưa chuyển hiệu ứng gõ từng chữ, nhịp ngắt và hoạt hình chân dung.

Cảnh công tắc đối chiếu `obj_torieltrigger1`, `obj_toroverworld3`,
`obj_floorswitch1`, `obj_wallswitchcut1` và `obj_ruinsdoor1` trong `game/code/`.
Nội dung lấy từ `SCR_TEXT` mục 202/203 và `obj_readable_room1_65`;
đường đi đọc từ `path_torielwalk2`, `path_torielwalk2_2` và `path_walkup` trong `game/assets/paths/`.
Phòng hai công tắc đối chiếu `obj_torieltrigger2`, `obj_plotswitch1/2`, `obj_plotwall1`,
`obj_torinteractable1/2`, `obj_readable_switch1`, `obj_spikes_room` và `obj_shaker`;
đường đi dùng `path_torielwalk3`, `path_torielwalk3_2`, `path_walkright`.

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
| `src/save-menu.mjs` | Menu Save/Return, hiển thị file cũ và xác nhận lưu |
| `src/save.mjs` | Đọc/ghi tiến trình qua localStorage |
| `src/ruins-tutorial.mjs` | Cảnh Toriel biểu diễn công tắc, đường đi và mốc cốt truyện |
| `src/ruins-tutorial.json` | Bảy trang lời thoại gốc của cảnh công tắc và biển hướng dẫn |
| `src/ruins-switches.mjs` | Hai công tắc, Toriel hướng dẫn và thay đổi chướng ngại ở phòng kế |
| `src/ruins-switches.json` | Lời thoại và ghi chú của phòng hai công tắc |
| `src/npc.mjs` | Theo path JSON và vùng va chạm NPC |
| `server.mjs` | Phục vụ mã và tài nguyên rời khi phát triển/chạy gói xuất |
| `build.mjs` | Đóng gói mã, Phaser, giấy phép và tài nguyên rời |

Chuyển tiếp theo: intro/tiêu đề/đặt tên → hội thoại và chuyển phòng → chuỗi sự
kiện Ruins → chiến đấu/ACT/ITEM/MERCY → lưu/nạp → Snowdin, Waterfall, Hotland,
CORE, New Home → các tuyến và kết thúc. Mỗi hệ thống phải có kiểm thử hành vi;
render được một phòng không đồng nghĩa đã chuyển gameplay của phòng đó.
