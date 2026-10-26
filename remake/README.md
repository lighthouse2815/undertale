# Undertale — viết lại bằng JavaScript

Mục tiêu: giữ nội dung, hình ảnh và cách chơi Undertale, chuyển bộ chạy và
gameplay thành mã JavaScript chỉnh sửa trực tiếp. Dùng Phaser 3.90.0 (MIT) cho
hiển thị, tải ảnh, bàn phím và co giãn canvas. Không dùng Butterscotch, WASM,
GameMaker VM, file `.win` hay thực thi GML trong bản viết lại.

## Phạm vi đã thực hiện

- Dựng nền và tile của phòng đầu `room_area1` từ JSON/PNG gốc.
- Mở đầu theo từng khung gốc, logo tiêu đề và nhập tên nhân vật tối đa 6 ký tự.
- Nhân vật bốn hướng, animation, bước 3 pixel ở 30 Hz, camera cuộn theo phòng.
- Nối hai chiều `room_area1` ↔ `room_area1_2` ↔ `room_ruins1` ↔ `room_ruins2` ↔ `room_ruins3` ↔ `room_ruins4` ↔ `room_ruins5` ↔ `room_ruins6`, dùng vùng cửa và marker gốc; giữ hướng nhìn, khóa di chuyển khi mờ chuyển phòng.
- Cảnh công tắc tại `room_ruins2`: Toriel chào, đi theo hai path JSON gốc, đạp bốn nút sàn, bật công tắc tường và mở cửa; giải thích xong đặt `plot = 3`, đợi Frisk tới gần rồi rời phòng. Quay lại hoặc nạp tiến trình giữ cửa mở. Biển hướng dẫn dùng lời thoại gốc.
- Hai công tắc tại `room_ruins3`: Toriel đi trước và nhắc khi được hỏi; công tắc đầu gỡ tường chặn, công tắc sau hạ gai và rung màn hình. Hỗ trợ công tắc sai, ghi chú, hướng tương tác, va chạm Toriel đứng chờ và nạp lại ở các mốc `plot = 4 / 4.5 / 5`. Có lời thoại và ẩn ghi chú theo tên FRISK; các hệ thống Hard Mode khác chưa chuyển.
- Phòng Dummy: Toriel hướng dẫn rồi đi theo path gốc, nhắc khi được hỏi; Dummy có 15 HP, ACT Check/Talk, FIGHT theo vị trí thanh đánh, MERCY Spare/Flee. Dummy không bắn đạn; hết tám lượt có thể bỏ đi. Bốn kết quả có lời phản hồi Toriel riêng, cập nhật cờ 10–14 và mốc `plot = 7`; lưu/nạp giữ Dummy còn hay mất.
- Phòng gai `room_ruins5`: Toriel đi trước, tăng/giảm tốc theo khoảng cách và dừng chờ; trò chuyện rồi nắm tay dẫn qua gai theo path gốc, đặt `plot = 7.5`, sau cùng `8`. Gai an toàn đổi hình khi chạm, gai chặn và tường tiến trình có va chạm.
- Hành lang `room_ruins6`: năm trang bài học rồi Toriel chạy đi, tạo tường chặn lối về và đặt `plot = 8.5`. Có tương tác Toriel sau cột; đi tới cuối phòng khiến Toriel trở lại theo path gốc, đặt `plot = 9`, giao bốn mục điện thoại và ghi snapshot tạm riêng, không ghi đè SAVE. Bảy cuộc gọi khi đứng chờ dùng bộ đếm 30 Hz, dừng khi đọc thoại, giữ cờ 37, tiếng chó và cuộc gọi cuối lặp lại. Flowey ở đầu hành lang chỉ chìm khi vào vùng camera, tăng cờ 9. Quay lại không lặp bài học.
- Froggit theo kịch bản ở phòng gai có 20 HP, ACT Check/Compliment/Threat, FIGHT và MERCY. Toriel can thiệp rồi Froggit chạy đi sau hành động không kết liễu. Cờ 30 ngăn gặp lại; thưởng GOLD/XP, số quái bị đánh bại và LV được giữ qua lưu/nạp. Đây là trận hướng dẫn riêng, khác encounter Froggit ngẫu nhiên.
- Menu ngoài trận mở bằng C/Ctrl, dùng Z/Enter xác nhận và X/Shift quay lại; giữ vị trí con trỏ chính, chặn khi đang thoại/cảnh khóa và khi cờ 17 bật. ITEM rỗng có màu xám và không mở. STAT hiện tên, LV, HP, AT/DF, EXP/NEXT, GOLD và trang bị ban đầu, đổi vị trí bảng nhỏ theo vị trí Frisk. Font nhỏ, bitmap, con trỏ và âm thanh gốc tải lúc mở menu. NPC vẫn di chuyển/dừng chờ, bộ đếm cuộc gọi không tăng khi xem menu.
- CELL chỉ hiện sau khi nhận điện thoại. Hỗ trợ Say Hello qua bốn biến thể rồi lặp biến thể cuối; About Yourself, Call Her Mom và Flirt với thứ tự hội thoại, chân dung theo từng trang, cờ 40–42 và xóa mục dùng xong theo mã gốc. Giữ nhánh bận khi chó cầm điện thoại, sau đó gọi lại được; lời thoại không trả lời ở mốc `plot >= 19.9`. Danh sách mục và cờ được lưu/nạp; trang chỉ chứa lệnh đổi mặt được chuyển tự động, không bắt xác nhận trang trống.
- Savepoint đầu Ruins hồi HP, hiện lời thoại gốc rồi mở Save/Return; X hoặc Return giữ file cũ, Save hiện xác nhận khi ghi thành công. Menu dùng font bitmap, con trỏ trái tim và âm thanh gốc.
- Đối tượng nhìn thấy và vùng đọc được lấy từ object JSON; Z mở hộp thoại theo đối tượng và khóa di chuyển tạm thời.
- Phòng rơi xuống không vẽ trùng Frisk; chỉ cho đọc hoa sau mốc mở đầu và hiện Toriel ở mốc `plot = 25` của tuyến thường. Lời thoại hoa dùng nội dung gốc. Phòng savepoint Ruins không có trận ngẫu nhiên.
- Trận Dummy dùng ảnh, nút lệnh và nội dung gốc, ITEM rỗng không phát kẹo miễn phí. Froggit/Whimsun vẫn là nền kiểm thử chiến đấu sơ bộ với đạn chưa chuyển đúng; `__remake.startBattle()` mở Dummy, có thể truyền tên quái để kiểm thử.
- Save/nạp phiên bản đầu lưu tên, phòng, vị trí, HP, LV, XP, GOLD, số quái bị đánh bại, thời gian chơi, danh sách điện thoại và mốc cốt truyện qua localStorage; `scene.saveGame()` và `scene.restoreGame()` dùng chung format, đọc được file trước khi thêm metadata.
- Vật cản chữ nhật dài/cao và mask PNG của bốn góc chéo.
- Bàn phím, cảm ứng, thả phím khi mất tiêu điểm, toàn màn hình.
- Tải JSON và PNG của phòng khi mở; giữ cache trong phiên chơi.
- Đóng gói hosting tĩnh, chạy dưới đường dẫn con, không cần compiler GML.

