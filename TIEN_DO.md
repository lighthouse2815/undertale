# Bàn giao bản viết lại Undertale

Cập nhật: 27/10/2026, sau cuộc gặp Sans/Papyrus đầu Snowdin. Mốc code trước phần này: `b4020968` trên `main`.
Xem `git log` để lấy mã commit triển khai mới nhất và kiểm tra trạng thái đồng bộ remote.
Luôn kiểm tra commit và source mới hơn trước khi tiếp tục; đây là ghi chú bàn giao, không thay thế kiểm tra implementation.

## Mục tiêu người dùng đã chốt

Viết lại **toàn bộ** Undertale bằng mã nguồn mới, giữ nội dung, hình ảnh và cách chơi gốc.
Phần đang phát triển nằm trong `remake/`, dùng JavaScript/Phaser 3.90.0 và tải tài nguyên theo phòng.
Không dùng Butterscotch, thực thi GML, WASM hoặc `data.win` trong bản viết lại.
Người dùng muốn tiếp tục triển khai, không chỉ lập kế hoạch hoặc dựng các phòng có hình ảnh.

`game/` là bản tham chiếu cũ: đọc `game/code/*.gml`, `game/assets/` và dữ liệu thứ tự phòng để đối chiếu hành vi.
Được đọc và chuyển nội dung/dữ liệu gốc; bộ chạy và gameplay trong `remake/` phải là JavaScript mới.
Trang chính/bản Butterscotch chưa được thay bằng bản viết lại; không báo đã triển khai toàn bộ game.

## Hiện trạng

- Có intro, tiêu đề, nhập tên; tải phòng/ảnh theo nhu cầu, di chuyển, camera, va chạm, chuyển phòng và lưu/nạp cơ bản.
- Hai bảng phòng 10 đã đọc được theo hướng nhìn: lời nhắc tránh lá ở tầng dưới, lời nhắc đọc bảng bên dưới ở tầng trên; không đổi plot.
- Hố phòng 8/10 dùng mask gốc và scale, chờ 10 frame rồi xuống 5 pixel/frame có alpha/xoay hoặc lên 10 pixel/frame có ẩn nhân vật; giữ x, đi 400 pixel, camera theo vị trí. Có âm thanh, dấu sàn sập và nhánh lần 11 ở phòng 10.
- Đá phòng 9 và hai đá thường phòng 11 đã đẩy/lùi từng bước, chốt tại vùng nút, giữ va chạm/vị trí qua cờ 31/32/35. Goofyrock đi theo `path_goofyrock`, có nhường đường, activator khiến đá rời nút và dựng lại tường, cờ 33 chỉ chốt khi yêu cầu đứng lại.
- Phòng 12A đã có tiếng chuột khi tương tác đúng hướng (không phát chồng), va chạm bàn phô mai, lời SAVE thường/hết quái và tên file “Ruins - Mouse Hole”; giữ Return/Save/hồi HP và nạp lại.
- Có các sự kiện đầu Ruins: công tắc, Dummy, Toriel dẫn qua gai, Froggit theo kịch bản, hành lang nhận điện thoại.
- Có menu ngoài trận, một số cuộc gọi Toriel, túi 8 ô và dữ liệu vật phẩm ID 1–13 cùng Snail Pie ID 63.
- Có trận Napstablook nối từ phòng 12; Check/Threat/Cheer/Flirt, màn mũ, kết thúc riêng, Flee/ITEM và Game Over; xem giới hạn trình bày trong `remake/README.md`.
- Mask trái tim/đạn trong trận đã đọc pixel trắng thay vì alpha, dòng nước Napstablook tải mask theo khung hình; có kiểm tra góc đen an toàn, hình ếch, xoay/co giãn, sát thương và bất tử bằng tài nguyên thật.
- Có trận đơn Froggit/Whimsun, một số đợt đạn, ACT/FIGHT/ITEM/MERCY, phần thưởng và Game Over nạp snapshot tạm; encounter mới nối ở phòng lá.
- Có trận Vegetoid đơn: Check/Devour/Talk/Dinner, hai generator cà rốt/rau, đạn xanh hồi HP cả khi bất tử, tha/Devour/Flee/đánh bại và thưởng riêng. Hai Vegetoid ngoài phòng 14 mở trận này; chưa có Parsnik Hard Mode hoặc encounter ngẫu nhiên Vegetoid.
- Phòng 14 nối hai chiều với 13 và 15A, có biển chỉ dẫn, hố xuống dùng mask riêng, sáu lối lên 400/510 pixel, công tắc đặt plot 13 và mở tường/gai, nhặt Ribbon với túi đầy/cờ 100, lần gặp lại Napstablook theo cờ 36/dân số/tuyến. Vật phẩm và NPC có va chạm, bỏ collider khi biến mất; lưu/nạp giữ tiến trình. Encounter ngẫu nhiên và Parsnik chưa chuyển.
- Câu đố 15A–15D đã nối hai chiều qua bốn góc nhìn. Có màu/va chạm công tắc, cột che khuất, bốn biển, Yes/No, ba lời giải xanh dương/đỏ/xanh lá mở tường/gai và plot 14/15/16. Sáu công tắc sai làm rơi sau 30 frame chờ và 20 frame rơi/mờ, về 15E rồi trở lại markerX của 15A. Giữ cờ 43/51, lời phản ứng sau 25 lần nhấn và gợi ý một lần khi vào 15B sau hai lần sai; lưu/nạp giữ tiến trình. Cửa C của 15D đã nối tới 16; encounter ngẫu nhiên chưa nối.
- Nhánh 15D ↔ 16 ↔ 17 ↔ 18OLD đã nối đúng marker C/D/A/B. Froggit phòng 17 có animation/va chạm/hướng tương tác, ba nhánh thoại thường/kết thúc/Hard Mode (Hard Mode ưu tiên như gốc); biến mất và bỏ collider khi kills > 0. Toy Knife phòng 18OLD nhận vật phẩm 13/cờ 102, không mất khi túi đầy, bỏ ảnh/collider sau lời nhặt, không nhặt lại qua vào phòng/lưu nạp. ITEM thay Stick và lưu sức đánh +3 đã kiểm tra. Cửa trên 16 ↔ 19 đã nối bằng markerX; nhạc nền Ruins ở phòng 16 chưa chuyển.
- Phòng 19 có trigger Toriel: lời mở đầu, path 19, điện thoại/dấu chấm than sau 30/60 frame, path tương đối 19_3, bảy trang lời chào theo HP đầy/bị thương/dưới 4 và hồi HP. Kết thúc thoại đặt plot 17, Toriel đi theo path 19_4 và biến mất tại toribuster; fade nhạc rồi mở điều khiển. Có nhạc Ruins/toomuch theo cờ 221, Reunited theo cờ 7 ưu tiên, nhạc Toriel rate .86 và dọn âm thanh khi đổi phòng. Cây có va chạm/lời thoại thường và sau kết thúc; SAVE có lời riêng, nhánh hết quái và tên “Ruins - Home”. Cửa sân ↔ sảnh nhà đã nối, có fade nhạc chính trước đổi phòng khi không ở tuyến kết thúc.
- Sảnh `room_torhouse1` có lời chào 7 trang thường/8 trang Hard Mode, chân dung theo trang và khóa điều khiển; chỉ đặt plot 18 khi đọc xong rồi Toriel đi path_walkright tới toribuster. Sách đọc được đúng hướng; lan can/mask cầu thang dùng collider gốc, bậc thang dịch y ±1 một lần mỗi hướng cho mỗi bậc. Cờ 45 = 1 tạo Toriel sau 2 frame, đi phải khi plot < 19 hoặc đi trái khi plot ≥ 19, xóa cờ 45. Hai lớp house1/house2 có âm lượng 1/.01; cờ 45 = 4 dùng hai lớp Toriel rate .4; cờ 7 ưu tiên Reunited. Nhạc giữ trong nhóm phòng nhà; path/timer dọn khi đổi phòng, lưu/nạp không lặp lời chào. Cửa sang hành lang/phòng khách/bếp, hai phòng ngủ và basement 1–3 đã nối.
- Các phòng Ruins tới sảnh nhà Toriel đã có nhiều phần triển khai, **chưa hoàn chỉnh toàn bộ sự kiện và hành vi gốc**. Xem giới hạn bên dưới và `remake/README.md`.
- Phần trước: cửa phải phòng 12 → 12A → 12B; cửa trên phòng 12 ↔ 13 dùng markerX. Spider Bake Sale mua Donut 7G/Cider 18G, kiểm tra túi/GOLD và cờ 59. Phòng 13 có các hội thoại Froggit, cờ màu tên 22 được trận thường đọc lại, cuộc gọi bánh Toriel theo trigger vô hình và Flowey chìm khi camera thấy.

