import text from './waterfall-papyrus-call.json' with { type: 'json' };

// SCR_TEXT 553–554: mô tả áo và hai lựa chọn về lời khai.
export function waterfallPapyrusCall(armor, choice) {
  const description = ({ 4: 'GROSS BANDAGE', 12: 'FADED RIBBON', 15: 'BANDANNA', 24: 'DUSTY TUTU' })[armor] ?? 'BEPIS.';
  const ids = choice === undefined ? [2180,2182,2183,2184,2185,2186,2187,2188,2189,2190] : choice === 0 ? [2206,2207,2208,2210] : [2215,2216,2217,2218,2220];
  return ids.map((id) => ({ text: text[id].replace(/\\\[1\]/g, description), papyrus: id !== 2180 && id !== 2210 && id !== 2220 }));
}