**Đã chuyển một phần mở đầu đến hành lang Ruins, chưa phải Undertale đầy đủ.**
Chưa chuyển sự kiện từ `room_ruins7`, các cửa ngoài chuỗi phòng trên, hội thoại đầy đủ, cảnh mở đầu Flowey và các cảnh Toriel khác, inventory/trang bị, các mục điện thoại sau Toriel và menu đầy đủ,
ACT/ITEM/MERCY theo từng quái, toàn bộ trạng thái lưu/nạp và menu Continue, những khu vực và nhánh kết thúc khác.
Va chạm chéo hiện dùng mask để chặn; hành vi trượt dọc góc của code gốc chưa được chuyển.
Các đối tượng/sự kiện GML trong phòng không được tự động coi là đã hỗ trợ.
Hộp thoại hiện hiển thị cả trang; chưa chuyển hiệu ứng gõ từng chữ, nhịp ngắt và hoạt hình chân dung.
Trận Dummy chưa chuyển đầy đủ âm nhạc, hoạt hình tan bụi khi bị đánh bại và chuyển cảnh vào trận;
inventory và các vũ khí ngoài nhánh sát thương ban đầu còn phải chuyển.
Hai trận hướng dẫn chưa có đầy đủ hoạt hình sát thương, tan bụi, nhạc và chuyển cảnh gốc;
trạng thái lưu giữa lúc đang nắm tay qua gai chưa được hỗ trợ.
Trang bị STAT hiện theo Stick/Bandage ban đầu; chưa hỗ trợ đổi đồ, nhánh cuộc gọi khi đang giữ vật phẩm Annoying Dog và lớp kính chân dung tại nhà Toriel.
Nhạc cảnh hành lang chưa chuyển; snapshot tạm đã ghi riêng nhưng chưa có luồng nạp sau Game Over.

