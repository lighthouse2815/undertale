# Undertale — viết lại bằng JavaScript

Mục tiêu: giữ nội dung, hình ảnh và cách chơi Undertale, chuyển bộ chạy và
gameplay thành mã JavaScript chỉnh sửa trực tiếp. Dùng Phaser 3.90.0 (MIT) cho
hiển thị, tải ảnh, bàn phím và co giãn canvas. Không dùng Butterscotch, WASM,
GameMaker VM, file `.win` hay thực thi GML trong bản viết lại.

## Phạm vi đã thực hiện

- Dựng nền và tile của phòng đầu `room_area1` từ JSON/PNG gốc.
- Mở đầu theo từng khung gốc, logo tiêu đề và nhập tên nhân vật tối đa 6 ký tự.
- Nhân vật bốn hướng, animation, bước 3 pixel ở 30 Hz, camera cuộn theo phòng.
- Nối hai chiều `room_area1` ↔ `room_area1_2` ↔ `room_ruins1` ↔ `room_ruins2` ↔ `room_ruins3` ↔ `room_ruins4` ↔ `room_ruins5` ↔ `room_ruins6` ↔ `room_ruins7` ↔ `room_ruins7A`, dùng vùng cửa và marker gốc; giữ hướng nhìn, khóa di chuyển khi mờ chuyển phòng.
- Cảnh công tắc tại `room_ruins2`: Toriel chào, đi theo hai path JSON gốc, đạp bốn nút sàn, bật công tắc tường và mở cửa; giải thích xong đặt `plot = 3`, đợi Frisk tới gần rồi rời phòng. Quay lại hoặc nạp tiến trình giữ cửa mở. Biển hướng dẫn dùng lời thoại gốc.
- Hai công tắc tại `room_ruins3`: Toriel đi trước và nhắc khi được hỏi; công tắc đầu gỡ tường chặn, công tắc sau hạ gai và rung màn hình. Hỗ trợ công tắc sai, ghi chú, hướng tương tác, va chạm Toriel đứng chờ và nạp lại ở các mốc `plot = 4 / 4.5 / 5`. Có lời thoại và ẩn ghi chú theo tên FRISK; các hệ thống Hard Mode khác chưa chuyển.
- Phòng Dummy: Toriel hướng dẫn rồi đi theo path gốc, nhắc khi được hỏi; Dummy có 15 HP, ACT Check/Talk, FIGHT theo vị trí thanh đánh, MERCY Spare/Flee. Dummy không bắn đạn; hết tám lượt có thể bỏ đi. Bốn kết quả có lời phản hồi Toriel riêng, cập nhật cờ 10–14 và mốc `plot = 7`; lưu/nạp giữ Dummy còn hay mất.
- Phòng gai `room_ruins5`: Toriel đi trước, tăng/giảm tốc theo khoảng cách và dừng chờ; trò chuyện rồi nắm tay dẫn qua gai theo path gốc, đặt `plot = 7.5`, sau cùng `8`. Gai an toàn đổi hình khi chạm, gai chặn và tường tiến trình có va chạm.
- Hành lang `room_ruins6`: năm trang bài học rồi Toriel chạy đi, tạo tường chặn lối về và đặt `plot = 8.5`. Có tương tác Toriel sau cột; đi tới cuối phòng khiến Toriel trở lại theo path gốc, đặt `plot = 9`, giao bốn mục điện thoại và ghi snapshot tạm riêng, không ghi đè SAVE. Bảy cuộc gọi khi đứng chờ dùng bộ đếm 30 Hz, dừng khi đọc thoại, giữ cờ 37, tiếng chó và cuộc gọi cuối lặp lại. Flowey ở đầu hành lang chỉ chìm khi vào vùng camera, tăng cờ 9. Quay lại không lặp bài học.
- Froggit theo kịch bản ở phòng gai có 20 HP, ACT Check/Compliment/Threat, FIGHT và MERCY. Toriel can thiệp rồi Froggit chạy đi sau hành động không kết liễu. Cờ 30 ngăn gặp lại; thưởng GOLD/XP, số quái bị đánh bại và LV được giữ qua lưu/nạp. Đây là trận hướng dẫn riêng, khác encounter Froggit ngẫu nhiên.
- Menu ngoài trận mở bằng C/Ctrl, dùng Z/Enter xác nhận và X/Shift quay lại; giữ vị trí con trỏ chính, chặn khi đang thoại/cảnh khóa và khi cờ 17 bật. ITEM rỗng có màu xám và không mở. STAT hiện tên, LV, HP, AT/DF, EXP/NEXT, GOLD và trang bị ban đầu, đổi vị trí bảng nhỏ theo vị trí Frisk. Font nhỏ, bitmap, con trỏ và âm thanh gốc tải lúc mở menu. NPC vẫn di chuyển/dừng chờ, bộ đếm cuộc gọi không tăng khi xem menu.
- CELL chỉ hiện sau khi nhận điện thoại. Hỗ trợ Say Hello qua bốn biến thể rồi lặp biến thể cuối; About Yourself, Call Her Mom và Flirt với thứ tự hội thoại, chân dung theo từng trang, cờ 40–42 và xóa mục dùng xong theo mã gốc. Giữ nhánh bận khi chó cầm điện thoại, sau đó gọi lại được; lời thoại không trả lời ở mốc `plot >= 19.9`. Danh sách mục và cờ được lưu/nạp; trang chỉ chứa lệnh đổi mặt được chuyển tự động, không bắt xác nhận trang trống.
- Túi đồ 8 ô có USE/INFO/DROP, con trỏ hai tầng và xóa/đổi món đúng vị trí. Đã chuyển dữ liệu 13 vật phẩm đầu: các món hồi HP, gậy dùng xong nhặt lại, Faded Ribbon và Toy Knife đổi món đang trang bị trở vào túi; STAT và sát thương trận hướng dẫn đọc chỉ số trang bị. Lưu/nạp giữ túi, trang bị và chỉ số, file cũ mặc định túi rỗng với Stick/Bandage. Hai trận hướng dẫn dùng được ITEM thật, hồi HP và tiêu hao một món; ITEM rỗng giữ nguyên lượt.
- Phòng lá `room_ruins7`: cuộc gọi Toriel một lần đưa `plot` lên `9.2`, có nhánh sau chuỗi chó giữ điện thoại và cờ 37; Froggit nhỏ đổi hình, nói chuyện theo cờ tuyến và biến mất nếu đã đánh bại quái. Savepoint có lời thoại và tên khu vực riêng.
- Phòng 8 nối từ cửa C phòng lá: hố dùng mask/scale gốc, chờ 10 frame rồi rơi xuống 400 pixel ở tốc độ 5 pixel/frame, xoay mỗi 4 frame và alpha 0.5. Hai lối lên ẩn Frisk, đi ngược 400 pixel ở 10 pixel/frame; cả hai giữ nguyên x, khóa điều khiển và camera đi theo nhân vật. Có tiếng sàn sập, tiếng rơi và dấu hố. Phòng 9 nối cửa phải, có cột gai, tường `plotwall4` và đá đẩy/lùi 3 pixel mỗi bước. Chạm vùng nút mới chốt đá tại x=240, lùi Frisk 6 pixel, đặt cờ 35 và mở gai/tường. Đá vẫn hiện và chặn tại vị trí mới; chỉ đứng gần không tự đẩy. Lưu/nạp giữ cờ 35. Biển dùng lời gốc về ba trong bốn viên đá.
- Phòng 10 nối từ phòng 9, có vùng sàn sập theo mask trắng/đen, hố lên và cửa hai chiều. Sau lần sập thứ 11, dấu hố biến mất, phát tiếng xác nhận và tắt riêng vùng hố vừa chạm cho tới khi vào lại phòng. Phòng 12 nối tiếp sau Goofyrock: Napstablook đọc ba trang giả ngủ rồi hỏi có dùng lực hay không; No giữ nguyên tiến trình, Yes mở trận. Cheer/Flirt sau màn mũ dẫn tới lời cảm ơn tự động và mờ dần ở `plot = 11`; bỏ chạy cho phép gặp lại, cạn HP khiến ma giải thích không thể chết rồi rời đi. Cờ 36 chỉ bật khi được an ủi; nhánh hết 20 quái Ruins tự bỏ đi theo mã gốc. Phòng 12A có tiếng chuột khi tương tác đúng hướng và không phát chồng, bàn phô mai có va chạm/thoại thường và sau kết thúc. Savepoint đọc lời gốc về chuột lấy phô mai, có nhánh “Determination.” khi hết quái; menu hiển thị tên “Ruins - Mouse Hole” sau khi lưu, giữ file cũ khi Return và hồi HP đúng lúc đọc SAVE. Cửa hai chiều được giữ. Phòng 11 có hai đá thường đẩy/lùi tới nút riêng, giữ cờ 31/32. Goofyrock tự nói khi bị chạm hoặc nhấn Z và đi liên tục theo path gốc: sang phải → lên → xuống rồi tới nút. Câu “Was that helpful?” không tự đẩy tiến trình; đi tới activator mới khiến đá lùi khỏi nút, bật lại gai và dựng tường. Yêu cầu đứng lại đưa đá trở về nút và chốt cờ 33; lời thoại sau đó có nhánh thường/cờ 7. Collider, vùng tương tác và độ sâu đi cùng đá, Frisk nhường đường trong các đoạn khóa. Lưu/nạp giữ ba đá ở vị trí đã chốt.
- Trận Napstablook có 88 HP, nhạc Ghost Fight, Check/Threat/Cheer/Flirt, FIGHT/ITEM/Spare/Flee và Game Over dùng snapshot chung. Đã chuyển hai generator nước mắt, dòng chữ buồn chỉ rung, màn mũ Dapper Blook, hệ số tâm trạng và phản ứng khi dùng hành động khác sau màn mũ. Cạn HP không cộng/trừ EXP, GOLD, số kill hay dân số Ruins; câu “lost 1 experience point” được giữ theo gốc.
- Trận Vegetoid đơn có 72 HP, Check/Devour/Talk/Dinner, hai generator cà rốt/rau và đạn xanh hồi 1 HP cả khi đang bất tử. Dinner cần chạm đạn xanh mới tăng khả năng tha; Devour chỉ thành công khi quái đủ yếu, hồi tối đa 5 HP và không cho EXP. Tha khi còn nguyên HP cho 4G; đánh bại cho 6 EXP/1G và cập nhật số kill/dân số. Tái sử dụng FIGHT/ITEM/MERCY và Game Over của trận thường; đã nối hai Vegetoid ngoài phòng 14, chưa có encounter ngẫu nhiên Vegetoid và Parsnik Hard Mode.
- Phòng 12B có Spider Bake Sale: mua Spider Donut 7G hoặc Spider Cider 18G, kiểm tra thiếu GOLD/túi đầy, cập nhật cờ đóng góp 59 và giữ nguyên tiền/đồ khi từ chối. Đường đi đúng là cửa phải phòng 12 → 12A → 12B; cửa trên phòng 12 ↔ phòng 13 dùng markerX và thời gian chuyển cảnh riêng.
- Phòng 13 có biển quảng cáo, Froggit trong khe tường và ba Froggit nhỏ với lời thoại gốc: phản ứng khi nhấn X, lời nhắc F4 và lựa chọn giữ/bỏ màu vàng rồi đổi sang màu hồng. Trận Froggit/Whimsun đọc cờ màu tên 22, cờ được lưu/nạp. Cuộc gọi bánh của Toriel kích hoạt theo vùng va chạm vô hình, có nhánh thường/cờ 6 và chân dung theo trang; chỉ đặt `plot = 12` khi kết thúc. Flowey xuất hiện phía sau và chìm khi camera nhìn thấy.
- Phòng 14 nối hai chiều với 13 và 15A. Hố xuống dùng mask riêng; ba lối lên phía trên đi 400 pixel, ba lối dưới đi 510 pixel. Biển đọc lời gốc, công tắc mở tường/gai và rung camera ở `plot = 13`. Faded Ribbon dùng túi 8 ô và cờ 100, không mất khi túi đầy; nhặt xong bỏ va chạm. Napstablook hiện theo cờ 36/dân số/tuyến, nói bốn trang rồi mờ dần và đặt cờ 36 thành 2. Hai Vegetoid có va chạm, ngẩng lên 25 frame rồi mở trận thật ở tuyến thường; biến mất trong lần ghé hiện tại và trở lại khi vào lại phòng nếu còn đủ dân số. Lưu/nạp giữ công tắc/Ribbon/trạng thái ma; chưa chuyển Parsnik Hard Mode và encounter ngẫu nhiên của phòng.
- Chuỗi 15A–15D có bốn góc nhìn, cột che công tắc, màu và collider đúng tài nguyên gốc. Ở 15A, các công tắc hỏi Yes/No rồi không đổi plot; có phản ứng riêng khi cờ nhấn 43 vượt 25. 15B/C/D yêu cầu xanh dương/đỏ/xanh lá: Yes đặt plot 14/15/16, phát tiếng click và mở tường/gai; No giữ khóa. Tường ở 15C nằm ngang, B/D thẳng đứng. Công tắc sai làm sàn sập ngay khi tương tác, chờ 30 frame rồi rơi/mờ 20 frame tới 15E; cửa 15E quay về markerX ở 15A. Hai lần sai tại 15B bật lời gợi ý khi vào lại phòng và chạm vùng trigger, tăng cờ 51 để không lặp. Lưu/nạp giữ lời giải và cờ; cửa C/D đã nối hai chiều tới phòng 16, encounter ngẫu nhiên của chuỗi chưa chuyển.
- Nhánh 16 ↔ 17 ↔ 18OLD có các cửa hai chiều. Froggit phòng 17 nói về Toriel với ba nhánh thường/kết thúc/Hard Mode, giữ animation cả khi mở menu; có collider và vùng tương tác theo hướng nhìn, biến mất sau khi đã có kill. Toy Knife dùng vật phẩm 13 và cờ 102, kiểm tra túi đầy, gỡ collider/ảnh sau khi đọc lời nhặt và không xuất hiện lại khi lưu/nạp. Dùng ITEM đổi vũ khí và đưa Stick về đúng ô trong túi. Cửa trên phòng 16 đã nối tới 19; nhạc nền Ruins của phòng 16 còn thiếu.
- Phòng 19 nối hai chiều với 16 bằng markerX và sảnh nhà qua cửa musicfade. Toriel xuất hiện khi chạm trigger ở plot ≤ 16: đi theo path 19, dùng điện thoại và dấu chấm than, chạy theo path tương đối 19_3 tới Frisk; lời chào có ba nhánh HP và hồi đầy máu. Sau bảy trang thoại đặt plot 17 rồi Toriel đi theo path 19_4, biến mất khi chạm toribuster; không lặp khi quay lại/lưu nạp. Có nhạc Ruins/toomuch theo cờ 221 hoặc Reunited theo cờ 7 (ưu tiên), fade/pause khi chuyển sang nhạc Toriel rate .86, fade ngược rồi mở khóa điều khiển; âm thanh được hủy khi rời phòng. Cây có collider và hai lời đọc theo vị trí/cờ tuyến. SAVE dùng lời về căn nhà, nhánh hết quái và tên “Ruins - Home”.
- Sảnh nhà Toriel có lời chào 7 trang thường/8 trang Hard Mode, chân dung theo trang và khóa di chuyển/menu. Đọc xong mới đặt plot 18, Toriel đi path_walkright và bị hủy khi chạm toribuster; vào lại/lưu nạp không lặp. Sách đọc đúng hướng, lan can/mask cầu thang chặn chân, các bậc dịch y ±1 một lần mỗi hướng. Cờ 45 = 1 tạo Toriel sau 2 frame: đi sang phải ở plot < 19, sang trái ở plot ≥ 19 rồi xóa cờ. Nhạc house1/house2 có hai lớp 1/.01; cờ 45 = 4 dùng nhạc Toriel rate .4, cờ 7 ưu tiên Reunited. Có fade nhạc chính qua cửa sân/sảnh khi không ở tuyến kết thúc. Nhạc giữ nguyên hai lớp khi đi qua các phòng nhà đã nối. Đã nối hành lang và phòng Frisk/Asriel: cửa C tới phòng ngủ, đồ chơi/khung ảnh/giày đọc đúng hướng, đèn sáng/tối, path ngủ/thức và giấc mơ theo plot 24/cờ 7, hồi HP, bánh Butterscotch-Cinnamon và Snail Pie Hard Mode với túi đầy, collider, cờ 103, lưu/nạp. Các phòng trên lầu và basement 1–3 đã nối; basement 4/trận Toriel đã nối tới basement 5.
- Phòng kẹo `room_ruins7A`: chọn Yes/No bằng trái/phải rồi Z, không nhận khi túi đủ 8 món, phản hồi theo số lần lấy. Lần thứ tư làm đổ bát kẹo; nhánh cờ 6 chỉ lấy được ba viên. Lưu/nạp giữ trạng thái bát và kẹo.
- Savepoint đầu Ruins hồi HP, hiện lời thoại gốc rồi mở Save/Return; X hoặc Return giữ file cũ, Save hiện xác nhận khi ghi thành công. Menu dùng font bitmap, con trỏ trái tim và âm thanh gốc.
- Đối tượng nhìn thấy và vùng đọc được lấy từ object JSON; Z mở hộp thoại theo đối tượng và khóa di chuyển tạm thời.
- Phòng rơi xuống không vẽ trùng Frisk; chỉ cho đọc hoa sau mốc mở đầu và hiện Toriel ở mốc `plot = 25` của tuyến thường. Lời thoại hoa dùng nội dung gốc. Phòng savepoint Ruins không có trận ngẫu nhiên.
- Trận Dummy dùng ảnh, nút lệnh và nội dung gốc, ITEM rỗng không phát kẹo miễn phí. Trận Froggit/Whimsun thường đã dùng ảnh, ACT Check/Compliment/Threat hoặc Console/Terrorize, FIGHT/MERCY, đợt né đạn theo generator gốc, va chạm mask, thời gian bất tử, phần thưởng và cảnh Game Over nạp snapshot tạm. `__remake.startBattle()` nhận `dummy`, `tutorialFroggit`, `froggit`, `whimsun`, `vegetoid`, `napstablook`.
- Save/nạp phiên bản đầu lưu tên, phòng, vị trí, HP, LV, XP, GOLD, số quái bị đánh bại, thời gian chơi, danh sách điện thoại và mốc cốt truyện qua localStorage; `scene.saveGame()` và `scene.restoreGame()` dùng chung format, đọc được file trước khi thêm metadata.
- Vật cản chữ nhật dài/cao và mask PNG của bốn góc chéo.
- Bàn phím, cảm ứng, thả phím khi mất tiêu điểm, toàn màn hình.
- Tải JSON và PNG của phòng khi mở; giữ cache trong phiên chơi.
- Đóng gói hosting tĩnh, chạy dưới đường dẫn con, không cần compiler GML.

