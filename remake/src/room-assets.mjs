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
  const goofyrock = name === 'room_ruins11';
  const rockDialogue = goofyrock ? await json(new URL('./ruins-goofyrock.json', import.meta.url).href) : null;
  const ruinsHoles = ['room_ruins8', 'room_ruins10', 'room_ruins14'].includes(name);
  const ruins14 = name === 'room_ruins14';
  const ruins14Dialogue = ruins14 ? await json(new URL('./ruins14.json', import.meta.url).href) : null;
  const perspective = /^room_ruins15[A-D]$/.test(name);
  const perspectiveDialogue = perspective ? await json(new URL('./ruins-perspective.json', import.meta.url).href) : null;
  const outlook = ['room_ruins17', 'room_ruins18OLD'].includes(name);
  const outlookDialogue = outlook ? await json(new URL('./ruins-outlook.json', import.meta.url).href) : null;
  const ruinsHome = name === 'room_ruins19';
  const homeDialogue = ruinsHome ? await json(new URL('./ruins-home.json', import.meta.url).href) : null;
  const torielHall = name === 'room_torhouse1';
  const hallDialogue = torielHall ? await json(new URL('./toriel-hall.json', import.meta.url).href) : null;
  const torielCorridor = name === 'room_torhouse3';
  const bedroomDialogue = torielCorridor ? await json(new URL('./toriel-corridor.json', import.meta.url).href) : null;
  const childBedroom = name === 'room_asrielroom';
  const childDialogue = childBedroom ? await json(new URL('./child-bedroom.json', import.meta.url).href) : null;
  const torielBedroom = name === 'room_torielroom';
  const torielBedroomDialogue = torielBedroom ? await json(new URL('./toriel-bedroom.json', import.meta.url).href) : null;
  const living = ['room_torhouse2', 'room_kitchen'].includes(name);
  const livingDialogue = living ? await json(new URL('./toriel-living.json', import.meta.url).href) : null;
  const basement = ['room_basement1', 'room_basement2', 'room_basement3', 'room_basement4'].includes(name);
  const gate = name === 'room_basement4';
  const gateDialogue = gate ? await json(new URL('./toriel-gate.json', import.meta.url).href) : null;
  const basementDialogue = basement ? await json(new URL('./toriel-basement.json', import.meta.url).href) : null;
  const floweyExit = name === 'room_ruinsexit';
  const floweyExitDialogue = floweyExit ? await json(new URL('./flowey-exit.json', import.meta.url).href) : null;
  const snowdinStart = name === 'room_tundra1';
  const snowdinStartDialogue = snowdinStart ? await json(new URL('./snowdin-start.json', import.meta.url).href) : null;
  const forest = name === 'room_tundra2';
  const forestDialogue = forest ? await json(new URL('./snowdin-forest.json', import.meta.url).href) : null;
  const boxRoad = ['room_tundra3', 'room_tundra3A'].includes(name);
  const snowdinEncounter = ['room_tundra3', 'room_tundra4'].includes(name);
  const checkpoint = name === 'room_tundra4';
  const checkpointDialogue = checkpoint ? await json(new URL('./snowdin-checkpoint.json', import.meta.url).href) : null;
  const doggoRoom = name === 'room_tundra5';
  const doggoDialogue = doggoRoom ? await json(new URL('./doggo-room.json', import.meta.url).href) : null;
  const boxRoadDialogue = boxRoad ? await json(new URL('./box-road.json', import.meta.url).href) : null;
  const ruins12 = name === 'room_ruins12';
  const ruins13 = ['room_ruins12B', 'room_ruins13'].includes(name);
  const ruins13Dialogue = ruins13 ? await json(new URL('./ruins13.json', import.meta.url).href) : null;
  const ruinsStartDialogue = ruinsStart ? await json(new URL('./ruins-start.json', import.meta.url).href) : null;
  if ((dummyLesson || spikeGuide || candyRoom || boxRoad) && !scene.cache.json.exists('inventory')) scene.cache.json.add('inventory',
    await json(new URL('./inventory.json', import.meta.url).href));
  const tutorialDialogue = ruinsTutorial ? await json(new URL('./ruins-tutorial.json', import.meta.url).href) : null;
  const switchDialogue = ruinsSwitches ? await json(new URL('./ruins-switches.json', import.meta.url).href) : null;
  const dummyDialogue = dummyLesson ? await json(new URL('./dummy-lesson.json', import.meta.url).href) : null;
  const spikeDialogue = spikeGuide ? await json(new URL('./spike-guide.json', import.meta.url).href) : null;
  const corridorDialogue = corridorLesson ? await json(new URL('./corridor-lesson.json', import.meta.url).href) : null;
  const paths = new Map();
  const pathNames = basement ? ['path_torielwalkbasement1', 'path_torielwalkbasement2', 'path_torielwalkbasement3', 'path_walkright', 'path_walkup', 'path_walkdown'] : ruinsTutorial ? ['path_torielwalk2', 'path_torielwalk2_2', 'path_walkup']
    : ruinsSwitches ? ['path_torielwalk3', 'path_torielwalk3_2', 'path_walkright']
      : dummyLesson ? ['path_torielwalk4', 'path_torielwalk4_2']
        : spikeGuide ? ['path_torielwalk5', 'path_torielwalk5_2', 'path_walkright', 'path_froghead']
          : corridorLesson ? ['path_walkright', 'path_torielwalk6'] : ruinsHome ? ['path_torielwalk19', 'path_torielwalk19_3', 'path_torielwalk19_4']
            : name === 'room_torhouse2' ? ['path_torielwalkhouse1'] : torielHall ? ['path_walkright', 'path_torielwalkhouse2', 'path_torielwalkhouse3']
              : torielCorridor ? ['path_torielwalk20_2', 'path_torielwalk20'] : childBedroom ? ['path_bedjump', 'path_unbed'] : goofyrock ? ['path_goofyrock'] : [];
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
  if (ruins13 && name === 'room_ruins13') await object('obj_stalkerflowey');
  if (corridorLesson) await Promise.all(['obj_plotwall3', 'obj_stalkerflowey'].map(object));
  if (ruinsRock) await Promise.all(['obj_plotwall4'].map(object));
  if (ruinsHoles || perspective) await object('obj_cosmetichole');
  if (floweyExit) await object('obj_solidsmall');
  if (snowdinStart) await Promise.all(['obj_sul', 'obj_door_s_musfade'].map(object));
  if (forest) await Promise.all(['obj_creeptree_sansmaker', 'obj_sans_interactable1', 'obj_sansbyetrigger'].map(object));
  if (checkpoint) await Promise.all(['obj_npc_room', 'obj_snowdrakedad'].map(object));
  if (doggoRoom) await object('obj_spagnot');
  if (ruinsHome || torielHall || torielCorridor || living || basement) await object('obj_toroverworld3');
  const spriteNames = new Set([...objects.values()].flatMap((data) => [data.Sprite, data.MaskSprite]).filter(Boolean));
  if (ruinsStart) spriteNames.add('spr_exc');
  if (snowdinEncounter) for (const key of ['spr_exc', 'spr_exc_f']) spriteNames.add(key);
  if (ruinsStart) for (const page of [...ruinsStartDialogue.call, ...ruinsStartDialogue.afterDog]) if (page.portrait) spriteNames.add(page.portrait);
  if (ruins13) for (const page of [...ruins13Dialogue.call, ...ruins13Dialogue.callHard]) if (page.portrait) spriteNames.add(page.portrait);
  if (candyRoom) spriteNames.add('spr_candydish2');
  if (ruinsHome) for (const key of ['spr_toriel_d', 'spr_toriel_r', 'spr_toriel_u', 'spr_toriel_l', 'spr_toriel_d_phone', 'spr_exc',
    'spr_face_torielhappytalk', 'spr_face_torieltalkside', 'spr_face_torielembarrassed']) spriteNames.add(key);
  if (torielHall || torielCorridor) for (const key of ['spr_toriel_d', 'spr_toriel_r', 'spr_toriel_u', 'spr_toriel_l', 'spr_face_torielhappytalk', 'spr_face_torieltalkside']) spriteNames.add(key);
  if (torielCorridor) for (const key of ['spr_toriel_handhold_r', 'spr_toriel_handhold_u', 'spr_toriel_ruffle']) spriteNames.add(key);
  if (floweyExit) for (const key of Object.keys(floweyExitDialogue.sprites)) spriteNames.add(key);
  if (forest) for (const key of [...Object.keys(forestDialogue.sprites), 'spr_floweysink']) spriteNames.add(key);
  if (checkpoint) for (const key of Object.keys(checkpointDialogue.sprites)) spriteNames.add(key);
  if (doggoRoom) spriteNames.add('spr_movedoge_o');
  if (gate) for (const key of ['spr_toriel_hug', 'spr_toriel_hug2', 'spr_toriel_hug3', 'spr_pbflame', 'spr_face_torielmad', 'spr_face_torielhappytalk', 'spr_face_torieltalkside']) spriteNames.add(key);
  if (basement) for (const key of ['spr_toriel_d', 'spr_toriel_r', 'spr_toriel_u', 'spr_toriel_l', 'spr_toriel_handhold_l', 'spr_face_torieltalk', 'spr_face_torielcold']) spriteNames.add(key);
  if (living) for (const key of ['spr_chairempty', 'spr_chairielgetup', 'spr_toriel_d', 'spr_toriel_r', 'spr_toriel_l', 'spr_toriel_u', 'spr_face_torielhappytalk', 'spr_face_torieltalkside', 'spr_face_torieltalk', 'spr_face_torielrevengetalk', 'spr_face_torielglasses']) spriteNames.add(key);
  if (hasSavepoint || candyRoom || ruins12 || ruins13 || perspective || torielBedroom || living || boxRoad || checkpoint) spriteNames.add('spr_heartsmall');
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
    ...room.Backgrounds.filter((item) => item.Enabled || childBedroom).map((item) => item.BackgroundAsset),
    ...room.Tiles.map((item) => item.Asset),
  ])) if (key) images.set(key, `backgrounds/${key}/${key}.png`);
  const font = (hasSavepoint || ruinsTutorial || ruinsSwitches || dummyLesson || spikeGuide || corridorLesson || candyRoom || ruins12 || ruins13 || ruins14 || perspective || outlook || torielHall || torielCorridor || childBedroom || torielBedroom || living || basement || floweyExit || snowdinStart || forest || boxRoad || checkpoint || doggoRoom || goofyrock || name === 'room_ruins10') && !scene.cache.bitmapFont.exists('fnt_maintext')
    ? await json('fonts/fnt_maintext/fnt_maintext.json') : null;
  if (font) images.set('fnt_maintext', 'fonts/fnt_maintext/fnt_maintext.png');
  const forestFonts = new Map();
  if (forest || checkpoint) for (const key of ['fnt_comicsans', 'fnt_papyrus']) if (!scene.cache.bitmapFont.exists(key)) {
    forestFonts.set(key, await json(`fonts/${key}/${key}.json`)); images.set(key, `fonts/${key}/${key}.png`);
  }
  const sounds = [...(dummyLesson || spikeGuide || candyRoom ? ['snd_power', 'snd_swallow', 'snd_spooky', 'snd_item'] : []),
    ...(candyRoom ? ['snd_select', 'snd_squeak'] : []),
    ...(ruins12 ? ['snd_squeak'] : []),
    ...(name === 'room_ruins12A' ? ['snd_movemenu'] : []),
    ...(ruinsHoles ? ['snd_noise', 'snd_fall2', 'snd_hero'] : []),
    ...(ruins14 ? ['snd_screenshake', 'snd_b'] : []),
    ...(perspective ? ['snd_switchpull_n', 'snd_noise', 'snd_fall2', 'snd_squeak'] : []),
    ...(ruinsHome ? ['snd_phone', 'mus_ruins', 'mus_toomuch', 'mus_reunited', 'mus_toriel'] : []),
    ...(torielHall || torielCorridor || childBedroom || torielBedroom || living ? ['mus_house1', 'mus_house2', 'mus_toriel', 'mus_reunited'] : []),
    ...(childBedroom ? ['snd_noise'] : []),
    ...(floweyExit ? ['snd_floweylaugh', 'snd_wonderfulidea', 'mus_cymbal'] : []),
    ...(snowdinStart || boxRoad || checkpoint || doggoRoom ? ['mus_tone2', 'mus_snowy', 'mus_toomuch', 'mus_reunited'] : []),
    ...(doggoRoom ? ['snd_bell'] : []),
    ...(checkpoint ? ['mus_papyrus', 'snd_phone', 'snd_squeak'] : []),
    ...(boxRoad ? ['snd_squeak'] : []),
    ...(snowdinEncounter ? ['snd_b'] : []),
    ...(forest ? ['mus_tone2', 'mus_tone3', 'mus_snowy', 'mus_reunited', 'mus_sticksnap', 'mus_snowwalk', 'mus_whoopee', 'mus_rimshot', 'mus_muscle', 'mus_papyrus'] : []),
    ...(basement ? ['mus_intronoise', 'mus_reunited', 'mus_toriel', 'snd_noise'] : []),
    ...(torielBedroom || living ? ['snd_squeak'] : []),
    ...(hasSavepoint ? ['snd_power', 'snd_save'] : []), ...(ruinsTutorial ? ['snd_noise'] : []),
    ...(ruinsSwitches ? ['snd_screenshake', 'snd_wrongvictory'] : []),
    ...(dummyLesson ? ['snd_select', 'snd_damage', 'snd_escaped', 'snd_slidewhist'] : []),
    ...(spikeGuide ? ['snd_select', 'snd_damage', 'snd_escaped', 'snd_ehurt1'] : []),
    ...(ruins13 ? ['snd_phone', 'snd_squeak'] : []), ...(corridorLesson ? ['snd_phone', 'snd_pombark'] : []), ...(ruinsStart ? ['snd_phone', 'snd_b'] : []), ...(ruinsRock ? ['snd_noise'] : [])]
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
    for (const key of sounds) scene.load.audio(key, new URL(`sounds/${key}/${key}.${key === 'snd_fall2' || key.startsWith('mus_') ? 'ogg' : 'wav'}`, base).href);
    scene.load.start();
  });
  if (font) registerBitmapFont(scene, 'fnt_maintext', font);
  for (const [key, data] of forestFonts) registerBitmapFont(scene, key, data);
  if (scene.cache.bitmapFont.exists('fnt_maintext')) colorBitmapFont(scene, 'fnt_maintext', 'yellow', '#ffff00');
  return { name, room, objects, sprites, paths, tutorialDialogue, switchDialogue, dummyDialogue, spikeDialogue, corridorDialogue, ruinsStartDialogue, ruins13Dialogue, ruins14Dialogue, perspectiveDialogue, outlookDialogue, homeDialogue, hallDialogue, bedroomDialogue, childDialogue, torielBedroomDialogue, livingDialogue, basementDialogue, gateDialogue, floweyExitDialogue, snowdinStartDialogue, forestDialogue, boxRoadDialogue, checkpointDialogue, doggoDialogue, rockDialogue };
}
