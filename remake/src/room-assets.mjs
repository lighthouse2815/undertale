import { registerBitmapFont, colorBitmapFont } from './fonts.mjs';

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
  const corridorLesson = name === 'room_ruins6';
  const candyRoom = name === 'room_ruins7A';
  const ruinsStart = name === 'room_ruins7';
  const ruinsRock = name === 'room_ruins9';
  const ruinsHoles = ['room_ruins8', 'room_ruins10'].includes(name);
  const ruins12 = name === 'room_ruins12';
  const ruinsStartDialogue = ruinsStart ? await json(new URL('./ruins-start.json', import.meta.url).href) : null;
  if ((dummyLesson || spikeGuide || candyRoom) && !scene.cache.json.exists('inventory')) scene.cache.json.add('inventory',
    await json(new URL('./inventory.json', import.meta.url).href));
  const tutorialDialogue = ruinsTutorial ? await json(new URL('./ruins-tutorial.json', import.meta.url).href) : null;
  const switchDialogue = ruinsSwitches ? await json(new URL('./ruins-switches.json', import.meta.url).href) : null;
  const dummyDialogue = dummyLesson ? await json(new URL('./dummy-lesson.json', import.meta.url).href) : null;
  const spikeDialogue = spikeGuide ? await json(new URL('./spike-guide.json', import.meta.url).href) : null;
  const corridorDialogue = corridorLesson ? await json(new URL('./corridor-lesson.json', import.meta.url).href) : null;
  const paths = new Map();
  const pathNames = ruinsTutorial ? ['path_torielwalk2', 'path_torielwalk2_2', 'path_walkup']
    : ruinsSwitches ? ['path_torielwalk3', 'path_torielwalk3_2', 'path_walkright']
      : dummyLesson ? ['path_torielwalk4', 'path_torielwalk4_2']
        : spikeGuide ? ['path_torielwalk5', 'path_torielwalk5_2', 'path_walkright', 'path_froghead']
          : corridorLesson ? ['path_walkright', 'path_torielwalk6'] : [];
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
  if (corridorLesson) await Promise.all(['obj_plotwall3', 'obj_stalkerflowey'].map(object));
  if (ruinsRock) await Promise.all(['obj_plotwall4'].map(object));
  const spriteNames = new Set([...objects.values()].flatMap((data) => [data.Sprite, data.MaskSprite]).filter(Boolean));
  if (ruinsStart) spriteNames.add('spr_exc');
  if (ruinsStart) for (const page of [...ruinsStartDialogue.call, ...ruinsStartDialogue.afterDog]) if (page.portrait) spriteNames.add(page.portrait);
  if (candyRoom) spriteNames.add('spr_candydish2');
  if (hasSavepoint || candyRoom || ruins12) spriteNames.add('spr_heartsmall');
  if (ruinsTutorial || ruinsSwitches || dummyLesson || spikeGuide || corridorLesson) for (const key of ['spr_toriel_d', 'spr_toriel_r', 'spr_toriel_u', 'spr_toriel_l', 'spr_face_torielhappytalk']) spriteNames.add(key);
  if (ruinsSwitches) for (const key of ['spr_face_torieltalk', 'spr_face_torieltalkside']) spriteNames.add(key);
  if (dummyLesson) for (const key of ['spr_face_torieltalk', 'spr_face_torielwhatside', 'spr_face_torielwhat', 'spr_face_torieltalkside',
    'spr_dummybattle', 'spr_target', 'spr_targetchoice', 'spr_fightbt', 'spr_talkbt', 'spr_itembt', 'spr_sparebt']) spriteNames.add(key);
  if (spikeGuide) for (const key of ['spr_toriel_handhold_d', 'spr_toriel_handhold_r', 'spr_toriel_handhold_u', 'spr_face_torieltalk',
    'spr_target', 'spr_targetchoice', 'spr_fightbt', 'spr_talkbt', 'spr_itembt', 'spr_sparebt']) spriteNames.add(key);
  if (corridorLesson) for (const key of ['spr_face_torieltalk', 'spr_toriel_lt']) spriteNames.add(key);
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
  const font = (hasSavepoint || ruinsTutorial || ruinsSwitches || dummyLesson || spikeGuide || corridorLesson || candyRoom || ruins12) && !scene.cache.bitmapFont.exists('fnt_maintext')
    ? await json('fonts/fnt_maintext/fnt_maintext.json') : null;
  if (font) images.set('fnt_maintext', 'fonts/fnt_maintext/fnt_maintext.png');
  const sounds = [...(dummyLesson || spikeGuide || candyRoom ? ['snd_power', 'snd_swallow', 'snd_spooky', 'snd_item'] : []),
    ...(candyRoom ? ['snd_select', 'snd_squeak'] : []),
    ...(hasSavepoint ? ['snd_power', 'snd_save'] : []), ...(ruinsTutorial ? ['snd_noise'] : []),
    ...(ruinsSwitches ? ['snd_screenshake', 'snd_wrongvictory'] : []),
    ...(dummyLesson ? ['snd_select', 'snd_damage', 'snd_escaped', 'snd_slidewhist'] : []),
    ...(spikeGuide ? ['snd_select', 'snd_damage', 'snd_escaped', 'snd_ehurt1'] : []),
    ...(corridorLesson ? ['snd_phone', 'snd_pombark'] : []), ...(ruinsStart ? ['snd_phone', 'snd_b'] : []), ...(ruinsRock ? ['snd_noise'] : [])]
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
  if (font) registerBitmapFont(scene, 'fnt_maintext', font);
  if (scene.cache.bitmapFont.exists('fnt_maintext')) colorBitmapFont(scene, 'fnt_maintext', 'yellow', '#ffff00');
  return { name, room, objects, sprites, paths, tutorialDialogue, switchDialogue, dummyDialogue, spikeDialogue, corridorDialogue, ruinsStartDialogue };
}
