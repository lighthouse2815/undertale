// ------------------------------------------------------------
// Dữ liệu gốc trên máy (tuỳ chọn) — sprite .png trích từ bản game bạn
// đã cài, phục vụ qua /local-sprites/. Không tệp nào nằm trong repo:
// máy không có bản game thì game vẽ bằng art tự sinh như trước.
// ------------------------------------------------------------
const SPRITE_ROUTE = '/local-sprites/';

// nhân vật chính gốc: các khung hình đi theo hướng
export const PLAYER_ART = {
  down: ['spr_f_maincharad_0.png', 'spr_f_maincharad_1.png', 'spr_f_maincharad_2.png', 'spr_f_maincharad_3.png'],
  up: ['spr_f_maincharau_0.png', 'spr_f_maincharau_1.png', 'spr_f_maincharau_2.png', 'spr_f_maincharau_3.png'],
  left: ['spr_f_maincharal_0.png', 'spr_f_maincharal_1.png'],
  right: ['spr_f_maincharar_0.png', 'spr_f_maincharar_1.png'],
};
const PLAYER_FILES = Object.values(PLAYER_ART).flat();

// kẻ địch trong game này — gán sang sprite gốc gần nhất về dáng hình
export const ENEMY_ART = {
  moss: ['spr_migosp_0.png'], // Bọ Rêu → Migosp (con bọ xanh)
  shroom: ['spr_moldsmal_0.png'], // Nấm Buồn → Moldsmal (khối mềm buồn)
  bird: ['spr_whimsun_0.png'], // Chim Tro → Whimsun (sinh vật bay)
  sentinel: ['spr_dummybattle_0.png'], // Lính Sắt Vụn → hình nộm gỗ
  frog: ['spr_froggit_0.png'], // Ếch Tuyết → Froggit (con ếch nhỏ)
  drek: ['spr_snowdrake_0.png', 'spr_snowdrake_1.png'], // Tuyết Long → Snowdrake
  cap: ['spr_icecap_0.png', 'spr_icecap_1.png'], // Mũ Băng → Ice Cap
  guard: ['spr_bigdog_side_0.png', 'spr_bigdog_side_1.png'], // Chó Tuyết Khổng Lồ → con chó lớn trong Snowdin
};
const ENEMY_FILES = Object.values(ENEMY_ART).flat();

// đồ đạc & nhân vật phụ lấy từ bản gốc (máy không có thì vẽ bằng art tự sinh)
export const PROP_ART = {
  chest: 'spr_chestbox_0.png', // rương gỗ
  sign: 'spr_npc_sign_0.png', // biển báo
  pillar: 'spr_brokenpillar_0.png', // cột gãy
  tree: 'spr_singletree_0.png', // cây
  flower: 'spr_echoflower_0.png', // hoa vang
  dom: 'spr_glowfly_0.png', // đom đóm
  // khu Tuyết Tro
  iceblock: 'spr_iceblock_0.png', // tảng băng
  gift: 'spr_presentbox_0.png', // hộp quà
  iceflower: 'spr_iceflower_0.png', // hoa băng
  snowman: 'spr_regsnowman_0.png', // người tuyết
  kem: 'spr_icecreamguy_anim_0.png', // Bác Kem (người bán kem gốc)
};
const PROP_FILES = Object.values(PROP_ART);

// nhân vật phụ dùng một sprite gốc duy nhất, gán theo mã trong phòng
export const NPC_ART = {
  kem: PROP_ART.kem,
  snowman: PROP_ART.snowman,
};

// chân dung trong khung hội thoại (máy có sprite gốc thì dùng luôn)
export const PORTRAIT_ART = {
  dom: PROP_ART.dom,
  kem: PROP_ART.kem,
  snowman: PROP_ART.snowman,
};

// Bà Mốc: ghép từ các phần của con nấm gốc (mũ + thân + hai tay).
// Toạ độ tính theo pixel gốc (bản gốc vẽ ở scale 2) nên trong game
// truyền offsetScale = scale / 2 để cả hình nhỏ lại đều nhau.
export const BAMOC_ART = {
  scale: 1.1,
  parts: [
    ['spr_moldessa_stem_0.png', 0, 0], // thân nấm
    ['spr_moldessa_headthing_0.png', 19, -34], // mũ nấm
    ['spr_moldessa_arm_0.png', -27, 6], // tay trái
    ['spr_moldessa_arm_0.png', 71, 6, { flip: true }], // tay phải (bản gốc lật ngang)
  ],
};
const BAMOC_FILES = BAMOC_ART.parts.map(([n]) => n);

