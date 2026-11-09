import { colorBitmapFont } from './fonts.mjs';
import { murderLevel } from './route.mjs';

// obj_savepoint tại lối vào phòng thí nghiệm và phòng dung nham.
export function showHotlandSave(world) {
  const level = murderLevel(world.flags), left = Math.max(0, 40 - (world.flags[205] ?? 0));
  const red = level >= 12 && level < 16 && !world.flags[27] && left > 0;
  const pages = level >= 16 || level >= 12 && !world.flags[27] && left === 0 ? ['* Determination.']
    : red ? [`* ${left} left.`] : world.dataSource.name==='room_fire6' ? ['* (The wooshing sound of steam\n  and cogs... it fills you\n  with determination.)'] : ['* (Seeing such a strange\n  laboratory in a place like\n  this...)', "* (You're filled with\n  determination.)"];
  colorBitmapFont(world, 'fnt_maintext', 'red', '#ff0000');
  world.hp = Math.max(world.hp, world.maxHp); world.sound.play('snd_power');
  world.showDialogue(pages, { onPage: () => world.dialogueText.setFont(red ? 'fnt_maintext:red' : 'fnt_maintext'),
    onClose: () => { world.release(); world.scene.pause(); world.scene.launch('SaveMenu'); } });
}
