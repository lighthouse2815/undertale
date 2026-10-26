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
  if (action === 'drop') {
    const choice = Math.min(4, Math.round(Math.random() * 18));
    const line = text.drop[choice].replace(/\\\[I\]/g, item.name);
    world.inventory.splice(index, 1);
    return [line];
  }
  if (id === 3) return [item.use]; // Gậy gốc được nhặt lại; không tiêu hao/đổi vũ khí.
  if (id === 12 || id === 13) {
    if (id === 12) {
      world.inventory[index] = world.armor; world.armor = id; world.armorDefense = 3;
    } else {
      world.inventory[index] = world.weapon; world.weapon = id; world.weaponStrength = 3;
    }
    scene.sound.play('snd_item');
    return [item.use];
  }
  let line = item.use;
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
  if (health.hp < health.maxHp) health.hp = Math.min(health.maxHp, health.hp + (id === 11 ? health.maxHp : item.heal));
  if (id !== 11) {
    world.flags[260] = 1;
    line += ' \n' + (health.hp >= health.maxHp ? text.maxed : text.recover.replace(/\\\[1\]/g, String(item.heal)));
  }
  world.inventory.splice(index, 1);
  return [line];
}
