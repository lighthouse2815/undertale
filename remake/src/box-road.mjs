import { inInteractionRange } from './npc.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';
import { colorBitmapFont } from './fonts.mjs';
import { murderLevel } from './route.mjs';
import { createCollider } from './movement.mjs';

// room_tundra3/3A: hộp đồ, biển, SAVE và cần câu (SCR_TEXT 30/31, 224/225).
export class BoxRoad {
  constructor(world) {
    this.world = world; this.text = world.dataSource.boxRoadDialogue; this.elapsed = 0; this.frames = 0;
    world.flags[300] ??= 14; // SCR_GAMESTART; file cũ chưa có BOX vẫn nhận găng tay đầu tiên.
    Object.assign(this, startSnowdinMusic(world));
    this.water = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_waterdivot_test').map((entry) => ({ ...entry,
      speed: .15 + Math.random() * .05, sine: Math.random() * 20, frame: 0 }));
    for (const e of this.water) e.image.setDepth(-e.object.Depth);
    this.rod = world.roomObjects.find((e) => e.item.ObjectName === 'obj_ladiesfishingrod'); this.reeled = false;
    this.star = world.roomObjects.find((e) => e.item.ObjectName === 'obj_savepoint');
    for (const e of world.roomObjects.filter((e) => ['obj_sansbox', 'obj_sign_room', 'obj_ladiesfishingrod'].includes(e.item.ObjectName)))
      world.colliders.push(createCollider(world.dataSource, e.item));
    colorBitmapFont(world, 'fnt_maintext', 'red', '#ff0000');
  }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30;
      this.frames++;
      if (this.star) this.star.image.setTexture(`${this.star.object.Sprite}:${Math.floor(this.frames * .2) % this.star.sprite.TextureCount}`);
      if (this.fade !== null) {
        this.fade += .04; if (this.fade > .95) this.fade = 1;
        this.music.setVolume(this.fade); if (this.fade === 1) this.fade = null;
      }
      for (const e of this.water) {
        e.image.x += 1.5 + Math.sin(e.sine++ / 6) * .2;
        if (e.image.x > this.world.dataSource.room.Width) e.image.x = -10;
        e.frame = (e.frame + e.speed) % e.sprite.TextureCount; e.image.setTexture(`${e.object.Sprite}:${Math.floor(e.frame)}`);
      }
    }
  }

  save() {
    const world = this.world, f = world.flags;
    const level = murderLevel(f);
    let lines = this.text.save, red = false;
    if (level >= 2 && !f[27]) {
      const left = Math.max(0, 16 - (f[203] ?? 0));
      lines = this.text.saveLeft.map((line) => line.replace(/\\\[1\]/g, String(left))); red = true;
      if (level === 5) lines = this.text.saveComedian;
      if (f[57] === 2 && left <= 0) { lines = this.text.saveDetermination; red = false; }
      if (left <= 0 && f[57] !== 2) { lines = this.text.saveSnowdrake; red = false; }
    }
    if (level >= 16) { lines = this.text.saveDetermination; red = false; }
    world.hp = Math.max(world.hp, world.maxHp); world.sound.play('snd_power');
    world.showDialogue(lines, { onPage: () => world.dialogueText.setFont(red ? 'fnt_maintext:red' : 'fnt_maintext'),
      onClose: () => { world.release(); world.scene.pause(); world.scene.launch('SaveMenu'); } });
  }

  interact() {
    const world = this.world;
    const target = world.roomObjects.find((e) => ['obj_sansbox', 'obj_sign_room', 'obj_savepoint', 'obj_ladiesfishingrod'].includes(e.item.ObjectName) && inInteractionRange(world, e));
    if (!target) return;
    if (target.item.ObjectName === 'obj_sign_room') world.showDialogue(this.text.sign);
    else if (target.item.ObjectName === 'obj_savepoint') this.save();
    else if (target.item.ObjectName === 'obj_sansbox') {
      world.showChoice(this.text.box.prompt, this.text.box.options, (choice) => {
        if (choice !== 0) return;
        if (!world.inventory.length && !world.flags[300]) world.showDialogue([this.text.box.empty[Math.floor(Math.random() * 3)]]);
        else { world.release(); world.scene.launch('ItemBox'); window.__remake.phase = 'loadingBox'; }
      });
    } else if (this.reeled) {
      this.reeled = false; this.rod.image.setTexture('spr_fishingrod:0'); world.showDialogue(this.text.rodSend);
    } else world.showDialogue(this.text.rodIntro, { onClose: () => {
      world.showChoice(this.text.rodPrompt, this.text.box.options, (choice) => {
        if (choice === 0) { this.reeled = true; this.rod.image.setTexture('spr_fishingrod:1'); }
        world.showDialogue(choice === 0 ? world.flags[7] === 1 ? this.text.rodNote : this.text.rodPhoto : this.text.rodNo);
      });
    } });
  }
}