## Việc tiếp theo và các chỗ phải sửa thật

1. **Tiếp tục cuộc gặp Sans/Papyrus, cảnh mở đầu và encounter còn thiếu.** Sảnh `room_torhouse1`, cảnh `obj_torieltrigger6`, bậc thang và `obj_torgen_house1` đã chuyển. Cửa C sảnh đi tới `room_torhouse3` (bỏ qua phòng khách), cửa D của phòng 3 trả về markerD; cửa A sảnh đi phòng khách `room_torhouse2`; cửa đặc biệt trên cầu thang đi `room_basement1`. Đã nối hành lang phòng ngủ và cảnh `obj_torieltrigger7`; đã nối phòng khách/bếp, hai phòng ngủ và basement 1–3. Basement 4 và trận Toriel/cảnh sau trận đã nối tới basement 5. Đã chuyển `obj_floweytrigger2`/`obj_floweytalker1` và cửa trên tới màn logo/Snowdin 1. Đã nối phòng `room_tundra2`, cành cây/bóng Sans/bắt tay/Papyrus và các nhánh ký ức/tuyến. Tiếp theo chuyển Snowdin 3/3A, SAVE Box Road, hộp đồ dùng chung, cần câu và encounter đầu Snowdin; cửa phải phòng 2 chưa nối vì gameplay các phòng này còn thiếu. Không bỏ qua Flowey để đi Snowdin. Nhánh phụ 16 → 17 → 18OLD và Toy Knife đã chuyển; nhạc `obj_ruinsmusic` tại 16 vẫn còn thiếu. Nhạc sân và sảnh hiện quản lý riêng, fade khi đi qua cửa musicfade nhưng chưa giữ vị trí bài nhạc liên tục khi qua các phòng/tuyến kết thúc. Câu đố 15A–15E đã chuyển; không coi các encounter của chuỗi này là đã hỗ trợ. Sự kiện phòng 14 và Vegetoid thường đã nối; Parsnik Hard Mode (nhóm 122) chưa có, không thay bằng Vegetoid thường rồi báo đã chuyển đầy đủ. Trận Napstablook đã nối: No không đổi plot; Yes vào battlegroup 20; Cheer ba lần → màn mũ, Cheer/Flirt tiếp → lời cảm ơn tự động, cờ 36 và fade tới plot 11. Flee giữ ma để đấu lại; đánh cạn 88 HP khiến ma rời đi, không đổi EXP/GOLD/kill/dân số. Nhánh cờ 202 >= 20 tự rời phòng không bật cờ 36. Bộ test phòng 12 đã thay kỳ vọng bỏ qua boss bằng các nhánh thật. Va chạm dòng nước sát khung và nước mắt tạo mũ còn cần đối chiếu từng khung; test hiện tại kiểm tra luật chơi và kết quả, chưa chứng minh toàn bộ quỹ đạo giống hệt gốc. Trình bày bong bóng thoại, gõ chữ và chuyển cảnh chiến đấu cũng chưa hoàn chỉnh như bản gốc.
2. Phát hiện mask PNG gốc là ảnh trắng/đen với alpha 255 ở cả hai màu. `movement.mjs`, `ruins-waves.mjs` và `napstablook-waves.mjs` đã đọc kênh đỏ cho mask. Đạn dòng nước Napstablook tải cả hai mask và chọn theo khung ảnh. Kiểm tra pixel thật ở góc tim/ruồi/ếch/nước mắt/dòng nước, gồm các góc xoay và hệ số scale, đã bổ sung. Quỹ đạo và va chạm khung của các generator vẫn cần đối chiếu riêng, không suy ra đã khớp hoàn toàn chỉ từ test mask. Hố phòng 8/10 đã thay bộ đếm dịch chuyển cố định bằng di chuyển 30 Hz, giữ x và chênh 400 pixel; hai bảng chỉ dẫn phòng 10 đã dùng lời gốc và vùng tương tác theo hướng nhìn, tải font bitmap cả khi vào phòng trực tiếp. Phần đá đã sửa: không đẩy khi chỉ đứng gần; di chuyển và collider đi cùng nhau; Goofyrock chỉ rời nút khi chạm activator chứ không phải sau câu “Was that helpful?”. Test kiểm tra các trạng thái/vị trí và chuyển động giữa đường, chưa chứng minh mọi khung va chạm sát cạnh hoặc thứ tự alarm giống hoàn toàn bản gốc.
3. Phòng 12A đã bổ sung lời thoại/tên SAVE và tiếng chuột; không suy ra toàn bộ Ruins đã hoàn chỉnh. Encounter phòng 8–15 và nhóm nhiều quái/hard mode chưa chuyển.
4. Tiếp tục nhà Toriel, các phần Ruins còn thiếu, rồi Snowdin, Waterfall, Hotland, CORE, New Home, các tuyến và kết thúc. Cảnh Flowey mở đầu cũng còn thiếu.
5. Các hạn chế chung còn có: hộp thoại hiện cả trang thay vì gõ từng chữ, hoạt hình/âm thanh/chuyển cảnh chiến đấu chưa đầy đủ, các vật phẩm/điện thoại/trạng thái lưu ngoài phần hiện tại chưa đủ.