**Đã chuyển một phần đầu Ruins, gồm trận Napstablook; chưa phải Undertale đầy đủ.**
Chưa chuyển nhóm nhiều quái/hard mode tại `room_ruins7`, encounter phòng 8–15, Parsnik ở phòng 14, các sự kiện còn lại từ phòng 8, basement trở đi, nhạc nền ở phòng 16 và nhạc liên tục giữa các phòng, các cửa ngoài chuỗi phòng trên, hội thoại đầy đủ, cảnh mở đầu Flowey và các cảnh Toriel khác, các vật phẩm sau ID 13, các mục điện thoại sau Toriel và menu đầy đủ,
ACT/ITEM/MERCY theo từng quái, toàn bộ trạng thái lưu/nạp và menu Continue, những khu vực và nhánh kết thúc khác.
Va chạm ngoài trận/hố đọc pixel trắng trong mask gốc (pixel đen cũng có alpha 255); mask trái tim/đạn trong trận cũng đã đọc pixel trắng, gồm mask theo khung hình của dòng nước Napstablook và phép xoay/co giãn hiện có. Va chạm chéo hiện dùng mask để chặn; hành vi trượt dọc góc của code gốc chưa được chuyển.
Các đối tượng/sự kiện GML trong phòng không được tự động coi là đã hỗ trợ.
Hộp thoại hiện hiển thị cả trang; chưa chuyển hiệu ứng gõ từng chữ, nhịp ngắt và hoạt hình chân dung.
Trận Dummy chưa chuyển đầy đủ âm nhạc, hoạt hình tan bụi khi bị đánh bại và chuyển cảnh vào trận;
các hoạt hình đánh bằng vũ khí khác nhau và vật phẩm sau ID 13 còn phải chuyển.
Hai trận hướng dẫn chưa có đầy đủ hoạt hình sát thương, tan bụi, nhạc và chuyển cảnh gốc;
trạng thái lưu giữa lúc đang nắm tay qua gai chưa được hỗ trợ.
Nhóm đơn Froggit/Whimsun và bộ đếm bước đã nối; chưa chuyển nhóm nhiều quái trong phòng lá; cuộc gọi khi đang giữ Annoying Dog, hiệu ứng vật phẩm riêng ở các boss/khu vực sau còn phải chuyển.
Faded Ribbon và Toy Knife đã nhặt được ở phòng 14/18OLD và dùng được trong túi đồ.
Nhạc cảnh hành lang chưa chuyển; phòng 8–9 mới giữ hành vi chuyển cảnh, hố và đá, chưa chuyển toàn bộ nhạc nền. snapshot tạm được nạp lại sau Game Over trong các trận thường và Napstablook.

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

