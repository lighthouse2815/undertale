import text from './waterfall-papyrus-second-call.json' with { type: 'json' };

export function waterfallPapyrusSecondCall(flags) {
  const armor = value => ({ 4: 'GROSS BANDAGE', 12: 'FADED RIBBON', 15: 'BANDANNA', 24: 'DUSTY TUTU' })[value] ?? 'BEPIS.';
  const first = flags[75] ?? 0, second = flags[77] ?? 0, choice = flags[76] ?? 0;
  const range = (start,end) => Array.from({length:end-start+1}, (_,i) => start+i);
  const branch = choice === 0 ? first === second ? range(3250,3260).concat(3262) : range(3268,3283).concat(3285) : first === second ? range(3291,3301).concat(3303) : range(3309,3329).concat(3331);
  return [3238,3240,3241,3242,3243,3244,...branch].map(id => ({ text: text[id].replace(/\\\[1\]/g,armor(first)).replace(/\\\[2\]/g,armor(second)), papyrus: id !== 3238 && ![3262,3285,3303,3331].includes(id) }));
}
