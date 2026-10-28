// obj_aaron Step/Alarm 6: ACT, báo hiệu và thứ tự chọn trạng thái.
export function aaronAct(state, action, flags) {
  if (action === 'check') { state.heard = 9; return { pages: ['* AARON - ATK 24 DEF 12\n* This seahorse has a lot of\n  HP (Horsepower).', '* All of his attacks are harder\n  to dodge at the bottom of the\n  box.'], leaves: false }; }
  if (action === 'shoo') {
    state.heard = 1; state.mercyModifier = flags[95] === 1 ? 222 : -10;
    return { pages: [flags[95] === 1 ? '* You tell Aaron to go away.\n* He agrees.' : '* You tell Aaron to go away.'], leaves: flags[95] === 1 };
  }
  if (action === 'flex') {
    const previous = state.flex;
    const pages = previous === 0 ? ['* You flex.\n* Aaron flexes twice as hard.\n* ATTACK increases for you two.'] : previous === 1 ? ['* You flex harder.\n* Aaron flexes thrice as hard.\n* ATTACK increases for you two.'] : ['* You flex.\n* Aaron flexes very hard...', '* He flexes himself out of\n  the room!'];
    state.flex++; state.heard = 3; if (state.attack < 150) state.attack += 15; state.monsterAttack++;
    if (previous === 2) { state.mercyModifier = 400; flags[143] = 1; }
    return { pages, leaves: previous === 2 };
  }
  throw new Error(`ACT Aaron không hợp lệ: ${action}`);
}

export function aaronStatus(command, flags, flex, hp) {
  let text = flags[95] === 1 ? '* Aaron is looking around,\n  fearful of something.' : '* Aaron is splashing you\n  playfully.';
  if (command >= 25) text = '* Aaron is sweating bullets.\n* Literally.';
  if (command >= 50) text = '* Aaron is admiring his own\n  muscles.';
  if (command >= 75) text = '* Smells like an underwater\n  barnyard.';
  if (command >= 90) text = '* Smells like a mussel farm.';
  if (flex > 0) text = '* Aaron is ready for your\n  next flex.';
  if (hp < 30) text = "* Aaron's muscles droop\n  comically.";
  return text;
}