Trận Napstablook đối chiếu `obj_napstablook`, `scr_battlegroup` nhóm 20, `scr_monstersetup` loại 11, `obj_crygen1/2/3`, `blt_crybullet/2`, `blt_streambullet`, `obj_sadmsggen` và `blt_blookhat`. Va chạm dòng nước với khung và nước mắt tạo mũ hiện dùng tọa độ tính lại; cần đối chiếu thêm từng khung với bản gốc ở sát biên. Chuyển cảnh vào/ra trận, font bong bóng thoại, hiệu ứng gõ chữ và hoạt hình đòn đánh vẫn dùng các giới hạn chung của bản viết lại.

Phòng 12–12A đối chiếu `obj_napstablook1`, `obj_cheesetable1`, `obj_mousehole`, `obj_door_ruins13`, `SCR_TEXT` 510/511/512 và lời thoại Napstablook.

Phòng 14 đối chiếu `obj_holedown3`/`obj_holedown`, `obj_holeup2`, `obj_plotswitch3`, `obj_plotwall6`, `obj_spikes_room`, `obj_ribbon_pickup`, `SCR_TEXT` 518, `obj_napstablook2`, `obj_vegetoid_overworld` và thứ tự phòng trong `game/project/order.json`. Các kiểm thử hố xác minh độ cao/thời gian khóa/vị trí, chưa chứng minh mọi frame alarm sát biên giống hệt bản gốc.

