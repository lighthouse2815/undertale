# Bàn giao bản viết lại Undertale

Cập nhật: 27/10/2026, sau phần trận Vegetoid đơn. Mốc code trước phần này: `1efd02c1` trên `main`.
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
- Có menu ngoài trận, một số cuộc gọi Toriel, túi 8 ô và dữ liệu vật phẩm ID 1–13.
- Có trận Napstablook nối từ phòng 12; Check/Threat/Cheer/Flirt, màn mũ, kết thúc riêng, Flee/ITEM và Game Over; xem giới hạn trình bày trong `remake/README.md`.
- Mask trái tim/đạn trong trận đã đọc pixel trắng thay vì alpha, dòng nước Napstablook tải mask theo khung hình; có kiểm tra góc đen an toàn, hình ếch, xoay/co giãn, sát thương và bất tử bằng tài nguyên thật.
- Có trận đơn Froggit/Whimsun, một số đợt đạn, ACT/FIGHT/ITEM/MERCY, phần thưởng và Game Over nạp snapshot tạm; encounter mới nối ở phòng lá.
- Có trận Vegetoid đơn qua `__remake.startBattle('vegetoid')`: Check/Devour/Talk/Dinner, hai generator cà rốt/rau, đạn xanh hồi HP cả khi bất tử, tha/Devour/Flee/đánh bại và thưởng riêng. Chưa nối Vegetoid ngoài phòng 14, chưa có Parsnik Hard Mode hoặc encounter ngẫu nhiên Vegetoid.
- Các phòng Ruins tới 13 đã có nhiều phần triển khai, **chưa hoàn chỉnh toàn bộ sự kiện và hành vi gốc**. Xem giới hạn bên dưới và `remake/README.md`.
- Phần trước: cửa phải phòng 12 → 12A → 12B; cửa trên phòng 12 ↔ 13 dùng markerX. Spider Bake Sale mua Donut 7G/Cider 18G, kiểm tra túi/GOLD và cờ 59. Phòng 13 có các hội thoại Froggit, cờ màu tên 22 được trận thường đọc lại, cuộc gọi bánh Toriel theo trigger vô hình và Flowey chìm khi camera thấy.

## Việc tiếp theo và các chỗ phải sửa thật

1. **Ưu tiên phòng 14 trở đi và encounter còn thiếu.** Vegetoid đơn đã chuyển, bước tiếp là nối cửa 13 ↔ 14, hố cao khác nhau, công tắc/tường/gai, Ribbon, Napstablook và Vegetoid ngoài trận trong phòng 14. Đối chiếu `obj_holeup2` (lối dưới đi lên 510 pixel), `obj_plotswitch3`, `obj_plotwall6`, `obj_ribbon_pickup`, `obj_napstablook2`, `obj_vegetoid_overworld`. Nhánh Hard Mode dùng Parsnik (nhóm 122), chưa có; không thay bằng Vegetoid thường rồi báo đã chuyển đầy đủ. Trận Napstablook đã nối: No không đổi plot; Yes vào battlegroup 20; Cheer ba lần → màn mũ, Cheer/Flirt tiếp → lời cảm ơn tự động, cờ 36 và fade tới plot 11. Flee giữ ma để đấu lại; đánh cạn 88 HP khiến ma rời đi, không đổi EXP/GOLD/kill/dân số. Nhánh cờ 202 >= 20 tự rời phòng không bật cờ 36. Bộ test phòng 12 đã thay kỳ vọng bỏ qua boss bằng các nhánh thật. Va chạm dòng nước sát khung và nước mắt tạo mũ còn cần đối chiếu từng khung; test hiện tại kiểm tra luật chơi và kết quả, chưa chứng minh toàn bộ quỹ đạo giống hệt gốc. Trình bày bong bóng thoại, gõ chữ và chuyển cảnh chiến đấu cũng chưa hoàn chỉnh như bản gốc.
2. Phát hiện mask PNG gốc là ảnh trắng/đen với alpha 255 ở cả hai màu. `movement.mjs`, `ruins-waves.mjs` và `napstablook-waves.mjs` đã đọc kênh đỏ cho mask. Đạn dòng nước Napstablook tải cả hai mask và chọn theo khung ảnh. Kiểm tra pixel thật ở góc tim/ruồi/ếch/nước mắt/dòng nước, gồm các góc xoay và hệ số scale, đã bổ sung. Quỹ đạo và va chạm khung của các generator vẫn cần đối chiếu riêng, không suy ra đã khớp hoàn toàn chỉ từ test mask. Hố phòng 8/10 đã thay bộ đếm dịch chuyển cố định bằng di chuyển 30 Hz, giữ x và chênh 400 pixel; hai bảng chỉ dẫn phòng 10 đã dùng lời gốc và vùng tương tác theo hướng nhìn, tải font bitmap cả khi vào phòng trực tiếp. Phần đá đã sửa: không đẩy khi chỉ đứng gần; di chuyển và collider đi cùng nhau; Goofyrock chỉ rời nút khi chạm activator chứ không phải sau câu “Was that helpful?”. Test kiểm tra các trạng thái/vị trí và chuyển động giữa đường, chưa chứng minh mọi khung va chạm sát cạnh hoặc thứ tự alarm giống hoàn toàn bản gốc.
3. Phòng 12A đã bổ sung lời thoại/tên SAVE và tiếng chuột; không suy ra toàn bộ Ruins đã hoàn chỉnh. Encounter phòng 8–13 và nhóm nhiều quái/hard mode chưa chuyển.
4. Tiếp tục phòng 14 trở đi, các phần Ruins còn thiếu, rồi Snowdin, Waterfall, Hotland, CORE, New Home, các tuyến và kết thúc. Cảnh Flowey mở đầu cũng còn thiếu.
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

Phần 12A có kiểm thử tại `tests/remake-ruins-12a.mjs`: hướng tương tác/tiếng chuột, chống phát chồng, lời SAVE thường/hết quái, file cũ/mới, Return/Save/nạp/hồi HP và va chạm/thoại bàn phô mai.
Phần 12A đã qua cú pháp, build, kiểm thử riêng và chuỗi hồi quy Napstablook → 12A → 12B/13. Bộ tổng gần nhất đã qua ở mốc sửa mask `3c30e1b2`; sau phần 12A chạy các kiểm thử liên quan nêu trên.

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
