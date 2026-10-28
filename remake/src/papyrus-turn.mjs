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

// Step của obj_papyrusboss ghi đè trạng thái theo lệnh, ngày hẹn, HP và MERCY.
export function papyrusTurnStatus(battle, command) {
  let id = command >= 0 ? 1584 : null;
  for (const [minimum, candidate] of [[16,1585], [20,1586], [30,1587], [40,1588], [60,1589], [80,1590], [90,1591], [97,1592]]) if (command >= minimum) id = candidate;
  if (battle.previousScene.flags[66] === 1) battle.flirt2++;
  if (battle.flirt2 > 0 && battle.flirt2 < 11) id = 1595 + battle.flirt2;
  if (battle.enemyHp < 100) id = 1609;
  if (battle.mercy >= 8000 || battle.murder) id = 1611;
  return id === null ? battle.status : text[id];
}

// ACT của Papyrus: phản ứng trước/sau đòn xanh và lựa chọn khi FLIRT lần đầu.
export function papyrusAct(battle, action, choice = null) {
  if (action === 'check') { battle.heard = 0; return { text: [text[battle.murder ? 1647 : 1645]], speaker: 'player' }; }
  if (action === 'insult') {
    battle.heard = 1;
    if (!battle.truefight && battle.insult <= 2) {
      const pages = battle.insult === 0 ? [text[1661], text[1662]] : [text[battle.insult === 1 ? 1663 : 1664]];
      battle.insult++; return { text: pages, speaker: 'papyrus' };
    }
    return { text: [text[battle.truefight ? 1680 : 1678]], speaker: 'player' };
  }
  if (action === 'flirtChoice') {
    battle.heard = choice === 0 ? 6 : 7;
    return { text: choice === 0 ? [text[1754], text[1755]] : [text[1769], text[1770], text[1771]], speaker: 'papyrus' };
  }
  if (action === 'flirt') {
    battle.heard = 3; battle.hotcha++;
    if (battle.hotcha <= 2 && !battle.truefight) {
      battle.previousScene.flags[66] = 1;
      return { text: battle.hotcha === 1 ? [text[1696], text[1697], text[1698]] : [text[1700]], speaker: 'papyrus', choice: battle.hotcha === 1 };
    }
    return { text: [text[battle.truefight ? 1715 : 1713]], speaker: 'player' };
  }
  throw new RangeError(`ACT không hợp lệ: ${action}`);
}