Chuỗi 15A–15E đối chiếu `obj_redswitch_1`, `obj_blueswitch_1`, `obj_greenswitch_1`, `obj_pillar_1`, `obj_plotwall_room`, `obj_spikes_room`, `obj_switchhelptrigger`, `SCR_TEXT` 519–522 và `obj_door_ruins13`. Chuyển động rơi dùng tọa độ và alarm 30 Hz; hiệu ứng gõ chữ và độ chính xác từng frame chuyển cảnh vẫn còn giới hạn chung.

Nhánh 16–18OLD đối chiếu `obj_doorA/B/C/D`, `obj_smallfrog` và các câu 90–109, `obj_knife_pickup`, `SCR_TEXT` 523, `scr_itemget` và thứ tự phòng `RoomOrder`. Chưa tô riêng chữ TORIEL trong thoại Froggit; vẫn dùng giới hạn hộp thoại hiện cả trang.

Phòng 19 đối chiếu `obj_torieltrigger5`, `path_torielwalk19/19_3/19_4`, `obj_toroverworld3`, `obj_cosmeticblcon`, `obj_toribuster`, `obj_nastytree`, `obj_nastrytree_bottom`, `SCR_TEXT` 133/134, `obj_musicobjectparent` và `roomname_ruins19`. Chân dung đổi theo trang; chưa đổi cảm xúc giữa dòng hoặc có đầy đủ hoạt hình NPC nói. Thời điểm alarm và chuyển động tween chưa đối chiếu từng frame; nhạc hiện có phạm vi phòng 19, chưa liên tục từ phòng 16.

Sảnh nhà đối chiếu `obj_torieltrigger6`, `obj_torgen_house1`, `path_walkright`, `path_torielwalkhouse2/3`, `obj_stairstep`, `obj_staircollission`, `obj_solidrailing`, `obj_solidrailing2/3`, `obj_housemusic` và `obj_musicobjectparent`. Helper path bỏ qua đổi texture sau khi NPC bị hủy trong callback x/y cùng frame. Chưa chuyển các hoạt hình nói đầy đủ; thứ tự alarm/va chạm bậc sát cạnh cần đối chiếu thêm từng frame.

Phòng 10–11 đối chiếu `obj_holedown`, `obj_holeup`, `obj_pushrock1/2`, `obj_goofyrock`, `path_goofyrock`, `obj_toribuster`, `obj_rock_activator`, `obj_plotwall5`, `obj_spikes_room` và `SCR_TEXT` 1562–1593. Đá và hố đã có chuyển động; hai bảng chỉ dẫn phòng 10 dùng lời gốc và vùng tương tác theo hướng nhìn; thứ tự alarm và va chạm sát cạnh vẫn cần đối chiếu thêm.

Phòng 8–9 đối chiếu `obj_holeup`, `obj_holedown2`, `obj_pushrock3`, `obj_plotwall4`, `obj_spikes_room` và `obj_readable_room1_68`.

Trận thường đối chiếu `obj_froggit`, `obj_whimsun`, `scr_monstersetup`, `scr_mercystandard`, `scr_damagestandard`, `obj_froggit_Alarm_5/6`, `obj_whimsun_Alarm_3/5/6`, `obj_battlecontroller`, `scr_battlegroup` nhóm 4/5, `blt_leapfrog`, `blt_flybullet`, `blt_butterfly1/2`, `obj_gameover`.

Vegetoid đối chiếu `obj_vegetoid`, `scr_battlegroup` nhóm 18, `scr_monstersetup` loại 8, `obj_1sidegen`, `blt_gravbullet`, `blt_vegbullet`, `scr_mercystandard`, `scr_monsterdefeat` và `obj_foodsound`. Các phép thử kiểm tra luật chơi, va chạm với mask thật và phần thưởng; chưa chứng minh mọi frame quỹ đạo, thứ tự alarm, bong bóng thoại và hiệu ứng tan bụi khớp hoàn toàn bản gốc.

Hành lang đối chiếu `obj_toroverworld7`, `obj_torinteractable6`, `obj_torieltrigger4`,
`obj_plotwall3`, `obj_tordogcall`, `obj_stalkerflowey` và `scr_tempsave`; đường đi dùng
`path_torielwalk6`, `path_walkright`; lời thoại lấy từ `SCR_TEXT` mục 219–221 và `obj_tordogcall`.

Menu/điện thoại đối chiếu `obj_mainchara` User2, `obj_overworldcontroller`, `scr_itemuseb` mục 201–205,
`SCR_TEXT` mục 1501–1508, `scr_phonename`, `scr_phoneshift`, `scr_levelup` và chân dung Toriel.

Túi đồ/bát kẹo đối chiếu `scr_itemget`, `scr_itemshift`, `scr_itemuseb` mục 1–13,
`scr_recoitem`, `scr_recover`, `scr_armoreq`, `scr_weaponeq`, `scr_itemdesc`,
`obj_candydish1` và `SCR_TEXT` mục 508/509. Phòng lá dùng `obj_torielcall1`,
`obj_smallfrog` và `SCR_TEXT` mục 15.

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
| `src/inventory.mjs` | Nhận đồ, tên, USE/INFO/DROP, hồi HP và đổi trang bị |
| `src/inventory.json` | Dữ liệu vật phẩm đầu và Snail Pie Hard Mode cùng lời thoại bát kẹo |
| `src/candy-dish.mjs` | Lựa chọn nhận kẹo, túi đầy và bát đổ |
| `src/ruins-start.mjs` | Cuộc gọi và Froggit nhỏ ở phòng lá |
| `src/ruins-battle.mjs` | Trận đơn Froggit/Whimsun, ACT, FIGHT/MERCY, phần thưởng, Game Over |
| `src/ruins-battle.json` | Lời thoại trận thường và Game Over |
| `src/ruins-waves.mjs` | Generator đạn leapfrog, fly và butterfly |
| `src/vegetoid-battle.mjs` | Trận Vegetoid đơn, ACT Devour/Dinner và phần thưởng riêng |
| `src/vegetoid-battle.json` | Lời thoại gốc trận Vegetoid |
| `src/vegetoid-waves.mjs` | Generator cà rốt/rau và đạn xanh chữa HP |
| `src/ruins12.mjs` | Tương tác Napstablook phòng 12 và cheese phòng 12A; chưa có trận Napstablook |
| `src/ruins13.mjs` | Spider Bake Sale, Froggit nhỏ, màu tên quái và cuộc gọi Toriel phòng 13 |
| `src/ruins13.json` | Hội thoại gốc phòng 12B/13 và nhánh mua đồ |
| `src/ruins14.mjs` | Công tắc/gai/tường, Ribbon, ma và Vegetoid ngoài phòng 14 |
| `src/ruins14.json` | Lời thoại gốc biển, Ribbon và lần gặp lại Napstablook |
| `src/ruins-perspective.mjs` | Bốn góc nhìn/công tắc màu, gai/tường, bẫy rơi và lời gợi ý phòng 15 |
| `src/ruins-perspective.json` | Bốn biển và các lời thoại công tắc/gợi ý gốc |
| `src/ruins-outlook.mjs` | Froggit phòng 17 và nhặt Toy Knife phòng 18OLD |
| `src/ruins-outlook.json` | Ba nhánh thoại Froggit và lời nhận dao/túi đầy gốc |
| `src/ruins-home.mjs` | Cảnh Toriel trước nhà, nhạc, cây và lời SAVE phòng 19 |
| `src/ruins-home.json` | Lời gốc/nhánh HP, chân dung, cây và SAVE Home |
| `src/toriel-hall.mjs` | Cảnh vào sảnh, Toriel quay lại, sách, bậc thang và nhạc hai lớp |
| `src/toriel-hall.json` | Lời chào thường/Hard Mode và sách trong sảnh |
| `src/stalker-flowey.mjs` | Flowey chìm khi camera nhìn thấy, dùng chung cho hành lang và phòng 13 |
| `src/ruins-goofyrock.mjs` | Path Goofyrock phòng 11, nhường đường, activator, cờ 33 và gai/tường |
| `src/ruins-rock.mjs` | Hố lên/xuống phòng 8/10, đẩy đá thường phòng 9/11 và gai/tường phòng 9 |
| `src/ruins-encounter.mjs` | Bộ đếm bước và nhóm encounter đơn đầu Ruins |
| `src/ruins-start.json` | Lời thoại cuộc gọi, Froggit và SAVE phòng lá |
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

