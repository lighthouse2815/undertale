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

export function startWaterfallQuietMusic(world) {
  if (world.townMusic || world.waterfallMusic || world.flags[7] === 1 || world.flags[94]) return;
  const bleak = world.flags[223] && !world.flags[27], key = bleak ? 'mus_toomuch' : 'mus_waterquiet';
  const music = world.waterfallMusic = world.sound.add(key, { loop: true, volume: bleak ? 1 : .8 });
  music.play(); music.setRate(bleak ? 1 : murderLevel(world.flags) >= 8 && !world.flags[27] ? .5 : .9);
}

export function updateWaterfallRain(world, deep) {
  const rain=world.waterfallRainLight, muted=world.waterfallRain, mix=world.waterfallRainMix;if(!rain||!muted||!mix)return;
  if(deep){if(mix.normal>.08)mix.normal=Math.max(.08,mix.normal-.02);if(mix.deep<.5)mix.deep=Math.min(.5,mix.deep+.02);}
  else {if(mix.deep>.02)mix.deep=Math.max(.02,mix.deep-.02);if(mix.normal<.5)mix.normal=Math.min(.5,mix.normal+.02);}
  rain.setVolume(mix.normal);muted.setVolume(mix.deep);
}
