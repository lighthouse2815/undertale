import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { createCollider } from './movement.mjs';
import { startHouseMusic, mixHouseMusic } from './house-music.mjs';

// obj_chairiel/SCR_TEXT 527–532 và đồ vật phòng khách/bếp.
export class TorielLiving {
  constructor(world) {
    this.world = world; this.text = world.dataSource.livingDialogue; this.elapsed = 0;
    this.music = startHouseMusic(world); this.stage = 'idle'; this.locked = false;
    this.chair = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_chairiel');
    this.fire = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_hearthflame');
    this.pie = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_bigpie');
    this.empty = world.plot > 20 || world.plot < 19;
    if (this.chair && this.empty) this.setChairSprite('spr_chairempty');
    for (const entry of [this.chair, this.fire].filter(Boolean)) {
      entry.body = createCollider(world.dataSource, entry.item); world.colliders.push(entry.body);
      entry.image.setDepth(entry.item.Y + entry.sprite.MarginBottom);
    }
    if (this.fire && world.flags[45] === 4) { this.fire.body.disabled = true; this.fire.image.destroy(); }
    if (this.pie) this.pie.image.setTexture(`spr_bigpie:${world.flags[103] > 0 ? 1 : 0}`);
    this.buster = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_toribuster');
  }

  setChairSprite(name) {
    const world = this.world, entry = this.chair;
    entry.object = { ...entry.object, Sprite: name }; entry.sprite = world.dataSource.sprites.get(name);
    world.dataSource.objects.set('obj_chairiel', entry.object); entry.image.setTexture(`${name}:0`);
    if (entry.body) Object.assign(entry.body, createCollider(world.dataSource, entry.item));
  }

  update(delta) {
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; mixHouseMusic(this.world, this.music, [1, .001]);
      if (this.fire?.image.active) this.fire.image.setTexture(`spr_hearthflame:${Math.floor((this.fireFrame = (this.fireFrame ?? 0) + .25)) % this.fire.sprite.TextureCount}`);
      if (this.stage === 'standing' && ++this.frames >= 30) this.leaveChair();
      else if (this.stage === 'standing') this.chair.image.setTexture(`spr_chairielgetup:${Math.floor(this.frames * .2)}`);
    }
    return this.locked;
  }

  glasses() {
    const world = this.world, portrait = world.dialoguePortrait;
    const image = world.add.image(portrait.x, portrait.y, 'spr_face_torielglasses:0').setOrigin(0).setScrollFactor(0).setDepth(100002);
    world.dialogueBox.once('destroy', () => image.destroy());
  }

  pages(pages, onClose) {
    const world = this.world; let portrait = 'spr_face_torielhappytalk';
    const portraits = pages.map((page) => portrait = page.portrait ?? portrait);
    world.showDialogue(pages.map((page) => page.text), { portrait: portraits[0], onPage: (index) => world.setDialoguePortrait(portraits[index]), onClose });
    this.glasses();
  }

  choice(key, labels, after) {
    const world = this.world;
    world.showChoice(this.text[key][0].text, labels, after);
    world.setDialoguePortrait(this.text[key][0].portrait ?? 'spr_face_torielhappytalk');
    this.glasses();
  }

  talk() {
    const world = this.world;
    if (world.plot === 19.4) { this.choice('askPrompt', ['Nothing', 'How to exit\nthe RUINS'], (choice) => this.lastChoice(choice, true)); return; }
    if (world.plot === 19.3) { this.fact(-1); return; }
    if (world.plot === 19.2) { this.book(-1); return; }
    if (world.plot === 19.1 || world.flags[103] > 0) { this.chat(-1); return; }
    this.pages(this.text.napIntro, () => this.choice('napPrompt', ['Yes', 'No'], (choice) => this.chat(choice)));
  }

  chat(choice) {
    this.world.plot = 19.1;
    if (choice === 0) { this.pages(this.text.sweet); return; }
    const first = this.world.flags[103] > 0 ? this.text.awakeStart : this.text.chatStart;
    this.pages([...first, ...this.text.chat], () => this.choice('homePrompt', ['Nothing', 'When can\nI go home?'], (choice) => this.book(choice)));
  }

  book(choice) {
    this.world.plot = 19.2;
    if (choice === 0) { this.pages(this.text.nothing); return; }
    this.pages([...(choice === -1 ? this.text.bookAgain : this.text.home), ...this.text.book],
      () => this.choice('bookPrompt', ['Sure', 'How to exit\nthe RUINS'], (choice) => this.fact(choice)));
  }

  fact(choice) {
    this.world.plot = 19.3;
    const fact = this.text.facts[Math.round(Math.random() * 3)];
    this.pages([...(choice === 1 ? this.text.factAvoid : this.text.factIntro), ...this.text.factStart, fact],
      () => this.choice('factPrompt', ['Yeah', 'How to exit\nthe RUINS'], (choice) => this.lastChoice(choice)));
  }

  lastChoice(choice, repeat = false) {
    const world = this.world; world.plot = choice === 1 ? 19.9 : 19.4;
    this.pages(choice === 1 ? this.text.leave : repeat ? this.text.anything : this.text.bother, () => {
      if (choice !== 1) return;
      world.plot = 20; world.release(); this.locked = true; this.stage = 'standing'; this.frames = 0;
      this.setChairSprite('spr_chairielgetup');
    });
  }

  leaveChair() {
    const world = this.world;
    this.stage = 'leaving'; this.empty = true; this.locked = false; world.plot = 21;
    this.setChairSprite('spr_chairempty');
    this.npc = world.add.image(this.chair.item.X + 28, this.chair.item.Y + 3, 'spr_toriel_d:0').setOrigin(0);
    this.path = walkNpc(world, this.npc, 'path_torielwalkhouse1', { absolute: false, speed: 5, onUpdate: (npc) => {
      npc.setDepth(npc.y + 53);
      if (touchesObject(world, npc, this.buster)) { this.path.stop(); npc.destroy(); this.stage = 'idle'; }
    }, onComplete: () => { this.npc.destroy(); this.stage = 'idle'; } });
    world.confirmPressed = false; world.confirmWasDown = world.confirmDown;
  }

  interact() {
    const world = this.world;
    if (this.chair && inInteractionRange(world, this.chair)) {
      if (this.empty) world.showDialogue(this.text.empty.map((page) => page.text)); else this.talk();
      return true;
    }
    if (this.fire?.image.active && inInteractionRange(world, this.fire)) { world.showDialogue(this.text.fire.map((page) => page.text)); return true; }
    const entry = world.roomObjects.find((entry) => /^obj_readable_room[1-4]$/.test(entry.item.ObjectName) && inInteractionRange(world, entry));
    if (!entry) return false;
    let key;
    if (world.dataSource.name === 'room_torhouse2') key = entry.item.ObjectName.endsWith('1') ? 'tools' : 'history';
    else if (entry.item.ObjectName.endsWith('1')) key = 'fridge';
    else if (entry.item.ObjectName.endsWith('2')) key = world.flags[7] === 1 ? 'pieEnd' : world.flags[103] > 0 ? 'pieSlice' : 'pieHot';
    else if (entry.item.ObjectName.endsWith('3')) key = 'sink';
    else if (entry.item.X < 130) key = world.flags[202] >= 20 ? 'knives' : 'cupboard';
    else key = world.flags[45] === 4 ? 'stoveAfter' : 'stove';
    world.showDialogue(this.text[key].map((page) => page.text)); return true;
  }

  destroy() { this.path?.stop(); }
}
