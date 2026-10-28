import { WaterfallRainKid } from './waterfall-rain-kid.mjs';
import { WaterfallUmbrellaRoom } from './waterfall-umbrella-room.mjs';
import { WaterfallMusicStatue } from './waterfall-music-statue.mjs';
import { WaterfallDogRoom } from './waterfall-dog-room.mjs';
import { WaterfallPianoRoom } from './waterfall-piano-room.mjs';
import { ShyrenBattle } from './shyren-battle.mjs';
import { WaterfallShyrenHall } from './waterfall-shyren-hall.mjs';
import { WaterfallOnionsan } from './waterfall-onionsan.mjs';
import { WaterfallGlowParticles } from './waterfall-glow-particles.mjs';
import { WaterfallNiceCreamRoom } from './waterfall-nice-cream-room.mjs';
import { WaterfallShoeRoom } from './waterfall-shoe-room.mjs';
import { WaterfallWishesRoom } from './waterfall-wishes-room.mjs';
import { WaterfallFriendlyHub } from './waterfall-friendly-hub.mjs';
import { WaterfallBird } from './waterfall-bird.mjs';
import { WaterfallMystery } from './waterfall-mystery.mjs';
import { AaronBattle } from './aaron-battle.mjs';
import { WoshuaBattle } from './woshua-battle.mjs';
import { MoldsmalGroupBattle } from './moldsmal-group-battle.mjs';
import { WaterfallGroupBattle } from './waterfall-group-battle.mjs';
import { WaterfallEncounter } from './waterfall-encounter.mjs';
import { WaterfallWishingRoom } from './waterfall-wishing-room.mjs';
import { WaterfallHistoryRoom } from './waterfall-history-room.mjs';
import { WaterfallRaft } from './waterfall-raft.mjs';
import { UndyneQuickBattle } from './undyne-quick-battle.mjs';
import { WaterfallUndyneChase } from './waterfall-undyne-chase.mjs';
import { WaterfallUndyneSecond } from './waterfall-undyne-second.mjs';
import { WaterfallCrystalRoom } from './waterfall-crystal-room.mjs';
import { WaterfallStarRoom } from './waterfall-star-room.mjs';
import { murderLevel } from './route.mjs';
import { WaterfallQuicheRoom } from './waterfall-quiche-room.mjs';
import { WaterfallPapyrusPhone } from './waterfall-papyrus-phone.mjs';
import { WaterfallBridgeRoom } from './waterfall-bridge-room.mjs';
import { startWaterfallMusic } from './waterfall-music.mjs';
import { WaterfallUndyne } from './waterfall-undyne.mjs';
import { WaterfallGrass } from './waterfall-grass.mjs';
import { WaterfallTutuRoom } from './waterfall-tutu-room.mjs';
import { WaterfallFalls } from './waterfall-falls.mjs';
import { WaterfallRockStream } from './waterfall-rock-stream.mjs';
import { WaterfallBoxRoom } from './waterfall-box-room.mjs';
import { WaterfallSans } from './waterfall-sans.mjs';
import { GrillbyDate } from './grillby-date.mjs';
import { GrillbyNpcs } from './grillby-npcs.mjs';
import { WaterfallSentryVisuals } from './waterfall-sentry-visuals.mjs';
import { showWaterfallSave } from './waterfall-save.mjs';
import { WaterfallSentryNpcs } from './waterfall-sentry-npcs.mjs';
import { WaterfallEntrance } from './waterfall-entrance.mjs';
import { PapyrusFogEncounter } from './papyrus-fog-encounter.mjs';
import { Game, Scene, Scale, CANVAS } from '../vendor/phaser.esm.min.js';
import { loadRoom } from './room-assets.mjs';
import { createColliders, movePlayer } from './movement.mjs';
import { Battle, BATTLE_CONFIGS } from './battle.mjs';
import { readSave, writeSave } from './save.mjs';
import { SaveMenu } from './save-menu.mjs';
import { FieldMenu } from './field-menu.mjs';
import { CandyDish } from './candy-dish.mjs';
import { RuinsStart } from './ruins-start.mjs';
import { RuinsTutorial } from './ruins-tutorial.mjs';
import { RuinsSwitches } from './ruins-switches.mjs';
import { DummyLesson } from './dummy-lesson.mjs';
import { DummyBattle } from './dummy-battle.mjs';
import { SpikeGuide } from './spike-guide.mjs';
import { CorridorLesson } from './corridor-lesson.mjs';
import { TutorialFroggit } from './tutorial-froggit.mjs';
import { RuinsBattle } from './ruins-battle.mjs';
import { NapstablookBattle } from './napstablook-battle.mjs';
import { VegetoidBattle } from './vegetoid-battle.mjs';
import { TorielBattle } from './toriel-battle.mjs';
import { DrakeBattle } from './drake-battle.mjs';
import { IceCapBattle } from './icecap-battle.mjs';
import { LesserDogBattle } from './lesser-dog-battle.mjs';
import { DoggoBattle } from './doggo-battle.mjs';
import { DogPairBattle } from './dog-pair-battle.mjs';
import { SnowdinGroupBattle } from './snowdin-group-battle.mjs';
import { GyftrotBattle } from './gyftrot-battle.mjs';
import { GreaterDogBattle } from './greater-dog-battle.mjs';
import { PapyrusBattle } from './papyrus-battle.mjs';
import { DogPairRoom } from './dog-pair-room.mjs';
import { TorielGate } from './toriel-gate.mjs';
import { FloweyExit } from './flowey-exit.mjs';
import { ChapterTitle } from './chapter-title.mjs';
import { SnowdinStart, stopSnowdinMusic } from './snowdin-start.mjs';
import { SnowdinForest } from './snowdin-forest.mjs';
import { BoxRoad } from './box-road.mjs';
import { ItemBox } from './item-box.mjs';
import { RuinsEncounter } from './ruins-encounter.mjs';
import { SnowdinEncounter } from './snowdin-encounter.mjs';
import { SnowdinCheckpoint } from './snowdin-checkpoint.mjs';
import { DoggoRoom } from './doggo-room.mjs';
import { SnowdinIce } from './snowdin-ice.mjs';
import { Snowman } from './snowman.mjs';
import { ElectricMaze } from './electric-maze.mjs';
import { NiceCream } from './nice-cream.mjs';
import { SnowGolf } from './snow-golf.mjs';
import { SnowdinPark } from './snowdin-park.mjs';
import { SnowdinScent } from './snowdin-scent.mjs';
import { SnowdinCrossword } from './snowdin-crossword.mjs';
import { SnowdinSpaghetti } from './snowdin-spaghetti.mjs';
import { SnowdinSnowpuzz } from './snowdin-snowpuzz.mjs';
import { SnowdinXoxoSmall } from './snowdin-xoxo-small.mjs';
import { SnowdinXoxoBig } from './snowdin-xoxo-big.mjs';
import { SnowdinColorTiles } from './snowdin-color-tiles.mjs';
import { SnowdinDogHouse } from './snowdin-dog-house.mjs';
import { SnowdinIcePuzzle } from './snowdin-ice-puzzle.mjs';
import { SnowdinIceHole } from './snowdin-ice-hole.mjs';
import { SnowdinInn, SnowdinInnSleep } from './snowdin-inn.mjs';
import { PapyrusGarage } from './papyrus-garage.mjs';
import { SnowdinFog } from './snowdin-fog.mjs';
import { SansBasement } from './sans-basement.mjs';
import { SnowdinLibrary } from './snowdin-library.mjs';
import { SnowdinTownUndyne } from './snowdin-town-undyne.mjs';
import { SnowdinTownPapyrus } from './snowdin-town-papyrus.mjs';
import { SnowdinTownDogs } from './snowdin-town-dogs.mjs';
import { SnowdinTown } from './snowdin-town.mjs';
import { SnowdinTownNpcs } from './snowdin-town-npcs.mjs';
import { SnowdinDangerBridge } from './snowdin-danger-bridge.mjs';
import { GreaterDogRoom } from './greater-dog-room.mjs';
import { GyftrotRoom } from './gyftrot-room.mjs';
import { RuinsRock, RuinsHoles } from './ruins-rock.mjs';
import { RuinsGoofyrock } from './ruins-goofyrock.mjs';
import { Ruins12Lesson } from './ruins12.mjs';
import { Ruins13Lesson } from './ruins13.mjs';
import { Ruins14Lesson } from './ruins14.mjs';
import { RuinsPerspective } from './ruins-perspective.mjs';
import { RuinsOutlook } from './ruins-outlook.mjs';
import { RuinsHome } from './ruins-home.mjs';
import { TorielHall } from './toriel-hall.mjs';
import { TorielCorridor } from './toriel-corridor.mjs';
import { HOUSE_ROOMS, stopHouseMusic } from './house-music.mjs';
import { ChildBedroom } from './child-bedroom.mjs';
import { TorielBedroom } from './toriel-bedroom.mjs';
import { TorielLiving } from './toriel-living.mjs';
import { TorielBasement, BASEMENT_ROOMS, stopBasementMusic } from './toriel-basement.mjs';

