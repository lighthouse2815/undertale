// Chỉ đọc JSON/PNG của phòng đang mở. Không thực thi GML hoặc nạp data.win.
export async function loadRoom(scene, name) {
  const base = new URL('../assets/', import.meta.url);
  const cache = scene.game.registry.get('sourceCache');
  const json = (path) => {
    if (!cache.has(path)) cache.set(path, fetch(new URL(path, base))
      .then(async (response) => {
        if (!response.ok) throw new Error(`Không tải được ${path} (${response.status}).`);
        return response.json();
      }).catch((error) => { cache.delete(path); throw error; }));
    return cache.get(path);
  };
  const room = await json(`rooms/${name}.json`);
  const hasSavepoint = room.GameObjects.some((item) => item.ObjectName === 'obj_savepoint');
  const ruinsTutorial = name === 'room_ruins2';
  const ruinsSwitches = name === 'room_ruins3';
  const dummyLesson = name === 'room_ruins4';
  const spikeGuide = name === 'room_ruins5';
  const tutorialDialogue = ruinsTutorial ? await json(new URL('./ruins-tutorial.json', import.meta.url).href) : null;
  const switchDialogue = ruinsSwitches ? await json(new URL('./ruins-switches.json', import.meta.url).href) : null;
  const dummyDialogue = dummyLesson ? await json(new URL('./dummy-lesson.json', import.meta.url).href) : null;
  const spikeDialogue = spikeGuide ? await json(new URL('./spike-guide.json', import.meta.url).href) : null;
  const paths = new Map();
  const pathNames = ruinsTutorial ? ['path_torielwalk2', 'path_torielwalk2_2', 'path_walkup']
    : ruinsSwitches ? ['path_torielwalk3', 'path_torielwalk3_2', 'path_walkright']
      : dummyLesson ? ['path_torielwalk4', 'path_torielwalk4_2']
        : spikeGuide ? ['path_torielwalk5', 'path_torielwalk5_2', 'path_walkright', 'path_froghead'] : [];
  await Promise.all(pathNames.map(async (key) => {
    paths.set(key, await json(`paths/${key}.json`));
  }));
  const objects = new Map();
  const sprites = new Map();
  const object = async (key) => {
    if (!objects.has(key)) {
      const data = await json(`objects/${key}.json`);
      objects.set(key, data);
      if (data.ParentObject) await object(data.ParentObject);
    }
  };
  await Promise.all([...new Set(room.GameObjects.map((item) => item.ObjectName))].map(object));
  if (spikeGuide) await Promise.all(['obj_toroverworld6', 'obj_torinteractable5', 'obj_torhandhold1', 'obj_fakefroggit',
    'obj_froghead', 'obj_froglegs', 'obj_torieldisapprove'].map(object));
  const spriteNames = new Set([...objects.values()].flatMap((data) => [data.Sprite, data.MaskSprite]).filter(Boolean));
  if (hasSavepoint) spriteNames.add('spr_heartsmall');
  if (ruinsTutorial || ruinsSwitches || dummyLesson || spikeGuide) for (const key of ['spr_toriel_d', 'spr_toriel_r', 'spr_toriel_u', 'spr_toriel_l', 'spr_face_torielhappytalk']) spriteNames.add(key);
  if (ruinsSwitches) for (const key of ['spr_face_torieltalk', 'spr_face_torieltalkside']) spriteNames.add(key);
  if (dummyLesson) for (const key of ['spr_face_torieltalk', 'spr_face_torielwhatside', 'spr_face_torielwhat', 'spr_face_torieltalkside',
    'spr_dummybattle', 'spr_target', 'spr_targetchoice', 'spr_fightbt', 'spr_talkbt', 'spr_itembt', 'spr_sparebt']) spriteNames.add(key);
  if (spikeGuide) for (const key of ['spr_toriel_handhold_d', 'spr_toriel_handhold_r', 'spr_toriel_handhold_u', 'spr_face_torieltalk',
    'spr_target', 'spr_targetchoice', 'spr_fightbt', 'spr_talkbt', 'spr_itembt', 'spr_sparebt']) spriteNames.add(key);
  for (const direction of ['d', 'r', 'u', 'l']) spriteNames.add(`spr_mainchara${direction}`);
  await Promise.all([...spriteNames].map(async (key) => sprites.set(key, await json(`sprites/${key}/${key}.json`))));
  const images = new Map();
  for (const [key, data] of sprites) {
    for (let i = 0; i < data.TextureCount; i++) images.set(`${key}:${i}`, `sprites/${key}/${key}_${i}.png`);
    if (data.MaskCount && data.CollisionKind === 'Precise') images.set(`${key}:mask`, `sprites/${key}/${key}_0.mask.png`);
  }
  for (const key of new Set([
    ...room.Backgrounds.filter((item) => item.Enabled).map((item) => item.BackgroundAsset),
    ...room.Tiles.map((item) => item.Asset),
  ])) if (key) images.set(key, `backgrounds/${key}/${key}.png`);
  const font = (hasSavepoint || ruinsTutorial || ruinsSwitches || dummyLesson || spikeGuide) && !scene.cache.bitmapFont.exists('fnt_maintext')
    ? await json('fonts/fnt_maintext/fnt_maintext.json') : null;
  if (font) images.set('fnt_maintext', 'fonts/fnt_maintext/fnt_maintext.png');
  const sounds = [...(hasSavepoint ? ['snd_power', 'snd_save'] : []), ...(ruinsTutorial ? ['snd_noise'] : []),
    ...(ruinsSwitches ? ['snd_screenshake', 'snd_wrongvictory'] : []),
    ...(dummyLesson ? ['snd_select', 'snd_damage', 'snd_escaped', 'snd_slidewhist'] : []),
    ...(spikeGuide ? ['snd_select', 'snd_damage', 'snd_escaped', 'snd_ehurt1'] : [])]
    .filter((key) => !scene.cache.audio.exists(key));
  const queued = [...images].filter(([key]) => !scene.textures.exists(key));
  if (queued.length || sounds.length) await new Promise((resolve, reject) => {
    const failed = (file) => {
      cleanup();
      reject(new Error(`Không tải được tài nguyên ${file.key}.`));
    };
    const complete = () => { cleanup(); resolve(); };
    const cleanup = () => {
      scene.load.off('loaderror', failed);
      scene.load.off('complete', complete);
    };
    scene.load.on('loaderror', failed);
    scene.load.once('complete', complete);
    for (const [key, path] of queued) scene.load.image(key, new URL(path, base).href);
    for (const key of sounds) scene.load.audio(key, new URL(`sounds/${key}/${key}.wav`, base).href);
    scene.load.start();
  });
  if (font) {
    // Chuyển metric font GameMaker sang dữ liệu BitmapText của Phaser; giữ atlas gốc.
    const { width, height } = scene.textures.get('fnt_maintext').getSourceImage();
    const chars = Object.fromEntries(font.Glyphs.map((glyph) => [glyph.C, {
      x: glyph.X, y: glyph.Y, width: glyph.W, height: glyph.H,
      centerX: Math.floor(glyph.W / 2), centerY: Math.floor(glyph.H / 2),
      xOffset: glyph.O, yOffset: 0, xAdvance: glyph.S, data: {}, kerning: {},
      u0: glyph.X / width, v0: glyph.Y / height,
      u1: (glyph.X + glyph.W) / width, v1: (glyph.Y + glyph.H) / height,
    }]));
    scene.cache.bitmapFont.add('fnt_maintext', { texture: 'fnt_maintext', frame: null,
      data: { font: 'fnt_maintext', size: font.EmSize, lineHeight: font.LineHeight || 16, chars } });
    // BitmapText của Phaser Canvas không hỗ trợ tint; nhuộm atlas một lần, dùng lại cache.
    const yellow = scene.textures.createCanvas('fnt_maintext:yellow', width, height);
    yellow.context.drawImage(scene.textures.get('fnt_maintext').getSourceImage(), 0, 0);
    yellow.context.globalCompositeOperation = 'source-in';
    yellow.context.fillStyle = '#ffff00';
    yellow.context.fillRect(0, 0, width, height);
    yellow.refresh();
    scene.cache.bitmapFont.add('fnt_maintext:yellow', { texture: 'fnt_maintext:yellow', frame: null,
      data: scene.cache.bitmapFont.get('fnt_maintext').data });
  }
  return { name, room, objects, sprites, paths, tutorialDialogue, switchDialogue, dummyDialogue, spikeDialogue };
}
