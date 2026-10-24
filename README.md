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

## Giao diện

Phần nhìn và cảm giác được làm theo tinh thần RPG dưới lòng đất kiểu cổ điển:

- **Chữ pixel** — font [Handjet](https://github.com/rosettatype/Handjet) (giấy phép
  SIL Open Font License 1.1, xem `assets/fonts/OFL.txt`), vẽ trong canvas ở chế độ
  khử răng cưa bằng ngưỡng alpha nên chữ sắc như font bitmap. Đây là font pixel
  hiếm hoi có đủ dấu tiếng Việt.
- **Phòng tối gần như đen** — sáu khu vực chỉ khác nhau ở sắc độ rất nhẹ, ánh sáng
  đến từ ngôi sao lưu game, đèn, và các hạt tro bay.
- **Hộp thoại viền trắng đặc** (viền dày 5px, góc vuông đúng kiểu gốc), mỗi dòng bắt
  đầu bằng dấu `*`, tên người nói nằm trong khung nhỏ vát góc phía trên.
- **Panel trận đấu** là khung trắng: HP / LV / TRO ở trên, nội dung ở giữa, hàng
  lệnh **ĐÁNH · NÓI · ĐỒ · THA** ở dưới, con trỏ là trái tim đỏ.
- **Điểm lưu** là ngôi sao vàng (thay cho đèn lồng trước đây) — chạm vào để hồi
  máu đầy và ghi lại hành trình.

Nếu máy bạn có bản game gốc, game sẽ dùng luôn sprite gốc cho nhân vật chính, kẻ địch
trong trận, trùm Vua Tro, NPC (Đom, Bà Mốc), đồ đạc trong phòng (rương, biển, cây, cột,
hoa), khung hội thoại/khung trận, tim, điểm lưu và hàng lệnh trận — xem mục “Dùng hình
ảnh (sprite) từ bản game bạn đã cài trên máy”.

## Dùng nhạc từ bản game bạn đã cài trên máy (tuỳ chọn)

Engine có thể phát các tệp `.ogg` **có sẵn trên máy bạn** thay cho nhạc tự tổng hợp.
Cách này giống các engine mã nguồn mở khác: repo chỉ chứa code, còn dữ liệu game là
của bản cài trên máy — **không tệp nhạc nào được sao chép vào dự án hay lên GitHub**.

Cách dùng:

1. Đặt bản cài vào `Undertale-AnkerGames/Undertale/` (thư mục này đã bị `.gitignore`
   bỏ qua), hoặc trỏ tới chỗ khác bằng biến môi trường:

   ```bash
   LOCAL_MUSIC_DIR="/đường/dẫn/tới/thư-mục-có-ogg" npm run dev
   ```

2. Chạy game như thường lệ. Khi vào màn hình chờ, góc dưới hiện dòng
   “Nhạc: lấy từ bản game trên máy”.

Server nội bộ chỉ phục vụ các tệp `.ogg` trong thư mục đó ở đường dẫn `/local-music/`
(danh sách ở `/local-music/index.json`), kèm kiểm tra tên tệp nên không đi ra ngoài
thư mục. Không có thư mục/nhạc thì game tự quay về nhạc WebAudio như trước — nên bản
trên GitHub vẫn chạy đầy đủ với người không có bản game.

Bài nhạc được chọn theo khu vực và theo cảnh:

| Cảnh | Tệp ưu tiên |
| --- | --- |
| Màn hình chờ | `mus_menu0.ogg` |
| Rêu Xanh, Hành Lang Tro | `mus_ruins.ogg` |
| Cầu Tro | `mus_snowy.ogg` |
| Rừng Tro | `mus_waterfall.ogg` |
| Chợ Tro | `mus_temshop.ogg` |
| Ngai Tro | `mus_bergentruckung.ogg` |
| Trận thường / trận trùm | `mus_battle1.ogg` / `mus_boss1.ogg` |
| Thua / kết thúc | `mus_gameover.ogg` / `mus_z_ending.ogg` |

Muốn đổi bản nhạc khác thì sửa bảng `LOCAL_TRACKS` trong `src/core.js`.

## Dùng hình ảnh (sprite) từ bản game bạn đã cài trên máy (tuỳ chọn)

