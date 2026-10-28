import text from './waterfall-sentry-dialogue.json' with { type: 'json' };

// obj_npc_room và obj_echoflower trong room_water2: hoa lặp lời cá đã nghe.
export function waterfallFishDialogue(talked, flowerHeard) {
  return [text[flowerHeard ? 'obj_npc_room_284' : talked > 0 ? 'obj_npc_room_283' : 'obj_npc_room_282']];
}
export function waterfallEchoDialogue(fishPresent, fishTalked, flowerHeard) {
  if (!fishPresent) return { pages: [text.obj_echoflower_123], heard: flowerHeard };
  if (!fishTalked) return { pages: [text.obj_echoflower_104, text.obj_echoflower_105], heard: true };
  const key = flowerHeard ? 'obj_echoflower_118' : fishTalked === 1 ? 'obj_echoflower_110' : 'obj_echoflower_114';
  return { pages: [text[key]], heard: flowerHeard };
}
export function waterfallKidDialogue(talked, conversation) {
  if (!talked) return [122, 123, 124, 125].map((n) => text[`obj_townnpc_monsterkid1_${n}`]);
  return (conversation === 2 ? [129, 130] : conversation === 1 ? [132, 133] : [127]).map((n) => text[`obj_townnpc_monsterkid1_${n}`]);
}
