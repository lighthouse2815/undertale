// scr_itemuseb 201–206, SCR_TEXT 1501–1515 và scr_torcall.
export function callToriel(world, id, text) {
  let pages;
  if (id === 206) {
    const index = world.phone.indexOf(id);
    if (index > 0) { world.phone.splice(index, 1); world.phone.unshift(id); }
    world.sound.play('snd_phone');
    if (world.flags[7] !== 1) pages = text.noAnswer;
    else {
      const read = world.flags[286] ?? 0, available = world.flags[287] ?? 0;
      pages = read === available ? text.noNewMessages : text.endingMessages[Math.min(read, 17)];
      if (read < available) world.flags[286] = read + 1;
    }
  } else if (world.flags[37] === 1) pages = text.busy;
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