Ngoài nhạc, game cũng có thể dùng **sprite gốc**: nhân vật chính trong phòng, kẻ địch
trong trận, trùm Vua Tro, NPC (Đom, Bà Mốc), đồ đạc trong phòng (rương, biển, cây, cột,
hoa vang), khung hội thoại/khung trận đấu, trái tim (con trỏ), điểm lưu và hàng lệnh
ĐÁNH/NÓI/ĐỒ/THA.

Sprite gốc nằm trong `data.win`, không phải tệp rời. Nếu bạn muốn tự trích ra:

```bash
# UndertaleModCli (UnderminersTeam/UndertaleModTool) — cần .NET 10
dotnet UndertaleModCli.dll dump "Undertale-AnkerGames/Undertale/data.win" \
  --textures --sprites -o "Undertale-AnkerGames/du-lieu-goc"
```

Sau đó thư mục sprite là `Undertale-AnkerGames/du-lieu-goc/Sprites/` (đã bị
`.gitignore` bỏ qua), hoặc trỏ tới chỗ khác:

```bash
LOCAL_SPRITE_DIR="/đường/dẫn/tới/Sprites" npm run dev
```

Server phục vụ các tệp `.png` ở đường dẫn `/local-sprites/`. Khi máy có sprite gốc,
màn hình chờ và màn hình tiêu đề hiện đúng ảnh logo gốc như bản game (`spr_undertaletitle`),
và trong game hiện dòng “Hình ảnh: lấy từ bản game trên máy”.

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

Không có thư mục sprite thì game tự vẽ toàn bộ bằng art tự sinh như trước — bản trên
GitHub vẫn chạy đầy đủ với người không có bản game.

## Cách chơi

**Khám phá.** Đi qua sáu khu vực của Hầm Tro: Rêu Xanh → Hành Lang Tro →
Cầu Tro → Rừng Tro → Chợ Tro → Ngai Tro. Trong phòng có ngôi sao lưu game (hồi
máu và ghi lại hành trình), rương đồ, biển chỉ dẫn, suối nước ấm trong Rừng Tro,
và những người bạn nói chuyện được: **Đom** (đom đóm dẫn đường), **Bà Mốc**,
**Nhím** (chủ tiệm — bán bánh mì tro, kẹo rêu, trà tro, mật đom).

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
server.mjs          static server cổng 5173 (+ /local-music, /local-sprites: dữ liệu gốc trên máy)
scripts/check.mjs   kiểm tra cú pháp + bản đồ + sprite
src/
  core.js           nhập liệu, âm thanh (WebAudio), vẽ, chữ, hội thoại, lưu game
  localassets.js    sprite gốc đọc từ bản game trên máy (tuỳ chọn)
  sprites.js        toàn bộ sprite pixel (chữ cái → bảng màu)
  data.js           phòng, kẻ địch, vật phẩm, hội thoại, cửa hàng
  world.js          bản đồ, va chạm, tương tác, túi đồ, cửa hàng
  battle.js         hệ thống trận đấu và các kiểu đạn
  main.js           màn hình chính, cảnh mở đầu, cảnh kết thúc, vòng lặp game
  style.css         giao diện trang
assets/fonts/       font pixel Handjet (woff2) + giấy phép OFL
```

Không có bước build: trình duyệt chạy trực tiếp các ES module trong `src/`.

## Ghi chú về bản quyền

- Game này là **sáng tác nguyên bản**, chỉ lấy cảm hứng từ *thể loại* RPG
  dưới lòng đất + né đạn.
- Không có asset (hình, âm thanh, chữ) nào được sao chép từ trò chơi khác.
  Font Handjet trong `assets/fonts/` là phần mềm tự do theo SIL Open Font
  License 1.1 (xem `assets/fonts/OFL.txt`), không liên quan tới trò chơi nào.
- Nhạc `.ogg` và sprite `.png` từ bản game cài trên máy **không** được đưa vào repo:
  engine chỉ đọc tệp tại chỗ khi chạy (xem mục “Dùng nhạc…” và “Dùng hình ảnh…”).
  Máy không có bản game vẫn chạy bình thường với nhạc tự tổng hợp và art tự sinh.
- Thư mục `Undertale-AnkerGames/` (bản game gốc để tham khảo cục bộ) **không**
  được đưa lên kho git — xem `.gitignore`.