Hành lang phòng ngủ có cảnh nắm tay và xoa đầu của Toriel, giữ các path 20_2/20, vị trí hai nhân vật và thời gian 90 frame của ruffle; đặt plot 19 sau lời cuối. Có ngăn kéo, cây, biển và gương với các nhánh gốc, phản chiếu nằm sau tile. Phòng Frisk/Asriel đã nối qua cửa C, có ngủ/thức, giấc mơ, đèn, vật phẩm pie và lưu/nạp. Mã ở `src/toriel-corridor.mjs`, `src/child-bedroom.mjs` và các JSON thoại; nhạc nhà dùng chung `src/house-music.mjs`.

Hai lớp nhạc nhà được giữ nguyên instance giữa các phòng trong nhóm nhà Toriel, dọn khi ra ngoài hoặc đổi chế độ nhạc. Việc nối nhạc toàn Ruins/sân vẫn chưa chuyển đầy đủ.

Phòng Toriel nối hai chiều qua cửa A/B của hành lang. Có nhật ký Yes/No, tất và lời đọc lại, xô ốc, sách thực vật đặt cờ 50, giường, xương rồng và Chairiel với lời thường/sau kết thúc. Ghế/xương rồng có va chạm; tên cây hành lang được giữ qua lưu/nạp. Mã ở `src/toriel-bedroom.mjs` và `src/toriel-bedroom.json`.

Phòng khách/bếp đã có sách lịch sử, lò sưởi và hoạt hình lửa, chuỗi trò chuyện Toriel về ngủ/nhà/sách/ốc theo plot 19–21, kính đọc sách, cảnh đứng dậy và path đi ra, ghế rỗng đổi mask va chạm. Bếp có lời và hình bánh theo cờ 103/7, tủ/chậu rửa/bếp theo cờ tuyến; không phát thêm bánh từ bếp. Mã ở `src/toriel-living.mjs/json`. Các cửa sảnh ↔ phòng khách ↔ bếp đã nối.

Basement 1–3 đã nối hai chiều qua cầu thang chữ U trong sảnh: xuống sớm được Toriel dẫn về theo path/cờ 44–45, có các lời cảnh báo plot 21–24/khóa điều khiển/path và lưu nạp không lặp. Nhạc intronoise .4/rate .3 hoặc Reunited giữ liên tục giữa ba phòng và dọn khi lên nhà. Mã ở `src/toriel-basement.mjs/json`. Basement 4/trận Toriel đã nối tới basement 5; cảnh Flowey rời Ruins chưa nối.

Trận Toriel nối từ basement 4: lời thách đấu/lửa, Check/Talk/ký ức, ITEM/Flee/đấu lại, 25 lượt MERCY/đổi cảm xúc/thỏa hiệp và cảnh ôm/tạm biệt, FIGHT/HP/phòng thủ/EXP 150, betrayal/tuyến giết/linh hồn vỡ, Game Over/nạp tạm. Có năm dạng đạn lửa/bàn tay và nhánh tránh tim khi HP thấp, clipping/mask, tốc độ Hard Mode. Trận dùng font fnt_plain và bong bóng gốc. Mã ở `src/toriel-battle.*`, `src/toriel-waves.mjs`, `src/toriel-gate.*`.

Kết thúc Hard Mode sau Toriel có chó, Toriel và Flowey, các câu gốc, bảng HARD MODE, nhạc và màn đen cuối; mã `src/hard-mode-end.*`. Không có thưởng EXP/kill giả của tuyến thường. Cờ 6 vẫn cần được thống nhất với màn nhập tên Frisk và các encounter Hard Mode trước boss chưa đủ, nên chưa hỗ trợ trọn tuyến Hard Mode.

Đường tay dùng Phaser Spline; thứ tự alarm/va chạm sát biên, hiệu ứng sinh đạn nhỏ/tan bụi, gõ chữ/ngắt/màu trong dòng vẫn cần đối chiếu từng frame. Các kiểm thử mới xác minh hành động, nhánh, phần thưởng, va chạm và kết quả, không chứng minh hình ảnh/quỹ đạo giống hoàn toàn. Flowey sau cửa Ruins và lối vào Snowdin đã nối; cuộc gặp Sans/Papyrus đầu Snowdin đã chuyển, phần sau phòng rừng còn thiếu.

Flowey sau Toriel đã có ở `src/flowey-exit.mjs/json`, nối từ basement 5. Các lời theo tha/giết/ký ức Toriel/Flowey và tuyến diệt chủng dùng dữ liệu gốc; có alarm/animation/cờ/plot28, chặn quay về Ruins ở tuyến thường và không lặp sau lưu/nạp. Cửa trên đã nối màn logo chuyển chương và phòng đầu Snowdin.

`src/chapter-title.mjs` chuyển logo/credit/đen đúng ba mốc 150 frame sau trắng dần 180 frame ở cửa Ruins. `src/snowdin-start.*` chuyển camera bụi cây, va chạm lối vào, nhạc theo plot/cờ và đường quay về Ruins sau kết thúc. Danh bạ chuyển thành Toriel’s Phone (206), có noAnswer và các tin nhắn kết thúc scr_torcall. Phòng 2 và cuộc gặp Sans/Papyrus đã nối hai chiều với phòng 1.

`src/snowdin-forest.*` chuyển cây tiền cảnh, cành cây gãy, bóng Sans/nhạc dọa, bắt tay và cuộc gặp Sans/Papyrus theo lần đầu, ký ức sau tải SAVE và tuyến diệt chủng. Có các đoạn đối thoại gốc, font/chân dung riêng, trốn sau đèn/hai màn pha trò, lời nhắc trước khi rời đi, plot 36/37 và nhạc Snowy. Camera zoom dùng Phaser với mốc 10 frame; thứ tự alarm/zoom/hiệu ứng Papyrus từng frame, gõ chữ/màu/cảm xúc giữa dòng vẫn cần đối chiếu thêm. Cửa phải phòng 2 đã nối Box Road; encounter còn thiếu.

