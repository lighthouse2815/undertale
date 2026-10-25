# DƯỚI ĐẤT — một câu chuyện dưới tầng tro

Game nhập vai chơi trên web (HTML/CSS/JavaScript thuần, không cần bước build).
Bạn là một đứa trẻ rơi xuống **Hầm Tro** — nơi tro phủ kín mọi lối đi và ngọn lửa
duy nhất còn cháy là ngọn lửa nơi ngai của Vua Tro.

Dự án chạy độc lập: logic gameplay, bản đồ và hội thoại nằm trong `src/`;
bộ hình ảnh và nhạc Undertale đang dùng được đóng gói trong `assets/`.
Không cần thư mục cài game gốc, file `.exe`, `data.win` hay bước trích xuất khi chạy.
Đây là gameplay hiện có của Dưới Đất, không phải bản chuyển toàn bộ logic Undertale gốc.

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

Chạy kiểm thử gameplay bằng Chrome/Chromium đã cài trên máy:

```bash
CHROME_PATH="/đường/dẫn/tới/chrome" npm test
```

Bộ kiểm thử tự mở server cổng 5187 (đổi bằng `TEST_PORT`), sử dụng profile trình
duyệt riêng. Server kiểm thử chạy từ một thư mục tạm chỉ chứa `index.html`,
`server.mjs`, `src/` và `assets/`, không có thư mục game gốc. Kiểm thử xác nhận
toàn bộ sprite và nhạc đi kèm nạp được, rồi kiểm tra đường đi và va chạm
trong chín phòng, cửa khóa, cửa hàng, túi đồ, lưu/tải, chuyển giai đoạn trùm,
các mẫu đạn, tuyến tha và ba kết thúc.
Ba tuyến còn được kiểm tra xuyên suốt bằng cách tìm đường và di chuyển qua đủ
chín phòng, nói chuyện để nhận hỗ trợ/mở cửa, chiến đấu với ba trùm rồi kiểm tra
kết thúc tương ứng. Kiểm thử riêng bao gồm dùng đồ trong trận, bỏ chạy thành công/
thất bại, trùm chặn bỏ chạy, canh đòn đánh và bố cục cảm ứng ở màn hình dọc/ngang.

## Điều khiển

| Phím | Tác dụng |
| --- | --- |
| `↑ ↓ ← →` hoặc `W A S D` | Di chuyển / chọn trong menu |
| `Z` · `Enter` · `Space` | Xác nhận, nói chuyện, tấn công |
| `X` · `Esc` | Mở túi đồ khi khám phá hoặc ở menu trận đấu / quay lại |
| `P` hoặc nút `Ⅱ` | Tạm dừng / tiếp tục, kể cả trong trận |
| `M` | Bật–tắt âm thanh |
| `F` | Bật–tắt toàn màn hình |

Trên điện thoại/máy tính bảng có sẵn các nút cảm ứng ở dưới màn hình.
Nếu đã có điểm lưu, chọn **BẮT ĐẦU** sẽ hiện xác nhận: Z / Enter để chơi mới,
X / Esc để quay lại. Hành trình cũ được giữ cho đến khi hành trình mới được lưu.
Khi chuyển tab hoặc cửa sổ, game tự tạm dừng cả khám phá lẫn trận đấu.
Quay lại và nhấn P / Z / Enter hoặc X (hoặc nút cảm ứng) để tiếp tục.

## Giao diện

Phần nhìn và cảm giác được làm theo tinh thần RPG dưới lòng đất kiểu cổ điển:

- **Chữ pixel** — font [Handjet](https://github.com/rosettatype/Handjet) (giấy phép
  SIL Open Font License 1.1, xem `assets/fonts/OFL.txt`), vẽ trong canvas ở chế độ
  khử răng cưa bằng ngưỡng alpha nên chữ sắc như font bitmap. Đây là font pixel
  hiếm hoi có đủ dấu tiếng Việt.
- **Phòng tối gần như đen** — chín khu vực chỉ khác nhau ở sắc độ rất nhẹ, ánh sáng
  đến từ ngôi sao lưu game, đèn, và các hạt tro bay.
- **Hộp thoại viền trắng đặc** (viền dày 5px, góc vuông đúng kiểu gốc), mỗi dòng bắt
  đầu bằng dấu `*`, tên người nói nằm trong khung nhỏ vát góc phía trên.
