// obj_housemusic: hai lớp nhạc trong nhà; tuyến kết thúc ưu tiên Reunited.
export function startHouseMusic(world) {
  const reunited = world.flags[7] === 1, slow = world.flags[45] === 4;
  const keys = reunited ? ['mus_reunited'] : slow ? ['mus_toriel', 'mus_toriel'] : ['mus_house1', 'mus_house2'];
  return keys.map((key, index) => {
    const sound = world.sound.add(key, { loop: true, volume: index ? .01 : 1, rate: slow && !reunited ? .4 : 1 });
    sound.play(); return sound;
  });
}
