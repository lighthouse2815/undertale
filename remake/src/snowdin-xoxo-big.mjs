import { SnowdinXoxoPuzzle } from './snowdin-xoxo-puzzle.mjs';
import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';

// room_tundra_xoxopuzz/obj_papyrus5: giải câu đố, hỏi gợi ý hoặc bật công tắc trên cây.
export class SnowdinXoxoBig extends SnowdinXoxoPuzzle {
  constructor(world) {
    super(world, 56); this.text = world.dataSource.xoxoBigDialogue; this.talked = 0; this.chillTalked = 0;
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus5');
    this.tree = world.roomObjects.find((e) => e.item.ObjectName === 'obj_readable_room5');
    this.stage = world.plot >= 55 ? 'done' : world.plot >= 54 ? 'explore' : 'waiting';
    this.cameraLocked = world.plot < 55;
    if (this.stage !== 'done' && world.flags[67] !== 1) {
      this.pap = this.actor(world.plot >= 54 ? 300 : 100, 60, 'spr_papyrus_dt');
      this.papBody = createCollider(world.dataSource, this.entry('obj_papyrus_room', this.pap).item); world.colliders.push(this.papBody);
    }
    this.chill = world.roomObjects.find((e) => e.item.ObjectName === 'obj_chilldrakenpc');
    if (world.plot <= 100 || world.flags[203]) {
      this.chill.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.chill); this.chill = null;
    } else { world.colliders.push(createCollider(world.dataSource, this.chill.item)); this.chill.image.setDepth(this.chill.item.Y + this.chill.sprite.Height); }
  }
  actor(x, y, key) { const image = this.world.add.image(x, y, `${key}:0`); this.pose(image, key); return image; }
  pose(image, key, frame = 0) { const s = this.world.dataSource.sprites.get(key); image.setTexture(`${key}:${frame}`).setOrigin(s.OriginX / s.Width, s.OriginY / s.Height).setDepth(image.y + s.Height); }
  entry(name, image) { const w = this.world, object = w.dataSource.objects.get(name); return { item: { ObjectName: name, X: image.x, Y: image.y, ScaleX: 1, ScaleY: 1 }, image, object, sprite: w.dataSource.sprites.get(object.Sprite) }; }
  wait(stage) { this.stage = stage; this.frames = 0; }
  show(key, next, onPage) {
    const w = this.world, pages = this.text[key];
    w.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait, onPage: (i) => {
      const p = pages[i]; w.setDialoguePortrait(p.portrait); w.dialogueText.setFont(p.font, p.font === 'fnt_papyrus' ? 8 : p.font === 'fnt_comicsans' ? 10 : 12); onPage?.(i);
    }, onClose: next });
  }
  press() {
    const w = this.world;
    if (this.pap?.active && this.stage !== 'done' && this.victory) {
      w.plot = 56; this.cameraLocked = false; this.tiles.forEach((tile) => { tile.frame = 3; });
      if (!['solvedWait', 'solvedTalk', 'leaving', 'departed'].includes(this.stage)) {
        this.locked = true; w.release(); this.papBody.disabled = true; this.wait('solvedWait');
        if (!w.flags[413] && w.flags[67] !== 1 && w.plot <= 200) {
          this.sans = this.actor(620, 80, 'spr_sans_d'); this.sansBody = createCollider(w.dataSource, this.entry('obj_sans_room', this.sans).item); w.colliders.push(this.sansBody);
        }
      }
    } else if (w.plot <= 55) {
      if (this.tiles.some((tile) => tile.frame === 1)) w.flags[63] = (w.flags[63] ?? 0) + 1;
      this.tiles.forEach((tile) => { tile.frame = 0; }); this.victory = false;
    }
  }
  step() {
    this.stepPuzzle(); const w = this.world;
    if (this.chill) this.chill.image.setTexture(`${this.chill.object.Sprite}:${this.talkingChill ? Math.floor(this.total * .2) % this.chill.sprite.TextureCount : 0}`);
    if (this.stage === 'walking') {
      this.pap.x += 3; this.pose(this.pap, 'spr_papyrus_r', Math.floor(this.total * .2) % 4);
      if (this.pap.x >= this.trigger.X - 56) { this.pose(this.pap, 'spr_papyrus_rt'); this.wait('introWait'); }
    } else if (this.stage === 'introWait' && this.frames >= 20) {
      this.stage = 'introTalk';
      this.show('intro', () => { this.pose(this.pap, 'spr_papyrus_dt'); this.talked = 0; this.papBody.disabled = false; this.locked = false; this.wait('explore'); }, (i) => {
        this.cape = i >= 9 && i < 12;
        if (i >= 12) this.pose(this.pap, 'spr_papyrus_dt');
      });
    } else if (this.stage === 'explore' && w.player.x > 400 && this.pap?.x < 300) this.pap.x += 4;
    else if (this.stage === 'solvedWait' && this.frames >= 20 && !w.dialogue) {
      this.flowey = this.actor(20, 100, 'spr_floweysink'); this.floweyFrame = 0; this.stage = 'solvedTalk';
      this.show(this.talked ? 'solvedHelp' : 'solved', () => {
        this.departure = walkNpc(w, this.pap, 'path_papyrus2', { absolute: false, speed: 5, sprites: { r: 'spr_papyrus_r', u: 'spr_papyrus_u' }, onComplete: () => this.pap?.destroy() });
        this.wait('leaving');
      });
    } else if (this.stage === 'leaving' && this.frames >= 60) { this.locked = false; w.release(); this.wait('departed'); }
    if (this.cape && this.stage === 'introTalk') this.pose(this.pap, 'spr_papyrus_cape', Math.floor(this.total * .5) % w.dataSource.sprites.get('spr_papyrus_cape').TextureCount);
    if (this.pap?.active && this.papBody && !this.papBody.disabled) Object.assign(this.papBody, createCollider(w.dataSource, this.entry('obj_papyrus_room', this.pap).item));
    if (this.flowey?.active) {
      const c = w.cameras.main;
      if (this.floweyFrame || this.flowey.x > c.scrollX - 37 && this.flowey.x < c.scrollX + 357 && this.flowey.y > c.scrollY - 18 && this.flowey.y < c.scrollY + 258) {
        this.floweyFrame += .5;
        if (this.floweyFrame >= 6) { this.flowey.destroy(); w.flags[9] = (w.flags[9] ?? 0) + 1; }
        else this.flowey.setTexture(`spr_floweysink:${Math.floor(this.floweyFrame)}`);
      }
    }
  }
  checkTrigger(previous) {
    const w = this.world;
    if (this.stage !== 'waiting' || !this.pap?.active || w.dialogue || !touchesObject(w, w.player, this.trigger, 1, 999)) return false;
    w.player.setPosition(previous.x, previous.y); w.plot = 54; w.release(); this.papBody.disabled = true; this.locked = true; this.wait('walking'); return true;
  }
  interact() {
    const w = this.world;
    if (this.pap?.active && ['waiting', 'explore'].includes(this.stage) && inInteractionRange(w, this.entry('obj_papyrus_room', this.pap))) {
      const talked = this.talked++;
      if (this.pap.x <= this.trigger.X - 100) this.show('papBefore');
      else if (talked < 2) this.show(talked ? 'papHintAgain' : 'papHint');
      else this.show(talked === 2 ? 'answerIntro' : 'answerAgain', () => w.showChoice('* (Do you absolutely,\n  dapsolutely want the answer?)', ['Yes', 'No'], (choice) => this.show(choice ? 'answerNo' : 'answerYes')));
      return true;
    }
    if (this.sans?.active && inInteractionRange(w, this.entry('obj_sans_room', this.sans))) {
      const memory = Number(localStorage.getItem('undertale-remake-sans-meetings') ?? 0);
      this.show(w.flags[63] > 5 ? 'sansFails' : !w.flags[63] && memory > 1 ? 'sansMemory' : 'sans'); return true;
    }
    if (inInteractionRange(w, this.tree)) {
      this.show('tree', () => w.showChoice('* (Press it?)', ['Yes', 'No'], (choice) => {
        if (!choice && !this.victory) { this.victory = true; w.sound.play('snd_switchpull_n'); }
      })); return true;
    }
    if (inInteractionRange(w, this.sign)) { this.show('sign'); return true; }
    if (this.chill && inInteractionRange(w, this.chill)) {
      this.talkingChill = true; this.show(w.flags[7] === 1 ? 'chillEnd' : this.chillTalked++ ? 'chillAgain' : 'chill', () => { this.talkingChill = false; }); return true;
    }
    return false;
  }
  destroy() { this.departure?.stop(); this.pap?.destroy(); this.sans?.destroy(); this.flowey?.destroy(); }
}
