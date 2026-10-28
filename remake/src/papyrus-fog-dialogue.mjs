import data from './papyrus-fog-dialogue.json' with { type: 'json' };

// obj_papyrus8 và SCR_TEXT 544: lựa chọn lời trước/sau trận theo ký ức và số lần bị bắt.
export function papyrusFogIntro(flags, memory, murder) {
  if (murder) return { pages: data.murderIntro, murder: true, offer: false };
  const attempt = flags[67] ?? 0;
  if (attempt === -3) return { pages: data.retry3, murder: false, offer: true };
  if (attempt === -2) return { pages: data.retry2, murder: false, offer: false };
  if (attempt === -1) return { pages: memory > 0 ? data.retry1Remembered : data.retry1, murder: false, offer: false };
  return { pages: memory > 0 ? data.remembered : data.first, murder: false, offer: false };
}

export function papyrusFogOffer(choice) {
  return { pages: choice === 0 ? data.retry3Yes : data.retry3No, fight: choice === 0 };
}

export function papyrusFogAfter(flags, murder) {
  return { intro: murder ? data.afterIntroMurder : data.afterIntro, choice: !murder,
    answer: (choice) => [...(choice === 0 ? data.afterChoiceYes : data.afterChoiceNo),
      ...(flags[66] === 1 ? data.afterChoiceDate : data.afterChoiceFriends), ...data.afterDirections],
    king: murder ? data.afterKingMurder : data.afterKing, friends: flags[66] === 1 ? data.afterDate : data.afterFriends };
}

export const papyrusFogMurderSpeech = [data.murder1, data.murder2, data.murder3];