Không dùng lời thoại tự bịa, tự tăng plot hoặc bỏ qua trận để thay cho gameplay chưa chuyển.
Không giữ kỳ vọng test sai chỉ vì nó đang xanh. Mỗi phần cần đối chiếu source gốc và kiểm tra kết quả thật.

## File và lệnh cần biết

- `remake/src/main.mjs`: vòng lặp World, cửa, hộp thoại và điều phối controller.
- `remake/src/room-assets.mjs`: tải JSON/PNG/âm thanh theo phòng.
- Các controller `remake/src/*.mjs` và dữ liệu thoại `*.json`: tiếp tục convention hiện có.
- `tests/remake.mjs`: bộ kiểm thử tổng bằng Playwright, gọi các helper `tests/remake-*.mjs`.
- `remake/README.md`: mô tả tính năng và giới hạn; một số mô tả cũ cần đối chiếu lại source.

```bash
npm run dev:remake
npm run check:remake
npm run build:remake
mkdir -p .cache/test-tmp
TMPDIR="$PWD/.cache/test-tmp" CHROME_PATH=/opt/google/chrome/chrome npm run test:remake
```

Máy hiện tại có Chrome ở đường dẫn trên; phiên/máy khác cần xác minh lại.
Server phát triển mặc định dùng cổng 5191. `.cache/` chứa script kiểm tra/trích dữ liệu cục bộ, không được giả định có trong checkout mới.
Không commit `.cache/`, `test-results/`, `dist/`, thư mục game gốc hoặc bí mật.

Phần bảng chỉ dẫn phòng 10 đã qua cú pháp, build và `testRuinsHoles` gồm hướng nhìn, hai lời gốc, font bitmap, plot không đổi và hồi quy các hố.

