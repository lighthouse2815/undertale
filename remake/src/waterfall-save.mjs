import { colorBitmapFont } from './fonts.mjs';
import { murderLevel } from './route.mjs';

// obj_savepoint tại Waterfall: lời từng phòng và dân số trên tuyến giết.
export function showWaterfallSave(world) {
  const level = murderLevel(world.flags), left = Math.max(0, 18 - (world.flags[204] ?? 0));
  const red = level >= 8 && level < 16 && !world.flags[27] && left > 0;
  const line = level >= 16 || level >= 8 && !world.flags[27] && left === 0 ? '* Determination.'
    : red ? `* ${left} left.` : world.dataSource.name === 'room_water4' ? '* (A feeling of dread hangs\n  over you...)\n* (But you stay determined.)' : '* (The sound of rushing water\n  fills you with\n  determination.)';
  colorBitmapFont(world, 'fnt_maintext', 'red', '#ff0000');
  world.hp = Math.max(world.hp, world.maxHp); world.sound.play('snd_power');
  world.showDialogue([line], { onPage: () => world.dialogueText.setFont(red ? 'fnt_maintext:red' : 'fnt_maintext'),
    onClose: () => { world.release(); world.scene.pause(); world.scene.launch('SaveMenu'); } });
}