- **Panel trận đấu** là khung trắng: HP / LV / TRO ở trên, nội dung ở giữa, hàng
  lệnh **ĐÁNH · NÓI · ĐỒ · THA** ở dưới, con trỏ là trái tim đỏ.
- **Điểm lưu** là ngôi sao vàng (thay cho đèn lồng trước đây) — chạm vào để hồi
  máu đầy và ghi lại hành trình.

## Tài nguyên đi kèm dự án

- `assets/sprites/`: 59 sprite `.png` cho nhân vật, kẻ địch, trùm, đồ vật và giao diện.
- `assets/music/`: 17 tệp `.ogg` cho màn hình tiêu đề, khu vực và trận đấu.
- Mỗi thư mục có `index.json` liệt kê tên tệp để trình duyệt nạp trực tiếp.
- `assets/fonts/`: font pixel Handjet cùng giấy phép OFL.

Các tệp này nằm trong Git nên bản clone có đủ code, hình ảnh và nhạc.
`Undertale-AnkerGames/` chỉ là dữ liệu tham khảo cũ trên máy, không còn được
code đọc tới. Không cần `LOCAL_MUSIC_DIR`, `LOCAL_SPRITE_DIR` hay công cụ trích xuất.
Khi chuyển dự án sang máy khác, clone repository hoặc mang theo `src/`, `assets/`,
`index.html`, `server.mjs` và `package.json`, rồi chạy `npm run dev` như hướng dẫn phía trên.

### Nhạc

Engine ưu tiên phát nhạc `.ogg` từ `assets/music/`; nhạc tổng hợp WebAudio được giữ
làm dự phòng. Hiệu ứng âm thanh vẫn do WebAudio của dự án tạo ra.
Đổi bài theo khu vực bằng bảng `LOCAL_TRACKS` trong `src/core.js`.
Khi thêm bài mới, thêm cả tệp và tên tương ứng vào `assets/music/index.json`.

| Cảnh | Tệp ưu tiên |
| --- | --- |
| Màn hình chờ | `mus_menu0.ogg` |
| Rêu Xanh, Hành Lang Tro | `mus_ruins.ogg` |
| Cầu Tro, Tuyết Tro | `mus_snowy.ogg` |
| Rừng Tro | `mus_waterfall.ogg` |
| Chợ Tro | `mus_temshop.ogg` |
| Ngai Tro | `mus_bergentruckung.ogg` |
| Trận thường / trận trùm | `mus_battle1.ogg` / `mus_boss1.ogg` |
| Thua / kết thúc | `mus_gameover.ogg` / `mus_z_ending.ogg` |

### Hình ảnh

Sprite nạp từ `assets/sprites/`, bao gồm cả logo Undertale cho màn hình chờ và
màn hình tiêu đề. Đổi ánh xạ trong `src/localassets.js`; khi thêm sprite mới,
thêm cả tệp và tên tương ứng vào `assets/sprites/index.json`.

Những sprite được dùng (xem `src/localassets.js`):

| Chỗ dùng | Sprite gốc |
| --- | --- |
| Màn hình chờ & màn hình tiêu đề | `spr_undertaletitle` (ảnh 320×240: nền đen + logo + tim đỏ) |
| Nhân vật chính (bốn hướng, khung đi) | `spr_f_mainchara` + `d`/`u`/`l`/`r` |
| Bọ Rêu (trận) | `spr_migosp` (con bọ xanh trong Ruins) |
| Nấm Buồn (trận) | `spr_moldsmal` |
| Chim Tro (trận) | `spr_whimsun` |
| Lính Sắt Vụn (trận) | `spr_dummybattle` (hình nộm gỗ) |
| Trùm Vua Tro | ghép 8 phần `spr_asgoreb_*` như trận Asgore gốc |
| Đom (NPC) | `spr_glowfly` (đom đóm) |
| Bà Mốc (NPC) | ghép từ nấm gốc `spr_moldessa_*` (mũ, thân, hai tay) |
| Rương | `spr_chestbox` |
| Biển chỉ dẫn | `spr_npc_sign` |
| Cột gãy (Hành Lang / Ngai Tro) | `spr_brokenpillar` |
| Cây (Rừng Tro) | `spr_singletree` |
| Hoa vang | `spr_echoflower` |
| Viền khung hội thoại / khung trận | `spr_border` (ô trắng 5×5, viền dày 5px, góc vuông) |
| Bảng tên người nói | `spr_blackbox_o` (viền 1px, góc vát) |
| Trái tim / con trỏ | `spr_heart` (tô lại màu theo ngữ cảnh) |
| Điểm lưu | `spr_savepoint` (2 khung hình nhấp nháy) |
| Hàng lệnh trận | `spr_fightbt`, `spr_actbt_center`, `spr_itembt`, `spr_sparebt` |

