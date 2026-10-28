import text from './papyrus-turn-dialogue.json' with { type: 'json' };

// Alarm 6 của obj_papyrusboss: chọn lời và điều chỉnh lượt trước khi sinh đạn.
export function preparePapyrusTurn(battle, command) {
  const w = battle.previousScene;
  let speech = [text[548]], blueAttack = false;
  if (!battle.conversation && battle.talked === 91) speech = [text[552]];
  if (!battle.conversation && battle.heard === -1 && battle.talked !== 91 && !battle.murder) {
    speech = [text[battle.enemyHp < battle.prevHp ? 558 : 559], text[560]];
    battle.conversation = 1; command = -1; blueAttack = true;
  }
  if (battle.enemyHp <= 140 && battle.fighto <= 14 && battle.xfight < 4) { battle.fighto = 14; battle.xfight = 4; }
  if (battle.enemyHp <= 80 && battle.fighto < 15) { battle.fighto = 15; battle.xfight = 0; }
  if (battle.truefight) {
    const turn = battle.fighto;
    if (turn === -1) speech = [text[w.flags[66] === 1 ? 571 : 570]];
    if (turn === 0) speech = [text[w.flags[66] === 1 ? 573 : 572]];
    if (turn === 0 && battle.hearthp2 < battle.hearthp && battle.xxtalk === 0) { speech = [text[574]]; battle.fighto = -1; battle.xxtalk = 1; }
    if (battle.fighto === 1) speech = [text[575]];
    if (battle.fighto === 1 && battle.hearthp2 < battle.hearthp && battle.xxtalk < 2) { speech = [text[576]]; battle.fighto = 0; battle.xxtalk = 2; }
    const lines = { 2: 577, 3: 578, 4: 579, 5: 580, 6: 581, 7: 582, 8: 583, 9: w.flags[66] === 1 ? 585 : 584, 10: 586, 11: w.flags[66] === 1 ? 588 : 587, 12: 589, 13: 590, 15: 596 };
    if (lines[battle.fighto]) speech = [text[lines[battle.fighto]]];
    if (battle.fighto === 14) speech = [text[battle.xfight > 3 ? 595 : battle.xfight > 2 ? 594 : 591 + battle.xfight]];
  }
  if (battle.heard > -1 && battle.fighto < 0) {
    if (battle.heard === 0) speech = [text[604]];
    if (battle.heard === 1) speech = [text[battle.insult > 2 ? 607 : battle.insult === 2 ? 606 : 605]];
    if ([3, 6, 7].includes(battle.heard)) speech = [text[608]];
  }
  if (battle.murder) speech = [text[612]];
  battle.command = command;
  return { speech, blueAttack, command };
}
