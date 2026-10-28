// obj_moldsmal Step: Moldsmal thông thường, không phải Moldbygg giả dạng.
export function moldsmalAct(state, action, flags) {
  if (action === 'check') {
    state.heard = 0;
    return state.monsterAttack > 6 ? "* MOLDSMAL - ATK 12 DEF 0\n* It's a different color, so\n  it's a bit stronger now." : '* MOLDSMAL - ATK 6 DEF 0\n* Stereotypical: Curvaceously\n  attractive, but no brains...';
  }
  if (action === 'imitate' || action === 'flirt') {
    state.heard = action === 'imitate' ? 3 : 1; state.mercyModifier = 101; flags[132] = 1;
    return action === 'imitate' ? '* You lie immobile with Moldsmal.\n* You feel like you understand\n  the world a little better.' : '* You wiggle your hips.\n* Moldsmal wiggles back.\n* What a meaningful conversation!';
  }
  throw new Error(`ACT Moldsmal không hợp lệ: ${action}`);
}

export function moldsmalStatus(command, hp) {
  let text = '* Moldsmal burbles quietly.';
  if (command >= 30) text = '* Moldsmal waits pensively.';
  if (command >= 70) text = '* Moldsmal is ruminating.';
  if (command >= 90) text = '* The aroma of lime gelatin\n  wafts through.';
  if (hp < 15) text = '* Moldsmal has started to spoil.';
  return text;
}
