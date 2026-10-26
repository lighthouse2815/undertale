# Bàn giao bản viết lại Undertale

Cập nhật: 26/10/2026, sau phần trận Napstablook. Mốc bàn giao trước phần này: `b762a563` trên `main`.
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
- Có các sự kiện đầu Ruins: công tắc, Dummy, Toriel dẫn qua gai, Froggit theo kịch bản, hành lang nhận điện thoại.
- Có menu ngoài trận, một số cuộc gọi Toriel, túi 8 ô và dữ liệu vật phẩm ID 1–13.
- Có trận Napstablook nối từ phòng 12; Check/Threat/Cheer/Flirt, màn mũ, kết thúc riêng, Flee/ITEM và Game Over; xem giới hạn trình bày trong `remake/README.md`.
- Có trận đơn Froggit/Whimsun, một số đợt đạn, ACT/FIGHT/ITEM/MERCY, phần thưởng và Game Over nạp snapshot tạm; encounter mới nối ở phòng lá.
- Các phòng Ruins tới 13 đã có nhiều phần triển khai, **chưa hoàn chỉnh toàn bộ sự kiện và hành vi gốc**. Xem giới hạn bên dưới và `remake/README.md`.
- Phần trước: cửa phải phòng 12 → 12A → 12B; cửa trên phòng 12 ↔ 13 dùng markerX. Spider Bake Sale mua Donut 7G/Cider 18G, kiểm tra túi/GOLD và cờ 59. Phòng 13 có các hội thoại Froggit, cờ màu tên 22 được trận thường đọc lại, cuộc gọi bánh Toriel theo trigger vô hình và Flowey chìm khi camera thấy.

## Việc tiếp theo và các chỗ phải sửa thật

1. **Tiếp tục đối chiếu câu đố đá/hố, sau đó các phần thiếu ở 12A và phòng 14 trở đi.** Trận Napstablook đã nối: No không đổi plot; Yes vào battlegroup 20; Cheer ba lần → màn mũ, Cheer/Flirt tiếp → lời cảm ơn tự động, cờ 36 và fade tới plot 11. Flee giữ ma để đấu lại; đánh cạn 88 HP khiến ma rời đi, không đổi EXP/GOLD/kill/dân số. Nhánh cờ 202 >= 20 tự rời phòng không bật cờ 36. Bộ test phòng 12 đã thay kỳ vọng bỏ qua boss bằng các nhánh thật. Va chạm dòng nước sát khung và nước mắt tạo mũ còn cần đối chiếu từng khung; test hiện tại kiểm tra luật chơi và kết quả, chưa chứng minh toàn bộ quỹ đạo giống hệt gốc. Trình bày bong bóng thoại, gõ chữ và chuyển cảnh chiến đấu cũng chưa hoàn chỉnh như bản gốc.
2. Đối chiếu lại `ruins-rock.mjs` và `ruins-goofyrock.mjs`: hố/đá hiện có các bước dịch chuyển tức thời và chuỗi tương tác đơn giản hóa. Cần chuyển chuyển động, vị trí, hội thoại, va chạm và cờ thực tế; test hiện tại chưa chứng minh những phần này trung thực hoàn toàn.
3. Phòng 12A còn thiếu lời thoại/tên SAVE đúng khu vực và âm thanh chuột. Encounter phòng 8–13 và nhóm nhiều quái/hard mode chưa chuyển.
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

Phần Napstablook có kiểm thử trình duyệt riêng tại `tests/remake-ruins-12.mjs`, được gọi trong bộ tổng.
Ở phần này, `check:remake`, `build:remake`, kiểm thử riêng và toàn bộ `test:remake` đã qua trên Chrome tại đường dẫn nêu trên.
Kiểm tra No/Yes/Flee, bốn ACT, bốn dạng đợt (nước mắt, dòng nước, chữ buồn, mũ), HP/bất tử/ITEM, kết thúc ma không chết, Hard Mode Check, Game Over nạp snapshot, lưu/nạp và nhánh hết quái.
Bộ tổng từng có kiểm tra thời điểm ẩn nhân vật khi rơi hố phòng 10 thất bại không ổn định ở phiên trước; nếu tái diễn, xác minh nguyên nhân trước khi sửa.

Mỗi phần độc lập: kiểm tra diff → check/test phù hợp → commit tiếng Việt → push `origin main` → báo mã commit và giới hạn còn lại.