// trùm Vua Tro: ghép từ các phần như trận Asgore gốc (obj_asgoreb_body)
export const KING_ART = {
  scale: 1.8,
  parts: [
    ['spr_asgoreb_cape_0.png', -48, 62],
    ['spr_asgoreb_arml_0.png', 16, 70],
    ['spr_asgoreb_armr_0.png', 168, 70],
    ['spr_asgoreb_dress_0.png', 50, 130],
    ['spr_asgoreb_legs_0.png', 54, 156],
    ['spr_asgoreb_feet_0.png', 32, 210],
    ['spr_asgoreb_armor_0.png', 0, 28],
    ['spr_asgoreb_head1_0.png', 68, 0],
  ],
};
const KING_FILES = KING_ART.parts.map(([n]) => n);

// những sprite dùng cho giao diện (tên tệp trong bản game)
const WANTED = [
  'spr_border_0.png', // viền khung gốc: ô trắng 5x5 (khung hội thoại/trận đấu)
  'spr_blackbox_o_0.png', // hộp nhỏ: viền trắng 1px, góc vát
  'spr_heart_0.png', // tim đỏ
  'spr_undertaletitle_0.png', // ảnh màn hình tiêu đề gốc (nền đen + logo + tim)
  'spr_savepoint_0.png', // điểm lưu
  'spr_savepoint_1.png',
  'spr_fightbt_0.png', // nút trận đấu (0: thường, 1: đang chọn)
  'spr_fightbt_1.png',
  'spr_actbt_center_0.png',
  'spr_actbt_center_1.png',
  'spr_itembt_0.png',
  'spr_itembt_1.png',
  'spr_sparebt_0.png', // nút THA (0: thường, 1: đang chọn)
  'spr_sparebt_1.png',
  // nhân vật chính (Frisk gốc, 20x30, bốn hướng)
  ...PLAYER_FILES,
  // kẻ địch gốc trong trận
  ...ENEMY_FILES,
  // đồ đạc, nhân vật phụ
  ...PROP_FILES,
  // Bà Mốc (ghép từ các phần của con nấm gốc)
  ...BAMOC_FILES,
  // trùm Vua Tro (ghép từ các phần của Asgore gốc)
  ...KING_FILES,
];

// hàng lệnh trận đấu: [khung thường, khung đang chọn]
export const BUTTON_ART = {
  fight: ['spr_fightbt_0.png', 'spr_fightbt_1.png'],
  act: ['spr_actbt_center_0.png', 'spr_actbt_center_1.png'],
  item: ['spr_itembt_0.png', 'spr_itembt_1.png'],
  mercy: ['spr_sparebt_0.png', 'spr_sparebt_1.png'],
};

export const art = {
  ready: false,
  count: 0,
  dir: null,
  files: null,
  img: new Map(),
  /** Ảnh đã nạp (hoặc null nếu không có). */
  get(name) {
    return this.img.get(name) ?? null;
  },
};

/** Dò và nạp sprite gốc trên máy. Không có cũng không sao. */
export async function loadLocalSprites() {
  try {
    const res = await fetch(`${SPRITE_ROUTE}index.json`);
    if (!res.ok) return false;
    const data = await res.json();
    if (!Array.isArray(data.files) || data.files.length === 0) return false;
    art.files = new Set(data.files);
    art.dir = typeof data.dir === 'string' ? data.dir : null;

    const wanted = WANTED.filter((f) => art.files.has(f));
    await Promise.all(
      wanted.map(
        (name) =>
          new Promise((done) => {
            const im = new Image();
            im.onload = () => {
              art.img.set(name, im);
              done();
            };
            im.onerror = () => done();
            im.src = SPRITE_ROUTE + name;
          })
      )
    );
    art.count = art.img.size;
    art.ready = art.count > 0;
    return art.ready;
  } catch {
    return false;
  }
}