Tough Glove (ID 14) có INFO/USE/AT +5 và FIGHT riêng: thanh nhanh 1.2x, dừng rồi nhấn 4 cú trong 30 frame; ít cú gây sát thương theo tỉ lệ, không nhấn là MISS. Có prompt/đấm yếu/mạnh/âm thanh và dùng chung ở các trận đã chuyển, gồm Toriel. Đã nhận được Glove từ hộp đồ đầu Snowdin.

Box Road và nhánh bờ câu (3/3A) có biển, SAVE/hồi HP/tên file/lời theo tuyến, hộp dùng chung 10 ô trong flag SAVE và túi 8 ô, găng tay ban đầu, gửi/rút/dồn ô/đầy/rỗng, cần câu Yes/No/gửi dây lại/ghi chú kết thúc và nước động. `src/item-box.mjs`, `src/box-road.*` và hàm route nguồn chung `src/route.mjs`. Encounter nhóm 30/32/24, nhánh fun=65 tới soundtest và phòng 4 vẫn chưa chuyển; không coi toàn Snowdin hoặc toàn gameplay Box Road đã hoàn chỉnh.

Snowdrake/Chilldrake đơn có ở `src/drake-battle.*`, `src/drake-waves.mjs`: ACT theo đã nghe câu nói, ba nhánh Heckle/Clash, Laugh/Agree/Joke, FIGHT/Glove/ITEM/MERCY/Flee, phần thưởng/cờ57/136 và dân số Snowdin, hai đợt móng vuốt bốn phía, Game Over/snapshot/nhạc. Chưa nối encounter phòng3 cho đến khi Ice Cap/Ice và Lesser Dog được chuyển; nhóm nhiều quái, gõ chữ/lắc chữ, tan bụi và thứ tự alarm/di chuyển từng frame còn thiếu hoặc cần đối chiếu thêm.

Ice Cap/Ice đơn có ở `src/icecap-battle.*` và `src/icecap-waves.mjs`: hai Ignore, Compliment/Steal, chuyển dạng/HP/DEF/menu, bonus13G trước chuyển và22G của Ice, các thưởng/cờ/dân số, răng băng32cột và mũ/tinh thể/two-mask, Game Over/nhạc. Ice có wave5frame như source; chưa nối encounter khi Lesser Dog còn thiếu. Nhánh nhiều quái/Hard Mode generator, gõ chữ/lắc chữ/tan bụi và thứ tự alarm/physics sát frame vẫn chưa đủ.


Lesser Dog đơn có ở `src/lesser-dog-battle.*` và `src/lesser-dog-waves.mjs`: Check/5ôPet, đủ55lầnPet/20lời/cổ vòng, Stick, phòng thủ/thưởng/cờ tuyến, chó sủa-đuổi-nhảy và giáo xanh/ trắng, Game Over/nhạc. Cả ba nhóm đơn30/32/24 đã có trận riêng; selector encounter tự nhiên Snowdin vẫn đang chuyển. Các giới hạn chung về trình bày/gõ chữ/animation từng frame và nhóm nhiều quái còn giữ.


Encounter tự nhiên đã nối phòng3 bằng `src/snowdin-encounter.mjs`: scr_steps theo dân số, thứ tự cờ70/plot42/tuyến, chuyển Chilldrake, hếtquái222/Nobody theo hai mốc, dấu!/skull và khóa, snapshot tự động trước trận/Game Over/nhạc. Chỉ đếm bước thật ngoài menu/thoại; 3A không sinh encounter. Phòng4/cảnh Papyrus và nhánh fun65/soundtest còn thiếu, nên chưa hoàn chỉnh Box Road hoặc toàn Snowdin.


Phòng4 có `src/snowdin-checkpoint.mjs/json`: cảnh Papyrus/Sans nhận nhầm tảng đá, quay/pan camera, ký ức/lần gặp/tuyến/cờ27, thoại gốc/nhạc/khóa/rời đi/plot40/lưu tạm, trạm gác và camera, cuộc gọi fun40–50 (Yes/No/pizza)/cờ277. Snowdrake NPC chỉ xuất hiện sauplot100 nếu dân số203 chưa bị giết; có gia đình sau kết thúc/thoại/collider. Cửa BOX↔phòng4 và encounter đã nối, phòng5/Doggo còn thiếu. Gõ chữ/animation thoại/chi tiết alarm từng frame vẫn cần đối chiếu thêm.


Doggo đơn có ở `src/doggo-battle.*`/`src/doggo-wave.mjs`: Check/Pet sau khi đứng yên qua kiếm xanh, 5lầnPet/DEF, Stick/cờ52/139/27/plot41, không Flee, thưởng30G và không cộng dân số ngẫu nhiên, kiếm tăng tốc/bám độ cao/chỉ trúng khi tim di chuyển, GameOver/nhạc. Phòng5/cảnh Doggo ngoài trận chưa nối; còn các giới hạn trình bày và alarm/physics từng frame như các trận đã chuyển.

Nhánh đạn trắng hiếm command100 của Doggo dùng lại generator móng vuốt xoay DrakeWave, rate25/border6/120frame; qua nhánh này không tự mở điều kiệnPet.


Phòng5 có `src/doggo-room.mjs/json`: trigger thật/Doggo trồi lên/cắt hình/hai nhánh thoại/khóa/nhạc, trận23 tự lưu snapshot, hậu trận Pet/Stick/kill và plot41→42, chuông hai tiếng/6lời/cap, bảng/treats/ghi chú từ64/collider, cửa4↔5 và lưu nạp. GameOver không mởlối hoặc trao thưởng khi chưa thắng. Phòng6/băngtrượt và6A/ngườituyết chưa nối.


Phòng6 có `src/snowdin-ice.mjs/json`:44ôbăng/giữ hướng/3px mỗi frame/khóa menu và tương tác/alarm3/va chạm/không tăng bước encounter lúc trượt, lờiSans về đòn xanh và các điều kiện biến mất, biển/collider. Cửa5↔6/nhạc/encounter đã nối; cửa trên6→6A/ngườituyết và cửa phải6→7 còn thiếu. Màu/gõchữ trong dòng và va chạm/alarm sát từng frame vẫn cần đốichiếu thêm.


Nhánh6A có `src/snowman.mjs/json`: người tuyết/Yes-No/túi đầy/cấp bù/BOX/cờ56, Snowman Piece16 hồi45HP/INFO-USE-DROP, ăn trước mặt, ba mảnh theo tuyến giết/cờ253/đổi ảnh/lưu nạp, lời sau kết thúc. Cửa6↔6A và nhạc đã nối; phòng7/câu đố điện Papyrus còn thiếu.


Phòng7 có `src/electric-maze.mjs/json`: intro/ký ức, Papyrus tự bị giật/path/dấu chân/trao orb, mê cung dùng mask PNG/giật 15 frame/đường đi an toàn, tám trang giải/plot43/Sans, nhánh diệt chủng/Frisk bước qua/cờ291 và dọn khi đổi phòng. Cửa6 ↔ 7/nhạc và SAVE đã nối; phòng8/Nice Cream/golf và phòng9/crossword chưa nối. Gõ chữ, chi tiết animation và alarm sát frame vẫn còn hạn chế.


