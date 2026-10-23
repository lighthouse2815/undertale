# DƯỚI ĐẤT — một câu chuyện dưới tầng tro

Game nhập vai chơi trên web (HTML/CSS/JavaScript thuần, không cần bước build).
Bạn là một đứa trẻ rơi xuống **Hầm Tro** — nơi tro phủ kín mọi lối đi và ngọn lửa
duy nhất còn cháy là ngọn lửa nơi ngai của Vua Tro.

Đây là **tác phẩm nguyên bản**: toàn bộ nhân vật, cốt truyện, bản nhạc, sprite
pixel, âm thanh đều do game này tự sinh ra trong trình duyệt — không sử dụng
hình ảnh, âm thanh hay nội dung của bất kỳ trò chơi nào khác.

---

## Chạy game

Yêu cầu: **Node.js 18+** và một trình duyệt hiện đại (có WebAudio).

```bash
npm run dev          # tương đương: node server.mjs
```

Mở **http://localhost:5173** là chơi được ngay.

Muốn đổi cổng thì đặt biến môi trường:

```bash
PORT=8080 npm run dev
```

Kiểm tra nhanh mã nguồn (cú pháp, kích thước bản đồ, sprite):

```bash
npm run check
```

(`playwright-core` trong `devDependencies` chỉ phục vụ việc kiểm thử tự động bằng
Chrome; chơi game không cần cài gì cả.)

## Điều khiển

| Phím | Tác dụng |
| --- | --- |
| `↑ ↓ ← →` hoặc `W A S D` | Di chuyển / chọn trong menu |
| `Z` · `Enter` · `Space` | Xác nhận, nói chuyện, tấn công |
| `X` · `Esc` | Mở túi đồ / quay lại |
| `M` | Bật–tắt âm thanh |
| `F` | Bật–tắt toàn màn hình |

Trên điện thoại/máy tính bảng có sẵn các nút cảm ứng ở dưới màn hình.

## Cách chơi

**Khám phá.** Đi qua sáu khu vực của Hầm Tro: Rêu Xanh → Hành Lang Tro →
Cầu Tro → Rừng Tro → Chợ Tro → Ngai Tro. Trong phòng có đèn lồng (hồi máu và
lưu game), rương đồ, biển chỉ dẫn, suối nước ấm trong Rừng Tro, và những người
bạn nói chuyện được: **Đom** (đom đóm dẫn đường), **Bà Mốc**, **Nhím** (chủ tiệm —
bán bánh mì tro, kẹo rêu, trà tro, mật đom).

**Trận đánh.** Mỗi lượt bạn chọn một trong bốn hành động:

- **ĐÁNH** — canh vạch chạy qua lại, càng gần vạch giữa thì sát thương càng lớn.
- **NÓI** — hỏi chuyện, khen, hát… Kẻ địch sẽ hé lộ điều gì đó; mỗi hành động
  đúng làm thanh **HƠI ẤM** đầy lên. Đây cũng là cách biết khi nào có thể tha.
- **ĐỒ** — dùng bánh mì tro, kẹo rêu, trà tro để hồi máu.
- **THA** — khi thanh HƠI ẤM đã đầy, bạn có thể tha cho kẻ địch. Tha không cho
  kinh nghiệm, nhưng mở đường cho cái kết tốt nhất.

Sau lượt của bạn, kẻ địch tấn công: điều khiển trái tim đỏ né đạn trong hộp —
mưa tro, quét ngang, đạn nhắm, vòng tròn, xoáy ốc, tường chắn… Vua Tro còn có
giai đoạn hai khó hơn hẳn.

**Ba kết thúc.** Hành trình của bạn được ghi nhớ bằng số người bạn tha và số
người bạn hạ:

| Kết thúc | Điều kiện |
| --- | --- |
| **BÌNH MINH TRO** | Tha hết, không hạ gục ai |
| **BÌNH MINH NHỎ** | Tha Vua Tro nhưng trước đó đã hạ gục ai đó |
| **TRO LẠNH** | Hạ gục Vua Tro |

Tiến trình được lưu tự động vào `localStorage` (`duoidat.save.v1`), và bị xoá
khi bạn đi hết một cái kết.

## Cấu trúc thư mục

```
index.html          khung trang, chỉ gắn canvas
server.mjs          static server cổng 5173
scripts/check.mjs   kiểm tra cú pháp + bản đồ + sprite
src/
  core.js           nhập liệu, âm thanh (WebAudio), vẽ, chữ, hội thoại, lưu game
  sprites.js        toàn bộ sprite pixel (chữ cái → bảng màu)
  data.js           phòng, kẻ địch, vật phẩm, hội thoại, cửa hàng
  world.js          bản đồ, va chạm, tương tác, túi đồ, cửa hàng
  battle.js         hệ thống trận đấu và các kiểu đạn
  main.js           màn hình chính, cảnh mở đầu, cảnh kết thúc, vòng lặp game
  style.css         giao diện trang
```

Không có bước build: trình duyệt chạy trực tiếp các ES module trong `src/`.

## Ghi chú về bản quyền

- Game này là **sáng tác nguyên bản**, chỉ lấy cảm hứng từ *thể loại* RPG
  dưới lòng đất + né đạn.
- Không có asset (hình, âm thanh, chữ) nào được sao chép từ trò chơi khác.
- Thư mục `Undertale-AnkerGames/` (bản game gốc để tham khảo cục bộ) **không**
  được đưa lên kho git — xem `.gitignore`.
