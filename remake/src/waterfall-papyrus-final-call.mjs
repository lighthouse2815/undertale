import text from './waterfall-papyrus-final-call.json' with { type: 'json' };

// SCR_TEXT 633: cuộc gọi trước Hotland thay đổi theo cuộc hẹn Papyrus.
export function waterfallPapyrusFinalCall(flags) {
  const branch = (flags[88] ?? 0) < 3 ? [3348, 3349, 3350, 3352] : [3342, 3343, 3345];
  return [3337, 3339, 3340, 3341, ...branch].map(id => ({ text: text[id], papyrus: id !== 3337 && id !== 3345 && id !== 3352 }));
}