Cảnh công tắc đối chiếu `obj_torieltrigger1`, `obj_toroverworld3`,
`obj_floorswitch1`, `obj_wallswitchcut1` và `obj_ruinsdoor1` trong `game/code/`.
Nội dung lấy từ `SCR_TEXT` mục 202/203 và `obj_readable_room1_65`;
đường đi đọc từ `path_torielwalk2`, `path_torielwalk2_2` và `path_walkup` trong `game/assets/paths/`.
Phòng hai công tắc đối chiếu `obj_torieltrigger2`, `obj_plotswitch1/2`, `obj_plotwall1`,
`obj_torinteractable1/2`, `obj_readable_switch1`, `obj_spikes_room` và `obj_shaker`;
đường đi dùng `path_torielwalk3`, `path_torielwalk3_2`, `path_walkright`.
Phòng Dummy đối chiếu `obj_torieltrigger3`, `obj_torinteractable4`, `obj_dummy1`,
`obj_dummymonster`, `scr_monstersetup`, `scr_runaway`, `scr_attackcalc` và `obj_targetchoice`;
đường đi dùng `path_torielwalk4`, `path_torielwalk4_2`; nội dung lấy từ `SCR_TEXT` mục 211/212/214/215 và `obj_dummymonster`.
Phòng gai đối chiếu `obj_toroverworld5/6`, `obj_torhandhold1`, `obj_encountertrigger1`,
`obj_fakefroggit`, `obj_plotwall2`, `obj_spiketile1/2`; đường đi dùng `path_torielwalk5`,
`path_torielwalk5_2` và `path_froghead`; lời thoại lấy từ `SCR_TEXT` mục 216–218 và `obj_fakefroggit`.

Hành lang đối chiếu `obj_toroverworld7`, `obj_torinteractable6`, `obj_torieltrigger4`,
`obj_plotwall3`, `obj_tordogcall`, `obj_stalkerflowey` và `scr_tempsave`; đường đi dùng
`path_torielwalk6`, `path_walkright`; lời thoại lấy từ `SCR_TEXT` mục 219–221 và `obj_tordogcall`.

Menu/điện thoại đối chiếu `obj_mainchara` User2, `obj_overworldcontroller`, `scr_itemuseb` mục 201–205,
`SCR_TEXT` mục 1501–1508, `scr_phonename`, `scr_phoneshift`, `scr_levelup` và chân dung Toriel.

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
| `src/field-menu.mjs` | Menu ngoài trận, STAT và danh sách CELL |
| `src/phone.mjs` | Cuộc gọi Toriel, thay đổi danh sách và cờ hội thoại |
| `src/phone.json` | Nhãn menu và các nhánh lời thoại điện thoại gốc |
| `src/fonts.mjs` | Dùng chung metric font bitmap và atlas đổi màu cho Canvas |
| `src/levels.mjs` | Ngưỡng EXP dùng chung cho chiến đấu và STAT |
| `src/save.mjs` | Đọc/ghi tiến trình qua localStorage |
| `src/ruins-tutorial.mjs` | Cảnh Toriel biểu diễn công tắc, đường đi và mốc cốt truyện |
| `src/ruins-tutorial.json` | Bảy trang lời thoại gốc của cảnh công tắc và biển hướng dẫn |
| `src/ruins-switches.mjs` | Hai công tắc, Toriel hướng dẫn và thay đổi chướng ngại ở phòng kế |
| `src/ruins-switches.json` | Lời thoại và ghi chú của phòng hai công tắc |
| `src/npc.mjs` | Theo path JSON và vùng va chạm NPC |
| `src/dummy-lesson.mjs` | Cảnh hướng dẫn và phản hồi Toriel trong phòng Dummy |
| `src/dummy-battle.mjs` | Trận Dummy và bốn kết quả theo mã gốc |
| `src/dummy-lesson.json` | Lời thoại gốc của bài học và trận Dummy |
| `src/spike-guide.mjs` | Toriel đi trước, dừng chờ, dẫn qua gai và encounter một lần |
| `src/tutorial-froggit.mjs` | Trận Froggit theo kịch bản, Toriel can thiệp và phần thưởng |
| `src/spike-guide.json` | Lời thoại gốc của phòng gai và trận Froggit theo kịch bản |
| `src/corridor-lesson.mjs` | Bài học hành lang, Toriel giao điện thoại, cuộc gọi chờ và Flowey |
| `src/corridor-lesson.json` | Lời thoại gốc trong hành lang và bảy cuộc gọi |
| `server.mjs` | Phục vụ mã và tài nguyên rời khi phát triển/chạy gói xuất |
| `build.mjs` | Đóng gói mã, Phaser, giấy phép và tài nguyên rời |

Chuyển tiếp theo: intro/tiêu đề/đặt tên → hội thoại và chuyển phòng → chuỗi sự
kiện Ruins → chiến đấu/ACT/ITEM/MERCY → lưu/nạp → Snowdin, Waterfall, Hotland,
CORE, New Home → các tuyến và kết thúc. Mỗi hệ thống phải có kiểm thử hành vi;
render được một phòng không đồng nghĩa đã chuyển gameplay của phòng đó.