`src/nice-cream.mjs/json` điều khiển quầy Nice Cream tại Snowdin8: mở đầu/chờ31 frame, mua15G/No/thiếu tiền/đầy/cờ60/GOLD-SPACE/collider/tuyến/SAVE, ITEM17/tám lời giấy gói/hồi15HP. Phòng8 đã nối hai chiều với7, có bóng/golf/băng và đồ vật qua các controller dưới đây. Quầy ở Waterfall/Hotland chưa chuyển.


`src/snow-golf.mjs/json` có bóng tuyết/đẩy/ma sát/co nhỏ/bật mép/sinh lại/rơi, lỗ/cờ trồi/bảy loại theo thời gian và kích thước, GOLD/cờ387/không thưởng lặp/dân số16. Đã kiểm tra bằng phím và va chạm thật. Phòng8 có băng x4/NPC/biển và cửa7↔8; phòng9 đã có controller dưới đây; các phần sau vẫn còn thiếu.

`src/snowdin-park.mjs/json` có Sans bán fried snow/bốn mức giá/No/giàu-nghèo không giao dịch, snowdecahedron/camera/Chilldrake thường và sau kết thúc, collider/điều kiện tuyến. `snowdin-ice.mjs` dùng lại luật trượt phòng6 cho bốn vùng x4 tại8 với bbox40×40. Test phòng8 kiểm tra cửa7↔8, nhạc, trượt/khóa, lời/lựa chọn/GOLD/túi/NPC/collider/tuyến/SAVE. Hai lối phải8 đã nối nhánh8A và phòng9; cửa phải9 đã nối spaghetti/SAVE.

`src/snowdin-scent.mjs/json` nối8↔8A, hai nhà chó/His-Hers/biển đánh giá mùi bốn trang với chữ màu gốc trên Canvas, collider/nhạc/dọn khi đổi phòng; kiểm thử riêng và chuỗi phòng8→8A đã qua.

`src/snowdin-crossword.mjs/json` nối8↔9 và cảnh Papyrus/Sans: word search/khóa/buffer/254, tường quay lại, Jumble-Crossword/58, xem-bỏ qua/tuyến giết, rời phòng/47/Sans/lưu nạp/dọn. Có ảnh nightmare theo5 và ký ức fun ngoài SAVE56/57; khởi tạo fun toàn game chưa chuyển. Cửa tới spaghetti đã nối; giới hạn thoại và alarm từng frame vẫn còn.

`src/snowdin-spaghetti.mjs/json` nối9↔spaghetti: đĩa/microwave/note với font Papyrus/lời kết thúc/collider, chuột đúng hướng/không chồng, sao SAVE/nhạc/tên file/lưu nạp. Hai điểm Snowdin dùng chung showSnowdinSave để giữ luật dân số/cờ/màu; kiểm thử Box Road và phòng mới đã qua. Cửa phải tới snowpuzz còn thiếu.

Tường mê cung7 có ba lời Papyrus theo số lần cố quay lại, đẩy4pixel/nhìn phải/khóa rồi hoàn trả điều khiển; kiểm thử chạm bốn lần và giải tiếp mê cung đã qua.

`src/snowdin-snowpuzz.mjs/json` chuyển phần công tắc/tường/gai/tuyết400hạt/cờ64/biển/camera/IceCap của snowpuzz, đã qua kiểm thử riêng và chuỗi spaghetti→câu đố. Chưa nối cửa từ spaghetti: cảnh hai chó/trận nhóm25/Jerry/encounter nhiều quái35-36 còn thiếu, không coi cả phòng đã hoàn chỉnh.

`src/dog-pair-waves.mjs` chuyển rìu trắng/vòng tim trắng-xanh và đợt riêng khi còn Dogamy hoặc Dogaressa. Đã kiểm generator trong scene Phaser bằng tài nguyên/mask thật; chưa có trận hai mục tiêu/HP riêng hoặc cảnh gặp hai chó. Không coi đạn chạy được là đã chuyển trận nhóm25; cửa spaghetti→snowpuzz vẫn chưa nối.

`src/dog-pair-battle.mjs/json` có trận dogi với hai HP108/mục tiêu riêng, ACT2×2/ngửi-lăn-pet/cờ140, Stick/ITEM/Spare, FIGHT/găng tay/hai thứ tự chết/DEF và đạn riêng khi còn một con, thưởng từng con/cờ53-27/plot50, Game Over/snapshot. Kiểm thử riêng và chuỗi Doggo→đạn đôi→trận đôi đã qua. Cảnh obj_forcedright/Jerry/nhóm35-36 chưa nối nên cửa spaghetti→snowpuzz vẫn đóng; hiệu ứng tan bụi, hurt/bong bóng/chuyển arena/gõ chữ từng frame vẫn còn cần đối chiếu.

`src/dog-pair-room.mjs/json` nối trigger ngoài phòng snowpuzz vào cảnh đi ép/tiến tới/đánh hơi/path_mdog-wdog/nhạc/khóa/trận dogi và hậu cảnh Pet-Stick-Kill/51, SAVE/GameOver/dọn. Đã qua test riêng và chuỗi câu đố tuyết→cảnh/trận. Jerry/encounter35-36 vẫn thiếu, nên cửa từ spaghetti chưa nối; không coi toàn bộ phòng đã xong.

`src/multi-battle.mjs` dùng lại điều khiển nhiều mục tiêu/lưới ACT/FIGHT từ trận đôi để mở rộng nhóm35/36. Trận/cảnh hai chó đã qua hồi quy sau tách; Jerry/nhóm35-36 chưa có trong bản này.

`src/snowdin-group-waves.mjs` dùng lại generator IceCap/Drake trong cùng arena/timer cho nhóm35/36, tần suất/khoảng răng theo số attacker và Jerry kéo dài60frame. Hai trận đơn và ca generator nhóm đã qua; scene/ACT/Jerry của nhóm đang chuyển riêng, cửa snowpuzz chưa mở.

`src/snowdin-group-battle.mjs/json` có nhóm35/36 nhiều HP/mục tiêu trong cùng trận: Jerry/Ditchhai lượt/chia5sátthương, Joke liênquái, Ice Cap→Ice, Drake/chill/ACT/Spare/FIGHT/ITEM/thưởng từng con/Flee/dân số/GameOver. Test riêng và chuỗi generator→nhóm đã qua; encounter và cửa snowpuzz sẽ nối tiếp, các giới hạn thoại/animation/instance từng frame vẫn giữ.

Đã nối spaghetti↔snowpuzz cùng encounter Jerry35/36, LesserDog70/dânsố/Nobody, ngưỡng bước riêng và forcedright+200/reset. Chuỗi hồi quy encountercũ→côngtắc→cảnhhai chó→encountermới đã qua, gồm kill/Flee/population/GameOver/snapshot/dọn. Cửa phải snowpuzz→xoxosmall chưa nối; các phòng/tuyến sau vẫn còn thiếu.


`src/snowdin-xoxo-small.mjs/json` nối snowpuzz↔phòng X/O nhỏ, hai ô/nút/reset/plot53/tường-gai và Papyrus6 hỏi spaghetti/cờ62/hai lựa chọn/đi rời; có biển, nhạc xuyên phòng, SAVE và nhánh murder4/27. Kiểm thử gồm bước đi thực, đứng yên, lời/khóa/lưu nạp và mở phòng trực tiếp. Cửa phải tới xoxopuzz chưa nối; phần Papyrus5/câu đố lớn đang chuyển, chưa coi Snowdin hay toàn bộ game đã hoàn tất. Hạn chế gõ chữ/animation từng frame vẫn giữ.


