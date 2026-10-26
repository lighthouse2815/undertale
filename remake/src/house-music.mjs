export const HOUSE_ROOMS = ['room_torhouse1', 'room_torhouse2', 'room_torhouse3', 'room_asrielroom', 'room_torielroom', 'room_kitchen'];

// obj_housemusic: giữ hai lớp nhạc giữa các phòng, tuyến kết thúc ưu tiên Reunited.
export function startHouseMusic(world) {
  const reunited = world.flags[7] === 1, slow = world.flags[45] === 4;
  const keys = reunited ? ['mus_reunited'] : slow ? ['mus_toriel', 'mus_toriel'] : ['mus_house1', 'mus_house2'];
  const rate = slow && !reunited ? .4 : 1;
  if (world.houseMusic?.length === keys.length && world.houseMusic.every((sound, i) => sound.key === keys[i] && sound.rate === rate && !sound.pendingRemove)) return world.houseMusic;
  stopHouseMusic(world);
  return world.houseMusic = keys.map((key, index) => {
    const sound = world.sound.add(key, { loop: true, volume: index ? .01 : 1, rate });
    sound.play(); return sound;
  });
}

export function stopHouseMusic(world) {
  for (const sound of world.houseMusic ?? []) sound.destroy();
  world.houseMusic = null;
}