Phần Vegetoid có kiểm thử `tests/remake-vegetoid.mjs`, gọi trong bộ tổng: Check/Talk/Devour thất bại và thành công, Dinner ở cả hai dạng đạn, HP/sát thương, rau xanh khi bất tử, Spare/Flee, EXP/GOLD/kill/cờ dân số. Quỹ đạo từng frame và trình bày vẫn cần đối chiếu thêm như ghi trong README.
Phần Vegetoid đã qua kiểm tra cú pháp, build và kiểm thử riêng trên Chrome nêu trên.
Toàn bộ `test:remake` đã qua sau phần Vegetoid, trước khi nối phòng 14.
Commit `d1f151c6` sửa fixture kiểm thử Vegetoid: hồi HP giữa các ca ACT độc lập để tránh nhân vật đứng yên qua ba wave ngẫu nhiên rồi Game Over trong khi test vẫn chờ menu. Vẫn giữ kiểm tra sát thương/rau xanh/bất tử và không đổi gameplay. Đã tái hiện timeout ở trạng thái `dead`, HP 0, turn 2 trước khi sửa; kiểm thử riêng đã qua sau sửa.

Phần phòng 14 có kiểm thử `tests/remake-ruins-14.mjs`, gọi trong bộ tổng: cửa hai chiều với 13, biển đúng hướng/font, mask hố xuống, sáu lối lên hai độ cao, công tắc/tường/gai/khóa di chuyển, túi đầy và nhặt Ribbon/bỏ va chạm, bốn lời ma/fade/cờ, lưu/nạp, hai Vegetoid mở trận thật và điều kiện NPC vắng mặt. Chưa có kiểm thử Parsnik hoặc encounter ngẫu nhiên vì các phần đó chưa chuyển.
Phần phòng 14 đã qua cú pháp, build, kiểm thử riêng và chuỗi hồi quy hố 8/10 → sự kiện 12B/13 → phòng 14 trên Chrome nêu trên, không có lỗi JavaScript/console. Sau đó đã qua trong bộ tổng của phần góc nhìn phòng 15.

Phần góc nhìn có kiểm thử `tests/remake-ruins-perspective.mjs`, gọi trong bộ tổng: cửa 14/15A–15E, biển/hướng nhìn, màu/va chạm/che khuất, Yes/No, ba lời giải và khóa tường/gai, nhấn lại không lùi plot, lưu/nạp, sáu bẫy sai/khóa menu/rơi/trở lại, cờ 43/51 và vùng gợi ý có hoàn trả bước đi. Đối chiếu `obj_*switch_1`, `SCR_TEXT` 519–522, `obj_pillar_1`, `obj_plotwall_room`, `obj_switchhelptrigger`, `obj_door_ruins13` và `obj_spikes_room`. Các kiểm thử xác minh luật chơi và kết quả; thứ tự alarm, thời điểm gõ chữ và chuyển cảnh từng frame vẫn cần đối chiếu thêm.
Phần góc nhìn đã qua `check:remake`, `build:remake`, kiểm thử riêng (gồm tường ngang/đứng chặn đường thật) và toàn bộ `test:remake` trên Chrome nêu trên sau sửa fixture Vegetoid. Bộ tổng cũng kiểm tra cảm ứng, đóng gói JavaScript không cần WASM và hosting tĩnh dưới đường dẫn con.

Phần nhánh 16–18OLD có kiểm thử `tests/remake-ruins-outlook.mjs`, gọi trong bộ tổng: cửa C/D hai chiều, các cửa nhánh phụ, ba lời thoại Froggit/ưu tiên cờ/animation cả khi mở menu/kill/bỏ collider, Toy Knife đúng hướng/túi đầy/cờ 102/va chạm, ITEM thật đổi Stick và lưu/nạp/đi lại không nhặt trùng. Đối chiếu `obj_smallfrog`, `obj_knife_pickup`, `SCR_TEXT` 523, `obj_doorA/B/C/D` và `RoomOrder`. Font hiện dùng giới hạn chung, chưa tô riêng chữ TORIEL màu xanh trong câu thoại.
Đã qua cú pháp, build, kiểm thử riêng từ cache trình duyệt mới và chuỗi hồi quy 15A–15E → 16/17/18OLD, không có lỗi JavaScript/console. Sau đó cũng đã qua trong bộ tổng của phần phòng 19.

Phần phòng 19 có kiểm thử `tests/remake-ruins-home.mjs`, gọi trong bộ tổng: cửa 16/19, trigger và khóa điều khiển, chuyển động path/điện thoại/dấu chấm than, chân dung theo trang, nhánh HP đầy/9/3/4/hồi máu, plot 17/không lặp, nhạc/fade/tốc độ/hủy khi đổi phòng và ưu tiên Reunited, cây/va chạm/nhánh kết thúc, SAVE Home/Return/hồi HP/lưu nạp. Đã qua kiểm thử riêng, cú pháp và build. Hộp thoại vẫn hiện cả trang, chưa đổi cảm xúc giữa dòng (ví dụ “Impressive!”), chưa đủ hoạt hình nói của NPC; thứ tự alarm/tween từng frame còn cần đối chiếu.
Toàn bộ `test:remake` đã qua sau khi nối phòng 19 (gồm nhánh 16–18OLD, cảm ứng và hosting tĩnh). Nhánh nhạc Reunited được thêm sau khi bộ tổng bắt đầu; bản cuối đã qua lại cú pháp/build và toàn bộ kiểm thử riêng phòng 19 gồm nhánh này, không có lỗi JavaScript/console.

