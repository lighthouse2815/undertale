import { murderLevel } from './route.mjs';

// obj_ambientwater / obj_watermusic chỉ chọn bài khi không có nhạc đang tiếp tục.
export function startWaterfallMusic(world, ambient = false) {
  if (world.townMusic || world.waterfallMusic) return world.townMusic ?? world.waterfallMusic;
  const bleak = !ambient && world.flags[223] && !world.flags[27];
  const key = ambient ? 'mus_ambientwater' : bleak ? 'mus_toomuch' : 'mus_waterfall';
  const rate = key === 'mus_waterfall' && murderLevel(world.flags) >= 8 && !world.flags[27] ? .13 : 1;
  const music = world.waterfallMusic = world.sound.add(key, { loop: true });
  const configure = () => { music.setVolume(bleak ? 1 : .8); music.setRate(rate); };
  music.once('play', configure); music.play(); configure(); return music;
}
