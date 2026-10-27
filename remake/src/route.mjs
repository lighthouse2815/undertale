// scr_murderlv: tiến trình diệt chủng và cờ ghi đè của game gốc.
export function murderLevel(flags) {
  let level = flags[202] >= 20 ? 1 : 0;
  const conditions = [flags[45] === 4, flags[52] === 1, flags[53] === 1, flags[54] === 1,
    flags[57] === 2, flags[203] >= 16, flags[67] === 1, flags[81] === 1, flags[252] === 1,
    flags[204] >= 18, flags[251] === 1 && flags[350] === 1, flags[402] === 1,
    flags[397] === 1, flags[205] >= 40, flags[425] === 1 && !flags[27]];
  for (const [index, condition] of conditions.entries()) if (level === index + 1 && condition) level++;
  return flags[26] > 0 ? flags[26] : level;
}