Sảnh nhà có kiểm thử `tests/remake-toriel-hall.mjs`, gọi trong bộ tổng: cửa sân/sảnh hai chiều và fade, bảy/tám trang thường/Hard Mode/đổi chân dung/khóa, plot 18/path/toribuster/không lặp/lưu nạp, sách đúng hướng, lan can/mask/bậc thang đổi hướng, cờ 45 cho hai path quay lại, nhạc hai lớp/tốc độ .4/Reunited/hủy khi đổi phòng. Đã qua cú pháp, build và kiểm thử riêng. `walkNpc` đã chặn callback ảnh khi NPC không còn active: Phaser gọi onUpdate riêng cho x/y nên sau khi hủy NPC ở callback đầu, callback còn lại phải bỏ qua; lỗi đã tái hiện ở sảnh trước khi sửa. Test âm lượng chờ Web Audio áp dụng gain và so sánh theo độ chính xác số thực, không đổi luật chơi.
Toàn bộ `test:remake` đã qua sau phần sảnh, gồm các cảnh Toriel cũ dùng helper path chung, sân/sảnh, cảm ứng và hosting tĩnh dưới đường dẫn con; không có lỗi JavaScript/console trong bộ tổng.

Phần 12A có kiểm thử tại `tests/remake-ruins-12a.mjs`: hướng tương tác/tiếng chuột, chống phát chồng, lời SAVE thường/hết quái, file cũ/mới, Return/Save/nạp/hồi HP và va chạm/thoại bàn phô mai.
Phần 12A đã qua cú pháp, build, kiểm thử riêng và chuỗi hồi quy Napstablook → 12A → 12B/13; sau đó cũng đã qua trong bộ tổng của phần Vegetoid.

Phần mask chiến đấu có kiểm thử tại `tests/remake-battle-masks.mjs`, dùng scene và PNG thật để kiểm tra pixel đen/trắng, sát thương/bất tử và các phép xoay/co giãn; được gọi trước test trận thường trong bộ tổng.
Phần mask đã qua cú pháp, build, kiểm thử riêng, kiểm thử Napstablook với vị trí đạn đã chỉnh và toàn bộ `test:remake`.

Phần hố có kiểm thử tại `tests/remake-ruins-holes.mjs`: vùng trắng/đen, scale holedown2, thời gian chờ, alpha/xoay/âm thanh, lên/xuống 400 pixel, camera/khóa điều khiển, dấu sàn và nhánh 11 lần sập; được gọi trong bộ tổng.
Phần hố đã qua kiểm tra cú pháp, build, kiểm thử riêng, kiểm thử hồi quy đá và toàn bộ `test:remake` trên Chrome nêu trên.

Phần đá có kiểm thử tại `tests/remake-ruins-path.mjs` và `tests/remake-ruins-late.mjs`: đẩy/lùi, đứng gần không tự đẩy, chốt nút, collider mới, ba đá phòng 11, path Goofyrock/nhường đường, activator/gai/tường, cờ 31–33/35, lời thoại tuyến thường/kết thúc và lưu/nạp.
Phần đá đã qua kiểm tra cú pháp, build, kiểm thử riêng và toàn bộ `test:remake` trên Chrome nêu trên.

Phần Napstablook có kiểm thử trình duyệt riêng tại `tests/remake-ruins-12.mjs`, được gọi trong bộ tổng.
Ở mốc `5547acd7`, `check:remake`, `build:remake`, kiểm thử riêng và toàn bộ `test:remake` đã qua trên Chrome tại đường dẫn nêu trên.
Kiểm tra No/Yes/Flee, bốn ACT, bốn dạng đợt (nước mắt, dòng nước, chữ buồn, mũ), HP/bất tử/ITEM, kết thúc ma không chết, Hard Mode Check, Game Over nạp snapshot, lưu/nạp và nhánh hết quái.
Bộ tổng từng có kiểm tra thời điểm ẩn nhân vật khi rơi hố phòng 10 thất bại không ổn định ở phiên trước; nếu tái diễn, xác minh nguyên nhân trước khi sửa.

Mỗi phần độc lập: kiểm tra diff → check/test phù hợp → commit tiếng Việt → push `origin main` → báo mã commit và giới hạn còn lại.

Hành lang phòng ngủ đã chuyển cảnh `obj_torieltrigger7`: vị trí đầu Frisk 38/144, Toriel 54/120, handhold path tương đối 20_2 tốc độ 2, đặt lại hai nhân vật tới 159/140 và 143/119, ruffle 90 frame rồi lời về mùi cháy và plot 19/path 20 tốc độ 6. Có ngăn kéo, biển sửa phòng, cây theo cờ 50, lời gương theo cờ 7/202/tên, phản chiếu đổi hướng và kẹp y ≥ 73 nằm sau tile. Nhạc hai lớp trong nhà dùng chung `house-music.mjs`. Test tại `tests/remake-toriel-corridor.mjs`, được gọi trong bộ tổng; kiểm tra khóa/ẩn/hiện, path/camera/90 frame, plot/lưu nạp/không lặp và tương tác/phản chiếu. Đã nối cả hai phòng Frisk/Asriel và Toriel.

Phần hành lang đã qua cú pháp, build, kiểm thử riêng và chuỗi hồi quy sảnh → hành lang trên Chrome, không có lỗi JavaScript/console. Bộ tổng gần nhất đã xác nhận qua ở `11874911`; phần phòng Frisk/Asriel đã qua kiểm thử riêng và chuỗi hành lang → phòng ngủ. Bộ tổng đã chạy tới đá phòng 11 rồi gặp assertion timing của test cũ; ca này đã được sửa ở `f3e17b4` và qua kiểm thử riêng. Người dùng đã yêu cầu làm liên tục tới khi hoàn thành toàn bộ game; goal đang active, không kết thúc sau từng commit.

