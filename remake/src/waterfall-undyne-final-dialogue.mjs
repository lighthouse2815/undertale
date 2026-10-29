import text from './waterfall-undyne-final-dialogue.json' with { type: 'json' };

const sequence = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
export function undyneFinalLines(ids, second = false) {
  const prefix = second ? 'obj_undynetrigger_boss2_' : 'obj_undynetrigger_boss_';
  return ids.map(id => text[`${prefix}${id}`]);
}

// Các nhánh đối thoại trước trận, theo obj_undynetrigger_boss Step.
export function undyneFinalSpeech({ kills = 0, flags = {}, undyneKilledBefore = false }) {
  const papyrusKilled = flags[67] === 1;
  const intro = sequence(157, 165);
  const bridge = papyrusKilled ? [[468,469]] : [[190,191], [199], [206], [213], [220]];
  let speech;
  if (papyrusKilled) speech = sequence(490, 509);
  else if (kills === 0 || kills === 1 && flags[4] === 1) {
    speech = [...sequence(325, 330), [0, 2].includes(flags[98] ?? 0) ? 332 : 331, ...sequence(335, 347)];
    if (undyneKilledBefore) speech.splice(7, 13, ...sequence(351, 363));
  } else {
    speech = [...sequence(369, 379), 381, 382, ...sequence(429, 438)];
    let special = [381, 382];
    for (const [flag, value, ids] of [[81,1,[386,387]], [57,2,[392,393]], [52,1,[399,400]], [53,1,[405,406]], [54,1,[412,413]], [55,1,[419,420]]]) if (flags[flag] === value) special = ids;
    if (flags[52] && [53,54,55].every(flag => flags[flag] === 1)) special = [425,426];
    speech.splice(11, 2, ...special);
  }
  return { intro, bridge, speech };
}

export function undyneFinalEncounterLines(encounteredBefore) {
  return undyneFinalLines(encounteredBefore ? [103] : [99,100], true);
}

export function undyneFinalSaveLine(flags) { return text[`SCR_TEXT_${flags[350] === 1 ? 170 : flags[99] > 0 ? 169 : 168}`]; }
