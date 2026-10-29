import text from './undyne-battle-dialogue.json' with { type: 'json' };

// Alarm 6 của Undyne thường; trả ID để scene có thể dùng hiệu ứng theo từng câu.
export function undyneBattleSpeech({ order, command, damageCause = 0, earlyReaction = 0, flag99 = 1, mercied = 0, hitfirst = 0 }) {
  let ids = [command < 100 ? 406 : 401], longBubble = false, uncancellable = false;
  if (damageCause) { ids = [409 + damageCause]; longBubble = true; }
  const lines = { 3: 496, 4: 501, 5: 506, 6: 510, 7: 515, 8: 528, 9: 538, 10: 546, 11: 554,
    13: 587, 14: 593, 15: 599, 16: 605, 17: 611, 18: 616, 19: 622, 20: 628, 21: 634, 22: 639, 23: 656, 24: 664 };
  if (earlyReaction) {
    ids = [[481,482,483], [470,471,472,473], [459,460,461,462], [442,443,444,445,446,447,448,449]][earlyReaction - 1];
    longBubble = uncancellable = true;
  } else if (order === 1) { ids = [427,428,429]; longBubble = uncancellable = true; }
  else if (order === 2) { ids = [439]; longBubble = uncancellable = true; }
  else if (order === 12 && hitfirst < 3) { ids = [582]; longBubble = uncancellable = true; }
  else if (lines[order]) { ids = [lines[order]]; longBubble = true; uncancellable = order === 6 || order === 22; }
  else if (order > 24) { ids = [672]; longBubble = true; }
  if (!earlyReaction && flag99 > 1 && [9,10,11].includes(order)) ids = [{ 9: 563, 10: 570, 11: 577 }[order]];
  if (!earlyReaction && mercied > 0) {
    if (order === 7) { ids = [519,520]; uncancellable = true; }
    if (order === 8) ids = [530];
    if (order === 23) ids = [658];
    if (order === 24) ids = [666];
  }
  if (order < 0) {
    const negative = { '-40': [682], '-39': [686,687], '-38': [691], '-37': [695,696], '-36': [700,701], '-35': [705] };
    if (negative[order]) ids = negative[order];
    longBubble = uncancellable = true;
  }
  return { ids, lines: ids.map(id => text[id]), longBubble, uncancellable };
}