Nhạc nhà đã giữ cùng Sound instance khi chuyển giữa sảnh/hành lang và các phòng trong nhóm HOUSE_ROOMS; rời nhóm hoặc shutdown mới dọn, đổi chế độ nhạc theo cờ thì tạo track đúng. Kiểm thử sảnh → hành lang xác minh giữ nguyên instance và dọn khi về sân; cú pháp/build/chuỗi kiểm thử đã qua. Chưa nối nhạc liên tục giữa sân và các phòng Ruins.


Phần phòng Frisk/Asriel đã chuyển cửa C từ hành lang và cửa D quay lại: đọc đồ chơi/khung ảnh/giày, đèn sáng/tối, ngủ theo path gốc, thức dậy hồi HP và tạo Butterscotch-Cinnamon Pie ở plot < 20; giấc mơ plot ≥ 24 có nhánh cờ 7; lấy bánh kiểm tra túi đầy, collider, cờ 103, lưu/nạp; Hard Mode nhận Snail Pie ID 63 hồi tới max HP - 1. Test tại `tests/remake-child-bedroom.mjs`, đã gọi trong bộ tổng; khung ảnh có lời riêng theo cờ 7; xử lý cả phím xác nhận còn treo sau khi đóng menu trong cảnh khóa. Phòng Toriel đã nối; phòng khách và basement chưa nối.

Phòng Frisk/Asriel đã qua check/build và kiểm thử riêng trên Chrome, gồm khung ảnh thường/sau kết thúc. Bộ tổng trước đó đã qua tới hành lang nhưng phát hiện vùng tương tác giường thiếu ScaleY; đã sửa helper chỉ áp scale, giữ convention origin để tránh làm hỏng công tắc phòng 3. Chuỗi hành lang → phòng ngủ và ca công tắc riêng đã qua sau sửa.

Kiểm thử khóa Goofyrock đã đổi từ giữ phím trong khoảng thời gian cố định sang lấy mẫu vị trí/menu ở từng postupdate còn khóa (`f3e17b4`): đã tái hiện hai lần test cũ giữ phím tới sau khi đá mở khóa. Ca riêng sau sửa qua, không đổi gameplay. Cần chạy lại bộ tổng với test mới.

Phòng Toriel `room_torielroom` nối hai chiều A/B với hành lang: nhật ký có Yes/No và bốn trang truyện đùa, ngăn kéo tất đọc lại trong phiên phòng (reset khi vào lại), xô ốc, sách thực vật đặt cờ 50 đổi lời cây hành lang, giường/cactus/Chairiel theo cờ 7. Cactus và ghế có collider, dùng nhạc nhà liên tục và mix về lớp sáng. Kiểm thử `tests/remake-toriel-bedroom.mjs` đã qua riêng và chuỗi hành lang → Frisk → Toriel, kiểm tra cửa/thoại/lựa chọn/cờ/va chạm/nhạc/lưu nạp. Bộ tổng đang chạy lại sau sửa test Goofyrock. Chưa có phòng khách, bếp và basement.

Phòng khách/bếp đã nối cửa A/B từ sảnh và cửa markerX giữa hai phòng. `toriel-living.mjs/json` chuyển SCR_TEXT 527–532: gợi ý ngủ, trò chuyện, hỏi về nhà/sách, bốn câu ốc ngẫu nhiên, từ chối/tiếp tục, plot 19.1/19.2/19.3/19.4/19.9/20/21, hoạt hình đứng dậy 30 frame và path rời ghế. Ghế rỗng đổi cả sprite/mask, lửa animate cả trong menu và biến mất theo cờ 45; chân dung đổi theo trang, có lớp kính. Bếp có hình bánh theo cờ 103, lời nóng/miếng bánh/kết thúc và nhánh knives/stove. Đã qua check/build và kiểm thử riêng toàn bộ lựa chọn, bốn câu ngẫu nhiên, cửa, nhạc, khóa, collider, lưu nạp và đồ vật; test gọi trong bộ tổng. Bộ tổng trước phần này đã qua ca Goofyrock sau sửa timing, đang chạy tiếp. Basement/boss Toriel/Flowey và phần còn lại game vẫn chưa chuyển. Giới hạn chung về gõ chữ và đổi cảm xúc giữa dòng vẫn còn.

Basement 1–3 đã có nhạc intronoise rate .3/volume .4 giữ cùng instance giữa các phòng hoặc Reunited theo cờ 7; dọn khi trở lên nhà. Trigger 8 đưa về khi xuống sớm: path tiếp cận, lời theo cờ 44 (trước plot 19 có hai trang và reset bộ đếm), cờ 45, nắm tay/ẩn Frisk/path về/cửa thật và Toriel quay lại ở sảnh. Trigger 9/10/11 tạo Toriel sau 2 frame ở plot 21/22/23, khóa và hoàn trả bước chạm, thoại 6/9/2 trang, chuyển plot 22/23/24 sau khi đọc, path đi phải/đi lên. Có kiểm thử riêng đi cầu thang chữ U từ sàn sảnh, cửa/marker hai chiều, nhạc, khóa, lời/cờ, lưu nạp không lặp và năm nhánh đưa về. Check/build đã qua; không coi basement 4 hoặc trận Toriel là đã có.