const state = window.__remake = { phase: 'loading', room: null, error: null, scene: null };
const status = document.getElementById('status');
const INTRO_TEXT = [
  'Long ago, two races\nruled over Earth:\nHUMANS and MONSTERS.',
  'One day, war broke\nout between the two\nraces.',
  'After a long battle,\nthe humans were\nvictorious.',
  'They sealed the monsters\nunderground with a magic\nspell.',
  'Many years later... ...',
  '      MT. EBOTT\n         201X',
  'Legends say that those\nwho climb the mountain\nnever return.',
];
const DIALOGUES = {
  obj_readable_flowers1: ['* (Golden flowers.)\n* (They must have\n  broken your fall.)'],
  obj_torinteractable7: ['* Do not worry about\n  me.', '* Someone has to take\n  care of these flowers.'],
  obj_savepoint: ['* (The shadow of the ruins\n  looms above, filling you with\n  determination.)', '* (HP fully restored.)'],
};
// Các cửa đã nối: A đi tới markerA của phòng kế, B quay về markerB.
const ROOM_EXITS = {
  room_area1: { A: 'room_area1_2' },
  room_area1_2: { A: 'room_ruins1', B: 'room_area1' },
  room_ruins1: { A: 'room_ruins2', B: 'room_area1_2' },
  room_ruins2: { A: 'room_ruins3', B: 'room_ruins1' },
  room_ruins3: { A: 'room_ruins4', B: 'room_ruins2' },
  room_ruins4: { A: 'room_ruins5', B: 'room_ruins3' },
  room_ruins5: { A: 'room_ruins6', B: 'room_ruins4' },
  room_ruins6: { A: 'room_ruins7', B: 'room_ruins5' },
  room_ruins7: { A: 'room_ruins7A', B: 'room_ruins6', C: 'room_ruins8' },
  room_ruins7A: { B: 'room_ruins7' },
  room_ruins8: { A: 'room_ruins9', D: 'room_ruins7' },
  room_ruins9: { A: 'room_ruins10', B: 'room_ruins8' },
  room_ruins10: { A: 'room_ruins11', B: 'room_ruins9' },
  room_ruins11: { A: 'room_ruins12', B: 'room_ruins10' },
  room_ruins12: { A: 'room_ruins12A', B: 'room_ruins11' },
  room_ruins12A: { A: 'room_ruins12B', B: 'room_ruins12' },
  room_ruins12B: { B: 'room_ruins12A' },
  room_ruins13: { A: 'room_ruins14' },
  room_ruins14: { A: 'room_ruins15A', B: 'room_ruins13' },
  room_ruins15A: { A: 'room_ruins15B', B: 'room_ruins14' },
  room_ruins15B: { A: 'room_ruins15C', B: 'room_ruins15A' },
  room_ruins15C: { A: 'room_ruins15D', B: 'room_ruins15B' },
  room_ruins15D: { B: 'room_ruins15C', C: 'room_ruins16' },
  room_ruins16: { A: 'room_ruins17', D: 'room_ruins15D' },
  room_ruins17: { A: 'room_ruins18OLD', B: 'room_ruins16' },
  room_ruins18OLD: { B: 'room_ruins17' },
  room_ruins19: { A: 'room_torhouse1' },
  room_torhouse1: { A: 'room_torhouse2', B: 'room_ruins19', C: 'room_torhouse3' },
  room_torhouse2: { B: 'room_torhouse1' },
  room_torhouse3: { D: 'room_torhouse1', C: 'room_asrielroom', A: 'room_torielroom' },
  room_torielroom: { B: 'room_torhouse3' },
  room_asrielroom: { D: 'room_torhouse3' },
  room_basement1: { A: 'room_basement2' },
  room_basement2: { A: 'room_basement3', B: 'room_basement1' },
  room_basement3: { A: 'room_basement4', B: 'room_basement2' },
  room_basement4: { A: 'room_basement5', B: 'room_basement3' },
  room_basement5: { A: 'room_ruinsexit', B: 'room_basement4' },
  room_ruinsexit: { B: 'room_basement5' },
  room_tundra1: { A: 'room_tundra2' },
  room_tundra2: { A: 'room_tundra3', B: 'room_tundra1' },
  room_tundra3: { A: 'room_tundra3A', B: 'room_tundra2', C: 'room_tundra4' },
  room_tundra3A: { B: 'room_tundra3' },
  room_tundra4: { D: 'room_tundra3', A: 'room_tundra5' },
  room_tundra5: { B: 'room_tundra4', A: 'room_tundra6' },
  room_tundra6: { B: 'room_tundra5', A: 'room_tundra6A', C: 'room_tundra7' },
  room_tundra7: { D: 'room_tundra6', A: 'room_tundra8' },
  room_tundra8: { B: 'room_tundra7', A: 'room_tundra8A', C: 'room_tundra9' },
  room_tundra9: { D: 'room_tundra8', A: 'room_tundra_spaghetti' },
  room_tundra_spaghetti: { B: 'room_tundra9', A: 'room_tundra_snowpuzz' },
  room_tundra_snowpuzz: { B: 'room_tundra_spaghetti', A: 'room_tundra_xoxosmall' },
  room_tundra_xoxosmall: { B: 'room_tundra_snowpuzz', A: 'room_tundra_xoxopuzz' },
  room_tundra_xoxopuzz: { B: 'room_tundra_xoxosmall', A: 'room_tundra_randoblock' },
  room_tundra_randoblock: { B: 'room_tundra_xoxopuzz', A: 'room_tundra_lesserdog' },
  room_tundra_lesserdog: { B: 'room_tundra_randoblock', C: 'room_tundra_iceentrance' },
  room_tundra_iceentrance: { D: 'room_tundra_lesserdog', B: 'room_tundra_icehole', A: 'room_tundra_iceexit_new' },
  room_tundra_iceexit_new: { B: 'room_tundra_iceentrance' },
  room_tundra_poffzone: { A: 'room_tundra_dangerbridge' },
  room_tundra_dangerbridge: { B: 'room_tundra_poffzone', A: 'room_tundra_town' },
  room_tundra_town: { B: 'room_tundra_dangerbridge', u: 'room_tundra_library', t: 'room_tundra_inn', w: 'room_tundra_grillby', X: 'room_fogroom' },
  room_fogroom: { X: 'room_tundra_town', A: 'room_water1' },
  room_water1: { B: 'room_fogroom', A: 'room_water2' },
  room_water2: { B: 'room_water1', A: 'room_water3' },
  room_water3: { B: 'room_water2', A: 'room_water3A', C: 'room_water4' },
  room_water4: { D: 'room_water3', A: 'room_water5' },
  room_water5: { B: 'room_water4', A: 'room_water5A', C: 'room_water6' },
  room_water5A: { B: 'room_water5' },
  room_water6: { D: 'room_water5', A: 'room_water7' },
  room_water7: { B: 'room_water6', A: 'room_water8' },
  room_water8: { B: 'room_water7', A: 'room_water9' },
  room_water9: { B: 'room_water8', A: 'room_water_savepoint1' },
  room_water_savepoint1: { B: 'room_water9' },
  room_water_fakehallway: { u: 'room_water11' },
  room_water11: { A: 'room_water_nicecream', t: 'room_water_bird', C: 'room_water12' },
  room_water_nicecream: { B: 'room_water11' },
  room_water12: { A: 'room_water_shoe', D: 'room_water11', t: 'room_water_bird', w: 'room_water_onionsan' },
  room_water_onionsan: { w: 'room_water12', A: 'room_water14' },
  room_water14: { B: 'room_water_onionsan', A: 'room_water_piano', s: 'room_water_statue' },
  room_water_statue: { s: 'room_water14', A: 'room_water_prewaterfall' },
  room_water_prewaterfall: { B: 'room_water_statue' },
  room_water_piano: { B: 'room_water14', A: 'room_water_dogroom' },
  room_water_dogroom: { B: 'room_water_piano' },
  room_water_shoe: { B: 'room_water12' },
  room_water_bird: { t: 'room_water11', s: 'room_water_friendlyhub' },
  room_water_friendlyhub: { s: 'room_water_bird' },
  room_mysteryman: { s: 'room_water_fakehallway' },
  room_water3A: { B: 'room_water3' },
  room_tundra_library: { u: 'room_tundra_town' },
  room_tundra_grillby: { w: 'room_tundra_town' },
  room_tundra_garage: { v: 'room_tundra_town' },
  room_tundra_inn: { t: 'room_tundra_town' },
  room_tundra_sansbasement: { s: 'room_tundra_town' },
  room_tundra_icehole: { A: 'room_tundra_iceentrance' },
  room_tundra8A: { B: 'room_tundra8' },
  room_tundra6A: { B: 'room_tundra6' },
};
function fail(error) {
  state.phase = 'error'; state.error = error.message;
  status.hidden = false; status.textContent = `Không mở được phòng: ${error.message}`;
  console.error(error);
}

class World extends Scene {
  constructor() { super('World'); }

  create() {
    this.game.registry.set('sourceCache', new Map());
    state.scene = this;
    this.setupInput();
    this.trackTime = (_time, delta) => { this.playTime = (this.playTime ?? 0) + delta; };
    this.game.events.on('step', this.trackTime);
    this.events.once('shutdown', () => this.game.events.off('step', this.trackTime));
    this.events.once('shutdown', () => { this.waterfallUndyneSecond?.destroy(); this.waterfallUndyneChase?.destroy(); this.waterfallRaft?.destroy(); this.waterfallWishingRoom?.destroy(); this.waterfallEncounter?.destroy(); this.waterfallPapyrusPhone?.destroy(); this.waterfallBridgeRoom?.destroy(); this.waterfallUndyne?.destroy(); this.waterfallRoomTiles?.destroy(); this.waterfallRockStream?.destroy(); this.waterfallSans?.destroy(); this.grillbyDate?.destroy(); this.grillbyNpcs?.destroy(); this.waterfallSentryVisuals?.destroy(); this.waterfallSentryNpcs?.destroy(); this.waterfallEntrance?.destroy(); this.papyrusFogEncounter?.destroy(); this.snowdinFog?.destroy(); this.snowdinEncounter?.destroy(); this.snowdinCheckpoint?.destroy(); this.doggoRoom?.destroy(); this.dogPairRoom?.destroy(); this.snowdinXoxoSmall?.destroy(); this.snowdinXoxoBig?.destroy(); this.snowdinColorTiles?.destroy(); this.snowdinIcePuzzle?.destroy(); this.snowdinInnSleep?.destroy(); this.sansBasement?.destroy(); this.snowdinTownDogs?.destroy(); this.snowdinTown?.destroy(); this.snowdinTownNpcs?.destroy(); this.snowdinDangerBridge?.destroy(); this.greaterDogRoom?.destroy(); this.gyftrotRoom?.destroy(); this.electricMaze?.destroy(); this.niceCream?.destroy(); this.snowGolf?.destroy(); });
    this.events.once('shutdown', () => { this.roomMusicFade?.stop(); this.waterfallRain?.destroy(); this.waterfallRain = null; this.townMusic?.destroy(); this.waterfallMusic?.destroy(); this.grillbyMusic?.destroy(); stopHouseMusic(this); stopBasementMusic(this); stopSnowdinMusic(this); this.snowdinForest?.destroy(); this.floweyExit?.destroy(); });
    this.openRoom('room_area1').catch(fail);
  }

