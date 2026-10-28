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
  const snowdinEncounter = ['room_tundra3', 'room_tundra4', 'room_tundra6', 'room_tundra_snowpuzz', 'room_tundra_iceexit_new', 'room_tundra_dangerbridge'].includes(name);
  const niceCream = name === 'room_tundra8';
  const scent = name === 'room_tundra8A';
  const crossword = name === 'room_tundra9';
  const spaghetti = name === 'room_tundra_spaghetti';
  const snowpuzz = name === 'room_tundra_snowpuzz';
  const xoxoSmall = name === 'room_tundra_xoxosmall';
  const xoxoBig = name === 'room_tundra_xoxopuzz';
  const xoxo = xoxoSmall || xoxoBig;
  const colorTiles = name === 'room_tundra_randoblock';
  const dogHouse = name === 'room_tundra_lesserdog';
  const icePuzzle = name === 'room_tundra_iceentrance';
  const iceHole = name === 'room_tundra_icehole';
  const fogRoom = name === 'room_fogroom';
  const garage = name === 'room_tundra_garage';
  const inn = ['room_tundra_inn', 'room_tundra_inn_2f'].includes(name);
  const innDialogue = inn ? await json(new URL('./snowdin-inn.json', import.meta.url).href) : null;
  const sansBasement = name === 'room_tundra_sansbasement';
  const sansBasementDialogue = sansBasement ? await json(new URL('./sans-basement.json', import.meta.url).href) : null;
  const library = name === 'room_tundra_library';
  const libraryDialogue = library ? await json(new URL('./snowdin-library.json', import.meta.url).href) : null;
  const town = name === 'room_tundra_town';
  const townUndyneDialogue = town ? await json(new URL('./snowdin-town-undyne.json', import.meta.url).href) : null;
  const townPapyrusDialogue = town ? await json(new URL('./snowdin-town-papyrus.json', import.meta.url).href) : null;
  const townDogDialogue = town ? await json(new URL('./snowdin-town-dogs.json', import.meta.url).href) : null;
  const townDialogue = town ? await json(new URL('./snowdin-town.json', import.meta.url).href) : null;
  const townNpcDialogue = town ? await json(new URL('./snowdin-town-npcs.json', import.meta.url).href) : null;
  const dangerBridge = name === 'room_tundra_dangerbridge';
  const dangerBridgeDialogue = dangerBridge ? await json(new URL('./snowdin-danger-bridge.json', import.meta.url).href) : null;
  const greaterDogRoom = name === 'room_tundra_poffzone';
  const greaterDogRoomDialogue = greaterDogRoom ? await json(new URL('./greater-dog-room.json', import.meta.url).href) : null;
  const gyftrotRoom = name === 'room_tundra_iceexit_new';
  const gyftrotRoomDialogue = gyftrotRoom ? await json(new URL('./gyftrot-room.json', import.meta.url).href) : null;
  const iceHoleDialogue = iceHole ? await json(new URL('./snowdin-ice-hole.json', import.meta.url).href) : null;
  const dogHouseDialogue = dogHouse ? await json(new URL('./snowdin-dog-house.json', import.meta.url).href) : null;
  const colorTilesDialogue = colorTiles ? await json(new URL('./snowdin-color-tiles.json', import.meta.url).href) : null;
  const xoxoBigDialogue = xoxoBig ? await json(new URL('./snowdin-xoxo-big.json', import.meta.url).href) : null;
  const xoxoSmallDialogue = xoxoSmall ? await json(new URL('./snowdin-xoxo-small.json', import.meta.url).href) : null;
  const dogPairDialogue = snowpuzz ? await json(new URL('./dog-pair-room.json', import.meta.url).href) : null;
  const snowpuzzDialogue = snowpuzz ? await json(new URL('./snowdin-snowpuzz.json', import.meta.url).href) : null;
  const spaghettiDialogue = spaghetti ? await json(new URL('./snowdin-spaghetti.json', import.meta.url).href) : null;
  const crosswordDialogue = crossword ? await json(new URL('./snowdin-crossword.json', import.meta.url).href) : null;
  const scentDialogue = scent ? await json(new URL('./snowdin-scent.json', import.meta.url).href) : null;
  const parkDialogue = niceCream ? await json(new URL('./snowdin-park.json', import.meta.url).href) : null;
  const golfDialogue = niceCream ? await json(new URL('./snow-golf.json', import.meta.url).href) : null;
  const niceCreamDialogue = niceCream ? await json(new URL('./nice-cream.json', import.meta.url).href) : null;
  const maze = name === 'room_tundra7';
  const mazeDialogue = maze ? await json(new URL('./electric-maze.json', import.meta.url).href) : null;
  const ice = name === 'room_tundra6';
  const snowman = name === 'room_tundra6A';
  const snowmanDialogue = snowman ? await json(new URL('./snowman.json', import.meta.url).href) : null;
  const iceDialogue = ice ? await json(new URL('./snowdin-ice.json', import.meta.url).href) : null;
  const checkpoint = name === 'room_tundra4';
  const checkpointDialogue = checkpoint ? await json(new URL('./snowdin-checkpoint.json', import.meta.url).href) : null;
  const doggoRoom = name === 'room_tundra5';
  const doggoDialogue = doggoRoom ? await json(new URL('./doggo-room.json', import.meta.url).href) : null;
  const boxRoadDialogue = boxRoad ? await json(new URL('./box-road.json', import.meta.url).href) : null;
  const ruins12 = name === 'room_ruins12';
  const ruins13 = ['room_ruins12B', 'room_ruins13'].includes(name);
  const ruins13Dialogue = ruins13 ? await json(new URL('./ruins13.json', import.meta.url).href) : null;
  const ruinsStartDialogue = ruinsStart ? await json(new URL('./ruins-start.json', import.meta.url).href) : null;
  if ((dummyLesson || spikeGuide || candyRoom || boxRoad || snowman || niceCream) && !scene.cache.json.exists('inventory')) scene.cache.json.add('inventory',
    await json(new URL('./inventory.json', import.meta.url).href));
  const tutorialDialogue = ruinsTutorial ? await json(new URL('./ruins-tutorial.json', import.meta.url).href) : null;
  const switchDialogue = ruinsSwitches ? await json(new URL('./ruins-switches.json', import.meta.url).href) : null;
  const dummyDialogue = dummyLesson ? await json(new URL('./dummy-lesson.json', import.meta.url).href) : null;
  const spikeDialogue = spikeGuide ? await json(new URL('./spike-guide.json', import.meta.url).href) : null;
  const corridorDialogue = corridorLesson ? await json(new URL('./corridor-lesson.json', import.meta.url).href) : null;
  const paths = new Map();
  const pathNames = xoxoBig ? ['path_papyrus2'] : snowpuzz ? ['path_mdog', 'path_wdog'] : maze ? ['path_papyrus1', 'path_papyrus1A'] : basement ? ['path_torielwalkbasement1', 'path_torielwalkbasement2', 'path_torielwalkbasement3', 'path_walkright', 'path_walkup', 'path_walkdown'] : ruinsTutorial ? ['path_torielwalk2', 'path_torielwalk2_2', 'path_walkup']
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
  if (inn) await object('obj_zzz');
  if (town) await object('obj_undyne_friendc');
  if (dangerBridge) await object('obj_sans_room');
  if (colorTiles) await Promise.all(['obj_sans_room', 'obj_spagnot'].map(object));
  if (xoxoBig) await Promise.all(['obj_papyrus_room', 'obj_sans_room'].map(object));
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
  if (snowpuzz) await Promise.all(['obj_mandog_actor', 'obj_womandog_actor'].map(object));
  if (niceCream) await object('obj_rollsnow');
  if (maze) await Promise.all(['obj_puzzlewall1', 'obj_sans_room'].map(object));
  if (crossword) await Promise.all(['obj_puzzlewall2', 'obj_sans_room'].map(object));
  if (ruinsHome || torielHall || torielCorridor || living || basement) await object('obj_toroverworld3');
  const spriteNames = new Set([...objects.values()].flatMap((data) => [data.Sprite, data.MaskSprite]).filter(Boolean));
  if (fogRoom) spriteNames.add('spr_tundrafog');
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
  if (ice) spriteNames.add('spr_face_sans');
  if (niceCream) for (const key of parkDialogue.sprites) spriteNames.add(key);
  if (snowman) spriteNames.add('spr_sadsnowman_d1');
  if (maze) for (const key of Object.keys(mazeDialogue.sprites)) spriteNames.add(key);
  if (crossword) for (const key of Object.keys(crosswordDialogue.sprites)) spriteNames.add(key);
  if (inn) for (const key of Object.keys(innDialogue.sprites)) spriteNames.add(key);
  if (town) for (const key of Object.keys(townUndyneDialogue.sprites)) spriteNames.add(key);
  if (town) for (const key of Object.keys(townPapyrusDialogue.sprites)) spriteNames.add(key);
  if (town) for (const key of Object.keys(townDogDialogue.sprites)) spriteNames.add(key);
  if (town) for (const key of Object.keys(townDialogue.sprites)) spriteNames.add(key);
  if (town) for (const key of Object.keys(townNpcDialogue.sprites)) spriteNames.add(key);
  if (name === 'room_water3') for (const key of ['spr_heartsmall', 'spr_waterpushrock', ...['topleft', 'midtop', 'topright', 'midleft', 'midmid', 'midright', 'bottomleft', 'bottommid', 'bottomright'].map((part) => `spr_waterfall_${part}`)]) spriteNames.add(key);
  if (name === 'room_tundra_grillby') for (const key of ['spr_npc_saddog', 'spr_heartsmall', 'spr_face_sans', 'spr_sans_d', 'spr_sans_u', 'spr_sans_l', 'spr_sans_r', 'spr_sans_shrug2', 'spr_sans_stool_u', 'spr_sans_stool_l', 'spr_sans_stoolcomb', 'spr_sans_stool_chup', 'spr_sans_stool_buttscratch', 'spr_grillby_l', 'spr_grillby_r', 'spr_grillby_u', 'spr_grillby_d', 'spr_sansfries', 'spr_sansburger', 'spr_grillbyshadow', 'spr_grillbycounter']) spriteNames.add(key);
  if (name === 'room_water2') for (const key of ['spr_face_sans', 'spr_sans_d', 'spr_sans_u', 'spr_sans_l', 'spr_sans_r', 'spr_heartsmall', 'spr_fishnpc_echo', 'spr_mkid_dt', 'spr_mkid_ut', 'spr_mkid_lt', 'spr_mkid_rt', ...['topleft', 'midtop', 'topright', 'midleft', 'midmid', 'midright', 'bottomleft', 'bottommid', 'bottomright'].map((part) => `spr_waterfall_${part}`)]) spriteNames.add(key);
  if (fogRoom) for (const key of ['spr_papyrus_lt', 'spr_papyrus_l', 'spr_papyrus_rt', 'spr_papyrus_shadowl', 'spr_papyrus_shadowr', 'spr_maincharar_shadow', 'spr_face_papyrus', 'spr_face_papyrusmad', 'spr_heartsmall']) spriteNames.add(key);
  if (dangerBridge) for (const key of Object.keys(dangerBridgeDialogue.sprites)) spriteNames.add(key);
  if (greaterDogRoom) for (const key of Object.keys(greaterDogRoomDialogue.sprites)) spriteNames.add(key);
  if (gyftrotRoom) for (const key of Object.keys(gyftrotRoomDialogue.sprites)) spriteNames.add(key);
  if (icePuzzle) for (const key of ['spr_fakebridge', 'spr_snowhat', 'spr_snowhatparticle']) spriteNames.add(key);
  if (dogHouse) for (const key of Object.keys(dogHouseDialogue.sprites)) spriteNames.add(key);
  if (colorTiles) for (const key of Object.keys(colorTilesDialogue.sprites)) spriteNames.add(key);
  if (xoxo) for (const key of Object.keys((xoxoBigDialogue ?? xoxoSmallDialogue).sprites)) spriteNames.add(key);
  if (niceCream) for (const key of ['spr_icecreamguy_sad', 'spr_icecreamguy_anim', 'spr_icecreamguy_happy', 'spr_rollsnow', 'spr_iceflag']) spriteNames.add(key);
  if (gate) for (const key of ['spr_toriel_hug', 'spr_toriel_hug2', 'spr_toriel_hug3', 'spr_pbflame', 'spr_face_torielmad', 'spr_face_torielhappytalk', 'spr_face_torieltalkside']) spriteNames.add(key);
  if (basement) for (const key of ['spr_toriel_d', 'spr_toriel_r', 'spr_toriel_u', 'spr_toriel_l', 'spr_toriel_handhold_l', 'spr_face_torieltalk', 'spr_face_torielcold']) spriteNames.add(key);
  if (living) for (const key of ['spr_chairempty', 'spr_chairielgetup', 'spr_toriel_d', 'spr_toriel_r', 'spr_toriel_l', 'spr_toriel_u', 'spr_face_torielhappytalk', 'spr_face_torieltalkside', 'spr_face_torieltalk', 'spr_face_torielrevengetalk', 'spr_face_torielglasses']) spriteNames.add(key);
  if (hasSavepoint || candyRoom || ruins12 || ruins13 || perspective || torielBedroom || living || boxRoad || checkpoint || snowman || niceCream || crossword || spaghetti || xoxo || colorTiles) spriteNames.add('spr_heartsmall');
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
  const font = (name === 'room_water3' || name === 'room_tundra_grillby' || name === 'room_water2' || fogRoom || garage || inn || sansBasement || library || town || hasSavepoint || ruinsTutorial || ruinsSwitches || dummyLesson || spikeGuide || corridorLesson || candyRoom || ruins12 || ruins13 || ruins14 || perspective || outlook || torielHall || torielCorridor || childBedroom || torielBedroom || living || basement || floweyExit || snowdinStart || forest || boxRoad || checkpoint || doggoRoom || ice || snowman || maze || niceCream || xoxo || colorTiles || iceHole || dangerBridge || greaterDogRoom || gyftrotRoom || goofyrock || name === 'room_ruins10') && !scene.cache.bitmapFont.exists('fnt_maintext')
    ? await json('fonts/fnt_maintext/fnt_maintext.json') : null;
  if (font) images.set('fnt_maintext', 'fonts/fnt_maintext/fnt_maintext.png');
  const forestFonts = new Map();
  if (name === 'room_water2' || name === 'room_tundra_grillby' || fogRoom || garage || forest || checkpoint || ice || maze || niceCream || crossword || spaghetti || xoxo || colorTiles || town || dangerBridge || gyftrotRoom) for (const key of ['fnt_comicsans', 'fnt_papyrus']) if (!scene.cache.bitmapFont.exists(key)) {
    forestFonts.set(key, await json(`fonts/${key}/${key}.json`)); images.set(key, `fonts/${key}/${key}.png`);
  }
  const sounds = [...(dummyLesson || spikeGuide || candyRoom ? ['snd_power', 'snd_swallow', 'snd_spooky', 'snd_item'] : []),
    ...(candyRoom ? ['snd_select', 'snd_squeak'] : []),
    ...(ruins12 ? ['snd_squeak'] : []),
    ...(name === 'room_ruins12A' || spaghetti ? ['snd_movemenu'] : []),
    ...(ruinsHoles ? ['snd_noise', 'snd_fall2', 'snd_hero'] : []),
    ...(ruins14 ? ['snd_screenshake', 'snd_b'] : []),
    ...(perspective ? ['snd_switchpull_n', 'snd_noise', 'snd_fall2', 'snd_squeak'] : []),
    ...(ruinsHome ? ['snd_phone', 'mus_ruins', 'mus_toomuch', 'mus_reunited', 'mus_toriel'] : []),
    ...(torielHall || torielCorridor || childBedroom || torielBedroom || living ? ['mus_house1', 'mus_house2', 'mus_toriel', 'mus_reunited'] : []),
    ...(childBedroom ? ['snd_noise'] : []),
    ...(floweyExit ? ['snd_floweylaugh', 'snd_wonderfulidea', 'mus_cymbal'] : []),
    ...(greaterDogRoom ? ['snd_pombark'] : []),
    ...(snowdinStart || boxRoad || checkpoint || doggoRoom || ice || snowman || maze || niceCream || scent || crossword || spaghetti || snowpuzz || xoxo || colorTiles || dogHouse || icePuzzle || iceHole || dangerBridge || greaterDogRoom || gyftrotRoom ? ['mus_tone2', 'mus_snowy', 'mus_toomuch', 'mus_reunited'] : []),
    ...(doggoRoom ? ['snd_bell'] : []),
    ...(niceCream ? ['snd_dumbvictory'] : []),
    ...(inn ? ['mus_town', 'mus_reunited', 'mus_toomuch', 'mus_snoresymphony', 'snd_squeak'] : []),
    ...(sansBasement ? ['mus_sansdate', 'mus_reunited'] : []),
    ...(town ? ['mus_town', 'mus_reunited', 'mus_toomuch', 'snd_escaped', 'snd_squeak', 'snd_bluh', 'mus_doorclose', 'snd_item'] : []),
    ...(dangerBridge || fogRoom ? ['mus_papyrus'] : []),
    ...(fogRoom ? ['mus_papyrusboss', 'snd_break2'] : []),
    ...(name === 'room_water1' ? ['mus_ambientwater'] : []),
    ...(name === 'room_water2' ? ['mus_muscle'] : []),
    ...(name === 'room_water3' ? ['snd_fall2', 'snd_splash'] : []),
    ...(name === 'room_tundra_grillby' ? ['snd_bluh', 'mus_muscle', 'mus_rimshot', 'mus_whoopee', 'mus_mysteriousroom2', 'snd_noise', 'snd_chug', 'snd_swallow'] : []),
    ...(maze ? ['mus_papyrus', 'snd_shock'] : []),
    ...(crossword ? ['mus_papyrus'] : []),
    ...(snowpuzz ? ['mus_dogmeander'] : []),
    ...(colorTiles ? ['mus_papyrus', 'mus_computer', 'snd_squeak'] : []),
    ...(icePuzzle ? ['snd_fall2', 'snd_chug'] : []),
    ...(xoxo || icePuzzle ? ['snd_instanoise', 'snd_switchpull_n', 'snd_squeak'] : []),
    ...(snowman || niceCream ? ['snd_squeak', 'snd_swallow', 'snd_power'] : []),
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
  return { name, room, objects, sprites, paths, tutorialDialogue, switchDialogue, dummyDialogue, spikeDialogue, corridorDialogue, ruinsStartDialogue, ruins13Dialogue, ruins14Dialogue, perspectiveDialogue, outlookDialogue, homeDialogue, hallDialogue, bedroomDialogue, childDialogue, torielBedroomDialogue, livingDialogue, basementDialogue, gateDialogue, floweyExitDialogue, snowdinStartDialogue, forestDialogue, boxRoadDialogue, checkpointDialogue, doggoDialogue, iceDialogue, snowmanDialogue, mazeDialogue, niceCreamDialogue, golfDialogue, parkDialogue, scentDialogue, crosswordDialogue, spaghettiDialogue, snowpuzzDialogue, dogPairDialogue, xoxoSmallDialogue, xoxoBigDialogue, colorTilesDialogue, dogHouseDialogue, iceHoleDialogue, gyftrotRoomDialogue, greaterDogRoomDialogue, dangerBridgeDialogue, townNpcDialogue, townDialogue, townDogDialogue, townPapyrusDialogue, townUndyneDialogue, libraryDialogue, sansBasementDialogue, innDialogue, rockDialogue };
}
