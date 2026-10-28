// obj_woshua Step: chọn đợt, thời gian và tốc độ theo số quái còn sống.
export function woshuaAttack(state, command, population) {
  const spiral = command < 50 || state.clean === 1 || state.clean === 3;
  if (spiral) {
    const rate = 3 * population + state.dirtyJoke;
    if (state.dirtyJoke > 3) state.dirtyJoke = 2;
    const cleaner = state.clean === 1 || state.clean === 3;
    if (state.clean === 1) state.clean = 0;
    else if (state.clean === 3) state.clean = 2;
    return { kind: 'spiral', duration: population === 1 ? 150 : 180, rate, cleaner, damage: state.monsterAttack };
  }
  return { kind: 'soap', duration: 160, rate: 4, speed: 4 - Math.min(1, state.dirtyJoke * .5), offset: population > 1, damage: state.monsterAttack };
}

// blt_growbullet va vào tim khi là giọt xanh.
export function woshuaCleanHit(state, player) {
  state.mercyModifier = 200;
  state.clean = 2;
  player.hp = Math.min(player.maxHp, player.hp + 1);
}
