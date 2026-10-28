// obj_woshua Step: ACT và thứ tự chọn lời trạng thái sau đợt tấn công.
export function woshuaAct(state, action, { aaron = null, joke = Math.floor(Math.random() * 3) } = {}) {
  if (action === 'check') {
    state.heard = 9;
    return { pages: ['* WOSHUA - ATK 18 DEF 5\n* This humble germophobe seeks\n  to cleanse the whole world.'], leaves: false };
  }
  if (action === 'touch') {
    state.heard = 1;
    let text = '* You reach out.\n* Woshua recoils from your\n  touch.';
    if (state.slime === 1) { text = '* Woshua is terrified of\n  your slimy body!\n* It runs away.'; state.mercyModifier = 333; }
    if (state.clean === 2) text = '* You give Woshua a friendly\n  pat.';
    return { pages: [text], leaves: state.mercyModifier === 333 };
  }
  if (action === 'clean') {
    state.heard = 3;
    const text = state.clean === 2 ? '* Woshua continues cleaning.' : '* You ask Woshua to clean you.\n* It hops around excitedly.';
    if (state.clean === 0) state.clean = 1;
    else if (state.clean === 2) state.clean = 3;
    return { pages: [text], leaves: false };
  }
  if (action === 'joke') {
    state.heard = 4; state.dirtyJoke++;
    if (state.monsterAttack > 3) state.monsterAttack -= 2;
    if (aaron) { aaron.heard = 12; aaron.mercyModifier = 450; }
    const jokes = ['* You tell a joke about two\n  kids who played in a\n  muddy flower garden.', '* You tell a joke about a kid\n  who ate a pie with\n  their bare hands.', '* You tell a joke about a kid\n  who slept in the soil.'];
    return { pages: [jokes[joke], "* Woshua's powers neutralized!"], leaves: false };
  }
  throw new Error(`ACT Woshua không hợp lệ: ${action}`);
}

export function woshuaStatus(command, hp) {
  let text = '* Woshua wonders if tears are\n  sanitary.';
  if (command >= 25) text = '* Woshua is friends with\n  a little bird.';
  if (command >= 50) text = '* Woshua is rinsing off a\n  pizza.';
  if (command >= 75) text = '* Woshua is looking for some\n  good clean fun.';
  if (command >= 90) text = '* Smells like detergent.';
  if (hp < 30) text = '* Woshua is revolted at its own\n  wounds.';
  return text;
}