Kẻ địch và NPC trong game này là nhân vật nguyên bản, nên mỗi con được gán sang sprite
gốc gần nhất về dáng hình (xem các bảng `ENEMY_ART`, `PROP_ART`, `BAMOC_ART`, `KING_ART`
trong `src/localassets.js`) — muốn đổi thì sửa các bảng đó. Riêng NPC **Nhím** giữ art
tự sinh vì bản gốc không có sprite nhím.

Art tự sinh được giữ làm dự phòng khi một sprite không nạp được.

## Cách chơi

**Khám phá.** Đi qua chín khu vực của Hầm Tro: Rêu Xanh → Hành Lang Tro →
Cầu Tro → Đồng Tuyết Tro → Làng Tuyết Tro → Đường Tuần Tra → Rừng Tro → Chợ Tro → Ngai Tro. Trong phòng có ngôi sao lưu game (hồi
máu và ghi lại hành trình), rương đồ, biển chỉ dẫn, suối nước ấm trong Rừng Tro,
và những người bạn nói chuyện được: **Đom** (đom đóm dẫn đường), **Bà Mốc**,
**Nhím** (chủ tiệm ở Chợ Tro), **Bác Kem** và **Người Tuyết**. Bác Kem bán
kem tuyết, kẹo rêu và trà tro; các nhân vật ở Tuyết Tro kể thêm về con chó
khổng lồ đang giữ đường tuần tra.

Mở túi đồ bằng X / Esc để xem **mục tiêu hiện tại**. Gợi ý thay đổi khi bạn
mở đường qua trùm hoặc nói chuyện với Nhím. Trước trận cuối, bạn có thể đi
sang trái từ Ngai Tro để quay về Chợ Tro mua thêm vật phẩm.

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
server.mjs          static server cổng 5173, phục vụ code và assets của dự án
scripts/check.mjs   kiểm tra cú pháp + bản đồ + sprite + tài nguyên đi kèm
src/
  core.js           nhập liệu, âm thanh (WebAudio), vẽ, chữ, hội thoại, lưu game
  localassets.js    ánh xạ và nạp sprite từ assets/sprites/
  sprites.js        toàn bộ sprite pixel (chữ cái → bảng màu)
  data.js           phòng, kẻ địch, vật phẩm, hội thoại, cửa hàng
  world.js          bản đồ, va chạm, tương tác, túi đồ, cửa hàng
  battle.js         hệ thống trận đấu và các kiểu đạn
  main.js           màn hình chính, cảnh mở đầu, cảnh kết thúc, vòng lặp game
  style.css         giao diện trang
assets/
  music/            nhạc .ogg + index.json
  sprites/          hình ảnh .png + index.json
  fonts/            font pixel Handjet (woff2) + giấy phép OFL
```

Không có bước build: trình duyệt chạy trực tiếp các ES module trong `src/`.

## Nguồn tài nguyên

- Bộ 59 sprite và 17 tệp nhạc được sao chép từ dữ liệu Undertale cục bộ vào
  `assets/`, giữ nguyên tên và nội dung. Các tài nguyên Undertale thuộc chủ sở hữu
  của trò chơi, không phải tài nguyên tự sáng tác của dự án.
- Logic JavaScript, bản đồ, hội thoại và cơ chế chiến đấu hiện có nằm trong `src/`.
  Việc đóng gói tài nguyên không chuyển mã GameMaker hay toàn bộ logic từ `data.win`.
- Font Handjet trong `assets/fonts/` dùng SIL Open Font License 1.1
  (xem `assets/fonts/OFL.txt`).
- Thư mục cài game `Undertale-AnkerGames/` không được đưa lên Git;
  không đóng gói file thực thi hay `data.win`.
