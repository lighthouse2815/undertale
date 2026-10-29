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

// ACT dùng trực tiếp bộ quy tắc để trạng thái và lời phản hồi luôn cùng một nhánh.
export function undyneBattleAct(rules, action, dying = false) {
  let ids;
  if (action === 'check') ids = [1145];
  else if (action === 'challenge') {
    const changed = rules.challenge();
    ids = [dying ? 1182 : !changed ? 1168 : rules.rating === 7 ? 1176 : 1174];
  } else if (action === 'plead') {
    const changed = rules.plead();
    ids = dying ? [1215] : changed ? [1209,1210] : [1205];
  } else throw new RangeError(`ACT không hợp lệ: ${action}`);
  return { ids, lines: ids.map(id => text[id]) };
}

// Step khi sinh đợt giáo: lời trạng thái phụ thuộc HP, thứ tự và lệnh ngẫu nhiên.
export function undyneBattleStatus({ hp, maxHp, order, command }) {
  let id = null;
  if (hp < maxHp) for (const [minimum, candidate] of [[0,1085],[20,1086],[40,1087],[60,1088],[80,1089]]) if (command >= minimum) id = candidate;
  if (hp >= maxHp / 2) {
    for (let i = 0; i < 10; i++) if (command >= i * 10) id = 1094 + i;
    if (order > 22) for (const [minimum, candidate] of [[0,1107],[25,1108],[50,1109],[75,1110],[90,1111]]) if (command >= minimum) id = candidate;
  }
  if (order >= -40 && order <= -36) id = 1118 + order + 40;
  return id === null ? null : { id, line: text[id] };
}