  async openRoom(name, spawnName = 'obj_mainchara') {
    state.phase = 'loading';
    if (this.waterfallRain && !['room_water_statue','room_water_prewaterfall'].includes(name)) { this.waterfallRain.destroy(); this.waterfallRain = null; }
    if (name === 'room_water9' && this.waterfallUndyneChase?.music) { this.chaseMusic = this.waterfallUndyneChase.music; this.waterfallUndyneChase.music = null; }
    // Dừng tween trước khi audio cũ bị hủy bởi đổi phòng.
    this.roomMusicFade?.stop(); this.roomMusicFade = null;
    // Tuyến kết thúc giữ cùng Reunited khi qua cửa không fade giữa rừng và thị trấn.
    if (this.flags?.[7] === 1 && name === 'room_tundra_town' && this.snowdinMusic?.key === 'mus_reunited' && !this.townMusic) { this.townMusic = this.snowdinMusic; this.snowdinMusic = null; }
    if (this.flags?.[7] === 1 && name === 'room_tundra_dangerbridge' && this.townMusic?.key === 'mus_reunited' && !this.snowdinMusic) { this.snowdinMusic = this.townMusic; this.townMusic = null; }
    if (!HOUSE_ROOMS.includes(name)) stopHouseMusic(this);
    if (!BASEMENT_ROOMS.includes(name)) stopBasementMusic(this);
    if (!['room_tundra1', 'room_tundra2', 'room_tundra3', 'room_tundra3A', 'room_tundra4', 'room_tundra5', 'room_tundra6', 'room_tundra6A', 'room_tundra7', 'room_tundra8', 'room_tundra8A', 'room_tundra9', 'room_tundra_spaghetti', 'room_tundra_snowpuzz', 'room_tundra_xoxosmall', 'room_tundra_xoxopuzz', 'room_tundra_randoblock', 'room_tundra_lesserdog', 'room_tundra_iceentrance', 'room_tundra_icehole', 'room_tundra_iceexit_new', 'room_tundra_poffzone', 'room_tundra_dangerbridge'].includes(name)) stopSnowdinMusic(this);
    if (!['room_tundra_town', 'room_tundra_library', 'room_tundra_inn', ...(this.flags?.[7] === 1 ? ['room_fogroom', 'room_water1', 'room_water2', 'room_water3', 'room_water3A', 'room_water4', 'room_water5', 'room_water5A', 'room_water6', 'room_water7', 'room_water8', 'room_water9', 'room_water_savepoint1', 'room_water11', 'room_water_fakehallway', 'room_water_bird', 'room_water_friendlyhub', 'room_water12', 'room_water_shoe', 'room_water_nicecream', 'room_water_onionsan', 'room_water14', 'room_water_piano', 'room_water_dogroom', 'room_water_statue', 'room_water_prewaterfall', 'room_tundra_grillby'] : [])].includes(name) && !(name === 'room_tundra_sansbasement' && this.flags[7] === 1)) { this.townMusic?.destroy(); this.townMusic = null; }
    if (this.waterfallMusic && !(name === 'room_water1' && this.waterfallMusic.key === 'mus_ambientwater') && !(name === 'room_water2' && this.waterfallMusic.key === 'mus_muscle') && !(['room_water11', 'room_water_bird', 'room_water_nicecream'].includes(name) && this.waterfallMusic.key === 'mus_waterfall') && !(['room_water_savepoint1', 'room_water11', 'room_water_fakehallway', 'room_water_bird', 'room_water_friendlyhub', 'room_water_nicecream'].includes(name) && ['mus_waterquiet', 'mus_toomuch'].includes(this.waterfallMusic.key)) && !(['room_water3', 'room_water3A', 'room_water4', 'room_water5', 'room_water5A', 'room_water6', 'room_water7', 'room_water8', 'room_water9', 'room_water12', 'room_water_shoe', 'room_water_onionsan', 'room_water14'].includes(name) && ['mus_ambientwater', 'mus_waterfall', 'mus_toomuch'].includes(this.waterfallMusic.key))) { this.waterfallMusic.destroy(); this.waterfallMusic = null; }
    if (name !== 'room_tundra_grillby') { this.grillbyMusic?.destroy(); this.grillbyMusic = null; }
    this.scene.stop('FieldMenu');
    this.scene.stop('ItemBox');
    state.scene = this;
    this.ruinsTutorial?.destroy();
    this.ruinsTutorial = null;
    this.ruinsSwitches?.destroy();
    this.ruinsSwitches = null;
    this.dummyLesson?.destroy();
    this.dummyLesson = null;
    this.spikeGuide?.destroy();
    this.spikeGuide = null;
    this.corridorLesson?.destroy();
    this.corridorLesson = null;
    this.candyDish = null;
    this.ruinsStart = null;
    this.ruinsEncounter?.destroy(); this.ruinsEncounter = null;
    this.snowdinEncounter?.destroy(); this.snowdinEncounter = null;
    this.ruinsRock = null; this.ruinsHoles?.destroy(); this.ruinsHoles = null;
    this.ruinsGoofyrock?.destroy(); this.ruinsGoofyrock = null;
    this.ruins12?.destroy(); this.ruins12 = null;
    this.ruins13?.destroy(); this.ruins13 = null;
    this.ruins14?.destroy(); this.ruins14 = null;
    this.ruinsPerspective?.destroy(); this.ruinsPerspective = null;
    this.ruinsOutlook = null;
    this.ruinsHome?.destroy(); this.ruinsHome = null;
    this.torielHall?.destroy(); this.torielHall = null;
    this.torielCorridor?.destroy(); this.torielCorridor = null;
    this.childBedroom?.destroy(); this.childBedroom = null;
    this.torielBedroom = null;
    this.torielLiving?.destroy(); this.torielLiving = null;
    this.torielBasement?.destroy(); this.torielBasement = null;
    this.torielGate?.destroy(); this.torielGate = null;
    this.floweyExit?.destroy(); this.floweyExit = null;
    this.snowdinStart = null;
    this.snowdinForest?.destroy(); this.snowdinForest = null;
    this.boxRoad = null;
    this.snowdinCheckpoint?.destroy(); this.snowdinCheckpoint = null;
    this.doggoRoom?.destroy(); this.doggoRoom = null;
    this.snowdinIce = null; this.snowman = null; this.snowdinPark = null;
    this.snowdinScent?.destroy(); this.snowdinScent = null;
    this.snowdinCrossword?.destroy(); this.snowdinCrossword = null; this.snowdinSpaghetti = null; this.snowdinSnowpuzz = null;
    this.dogPairRoom?.destroy(); this.dogPairRoom = null;
    this.snowdinXoxoSmall?.destroy(); this.snowdinXoxoSmall = null;
    this.snowdinXoxoBig?.destroy(); this.snowdinXoxoBig = null;
    this.snowdinColorTiles?.destroy(); this.snowdinColorTiles = null; this.snowdinDogHouse = null;
    this.waterfallUndyneSecond?.destroy(); this.waterfallUndyneChase?.destroy(); this.waterfallRaft?.destroy(); this.waterfallWishingRoom?.destroy(); this.waterfallEncounter?.destroy(); this.waterfallPapyrusPhone?.destroy(); this.waterfallBridgeRoom?.destroy(); this.waterfallUndyne?.destroy(); this.waterfallRoomTiles?.destroy(); this.waterfallRockStream?.destroy(); this.waterfallSans?.destroy(); this.grillbyDate?.destroy(); this.grillbyNpcs?.destroy(); this.waterfallSentryVisuals?.destroy(); this.waterfallSentryNpcs?.destroy(); this.waterfallEntrance?.destroy(); this.papyrusFogEncounter?.destroy(); this.snowdinFog?.destroy(); this.snowdinFog = null; this.papyrusFogEncounter = null; this.waterfallEntrance = null; this.waterfallSentryNpcs = null; this.waterfallSentryVisuals = null; this.grillbyNpcs = null; this.grillbyDate = null; this.waterfallSans = null; this.waterfallBoxRoom = null; this.waterfallRockStream = null; this.waterfallRoomTiles = null; this.waterfallFalls = null; this.waterfallTutuRoom = null; this.waterfallGrass = null; this.waterfallUndyne = null; this.waterfallBridgeRoom = null; this.waterfallPapyrusPhone = null; this.waterfallEncounter = null; this.waterfallQuicheRoom = null; this.waterfallWishingRoom = null; this.waterfallHistoryRoom = null; this.waterfallRaft = null; this.waterfallUndyneChase = null; this.waterfallUndyneSecond = null; this.waterfallCrystalRoom = null; this.waterfallStarRoom?.destroy(); this.waterfallStarRoom = null; this.waterfallBird?.destroy(); this.waterfallBird = null; this.waterfallFriendlyHub = null; this.waterfallWishesRoom?.destroy(); this.waterfallWishesRoom = null; this.waterfallShoeRoom = null; this.waterfallNiceCreamRoom = null; this.waterfallGlowParticles?.destroy(); this.waterfallGlowParticles = null; this.waterfallOnionsan?.destroy(); this.waterfallOnionsan = null; this.waterfallShyrenHall?.destroy(); this.waterfallShyrenHall = null; this.waterfallPianoRoom?.destroy(); this.waterfallPianoRoom = null; this.waterfallDogRoom?.destroy(); this.waterfallDogRoom = null; this.waterfallMusicStatue?.destroy(); this.waterfallMusicStatue = null; this.waterfallUmbrellaRoom?.destroy(); this.waterfallUmbrellaRoom = null; this.waterfallRainKid?.destroy(); this.waterfallRainKid = null; this.waterfallMystery = null; this.snowdinIcePuzzle?.destroy(); this.snowdinIcePuzzle = null; this.snowdinIceHole = null; this.snowdinInnSleep?.destroy(); this.sansBasement?.destroy(); this.snowdinTownDogs?.destroy(); this.snowdinTown?.destroy(); this.snowdinTownNpcs?.destroy(); this.snowdinDangerBridge?.destroy(); this.greaterDogRoom?.destroy(); this.gyftrotRoom?.destroy(); this.gyftrotRoom = null; this.greaterDogRoom = null; this.snowdinDangerBridge = null; this.snowdinTownNpcs = null; this.snowdinTown = null; this.snowdinTownDogs = null; this.snowdinTownPapyrus = null; this.snowdinTownUndyne = null; this.snowdinLibrary = null; this.sansBasement = null; this.snowdinInn = null; this.snowdinInnSleep = null; this.papyrusGarage = null;
    this.electricMaze?.destroy(); this.electricMaze = null;
    this.niceCream?.destroy(); this.niceCream = null;
    this.snowGolf?.destroy(); this.snowGolf = null;
    this.dialogue = null;
    this.choiceUi = [];
    this.flags ??= {};
    this.phone ??= [];
    this.inventory ??= []; this.weapon ??= 3; this.armor ??= 4;
    this.weaponStrength ??= 0; this.armorDefense ??= 0;
    const facing = this.player?.facing ?? 'd';
    const data = await loadRoom(this, name);
    // DisplayList.removeAll(true) chỉ bỏ danh sách và skip callback, không hủy GameObject.
    for (const child of this.children.getAll()) child.destroy();
    this.dataSource = data;
    for (const background of data.room.Backgrounds.filter((item) => item.Enabled && !item.Foreground)) {
      const image = this.add.image(background.X, background.Y, background.BackgroundAsset).setOrigin(0).setDepth(-2000000);
      if (background.Stretch) image.setDisplaySize(data.room.Width, data.room.Height);
    }
    for (const tile of data.room.Tiles) {
      const key = `tile:${tile.Asset}:${tile.SourceX}:${tile.SourceY}:${tile.Width}:${tile.Height}`;
      const texture = this.textures.get(tile.Asset);
      if (!texture.has(key)) texture.add(key, 0, tile.SourceX, tile.SourceY, tile.Width, tile.Height);
      this.add.image(tile.X, tile.Y, tile.Asset, key).setOrigin(0).setScale(tile.ScaleX, tile.ScaleY).setDepth(-tile.Depth);
    }
    this.roomObjects = [];
    const inherits = (name, target) => {
      for (let current = name; current; current = data.objects.get(current)?.ParentObject) if (current === target) return true;
      return false;
    };
    for (const item of data.room.GameObjects) {
      if (item.ObjectName === 'obj_mainchara') continue; // Vị trí gốc chỉ dùng để tạo player một lần.
      // Create/RoomStart gốc: không đọc hoa khi mới rơi xuống; Toriel ở đây khi plot = 25.
      if (item.ObjectName === 'obj_readable_flowers1' && (this.plot ?? 0) === 0) continue;
      if (item.ObjectName === 'obj_torinteractable7' && this.plot !== 25) continue;
      if (name === 'room_water11' && item.ObjectName === 'obj_npc_room' && murderLevel(this.flags) >= 8) continue;
      if (name === 'room_water7' && item.ObjectName === 'obj_woshuanpc' && !(this.plot > 121 && (this.flags[204] ?? 0) === 0)) continue;
      if (['room_water7', 'room_water9'].includes(name) && item.ObjectName === 'obj_purpledude' && (this.plot < 110 || murderLevel(this.flags) >= 8 && !this.flags[27])) continue;
      if (name === 'room_water7' && item.ObjectName === 'obj_mkid_goner' && (this.plot < 110 || this.flags[7] === 1 || (this.flags[5] ?? 0) < 90 || Number(localStorage.getItem('undertale-remake-fun') ?? 0) < 90)) continue;
      if (name === 'room_ruins2' && this.plot > 2 && ['obj_ruinsdoor1', 'obj_toroverworld3'].includes(item.ObjectName)) continue;
      if (name === 'room_ruins3') {
        if (item.ObjectName === 'obj_toroverworld4' && this.plot >= 4) continue;
        if (item.ObjectName === 'obj_torinteractable1' && this.plot !== 4) continue;
        if (item.ObjectName === 'obj_torinteractable2' && this.plot !== 4.5) continue;
      }
      if (name === 'room_ruins4') {
        if (item.ObjectName === 'obj_torinteractable4' && !(this.plot >= 5.4 && this.plot <= 6.5)) continue;
        if (item.ObjectName === 'obj_dummy1' && this.flags[14] === 1) continue;
      }
      if (name === 'room_ruins5' && item.ObjectName === 'obj_toroverworld5' && (this.plot > 7 || this.plot < 6)) continue;
      if (name === 'room_ruins9' && item.ObjectName === 'obj_plotwall4' && this.flags[35] === 1) continue;
      if (name === 'room_ruins7' && item.ObjectName === 'obj_smallfrog' && this.kills > 0) continue;
      if (name === 'room_ruins6') {
        if (item.ObjectName === 'obj_toroverworld7' && this.plot > 8) continue;
        if (item.ObjectName === 'obj_torinteractable6' && this.plot > 8.5) continue;
      }
      const object = data.objects.get(item.ObjectName);
      const interactable = Boolean(object && (inherits(item.ObjectName, 'obj_readable') || inherits(item.ObjectName, 'obj_interactable')
        || item.ObjectName.includes('readable') || item.ObjectName.includes('torinteractable')));
      if ((!object?.Visible && !interactable) || !object.Sprite || item.ObjectName === 'obj_overworldcontroller' || item.ObjectName === 'obj_unfader') continue;
      const sprite = data.sprites.get(object.Sprite);
      const key = `${object.Sprite}:0`;
      const image = object.Visible ? this.add.image(item.X, item.Y, key)
        .setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height)
        .setScale(item.ScaleX ?? 1, item.ScaleY ?? 1)
        .setDepth(item.Depth ?? item.Y) : null;
      this.roomObjects.push({ item, object, sprite, image, interactable });
    }
    const spawn = data.room.GameObjects.find((item) => item.ObjectName === spawnName)
      ?? data.room.GameObjects.find((item) => item.ObjectName === 'obj_mainchara');
    if (!spawn) throw new Error(`Phòng ${name} không có vị trí nhân vật.`);
    const snap = (value) => value % 3 === 2 ? value + 1 : value % 3 === 1 ? value - 1 : value;
    // Create gốc căn lưới trước, rồi mới ghi đè bằng marker cửa: không căn lại marker.
    this.player = this.add.image(spawnName === 'obj_mainchara' ? snap(spawn.X) : spawn.X,
      spawnName === 'obj_mainchara' ? snap(spawn.Y) : spawn.Y, `spr_mainchara${facing}:0`).setOrigin(0);
    this.player.facing = facing; this.player.frameIndex = 0;
    if (this.flags[85] === 1) { const key = `spr_mainchara${facing}_umbrella`, sprite = data.sprites.get(key); this.player.setTexture(`${key}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height); }
    this.doors = data.room.GameObjects.flatMap((item) => {
      const match = /^obj_door([ABCDX])(musicfade)?$/.exec(item.ObjectName) ?? (['obj_door_u', 'obj_door_t', 'obj_door_v', 'obj_door_w'].includes(item.ObjectName) ? [item.ObjectName, item.ObjectName.slice(-1)] : item.ObjectName === 'obj_door_s_musfade' ? [item.ObjectName, 's', true] : null);
      const special = item.ObjectName === 'obj_door_ruins13' && ({ room_ruins12: 'room_ruins13', room_ruins13: 'room_ruins12', room_ruins15E: 'room_ruins15A', room_ruins16: 'room_ruins19', room_ruins19: 'room_ruins16', room_torhouse2: 'room_kitchen', room_kitchen: 'room_torhouse2', room_torhouse1: 'room_basement1', room_basement1: 'room_torhouse1', room_tundra_iceentrance: 'room_tundra_poffzone', room_tundra_poffzone: 'room_tundra_iceentrance', room_water_savepoint1: 'room_water11', room_water11: 'room_water_savepoint1', room_water_fakehallway: 'room_water_savepoint1', room_water12: 'room_water11' })[name];
      const destination = special || (match && !(name === 'room_tundra_town' && match[1] === 'X' && item.X <= data.room.Width - 80) && ROOM_EXITS[name]?.[match[1]]);
      if (!destination) return [];
      const sprite = data.sprites.get(data.objects.get(item.ObjectName).Sprite);
      return [{ destination, direction: special ? 'X' : match[1], marker: special ? 'obj_markerX' : ({ A: 'obj_markerA', B: 'obj_markerB', C: 'obj_markerC', D: 'obj_markerD', X: 'obj_markerX', u: 'obj_markeru', t: 'obj_markert', s: 'obj_markers', v: 'obj_markerv', w: 'obj_markerw' })[match[1]] ?? 'obj_markerA',
        musicFade: Boolean(match?.[2] || ['v', 'w'].includes(match?.[1])),
        duration: (special || ['u', 's', 't', 'v', 'w'].includes(match[1]) ? 14 : match[2] ? 13 : 8) * 1000 / 30,
        left: item.X + (sprite.MarginLeft - sprite.OriginX) * item.ScaleX,
        right: item.X + (sprite.MarginRight - sprite.OriginX) * item.ScaleX,
        top: item.Y + (sprite.MarginTop - sprite.OriginY) * item.ScaleY,
        bottom: item.Y + (sprite.MarginBottom - sprite.OriginY) * item.ScaleY }];
    });
    this.menuPressed = false;
    this.confirmDown = false;
    this.confirmPressed = false;
    this.confirmWasDown = false;
    this.interactionCooldown = 0;
    this.dialogue = null;
    this.hp = this.hp ?? 20;
    this.maxHp = this.maxHp ?? 20;
    this.lv = this.lv ?? 1;
    this.xp ??= 0; this.gold ??= 0; this.kills ??= 0;
    this.plot = this.plot ?? 0;
    this.playTime = this.playTime ?? 0;
    this.colliders = createColliders(data);
    this.elapsed = 0;
    this.cameras.main.setBounds(0, 0, data.room.Width, data.room.Height);
    this.updateCamera();
    if (name === 'room_ruins2') this.ruinsTutorial = new RuinsTutorial(this);
    if (name === 'room_ruins3') this.ruinsSwitches = new RuinsSwitches(this);
    if (name === 'room_ruins4') this.dummyLesson = new DummyLesson(this);
    if (name === 'room_ruins5') this.spikeGuide = new SpikeGuide(this);
    if (name === 'room_ruins6') this.corridorLesson = new CorridorLesson(this);
    if (name === 'room_ruins7A') this.candyDish = new CandyDish(this);
    if (name === 'room_ruins7') { this.ruinsStart = new RuinsStart(this); this.ruinsEncounter = new RuinsEncounter(this); }
    if (['room_ruins8', 'room_ruins10', 'room_ruins14'].includes(name)) this.ruinsHoles = new RuinsHoles(this);
    if (['room_ruins9', 'room_ruins11'].includes(name)) this.ruinsRock = new RuinsRock(this);
    if (name === 'room_ruins11') this.ruinsGoofyrock = new RuinsGoofyrock(this);
    if (name === 'room_ruins12') this.ruins12 = new Ruins12Lesson(this);
    if (name === 'room_ruins12A') this.ruins12 = new Ruins12Lesson(this);
    if (['room_ruins12B', 'room_ruins13'].includes(name)) this.ruins13 = new Ruins13Lesson(this);
    if (name === 'room_ruins14') this.ruins14 = new Ruins14Lesson(this);
    if (/^room_ruins15[A-D]$/.test(name)) this.ruinsPerspective = new RuinsPerspective(this);
    if (['room_ruins17', 'room_ruins18OLD'].includes(name)) this.ruinsOutlook = new RuinsOutlook(this);
    if (name === 'room_ruins19') this.ruinsHome = new RuinsHome(this);
    if (name === 'room_torhouse1') this.torielHall = new TorielHall(this);
    if (name === 'room_torhouse3') this.torielCorridor = new TorielCorridor(this);
    if (name === 'room_asrielroom') this.childBedroom = new ChildBedroom(this);
    if (name === 'room_torielroom') this.torielBedroom = new TorielBedroom(this);
    if (['room_torhouse2', 'room_kitchen'].includes(name)) this.torielLiving = new TorielLiving(this);
    if (BASEMENT_ROOMS.includes(name) && name !== 'room_basement4') this.torielBasement = new TorielBasement(this);
    if (name === 'room_basement4') this.torielGate = new TorielGate(this);
    if (name === 'room_ruinsexit') this.floweyExit = new FloweyExit(this);
    if (name === 'room_tundra1') this.snowdinStart = new SnowdinStart(this);
    if (name === 'room_tundra2') this.snowdinForest = new SnowdinForest(this);
    if (['room_tundra3', 'room_tundra3A'].includes(name)) this.boxRoad = new BoxRoad(this);
    if (name === 'room_tundra4') this.snowdinCheckpoint = new SnowdinCheckpoint(this);
    if (name === 'room_tundra5') this.doggoRoom = new DoggoRoom(this);
    if (['room_tundra6', 'room_tundra8', 'room_tundra_iceentrance'].includes(name)) this.snowdinIce = new SnowdinIce(this);
    if (name === 'room_tundra_xoxosmall') this.snowdinXoxoSmall = new SnowdinXoxoSmall(this);
    if (name === 'room_tundra_xoxopuzz') this.snowdinXoxoBig = new SnowdinXoxoBig(this);
    if (name === 'room_tundra_randoblock') this.snowdinColorTiles = new SnowdinColorTiles(this);
    if (name === 'room_tundra_lesserdog') this.snowdinDogHouse = new SnowdinDogHouse(this);
    if (name === 'room_tundra_iceentrance') this.snowdinIcePuzzle = new SnowdinIcePuzzle(this);
    if (name === 'room_tundra_icehole') this.snowdinIceHole = new SnowdinIceHole(this);
    if (name === 'room_fogroom') { this.snowdinFog = new SnowdinFog(this); this.papyrusFogEncounter = new PapyrusFogEncounter(this); }
    if (name === 'room_tundra_grillby') {
      this.grillbyNpcs = new GrillbyNpcs(this); this.snowdinTownDogs = new SnowdinTownDogs(this, true);
      if (this.flags[67] !== 1 && !this.townMusic && !this.grillbyMusic) { this.grillbyMusic = this.sound.add('mus_muscle', { loop: true }); this.grillbyMusic.play(); }
      this.grillbyDate = new GrillbyDate(this);
    }
    if (['room_water_fakehallway', 'room_mysteryman'].includes(name)) this.waterfallMystery = new WaterfallMystery(this);
    if (data.room.GameObjects.some(e => e.ObjectName === 'obj_glowparticlegen_1')) this.waterfallGlowParticles = new WaterfallGlowParticles(this);
    if (name === 'room_water_nicecream') { this.waterfallNiceCreamRoom = new WaterfallNiceCreamRoom(this); this.niceCream = new NiceCream(this); }
    if (name === 'room_water_waterfall') this.waterfallRainKid = new WaterfallRainKid(this, spawnName);
    if (name === 'room_water_prewaterfall') this.waterfallUmbrellaRoom = new WaterfallUmbrellaRoom(this);
    if (name === 'room_water_statue') this.waterfallMusicStatue = new WaterfallMusicStatue(this);
    if (name === 'room_water_dogroom') this.waterfallDogRoom = new WaterfallDogRoom(this);
    if (name === 'room_water_piano') this.waterfallPianoRoom = new WaterfallPianoRoom(this);
    if (name === 'room_water14') this.waterfallShyrenHall = new WaterfallShyrenHall(this);
    if (name === 'room_water_onionsan') this.waterfallOnionsan = new WaterfallOnionsan(this);
    if (name === 'room_water_shoe') { this.waterfallShoeRoom = new WaterfallShoeRoom(this); this.waterfallGrass = new WaterfallGrass(this); }
    if (name === 'room_water12') { this.waterfallWishesRoom = new WaterfallWishesRoom(this); this.waterfallPapyrusPhone = new WaterfallPapyrusPhone(this); this.waterfallEncounter = new WaterfallEncounter(this, spawnName); }
    if (name === 'room_water_friendlyhub') this.waterfallFriendlyHub = new WaterfallFriendlyHub(this);
    if (name === 'room_water_bird') this.waterfallBird = new WaterfallBird(this, spawnName);
    if (name === 'room_water11') this.waterfallStarRoom = new WaterfallStarRoom(this);
    if (name === 'room_water_savepoint1') this.waterfallCrystalRoom = new WaterfallCrystalRoom(this);
    if (name === 'room_water9') { if (this.plot >= 110) startWaterfallMusic(this); this.waterfallGrass = new WaterfallGrass(this); this.waterfallUndyneSecond = new WaterfallUndyneSecond(this); }
    if (name === 'room_water8') this.waterfallUndyneChase = new WaterfallUndyneChase(this);
    if (name === 'room_water7') { startWaterfallMusic(this); this.waterfallHistoryRoom = new WaterfallHistoryRoom(this); this.waterfallRaft = new WaterfallRaft(this); }
    if (name === 'room_water6') { startWaterfallMusic(this); this.waterfallWishingRoom = new WaterfallWishingRoom(this); this.waterfallEncounter = new WaterfallEncounter(this, spawnName); }
    if (name === 'room_water5A') this.waterfallQuicheRoom = new WaterfallQuicheRoom(this);
    if (name === 'room_water5') { this.waterfallBridgeRoom = new WaterfallBridgeRoom(this, spawnName); this.waterfallPapyrusPhone = new WaterfallPapyrusPhone(this); this.waterfallEncounter = new WaterfallEncounter(this, spawnName); }
    if (name === 'room_water4') { startWaterfallMusic(this); this.waterfallGrass = new WaterfallGrass(this); this.waterfallUndyne = new WaterfallUndyne(this); }
    if (name === 'room_water3A') this.waterfallTutuRoom = new WaterfallTutuRoom(this);
    if (name === 'room_water3') { this.waterfallBoxRoom = new WaterfallBoxRoom(this); this.waterfallRockStream = new WaterfallRockStream(this); this.waterfallRoomTiles = new WaterfallSentryVisuals(this); this.waterfallFalls = new WaterfallFalls(this); }
    if (name === 'room_water2') {
      this.waterfallSentryNpcs = new WaterfallSentryNpcs(this); this.waterfallSentryVisuals = new WaterfallSentryVisuals(this); this.waterfallSans = new WaterfallSans(this);
      if (this.flags[67] !== 1 && !this.townMusic && !this.waterfallMusic) { this.waterfallMusic = this.sound.add('mus_muscle', { loop: true }); this.waterfallMusic.play(); }
    }
    if (name === 'room_water1') this.waterfallEntrance = new WaterfallEntrance(this);
    if (name === 'room_tundra_garage') this.papyrusGarage = new PapyrusGarage(this);
    if (name === 'room_tundra_inn') this.snowdinInn = new SnowdinInn(this);
    if (name === 'room_tundra_inn_2f') this.snowdinInnSleep = new SnowdinInnSleep(this);
    if (name === 'room_tundra_sansbasement') this.sansBasement = new SansBasement(this);
    if (name === 'room_tundra_library') this.snowdinLibrary = new SnowdinLibrary(this);
    if (name === 'room_tundra_town') { this.snowdinTown = new SnowdinTown(this); this.snowdinTownNpcs = new SnowdinTownNpcs(this); this.snowdinTownDogs = new SnowdinTownDogs(this); this.snowdinTownPapyrus = new SnowdinTownPapyrus(this); this.snowdinTownUndyne = new SnowdinTownUndyne(this); }
    if (name === 'room_tundra_dangerbridge') this.snowdinDangerBridge = new SnowdinDangerBridge(this);
    if (name === 'room_tundra_poffzone') this.greaterDogRoom = new GreaterDogRoom(this);
    if (name === 'room_tundra_iceexit_new') this.gyftrotRoom = new GyftrotRoom(this);
    if (name === 'room_tundra_snowpuzz') { this.snowdinSnowpuzz = new SnowdinSnowpuzz(this); this.dogPairRoom = new DogPairRoom(this); }
    if (name === 'room_tundra_spaghetti') this.snowdinSpaghetti = new SnowdinSpaghetti(this);
    if (name === 'room_tundra9') this.snowdinCrossword = new SnowdinCrossword(this);
    if (name === 'room_tundra8A') this.snowdinScent = new SnowdinScent(this);
    if (name === 'room_tundra6A') this.snowman = new Snowman(this);
    if (name === 'room_tundra7') this.electricMaze = new ElectricMaze(this);
    if (name === 'room_tundra8') { this.niceCream = new NiceCream(this); this.snowGolf = new SnowGolf(this); this.snowdinPark = new SnowdinPark(this); }
    if (['room_tundra3', 'room_tundra4', 'room_tundra6', 'room_tundra_snowpuzz', 'room_tundra_iceexit_new', 'room_tundra_dangerbridge'].includes(name)) this.snowdinEncounter = new SnowdinEncounter(this, spawnName);
    state.room = name; state.phase = 'running'; status.hidden = true;
  }

  setupInput() {
    this.keys = this.input.keyboard.createCursorKeys();
    this.touch = new Map();
    for (const button of document.querySelectorAll('[data-direction]')) {
      button.onpointerdown = (event) => {
        event.preventDefault(); button.setPointerCapture(event.pointerId);
        this.touch.set(event.pointerId, { direction: button.dataset.direction, started: performance.now() });
      };
      button.onpointerup = button.onpointercancel = button.onlostpointercapture = (event) => {
        const pointer = this.touch.get(event.pointerId);
        if (!pointer) return;
        setTimeout(() => {
          if (this.touch.get(event.pointerId) === pointer) this.touch.delete(event.pointerId);
        }, Math.max(0, 50 - (performance.now() - pointer.started)));
      };
    }
    this.release = () => { this.input.keyboard.resetKeys(); this.touch.clear(); };
    this.confirmPress = (event) => {
      if (event.repeat) return;
      if (state.phase === 'running' && this.dialogue?.choice && ['ArrowLeft', 'ArrowRight'].includes(event.code) && this.time.now >= this.dialogue.choice.readyAt) {
        this.dialogue.choice.index = 1 - this.dialogue.choice.index;
        this.choiceUi[0].x = this.dialogue.choice.index === 0 ? 89 : 185;
        this.sound.play('snd_squeak');
      }
      if (['KeyX', 'ShiftLeft', 'ShiftRight'].includes(event.code) && state.phase === 'running') this.dialogue?.onCancel?.();
      if (['KeyX', 'ShiftLeft', 'ShiftRight'].includes(event.code) && state.phase === 'running') { this.waterfallWishingRoom?.closeViewer(); this.waterfallStarRoom?.closeViewer(); this.waterfallPianoRoom?.quit(); }
      if (['KeyZ', 'Enter'].includes(event.code)) { this.confirmDown = true; this.confirmPressed = true; }
      if (['KeyC', 'ControlLeft', 'ControlRight'].includes(event.code) && state.phase === 'running' && !this.dialogue) this.menuPressed = true;
    };
    this.confirmRelease = (event) => { if (['KeyZ', 'Enter'].includes(event.code)) this.confirmDown = false; };
    window.addEventListener('keydown', this.confirmPress);
    window.addEventListener('keyup', this.confirmRelease);
    window.addEventListener('blur', this.release);
    this.visibility = () => { if (document.hidden) this.release(); };
    document.addEventListener('visibilitychange', this.visibility);
    this.events.once('shutdown', () => {
      window.removeEventListener('blur', this.release);
      window.removeEventListener('keydown', this.confirmPress);
      window.removeEventListener('keyup', this.confirmRelease);
      document.removeEventListener('visibilitychange', this.visibility);
    });
  }

  updateCamera() {
    if (this.snowdinXoxoBig?.cameraLocked && this.player.x >= 450) return;
    this.cameras.main.setScroll(Math.max(0, Math.min(this.dataSource.room.Width - 320, Math.round(this.player.x - 150))),
      Math.max(0, Math.min(this.dataSource.room.Height - 240, Math.round(this.player.y - 110))));
  }

  update(_time, delta) {
    if (['running', 'menu', 'loadingMenu', 'itemBox', 'loadingBox'].includes(state.phase)) {
      this.waterfallGlowParticles?.update(delta);
      this.ruinsStart?.animate();
      this.ruins13?.animate();
      this.ruinsOutlook?.animate();
      this.torielCorridor?.animate();
    }
    if (['menu', 'loadingMenu', 'itemBox', 'loadingBox'].includes(state.phase)) {
      this.spikeGuide?.updateMotion(delta);
      this.corridorLesson?.updateFlowey();
      this.torielCorridor?.update(delta);
      this.childBedroom?.update(delta);
      this.torielBedroom?.update(delta);
      this.torielLiving?.update(delta);
      this.floweyExit?.update(delta);
      this.snowdinStart?.update(delta);
      this.snowdinForest?.update(delta);
      this.boxRoad?.update(delta);
      this.snowdinCheckpoint?.update(delta);
      this.doggoRoom?.update(delta);
      this.dogPairRoom?.update(delta);
      this.snowdinXoxoSmall?.update(delta);
      this.snowdinXoxoBig?.update(delta);
      this.snowdinColorTiles?.update(delta);
      this.snowdinDogHouse?.update(delta);
      this.snowdinIcePuzzle?.update(delta);
      this.snowdinIceHole?.update(delta);
      this.snowdinFog?.update(delta); this.papyrusFogEncounter?.update(delta); this.waterfallEntrance?.update(delta); this.waterfallSentryNpcs?.update(delta); this.waterfallSentryVisuals?.update(delta); this.grillbyNpcs?.update(delta); this.grillbyDate?.update(delta); this.waterfallSans?.update(delta); this.waterfallRockStream?.update(delta, true); this.waterfallRoomTiles?.update(delta); this.waterfallFalls?.update(delta); this.waterfallGrass?.update(delta); this.waterfallUndyne?.update(delta); this.waterfallBridgeRoom?.update(delta); this.waterfallPapyrusPhone?.update(delta); this.waterfallQuicheRoom?.update(delta);
      this.snowdinInn?.update(delta); this.snowdinInnSleep?.update(delta);
      this.snowdinLibrary?.update(delta);
      this.snowdinTownUndyne?.update(delta);
      this.snowdinTownPapyrus?.update(delta);
      this.snowdinTownDogs?.update(delta);
      this.snowdinTown?.update(delta);
      this.snowdinTownNpcs?.update(delta);
      this.snowdinDangerBridge?.update(delta);
      this.greaterDogRoom?.update(delta);
      this.gyftrotRoom?.update(delta);
      this.electricMaze?.update(delta);
      this.snowdinCrossword?.update(delta);
      this.snowdinSpaghetti?.update(delta);
      this.snowdinSnowpuzz?.update();
      this.niceCream?.update(delta);
      this.snowGolf?.update(delta);
      return;
    }
    if (state.phase !== 'running') return;
    const menuPressed = this.menuPressed; this.menuPressed = false;
    const guideLocked = this.spikeGuide?.update(delta);
    const holesLocked = this.ruinsHoles?.update(delta);
    const rockLocked = this.ruinsGoofyrock?.update();
    const homeLocked = this.ruinsHome?.update(delta);
    const bedroomLocked = this.torielCorridor?.update(delta);
    const sleepLocked = this.childBedroom?.update(delta);
    this.torielBedroom?.update(delta);
    const livingLocked = this.torielLiving?.update(delta);
    const basementLocked = this.torielBasement?.update(delta);
    const gateLocked = this.torielGate?.update();
    const floweyLocked = this.floweyExit?.update(delta);
    this.snowdinStart?.update(delta);
    const forestLocked = this.snowdinForest?.update(delta);
    const checkpointLocked = this.snowdinCheckpoint?.update(delta);
    const doggoLocked = this.doggoRoom?.update(delta);
    const dogPairLocked = this.dogPairRoom?.update(delta);
    const xoxoSmallLocked = this.snowdinXoxoSmall?.update(delta);
    const xoxoBigLocked = this.snowdinXoxoBig?.update(delta);
    const colorTilesLocked = this.snowdinColorTiles?.update(delta);
    this.snowdinDogHouse?.update(delta);
    const icePuzzleLocked = this.snowdinIcePuzzle?.update(delta);
    const iceHoleLocked = this.snowdinIceHole?.update(delta);
    this.snowdinFog?.update(delta); this.waterfallEntrance?.update(delta); this.waterfallSentryNpcs?.update(delta); this.waterfallSentryVisuals?.update(delta); this.grillbyNpcs?.update(delta);
    const grillbyDateLocked = this.grillbyDate?.update(delta);
    const waterfallSansLocked = this.waterfallSans?.update(delta);
    const waterfallRockLocked = this.waterfallRockStream?.update(delta);
    this.waterfallRoomTiles?.update(delta); this.waterfallFalls?.update(delta); this.waterfallGrass?.update(delta);
    const waterfallUndyneLocked = this.waterfallUndyne?.update(delta);
    const waterfallBridgeLocked = this.waterfallBridgeRoom?.update(delta);
    this.waterfallMystery?.update(delta);
    const wishingLocked = this.waterfallWishingRoom?.update(delta);
    this.waterfallWishesRoom?.update(delta);
    this.waterfallMusicStatue?.update(delta); this.waterfallUmbrellaRoom?.update(delta);
    const dogRoomLocked = this.waterfallDogRoom?.update(delta);
    const rainKidLocked = this.waterfallRainKid?.update(delta);
    const pianoLocked = this.waterfallPianoRoom?.update(delta);
    const shyrenHallLocked = this.waterfallShyrenHall?.update(delta);
    const onionsanLocked = this.waterfallOnionsan?.update(delta);
    const friendlyLocked = this.waterfallFriendlyHub?.update(delta);
    const birdLocked = this.waterfallBird?.update(delta);
    const starViewerLocked = this.waterfallStarRoom?.update(delta);
    const raftLocked = this.waterfallRaft?.update(delta);
    const chaseLocked = this.waterfallUndyneChase?.update(delta);
    const secondChaseLocked = this.waterfallUndyneSecond?.update(delta);
    this.waterfallPapyrusPhone?.update(delta); this.waterfallQuicheRoom?.update(delta);
    const papyrusFogLocked = this.papyrusFogEncounter?.update(delta);
    const innLocked = this.snowdinInn?.update(delta) || this.snowdinInnSleep?.update(delta);
    this.snowdinLibrary?.update(delta);
    this.snowdinTownUndyne?.update(delta);
    const townPapyrusLocked = this.snowdinTownPapyrus?.update(delta);
    const townDogsLocked = this.snowdinTownDogs?.update(delta);
    const townLocked = this.snowdinTown?.update(delta);
    this.snowdinTownNpcs?.update(delta);
    const dangerBridgeLocked = this.snowdinDangerBridge?.update(delta);
    const greaterDogLocked = this.greaterDogRoom?.update(delta);
    const gyftrotLocked = this.gyftrotRoom?.update(delta);
    const mazeLocked = this.electricMaze?.update(delta);
    const crosswordLocked = this.snowdinCrossword?.update(delta);
    this.snowdinSpaghetti?.update(delta);
    this.snowdinSnowpuzz?.update();
    const creamLocked = this.niceCream?.update(delta);
    this.snowGolf?.update(delta);
    this.boxRoad?.update(delta);
    if (this.dialogue) {
      if (this.justConfirmed()) this.advanceDialogue();
      return;
    }
    if (this.corridorLesson?.update(delta) || guideLocked || holesLocked || rockLocked || homeLocked || bedroomLocked || sleepLocked || livingLocked || basementLocked || gateLocked || floweyLocked || forestLocked || checkpointLocked || doggoLocked || dogPairLocked || xoxoSmallLocked || xoxoBigLocked || colorTilesLocked || icePuzzleLocked || iceHoleLocked || grillbyDateLocked || waterfallSansLocked || waterfallRockLocked || waterfallUndyneLocked || waterfallBridgeLocked || wishingLocked || starViewerLocked || birdLocked || friendlyLocked || onionsanLocked || shyrenHallLocked || pianoLocked || dogRoomLocked || rainKidLocked || raftLocked || chaseLocked || secondChaseLocked || papyrusFogLocked || innLocked || townPapyrusLocked || townDogsLocked || townLocked || dangerBridgeLocked || greaterDogLocked || gyftrotLocked || mazeLocked || crosswordLocked || creamLocked) return;
    if (this.ruinsTutorial?.update()) return;
    if (this.ruinsSwitches?.update()) return;
    if (this.dummyLesson?.update()) return;
    if (this.ruinsStart?.update()) return;
    if (this.ruins12?.update()) return;
    if (this.ruins13?.update()) return;
    if (this.ruins14?.update()) return;
    if (this.ruinsPerspective?.update(delta)) return;
    if (this.ruinsPerspective?.checkTrigger()) return;
    if (this.torielHall?.update()) return;
    if (menuPressed && this.flags[17] !== 1 && !this.snowdinIce?.active) {
      this.release();
      state.phase = 'loadingMenu';
      this.scene.launch('FieldMenu');
      return;
    }
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      const previous = { x: this.player.x, y: this.player.y };
      const input = (direction) => this.keys[direction].isDown || [...this.touch.values()].some((pointer) => pointer.direction === direction);
      if (!this.snowdinIce?.slide()) movePlayer(this, this.player, this.colliders, input,
        (x, y, dx, dy) => this.dialogue || this.ruinsRock?.tryMove(x, y, dx, dy) || this.ruinsGoofyrock?.tryMove(x, y));
      this.snowdinIce?.contact(previous, input);
      this.snowdinSnowpuzz?.stepSnow(previous);
      this.torielHall?.step();
      this.elapsed -= 1000 / 30;
      if (!this.snowdinIce?.active && (this.player.x !== previous.x || this.player.y !== previous.y)) {
        this.ruinsEncounter?.step(); this.snowdinEncounter?.step(); this.waterfallEncounter?.step();
      }
      if (this.corridorLesson?.checkTrigger(previous)) return;
      if (this.ruinsPerspective?.checkTrigger(previous)) return;
      if (this.ruinsHome?.checkTrigger()) return;
      if (this.torielBasement?.checkTrigger(previous)) return;
      if (this.torielGate?.checkTrigger(previous)) return;
      if (this.floweyExit?.checkTrigger(previous)) return;
      if (this.snowdinStart?.checkTrigger()) return;
      if (this.snowdinForest?.checkTrigger(previous)) return;
      if (this.snowdinCheckpoint?.checkTrigger()) return;
      if (this.doggoRoom?.checkTrigger()) return;
      if (this.snowdinTown?.checkTrigger()) return;
      if (this.snowdinDangerBridge?.checkTrigger()) return;
      if (this.papyrusFogEncounter?.checkTrigger()) return;
      this.waterfallGrass?.syncPlayer();
      if (this.waterfallRainKid?.checkTrigger(previous)) return;
      if (this.waterfallShyrenHall?.checkTrigger()) return;
      if (this.waterfallFriendlyHub?.checkTrigger()) return;
      if (this.waterfallUndyne?.checkTrigger() || this.waterfallUndyne?.checkWalk(previous) || this.waterfallUndyneChase?.checkTrigger()) return;
      if (this.waterfallPapyrusPhone?.checkTrigger()) return;
      if (this.greaterDogRoom?.checkTrigger()) return;
      if (this.dogPairRoom?.checkTrigger()) return;
      if (this.snowdinXoxoSmall?.checkTrigger(previous)) return;
      if (this.snowdinXoxoBig?.checkTrigger(previous)) return;
      if (this.snowdinColorTiles?.checkTrigger(previous)) return;
      if (this.snowdinIcePuzzle?.checkTrigger(previous)) return;
      if (this.electricMaze?.checkTrigger(previous)) return;
      if (this.snowdinCrossword?.checkTrigger()) return;
      if (this.ruinsHoles?.checkTrigger() || this.ruinsGoofyrock?.checkTrigger() || this.dialogue) return;
    }
    this.interactionCooldown = Math.max(0, this.interactionCooldown - delta);
    if (this.interactionCooldown === 0 && this.justConfirmed() && !this.snowdinIce?.active) this.tryInteract();
    const door = this.findDoor(this.player.x, this.player.y);
    if (door) {
      this.transitionRoom(door.destination, door.marker, door.duration, door.musicFade);
      return;
    }
    this.updateCamera();
    this.ruinsEncounter?.update(); this.waterfallEncounter?.update();
    if (!this.snowdinIce?.active) this.snowdinEncounter?.update();
  }

  transitionRoom(destination, marker, duration, musicFade = false) {
    if (this.dataSource.name === 'room_water_savepoint1' && destination === 'room_water11' && this.flags[5] === 66 && Number(localStorage.getItem('undertale-remake-fun')) === 66) {
      destination = 'room_water_fakehallway'; this.flags[5] = 0; localStorage.setItem('undertale-remake-fun', '0');
    }
    state.phase = 'transition';
    if (musicFade && this.flags[7] !== 1) {
      const music = this.ruinsHome?.music ?? this.torielHall?.music[0] ?? this.torielGate?.music ?? this.townMusic ?? this.grillbyMusic ?? this.waterfallMusic ?? this.sansBasement?.music ?? this.snowdinMusic;
      if (music) this.roomMusicFade = this.tweens.add({ targets: music, volume: 0, duration: 10 * 1000 / 30 });
    }
    this.cameras.main.once('camerafadeoutcomplete', async () => {
      try {
        if (musicFade && this.flags[7] !== 1 && ((['room_water_bird', 'room_water_friendlyhub'].includes(this.dataSource.name) && ['room_water_bird', 'room_water_friendlyhub'].includes(destination)) || (['room_water11', 'room_water12'].includes(this.dataSource.name) && ['room_water11', 'room_water12'].includes(destination)) || (['room_water12', 'room_water_onionsan'].includes(this.dataSource.name) && ['room_water12', 'room_water_onionsan'].includes(destination)))) {
          this.roomMusicFade?.stop(); this.waterfallMusic?.destroy(); this.waterfallMusic = null;
        }
        await this.openRoom(destination, marker);
        this.cameras.main.fadeIn(1000 / 30 / 0.08);
      } catch (error) { fail(error); }
    });
    this.cameras.main.fadeOut(duration);
  }

  findDoor(x, y) {
    const sprite = this.dataSource.sprites.get(`spr_mainchara${this.player.facing}`);
    return this.doors.find((entry) => !(entry.direction === 'A' && this.torielGate && this.plot < 25)
      && !(entry.direction === 'A' && this.ruinsTutorial && !this.ruinsTutorial.gateOpen)
      && x + sprite.MarginRight >= entry.left
      && x + sprite.MarginLeft <= entry.right
      && y + sprite.MarginBottom >= entry.top
      && y + sprite.MarginTop <= entry.bottom);
  }

  tryInteract() {
    if (this.waterfallUmbrellaRoom?.interact()) return;
    if (this.waterfallMusicStatue?.interact()) return;
    if (this.waterfallDogRoom?.interact()) return;
    if (this.waterfallPianoRoom?.interact()) return;
    if (this.waterfallShyrenHall?.interact()) return;
    if (this.waterfallNiceCreamRoom?.interact()) return;
    if (this.waterfallShoeRoom?.interact()) return;
    if (this.waterfallWishesRoom?.interact()) return;
    if (this.waterfallFriendlyHub?.interact()) return;
    if (this.waterfallBird?.interact()) return;
    if (this.waterfallMystery?.interact()) return;
    if (this.waterfallStarRoom?.interact()) return;
    if (this.waterfallCrystalRoom?.interact()) return;
    if (this.waterfallHistoryRoom?.interact()) return;
    if (this.waterfallWishingRoom?.interact()) return;
    if (this.waterfallQuicheRoom?.interact()) return;
    if (this.waterfallBridgeRoom?.interact()) return;
    if (this.waterfallTutuRoom?.interact()) return;
    if (this.waterfallBoxRoom?.interact()) return;
    if (this.waterfallSans?.interact()) return;
    if (this.grillbyNpcs?.interact()) return;
    if (this.waterfallSentryNpcs?.interact()) return;
    if (this.snowdinCheckpoint?.interact()) return;
    if (this.doggoRoom?.interact()) return;
    if (this.snowdinIce?.interact()) return;
    if (this.snowman?.interact()) return;
    if (this.electricMaze?.interact()) return;
    if (this.niceCream?.interact()) return;
    if (this.snowGolf?.interact()) return;
    if (this.snowdinPark?.interact()) return;
    if (this.snowdinScent?.interact()) return;
    if (this.snowdinCrossword?.interact()) return;
    if (this.snowdinSpaghetti?.interact()) return;
    if (this.snowdinSnowpuzz?.interact()) return;
    if (this.snowdinXoxoSmall?.interact()) return;
    if (this.snowdinXoxoBig?.interact()) return;
    if (this.snowdinColorTiles?.interact()) return;
    if (this.snowdinDogHouse?.interact()) return;
    if (this.snowdinIceHole?.interact()) return;
    if (this.snowdinInn?.interact()) return;
    if (this.papyrusGarage?.interact()) return;
    if (this.sansBasement?.interact()) return;
    if (this.snowdinLibrary?.interact()) return;
    if (this.snowdinTownUndyne?.interact()) return;
    if (this.snowdinTownPapyrus?.interact()) return;
    if (this.snowdinTownDogs?.interact()) return;
    if (this.snowdinTownNpcs?.interact() || this.snowdinTown?.interact()) return;
    if (this.snowdinDangerBridge?.interact()) return;
    if (this.greaterDogRoom?.interact()) return;
    if (this.gyftrotRoom?.interact()) return;
    if (this.boxRoad) { this.boxRoad.interact(); return; }
    if (this.candyDish) { this.candyDish.interact(); return; }
    if (this.ruinsGoofyrock?.interact()) return;
    if (this.ruinsHoles?.interact()) return;
    if (this.ruins12?.interact()) return;
    if (this.ruins13?.interact()) return;
    if (this.ruins14?.interact()) return;
    if (this.ruinsPerspective?.interact()) return;
    if (this.ruinsOutlook?.interact()) return;
    if (this.ruinsHome?.interact()) return;
    if (this.torielHall?.interact()) return;
    if (this.torielCorridor?.interact()) return;
    if (this.childBedroom?.interact()) return;
    if (this.torielBedroom?.interact()) return;
    if (this.torielLiving?.interact()) return;
    if (this.snowdinStart?.interact()) return;
    if (this.snowdinForest?.interact()) return;
    if (this.ruinsRock?.interact()) return;
    if (this.ruinsStart?.interact()) return;
    if (this.corridorLesson) { this.corridorLesson.interact(); return; }
    if (this.spikeGuide) { this.spikeGuide.interact(); return; }
    if (this.dummyLesson) { this.dummyLesson.interact(); return; }
    if (this.ruinsSwitches) {
      const entry = this.roomObjects.find((entry) => entry.interactable
        && this.ruinsSwitches.canInteract(entry) && this.ruinsSwitches.inReach(entry));
      if (entry) this.ruinsSwitches.interact(entry);
      return;
    }
    const target = this.roomObjects
      .filter((entry) => entry.interactable && (DIALOGUES[entry.item.ObjectName]
        || (this.dataSource.name === 'room_ruins2' && entry.item.ObjectName === 'obj_readable_room1')))
      .map((entry) => ({ entry, distance: Math.hypot(this.player.x - entry.item.X, this.player.y - entry.item.Y) }))
      .filter(({ distance }) => distance < 45)
      .sort((a, b) => a.distance - b.distance)[0];
    if (!target) return;
    if (target.entry.item.ObjectName === 'obj_savepoint') {
      if (['room_water2', 'room_water4', 'room_water_savepoint1', 'room_water_friendlyhub'].includes(this.dataSource.name)) { showWaterfallSave(this); return; }
      this.hp = Math.max(this.hp, this.maxHp);
      this.sound.play('snd_power', { volume: 0.88 });
      this.showDialogue(this.ruinsHome?.saveDialogue ?? this.ruins12?.saveDialogue ?? this.ruinsStart?.text.save ?? DIALOGUES.obj_savepoint, { onClose: () => {
        this.plot = Math.max(this.plot, 2);
        this.scene.pause();
        this.scene.launch('SaveMenu');
      } });
    } else this.showDialogue(target.entry.item.ObjectName === 'obj_readable_room1'
      ? this.dataSource.tutorialDialogue.sign : DIALOGUES[target.entry.item.ObjectName]);
  }

  showDialogue(lines, { portrait = false, onClose, onPage, onCancel } = {}) {
    this.confirmPressed = false;
    this.confirmWasDown = this.confirmDown;
    this.dialogue = { lines, index: 0, onClose, onPage, onCancel };
    const y = this.player.y - this.cameras.main.scrollY > 130 ? 8 : 160;
    this.dialogueBox = this.add.rectangle(8, y, 304, 70, 0x000000).setOrigin(0).setScrollFactor(0).setDepth(100000).setStrokeStyle(2, 0xffffff);
    const x = portrait ? 68 : 18;
    this.dialogueText = this.cache.bitmapFont.exists('fnt_maintext')
      ? this.add.bitmapText(x, y + 8, 'fnt_maintext', lines[0], 12).setMaxWidth(300 - x)
      : this.add.text(x, y + 10, lines[0], { fontFamily: 'monospace', fontSize: '9px', color: '#fff', lineSpacing: 3 });
    this.dialogueText.setScrollFactor(0).setDepth(100001);
    this.dialoguePortrait = null;
    this.setDialoguePortrait(portrait);
    onPage?.(0);
    this.interactionCooldown = 250;
  }

  showChoice(prompt, options, onChoose) {
    this.showDialogue([prompt]);
    this.dialogue.choice = { index: 0, readyAt: this.time.now + 100, onChoose };
    const y = this.dialogueBox.y + 50;
    this.choiceUi = [this.add.image(89, y, 'spr_heartsmall:0').setOrigin(0)];
    for (const [index, label] of options.entries()) this.choiceUi.push(this.add.bitmapText(index === 0 ? 100 : 196, y - 4, 'fnt_maintext', label, 12));
    for (const child of this.choiceUi) child.setScrollFactor(0).setDepth(100002);
  }

  setDialoguePortrait(portrait) {
    const x = portrait ? 68 : 18;
    this.dialogueText.x = x;
    this.dialogueText.setMaxWidth?.(300 - x);
    this.dialoguePortrait?.destroy();
    this.dialoguePortrait = portrait ? this.add.image(23, this.dialogueBox.y + 19,
      `${typeof portrait === 'string' ? portrait : 'spr_face_torielhappytalk'}:0`).setOrigin(0).setScrollFactor(0).setDepth(100001) : null;
  }

  justConfirmed() {
    const down = this.confirmDown;
    const just = this.confirmPressed || (down && !this.confirmWasDown);
    this.confirmPressed = false;
    this.confirmWasDown = down;
    return just;
  }

  advanceDialogue() {
    if (this.dialogue.choice) {
      if (this.time.now < this.dialogue.choice.readyAt) return;
      const choice = this.dialogue.choice;
      this.dialogue.onClose = () => choice.onChoose(choice.index);
    }
    this.dialogue.index += 1;
    if (this.dialogue.index >= this.dialogue.lines.length) {
      const onClose = this.dialogue.onClose;
      this.dialogueBox.destroy(); this.dialogueText.destroy(); this.dialogue = null;
      this.dialoguePortrait?.destroy();
      for (const child of this.choiceUi) child.destroy();
      this.choiceUi = [];
      onClose?.();
    } else {
      this.dialogueText.setText(this.dialogue.lines[this.dialogue.index]);
      this.dialogue.onPage?.(this.dialogue.index);
    }
    this.interactionCooldown = 250;
  }

  saveGame(temporary = false) {
    return writeSave({ name: this.game.registry.get('charname'), room: this.dataSource.name,
      x: this.player.x, y: this.player.y, hp: this.hp, maxHp: this.maxHp, lv: this.lv,
      playTime: this.playTime, xp: this.xp, gold: this.gold, kills: this.kills, phone: this.phone, inventory: this.inventory, weapon: this.weapon, armor: this.armor,
      weaponStrength: this.weaponStrength, armorDefense: this.armorDefense, flags: { ...this.flags, plot: this.plot } }, { temporary });
  }

  async restoreGame(temporary = false) {
    const save = readSave(temporary);
    if (!save) return false;
    this.game.registry.set('charname', save.name);
    this.hp = save.hp;
    this.maxHp = save.maxHp ?? 20;
    this.lv = save.lv ?? 1;
    this.xp = save.xp ?? 0; this.gold = save.gold ?? 0; this.kills = save.kills ?? 0;
    this.phone = [...(save.phone ?? [])];
    this.inventory = [...(save.inventory ?? [])]; this.weapon = save.weapon ?? 3; this.armor = save.armor ?? 4;
    this.weaponStrength = save.weaponStrength ?? 0; this.armorDefense = save.armorDefense ?? 0;
    this.plot = save.flags?.plot ?? 0;
    this.flags = { ...(save.flags ?? {}) };
    delete this.flags.plot;
    this.playTime = save.playTime ?? 0;
    await this.openRoom(save.room);
    this.player.setPosition(save.x, save.y);
    this.updateCamera();
    return true;
  }
}

class Intro extends Scene {
  constructor() { super('Intro'); }

  preload() {
    for (let frame = 0; frame < 11; frame++) this.load.image(`intro:${frame}`, new URL(`../assets/sprites/spr_introimage/spr_introimage_${frame}.png`, import.meta.url).href);
    this.load.image('title', new URL('../assets/sprites/spr_undertaletitle/spr_undertaletitle_0.png', import.meta.url).href);
  }

  create() {
    this.frame = 0;
    this.story = this.add.image(0, 0, 'intro:0').setOrigin(0);
    this.caption = this.add.text(18, 152, '', { fontFamily: 'monospace', fontSize: '10px', color: '#fff', lineSpacing: 2 });
    this.hint = this.add.text(160, 225, 'Z / ENTER để tiếp tục', { fontFamily: 'monospace', fontSize: '8px', color: '#aaa' }).setOrigin(.5);
    this.startedAt = performance.now();
    this.input.keyboard.on('keydown-Z', this.advance, this);
    this.input.keyboard.on('keydown-ENTER', this.advance, this);
    this.input.keyboard.on('keydown-SPACE', this.advance, this);
    this.showFrame();
    state.phase = 'intro'; state.room = 'room_introstory'; state.scene = this;
    status.hidden = true;
  }

  shutdown() {
    this.input.keyboard.off('keydown-Z', this.advance, this);
    this.input.keyboard.off('keydown-ENTER', this.advance, this);
    this.input.keyboard.off('keydown-SPACE', this.advance, this);
  }

  showFrame() {
    this.story.setTexture(`intro:${this.frame}`);
    this.caption.setText(INTRO_TEXT[Math.min(this.frame, INTRO_TEXT.length - 1)] ?? '');
    this.caption.setVisible(this.frame < INTRO_TEXT.length);
    this.startedAt = performance.now();
  }

  advance() {
    if (state.phase !== 'intro') return;
    if (this.frame < 10) { this.frame += 1; this.showFrame(); return; }
    this.scene.start('Title');
  }

  update() {
    if (state.phase === 'intro' && performance.now() - this.startedAt > 4200) this.advance();
  }
}

class Title extends Scene {
  constructor() { super('Title'); }

  create() {
    this.add.image(0, 0, 'title').setOrigin(0);
    this.add.text(160, 180, 'Z / ENTER để bắt đầu', { fontFamily: 'monospace', fontSize: '10px', color: '#aaa' }).setOrigin(.5);
    this.add.text(160, 232, 'UNDERTALE v1.08 (C) Toby Fox 2015-2017', { fontFamily: 'monospace', fontSize: '5px', color: '#888' }).setOrigin(.5);
    this.input.keyboard.once('keydown-Z', () => this.scene.start('Name'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Name'));
    state.phase = 'title'; state.room = 'room_introimage'; state.scene = this;
  }
}

class Name extends Scene {
  constructor() { super('Name'); }

  create() {
    this.name = '';
    this.lastKey = '';
    this.lastKeyAt = 0;
    this.cursor = 0;
    this.add.text(160, 35, 'Name the fallen human.', { fontFamily: 'monospace', fontSize: '10px', color: '#fff' }).setOrigin(.5);
    this.label = this.add.text(160, 70, '_'.repeat(6), { fontFamily: 'monospace', fontSize: '16px', color: '#fff' }).setOrigin(.5);
    this.add.text(160, 200, 'Gõ tên bằng bàn phím · ENTER xác nhận', { fontFamily: 'monospace', fontSize: '7px', color: '#aaa' }).setOrigin(.5);
    this.input.keyboard.on('keydown', this.onKey, this);
    state.phase = 'name'; state.room = 'room_intromenu'; state.scene = this;
  }

  onKey(event) {
    if (event.repeat || (event.key === this.lastKey && performance.now() - this.lastKeyAt < 40)) return;
    this.lastKey = event.key;
    this.lastKeyAt = performance.now();
    if (event.key === 'Backspace') this.name = this.name.slice(0, -1);
    else if (event.key === 'Enter' && this.name.length) {
      this.game.registry.set('charname', this.name);
      this.scene.start('World');
      return;
    } else if (/^[a-zA-Z0-9]$/.test(event.key) && this.name.length < 6) this.name += event.key.toUpperCase();
    this.label.setText(`${this.name}${this.name.length < 6 ? '_' : ''}`);
  }
}

state.game = new Game({ type: CANVAS, width: 320, height: 240, parent: 'game', backgroundColor: '#000000',
  pixelArt: true, antialias: false, banner: false, scene: [Intro, Title, Name, ChapterTitle, World, Battle, DummyBattle, TutorialFroggit, RuinsBattle, NapstablookBattle, VegetoidBattle, TorielBattle, DrakeBattle, IceCapBattle, LesserDogBattle, DoggoBattle, DogPairBattle, SnowdinGroupBattle, GyftrotBattle, GreaterDogBattle, PapyrusBattle, AaronBattle, ShyrenBattle, WoshuaBattle, MoldsmalGroupBattle, WaterfallGroupBattle, UndyneQuickBattle, SaveMenu, FieldMenu, ItemBox],
  scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH } });
state.startBattle = (config = 'dummy') => {
  if (!BATTLE_CONFIGS[config]) throw new Error(`Không có cấu hình quái ${config}.`);
  if (state.phase !== 'running') return;
  state.game.registry.set('battleConfig', config);
  const world = state.scene;
  state.phase = 'loading';
  world.scene.pause();
  world.scene.launch(config === 'dummy' ? 'DummyBattle' : config === 'tutorialFroggit' ? 'TutorialFroggit' : config === 'napstablook' ? 'NapstablookBattle' : config === 'vegetoid' ? 'VegetoidBattle' : config === 'toriel' ? 'TorielBattle' : ['snowdrake', 'chilldrake'].includes(config) ? 'DrakeBattle' : ['icecap', 'ice'].includes(config) ? 'IceCapBattle' : config === 'lesserDog' ? 'LesserDogBattle' : config === 'doggo' ? 'DoggoBattle' : config === 'dogi' ? 'DogPairBattle' : config === 'gyftrot' ? 'GyftrotBattle' : config === 'greaterDog' ? 'GreaterDogBattle' : config === 'shyren' ? 'ShyrenBattle' : config === 'aaron' ? 'AaronBattle' : config === 'woshua' ? 'WoshuaBattle' : config === 'moldsmalGroup53' ? 'MoldsmalGroupBattle' : config === 'waterfallGroup54' ? 'WaterfallGroupBattle' : config === 'undyneQuick' ? 'UndyneQuickBattle' : config === 'papyrus' ? 'PapyrusBattle' : ['snowdinGroup35', 'snowdinGroup36'].includes(config) ? 'SnowdinGroupBattle' : 'RuinsBattle');
};
document.getElementById('fullscreen').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(fail);
  else document.querySelector('main').requestFullscreen().catch(fail);
};