`src/snowdin-xoxo-big.mjs/json` nối phòng X/O nhỏ↔lớn, dùng chung ô/nút qua SnowdinXoxoPuzzle. Có15ô/sai63/plot56/cây Yes-No, Papyrus5/54/14trang/áo choàng/gợi ý/đáp án/hậu cảnh/path, camera, Sans/kýức, Flowey chìm/cờ9 và Chilldrake cuối tuyến. Kiểm thử riêng gồm SAVE54/56, hai cách giải và nhánh tuyến. Cửa phải tới randoblock/Papyrus4 chưa nối; các giới hạn gõ chữ/animation/tô từng từ và thứ tự instance từng frame vẫn cần hoàn thiện.


`src/snowdin-color-tiles.mjs/json` nối X/O lớn↔randoblock/Papyrus4:48ô,33trang/19trang nghe lại/hai câu hỏi, máy đổi7màu/alarm/pitch/chốt đỏ-hồng/collider/lối đi, nhánh từ chối đểnote, tuyến Frisk đi xuyên93pixel/đối thoại Papyrus-Sans, hậu cảnh/nhạc/plot58/SAVE và dọn. Kiểm thử chuỗi X/O lớn→ô màu đã qua. Cửa phải tới phòng tượng Lesser Dog chưa nối; gõ chữ/miệng nói và thứ tự từngframe vẫn cần hoàn thiện.


`src/snowdin-dog-house.mjs/json` nối randoblock↔phòng tượng Lesser Dog:55/plot67 quyết định10tượng/chó chờ/tuyết nhão, đổi ảnh-bbox/vịtrí/NPC; có4nhánhNPC/biển/nhà/camera/SAVE2lời/nhãn file/nhạc/lưu nạp. Kiểm thử riêng đã qua. Cửa C tới icehole/chuỗi băng chưa nối; không coi Snowdin đã hoàn chỉnh.


`src/snowdin-ice-puzzle.mjs` dùng lại trượt/XO cho12ô, plot63/cầu mở từng8px/pause/khóa và hố388. `snowdin-ice-hole.mjs/json` có falltransition/hai người tuyết/IceCap cuối tuyến. DogHouse↔iceentrance↔icehole đã nối; kiểm thử riêng gồm rơi/trượt/cầu/SAVE/mũ/hạt/tuyến. Cửa sang iceexit_new/Gyftrot và poffzone chưa nối; hiệu ứng/nhịp từngframe vẫn cần đối chiếu thêm.


`src/gyftrot-waves.mjs` có6cộttrọnglực và3hộp quà/cảnhbáo/sine/hộpxanh/tăngtốc/120frame, kiểm thử bằngảnhvàPhaserthật/HP/mask/cleanup. ChưacóACT/scene/encounterGyftrot trongcommitgenerator; cửaiceexit_new chưa nối. ThứtựAlarm/Step/Draw sátframe vẫn cầnđốichiếuthêm.


`src/gyftrot-battle.mjs/json` có nhóm28/114HP/ACT2×2/bađồ/Gift/đôi mắt/betray/74-138/MERCY/DEF/thưởng riêng, dùngmenu/FIGHT/găngtay/Flee/ITEM/GameOver sẵn có và hai generatorGyftrot. Đã qua kiểmthử riêng và hồi quyhai trậnSnowdinđơn; chưa nối encounter28/cửaiceexit_new. Tanbụi/gõchữ/thứtựinstance từngframe vẫnchưađủ.


`src/gyftrot-room.mjs/json` nối iceentrance↔iceexit_new,2Sans/lời chéo/váchbăng3loạiDraw/NPC/Fall388. SnowdinEncounterdùnglại ngưỡngbước160-300/840/nhóm28-LesserDog-Nobody/SAVE/GameOver, đãqua chuỗi Jerry→băng→GyftrotRoom. Nhánhiceexit/icecave1 vàpoffzone/GreaterDog chưa nối; cácgiớihạngõchữ/animationtừngframe vẫngiữ.


`src/greater-dog-waves.mjs` cóchó ngủ/thức sau8framechuyển động/bark dựđoán vàgiáotrắng-xanh/lên-rẽtrái/blut2. Testdùngảnh/mask2x/HPthật, phânbiệtcollisionkếthừaxóađạn-chó vớigiáo giữlại. Chưacóscene105HP/ACT/poffzone, chưacoiGreaterDogđãhoànchỉnh.


`src/greater-dog-battle.mjs/json` có trận nhóm26/105HP, năm ACT/Beckon/Pet-Play/tim chậm/142/DEF, Ignore4/phóng thân/54, Stick/ITEM/FIGHT đủ HP/Spare/thưởng/plot60/GameOver. Kiểm thử riêng và chuỗi Lesser Dog→đạn→trận đã qua. Poffzone và hậu cảnh chưa nối; gõ chữ/tan bụi/thứ tự sát frame còn cần đối chiếu.


`src/greater-dog-room.mjs/json` nối iceentrance↔poffzone: tám đống tuyết/bộ đếm riêng/30G/cờ65, nhà/biển/NPC/va chạm; chó trồi khỏi tuyết, trận26 thật và hậu cảnh riêng theo54=1/2/3, plot61→65/nhạc/khóa/SAVE/GameOver. Kiểm thử riêng và chuỗi băng→trận→phòng đã qua. Cửa phải tới dangerbridge chưa nối, các giới hạn gõ chữ và nhịp sát frame vẫn còn.


`src/snowdin-danger-bridge.mjs/json` nối poffzone↔cầu bẫy Papyrus7: camera120/khóa/nhạc, sáu bẫy hạ-thu hồi/đúng tọa độ, các đoạn chờ và hội thoại thường-tuyến giết, Papyrus rời/plot67/Sans-ký ức/Flowey9. Encounter Jerry chỉ khi quay lại sau67; đã qua riêng và chuỗi encounter→phòng chó→cầu. Cửa phải tới town chưa nối; các giới hạn gõ chữ/tô từng từ và thứ tự sátframe vẫn còn.


`src/snowdin-town-npcs.mjs/json` chuyển bảy cư dân Snowdin: lời đầu/lặp/plot122/kết thúc, ba chó/cờ Papyrus/tuyến giết theo thứ tự gốc, Monster Kid98/112/mặt nói, collider và lưu/nạp. Kiểm thử riêng đã qua. Hiện mở trực tiếp town để kiểm tra; cửa/nhạc/đồ vật/dịch vụ thị trấn chưa nối đủ.


`src/snowdin-town.mjs/json` có nhạc theo tuyến, đồ vật/biển/thư/cây/logo, BOX dùng chung và SAVE Town/HP/lưu nạp; hai igloo đưa Frisk dưới tuyết sang bên kia thị trấn với gia tốc/khóa/đích gốc, nước/cube chuyển động. Kiểm thử riêng và chuỗi BoxRoad→NPC→Town đã qua. Chưa nối cửa vào thị trấn/các dịch vụ và còn thiếu Papyrus/chó kết thúc/cửa Sans/Undyne; không coi town đã đầy đủ.


`src/snowdin-town-dogs.mjs/json` có chó sau kết thúc ở town theo7/52-53-54, lời ba NPC và GreaterDog+Amalgamate/mask riêng/tiếng sủa/khóa/pause-resume. Chuỗi NPC→Town→Dogs đã qua. Papyrus ngoài nhà và các dịch vụ/cửa town vẫn còn thiếu.