Bộ tổng đã xanh sau phòng Frisk/Toriel (`0d11957d`) trên gói xuất, gồm sửa test Goofyrock, kiểm tra cảm ứng và hosting đường dẫn con. Phòng khách/bếp (`52a02eec`) đã qua chuỗi kiểm thử riêng toàn bộ khu nhà và check/build. Cần chạy lại bộ tổng có phòng khách/bếp và basement mới. Hard Mode từ màn nhập tên chưa thống nhất: một số controller kiểm tra tên Frisk, số khác đọc cờ 6; phải đối chiếu và hoàn thiện trước khi báo hỗ trợ Hard Mode toàn tuyến.

Trận Toriel đã nối qua basement 3 → 4 → 5, gồm trigger 12/thách đấu theo cờ 45/ký ức TK/dân số, lớp lửa bốn bậc, Flee/đấu lại; Check/Talk ba lần/ký ức, ITEM, 25 MERCY/đổi sprite/thỏa hiệp, FIGHT/phòng thủ ở HP ≤ 150/EXP 150, nhánh betrayal và tuyến giết; linh hồn vỡ rồi trả về, Game Over nạp snapshot. Generator lửa xoắn/mini/lửa hai bên/bàn tay đơn/đôi và tránh tim khi HP ≤ 2 có clipping, mask thật, nhịp Hard Mode, sát thương/bất tử. Đã dùng font fnt_plain và bong bóng gốc. Cảnh tha có năm trang, ôm 120 frame + tách 60 frame, lời chào, path3/nhìn lại/rời phòng rồi plot 25. Lưu/nạp không lặp; cờ 45 = 4 mở lối sau giết. Mã `toriel-battle.*`, `toriel-waves.mjs`, `toriel-gate.*`; kiểm thử riêng trận/cảnh đã qua, gồm ba kiểu kết liễu, ký ức, Flee, 25 MERCY và Game Over.

Kết thúc Hard Mode tại Toriel dùng `hard-mode-end.*`: chó vào phòng, toàn bộ hội thoại chó/Toriel/Flowey, pause/di chuyển, năm mốc tiêu đề với bốn dòng, nhạc và màn đen `room_emptyblack` theo source. Kết thúc không tính EXP/kill của tuyến thường; tha vẫn giữ cờ 27/45 và TS. Test riêng chạy cả sau tha và bị đánh bại, kiểm tra toàn bộ ba người nói/tiêu đề/không có thưởng giả. Cờ hoàn thành Hard Mode và ký ức Toriel lưu ngoài SAVE theo convention localStorage riêng. Chưa coi toàn tuyến Hard Mode là hoàn chỉnh: bật từ tên Frisk và nhóm quái Hard Mode trước boss vẫn còn thiếu.

Giới hạn cần đối chiếu thêm của phần Toriel: đường smooth của bàn tay dùng Phaser Spline, chưa chứng minh từng điểm trùng thuật toán path gốc; thứ tự collision/alarm sát biên, animation tan bụi/đạn sinh nhỏ, hiệu ứng gõ chữ/ngắt và màu riêng giữa dòng vẫn chưa khớp toàn bộ. Test chứng minh các nhánh gameplay/điều kiện/kết quả và mask, không chứng minh toàn bộ animation từng frame. Bộ tổng có thêm ba helper `remake-toriel-battle`, `remake-toriel-gate`, `remake-hard-mode-end` đang chạy; lần xanh trước phần boss đã bao gồm hai phòng ngủ, cảm ứng và hosting.

Bộ tổng lần đầu sau boss dừng tại assertion biển phòng 14 do helper chỉ chờ 65 ms rồi đọc lại dialogueText đã hủy trước khi frame xử lý Z. Đã bổ sung chờ poststep ở test (`1258252`), giữ toàn bộ assertion; chuỗi phòng 13 → 14 đã qua. Các kiểm thử riêng trận Toriel/cửa ra/Hard Mode bản cuối đã qua, gồm font/bong bóng và fade nhạc. Bộ tổng đang chạy lại với helper mới; không ghi nhận là đã xanh cho toàn bản mới cho tới khi có kết quả.

Cảnh Flowey sau Toriel đã nối basement 5 → room_ruinsexit: khóa cửa dưới ở tuyến thường, đọc TK/TS/FloweyExplain1 và ký ức Alter/K/SPECIALK/alter2, các nhánh giết lần 1/2/nhiều, giết sau tha, tha sau giết, tha có/không kill và tuyến diệt chủng. Có chân dung/tên, cờ truename/alter2/explained ngoài SAVE, nhánh ưu tiên cờ 26 theo scr_murderlv, cười/lớn lên/thu nhỏ/chìm, alarm 150/80/240 frame và plot 28; lưu nạp không lặp. Test riêng `tests/remake-flowey-exit.mjs` đã qua cả các nhánh, cửa hai chiều sau kết thúc, khóa di chuyển/menu và cờ/ký ức/animation giữa đường. Font/thoại vẫn có giới hạn gõ chữ chung. Màn logo/cửa trên chưa nối trong phần này.

Bộ tổng sau `5f54808a` đã qua toàn bộ gameplay (gồm phòng khách/bếp, basement, Toriel và Hard Mode) và bước tổng hợp tải tài nguyên; Chrome crash tại ca cảm ứng khi mở context thứ hai (`Target crashed` ở tests/remake.mjs:409). Không ghi nhận bộ tổng xanh; cần chạy lại cảm ứng/hosting trên gói mới và kiểm tra resource nếu tái diễn. Không có tiến trình kiểm thử cũ còn chạy khi tiếp tục phiên này.

