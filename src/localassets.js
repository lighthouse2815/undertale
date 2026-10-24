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
};
const ENEMY_FILES = Object.values(ENEMY_ART).flat();

// những sprite dùng cho giao diện (tên tệp trong bản game)
const WANTED = [
  'spr_border_0.png', // viền khung gốc: ô trắng 5x5 (khung hội thoại/trận đấu)
  'spr_blackbox_o_0.png', // hộp nhỏ: viền trắng 1px, góc vát
  'spr_heart_0.png', // tim đỏ
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
