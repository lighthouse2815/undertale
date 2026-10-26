// scr_itemuseb 201–205 và SCR_TEXT 1501–1508. Các cờ dùng chung với file SAVE.
export function callToriel(world, id, text) {
  let pages;
  if (world.flags[37] === 1) pages = text.busy;
  else {
    world.sound.play('snd_phone');
    if (world.plot >= 19.9) pages = world.flags[45] === 4 ? text.silent : text.noAnswer;
    else if (world.plot > 18 && world.dataSource.name === 'room_torhouse2') pages = text.house;
    else {
      if (id === 201) {
        world.flags[40] = (world.flags[40] ?? 0) + 1;
        pages = text.hello[Math.min(world.flags[40], 4) - 1];
      } else if (id === 202) pages = text.help;
      else if (id === 203) pages = text.about;
      else if (id === 204) { world.flags[42] = 1; pages = text.mom; }
      else if (id === 205) {
        if (world.flags[41] === 1) world.phone.splice(world.phone.indexOf(id), 1);
        world.flags[41] = (world.flags[41] ?? 0) + 1;
        pages = world.flags[41] === 1 ? text.flirtFirst : world.flags[42] === 1 ? text.flirtMom : text.flirtSecond;
      }
      if ([202, 203, 204].includes(id)) world.phone.splice(world.phone.indexOf(id), 1);
    }
  }
  world.showDialogue(pages.map((page) => page.text), { onPage: (index) => world.setDialoguePortrait(pages[index].portrait) });
}