Màn chuyển chương đã nối cửa thật Ruins → whitefader 180 frame → room_undertale (logo/By Toby Fox/đen, mỗi mốc 150 frame) → markerA Snowdin 1, hướng phải và thay danh bạ bằng 206. Không có phím bỏ qua tự thêm. Snowdin 1 có camera trong bụi đúng hướng, bỏ cửa thường/thêm hai collider với mask chéo, nhạc tone2/fade/Snowy/toomuch/Reunited theo plot và cờ, đường quay lại Ruins hai chiều sau kết thúc bằng markerS. Phone206 có tên/CELL thật, nhánh noAnswer độc lập busy/giết Toriel, 18 đoạn tin nhắn scr_torcall, số đã đọc/khả dụng và chuyển lên đầu danh bạ; lưu nạp giữ dữ liệu. Test riêng `remake-snowdin-start.mjs` đã qua, gồm chuyển cảnh từ cửa thật, các mốc, khóa, camera/va chạm, nhạc/ưu tiên cờ và tin nhắn/lưu nạp. Đã qua check/build. Phòng 2/cuộc gặp Sans chưa chuyển; các giới hạn thoại gõ chữ và nhạc xuyên nhóm phòng vẫn còn.

Kiểm thử đường rừng phát hiện lỗi bộ di chuyển cũ: spr_maincharar/l chỉ có 2 texture nhưng animation dùng modulo 4, xuất hiện __MISSING và gây lỗi trigger đọc mask sau khi đi ngang lâu. `movement.mjs` đã dùng TextureCount của hướng thật; `remake-walk-frames.mjs` kiểm tra 60 frame mỗi hướng, đủ 2/4 khung và tốc độ 3 pixel.

Phòng rừng `room_tundra2` đã nối hai chiều phòng 1: giữ instance nhạc, 9 cây tiền cảnh/parallax, cành cây gãy theo collision và cờ 47/275/âm thanh, bóng Sans thoáng qua/tăng tốc khi quay lại, tone3 theo vị trí. `snowdin-forest.*` chuyển cuộc gặp Sans từ trigger thật: tiếp cận, 3/1 trang theo ký ức M1 ngoài SAVE, quay lại/bắt tay/whoopee, intro 13/17 trang, đi qua cổng, trốn sau đèn hoặc từ chối trên tuyến giết. Có toàn bộ đối thoại Papyrus/Sans theo hai tuyến, sprite/chân dung/font riêng, hai màn zoom pha trò, Papyrus đi/ngoái lại, ra khỏi đèn/plot36, Sans tương tác 3 lần, hai trigger bye/plot37/Snowy rate .95/.6, Flowey phía sau và collider Sans/đèn sau cảnh. Test riêng đã qua cả 3 kịch bản lần đầu/gặp lại/diệt chủng và các trạng thái/khóa/âm thanh/cờ/va chạm/lưu nạp; đã xem ảnh trong trình duyệt. Cửa tới phòng 3 chưa nối; encounter/SAVE/hộp đồ/cần câu vẫn phải chuyển tiếp. Giới hạn: zoom dùng camera Phaser với mốc co/giãn 10 frame; thứ tự alarm/phóng hình từng frame của GML và hiệu ứng fun Papyrus cần đối chiếu thêm; thoại vẫn hiện cả trang/chưa đổi cảm xúc hoặc màu giữa dòng.

Bộ tổng sau màn logo (`b6b3b0b1`) đã qua toàn bộ gameplay tới Hard Mode, rồi timeout tại phím ArrowUp đầu fixture Flowey. Nguyên nhân thứ tự fixture: Hard Mode gọi resume World nhưng Phaser áp dụng ở frame kế; phòng baseline đã cache khiến test sau gửi phím trước resume và phím bị reset. Helper Hard Mode giờ chờ poststep sau dọn scene, không đổi gameplay/assertion. Chuỗi Hard Mode (tha/giết) → Flowey với basement 5 đã cache đã qua sau sửa. Bộ tổng chưa xanh cho bản mới cho tới khi chạy lại. Chuỗi riêng logo → kiểm tra 60 frame bốn hướng → rừng Sans/Papyrus bản cuối đã qua; check/build đã qua.

Tough Glove (ID 14) đã có dữ liệu INFO/USE/tên gốc, thay vũ khí cũ và AT +5, giữ qua SAVE. `fight-input.mjs` dùng chung cho Dummy/Ruins/Toriel, giữ công thức vũ khí cũ; găng tay tăng tốc thanh 1.2x, Z đầu chốt vị trí/bonus 2.1, bốn lần nhấn sau trong 30 frame, ceil(damage × số cú/4), zero punch = MISS; có prompt nhấp nháy, nắm đấm yếu/mạnh, âm thanh/shake. Không gây sát thương khi mới dừng thanh. Test `remake-tough-glove.mjs` đã qua 0–4 cú, phím thật, HP, tốc độ/thời gian, equip/lưu nạp trên Froggit và Toriel; chuỗi hồi quy Froggit/Whimsun → Glove → Toriel đã qua. Fixture Toriel nay đặt rõ Stick/Bandage để không phụ thuộc vũ khí từ ca trước. Check/build đã qua. Đường nhận Tough Glove từ BOX đang chuyển ở phần Box Road, chưa nối trong phần này.
