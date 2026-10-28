// scr_itemget, scr_itemshift, scr_itemuseb, scr_recover và scr_armoreq/weaponeq.
export function addItem(world, id) {
  if (world.inventory.length >= 8) return false;
  world.inventory.push(id);
  return true;
}

export function itemNames(world, text, battle = false) {
  return world.inventory.map((id) => text.items[id][battle ? 'battleName' : 'name']);
}

export function itemAction(world, index, action, text, { scene = world, health = world } = {}) {
  const id = world.inventory[index], item = text.items[id];
  if (action === 'info') return item.info;
  if ([56, 57].includes(id)) {
    const undyne = scene === world && !!world.snowdinTownUndyne?.actor;
    if (action === 'drop') {
      if (id === 57) return [item.drop];
      if (undyne) return [item.undyneDrop];
      world.inventory.splice(index, 1); world.flags[494] = 1; return [item.drop];
    }
    return undyne ? [item.undyneUse] : world.dataSource.name === 'room_fire_prelab' ? [item.prelab] : [item.use, item.useAgain];
  }
  if (action === 'drop') {
    const choice = Math.min(4, Math.round(Math.random() * 18));
    const line = text.drop[choice].replace(/\\\[I\]/g, item.name);
    world.inventory.splice(index, 1);
    return [line];
  }
  if (id === 26 && scene !== world) {
    world.inventory.splice(index, 1);
    if (world.weapon !== 14) return [item.use, '* But nothing happened.'];
    const attack = (world.lv === 20 ? 99 : 8 + world.lv * 2) + (scene.attackBonus ?? 0) + (scene.cardAttackBonus ?? 0);
    const add = attack > 28 ? 2 : attack > 26 ? 3 : attack > 23 ? 4 : attack > 18 ? 5 : 6;
    scene.cardAttackBonus = (scene.cardAttackBonus ?? 0) + add; world.flags[78] = 1; scene.sound.play('snd_tearcard');
    return [item.use, `* Your hands are burning!\n* AT increased by ${add}!`];
  }
  if (id === 3) return [item.use]; // Gậy gốc được nhặt lại; không tiêu hao/đổi vũ khí.
  if (id === 12 || id === 13 || id === 14 || id === 24 || id === 25) {
    if (id === 12 || id === 24) {
      world.inventory[index] = world.armor; world.armor = id; world.armorDefense = id === 24 ? 10 : 3;
    } else {
      if (scene !== world && world.weapon === 14 && world.flags[78] === 1) scene.cardAttackBonus = 0;
      world.inventory[index] = world.weapon; world.weapon = id; world.weaponStrength = id === 25 ? 7 : id === 14 ? 5 : 3;
    }
    scene.sound.play('snd_item');
    return [item.use];
  }
  let line = item.use;
  if (id === 17) line = item.wrappers[Math.floor(Math.random() * 8)];
  if (id === 16 && scene === world && world.dataSource.name === 'room_tundra6A') world.flags[56] = 4;
  if (id === 1) {
    const value = Math.round(Math.random() * 15);
    if (value <= 2) line += item.a;
    if (value === 15) line += item.b;
  } else if (id === 4) line += item.a;
  else if (id === 8 && Math.round(Math.random() * 10) > 8) line += item.a;
  if (id === 4) scene.sound.play('snd_power');
  else {
    scene.sound.play('snd_swallow');
    scene.time.delayedCall(10 * 1000 / 30, () => scene.sound.play(id === 9 ? 'snd_spooky' : 'snd_power'));
  }
  if (id === 63) health.hp = Math.max(health.hp, health.maxHp - 1);
  else if (health.hp < health.maxHp) health.hp = Math.min(health.maxHp, health.hp + (id === 11 ? health.maxHp : item.heal));
  if (id !== 11 && id !== 63) {
    world.flags[260] = 1;
    line += ' \n' + (health.hp >= health.maxHp ? text.maxed : text.recover.replace(/\\\[1\]/g, String(item.heal)));
  }
  world.inventory.splice(index, 1);
  return [line];
}
