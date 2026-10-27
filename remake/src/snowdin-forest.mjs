import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { startSnowdinMusic, stopSnowdinMusic } from './snowdin-start.mjs';
import { spawnStalkerFlowey, updateStalkerFlowey } from './stalker-flowey.mjs';

// room_tundra2: cây tiền cảnh, cành cây, hai Sans và cuộc gặp Papyrus đầu tiên.
export class SnowdinForest {
  constructor(world) {
    this.world = world; this.text = world.dataSource.forestDialogue; this.elapsed = 0; this.frames = 0;
    this.stage = 'walking'; this.locked = false; this.oldX = world.player.x; this.played = 0; this.musicClock = 5;
    Object.assign(this, startSnowdinMusic(world, true));
    this.murder = world.flags[26] > 0 ? world.flags[26] >= 2 : world.flags[202] >= 20 && world.flags[45] === 4;
    this.stick = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_stick');
    this.lamp = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_convenientlamp');
    this.trees = world.roomObjects.filter(({ item }) => item.ObjectName.startsWith('obj_creeptree'));
    for (const tree of this.trees) tree.image.setDepth(-10);
    this.broken = world.flags[47] >= 2 || world.flags[275] >= 1;
    if (world.plot >= 35) this.stick.image.destroy();
    else {
      this.stick.image.setTexture(`spr_stick:${this.broken ? 1 : 0}`).setDepth(-99999);
      for (const [ObjectName, X] of [['obj_creeptree_sansmaker', 2650], ['obj_creeptree_stickbreak', 2725], ['obj_creeptree1', 3400], ['obj_creeptree1', 3440], ['obj_creeptree1', 4040]]) {
        const item = { ObjectName, X, Y: 0, ScaleX: 1, ScaleY: 1 };
        const image = world.add.image(X, 0, 'spr_treeshadow:0').setOrigin(0).setDepth(-10);
        this.trees.push({ item, image });
      }
    }
    this.fakeTrigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_fakesanstrigger');
    this.darkTrigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_darksanstrigger');
    if (world.plot > 35) this.addLampCollider();
    if (world.plot <= 35) this.tone = world.sound.add('mus_tone3', { loop: true, volume: .2, rate: 1.58 });
  }

  show(key, next) {
    const world = this.world, pages = this.text[key];
    this.stage = 'talking';
    world.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait,
      onPage: (index) => {
        const page = pages[index]; world.setDialoguePortrait(page.portrait);
        world.dialogueText.setFont(page.font, page.font === 'fnt_papyrus' ? 8 : page.font === 'fnt_comicsans' ? 10 : 12);
      }, onClose: next });
  }

  wait(stage, duration) { this.stage = stage; this.frames = 0; this.duration = duration; }
  pose(actor, sprite, frame = 0) { actor.setTexture(`${sprite}:${frame}`).setDepth(actor.y + actor.height); }
  face(direction) { const p = this.world.player; p.facing = direction; this.pose(p, `spr_mainchara${direction}`); }
  animate(actor, sprite, speed) { this.pose(actor, sprite, Math.floor(this.frames * speed) % this.text.sprites[sprite]); }

  addLampCollider() {
    if (!this.lampCollider) { this.lampCollider = createCollider(this.world.dataSource, this.lamp.item); this.world.colliders.push(this.lampCollider); }
  }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }

  step() {
    const world = this.world, player = world.player; this.frames++;
    const dx = player.x - this.oldX;
    for (const tree of this.trees) { tree.item.X -= dx * 1.25; tree.image.x = tree.item.X; }
    this.oldX = player.x;
    if (this.fade !== null) {
      this.fade += .04; if (this.fade > .95) this.fade = 1;
      this.music.setVolume(this.fade); if (this.fade === 1) this.fade = null;
    }
    if (this.fadeOut && this.music?.active !== false && !this.music.pendingRemove) this.music.setVolume(Math.max(0, this.music.volume - this.fadeOut));
    if (this.snapFrames && --this.snapFrames === 0) this.snap?.destroy();
    if (this.tone && --this.musicClock <= 0) this.updateTone();
    if (this.stick.image.active && !this.broken && !world.flags[275]
      && this.trees.some((t) => t.item.ObjectName === 'obj_creeptree_stickbreak' && this.overlap(this.stick.image, t.item))) {
      this.broken = true; this.stick.image.setTexture('spr_stick:1'); world.flags[47] = 2; world.flags[275] = 1;
      this.snap = world.sound.add('mus_sticksnap', { rate: .9, pan: -.8 }); this.snap.play(); this.snapFrames = 80;
    }
    if (this.fake?.active) {
      this.fake.x += dx < 0 ? 8 : 1; this.animate(this.fake, 'spr_sans_r_dark', .2);
      if (this.trees.some((t) => t.item.ObjectName === 'obj_creeptree_stickbreak' && this.overlap(this.fake, t.item))) {
        this.fake.destroy(); this.walkNoise?.destroy(); this.walkNoise = null;
      }
    }
    updateStalkerFlowey(world, this.flowey);
    switch (this.stage) {
      case 'approach':
        this.sans.x = Math.min(player.x - 23, this.sans.x + .75); this.animate(this.sans, 'spr_sans_r_dark', .1);
        if (this.sans.x >= player.x - 23) {
          this.walkNoise?.destroy(); this.walkNoise = null; this.pose(this.sans, 'spr_sans_r_dark');
          this.met = Number(localStorage.getItem('undertale-remake-sans-meetings') ?? 0);
          localStorage.setItem('undertale-remake-sans-meetings', String(this.met + 1));
          this.show(this.met > 0 ? 'greetAgain' : 'greet', () => { this.face('d'); this.wait('turn', 50); });
        }
        break;
      case 'turn':
        if (this.frames >= this.duration) { this.face('l'); this.wait('hand', 60); }
        break;
      case 'hand':
        if (this.frames >= this.duration) { player.setVisible(false); this.pose(this.sans, 'spr_sans_r_darkhand'); this.wait('shake', 90); }
        break;
      case 'shake':
        if (this.frames >= this.duration) { this.pose(this.sans, 'spr_sans_r_darkhand', 2); world.sound.play('mus_whoopee'); this.wait('whoopee', 180); }
        break;
      case 'whoopee':
        if (this.frames >= this.duration) {
          player.setVisible(true); this.pose(this.sans, 'spr_sans_r'); this.setMusic('mus_muscle');
          this.show(this.murder ? 'introMurder' : this.met > 0 ? 'introAgain' : 'intro', () => {
            this.face('r'); this.wait('gateWalk', 0);
          });
        }
        break;
      case 'gateWalk':
        this.sans.x += 4; player.x += 4; this.animate(this.sans, 'spr_sans_r', .25); this.face('r');
        player.setTexture(`spr_maincharar:${Math.floor(this.frames * .25) % world.dataSource.sprites.get('spr_maincharar').TextureCount}`);
        if (this.sans.x >= 2440) {
          this.pose(this.sans, 'spr_sans_r'); player.setTexture('spr_maincharar:0');
          this.show('lamp', () => this.murder ? (this.fadeOut = .01, this.wait('refuseWait', 90)) : this.wait('hideUp', 0));
        }
        break;
      case 'hideUp':
        player.y = Math.max(this.lamp.item.Y, player.y - 1);
        if (player.y <= this.lamp.item.Y) { this.fadeOut = .01; this.wait('hideRight', 0); }
        break;
      case 'hideRight':
        player.x = Math.min(this.lamp.item.X, player.x + 1);
        if (player.x >= this.lamp.item.X) { player.setVisible(false); player.y += 60; this.createPapyrus('papEnter'); }
        break;
      case 'refuseWait':
        if (this.frames >= this.duration) this.show('refuseLamp', () => this.createPapyrus('murderPapEnter'));
        break;
      case 'papEnter': case 'murderPapEnter': {
        const murder = this.stage === 'murderPapEnter', stop = 2720 - (murder ? 180 : 140);
        this.pap.x = Math.max(stop, this.pap.x - 4); this.animate(this.pap, 'spr_papyrus_l_mad', .334);
        if (this.pap.x <= stop) {
          this.pose(this.pap, 'spr_papyrus_lt_mad'); this.setMusic('mus_papyrus', .5);
          if (murder) this.show('murderBrother', () => { this.fadeOut = .02; this.wait('murderPapLeave', 0); });
          else this.show('brother', () => {
            this.pose(this.pap, 'spr_papyrus_mad1'); this.show('capture', () => {
              this.pose(this.pap, 'spr_papyrus_cape'); this.show('royalGuard', () => {
                this.pose(this.pap, 'spr_papyrus_lt'); this.show('helpLamp', () => {
                  this.pose(this.pap, 'spr_papyrus_mad2'); this.show('skeleton', () => this.startZoom(0));
                });
              });
            });
          });
        }
        break;
      }
      case 'zoomIn':
        this.zoomView.width -= 16; this.zoomView.height -= 12;
        if (this.sans.x + 12 > this.zoomView.x + this.zoomView.width / 2) this.zoomView.x += 3;
        if (this.sans.y + 16 > this.zoomView.y + this.zoomView.height / 2) this.zoomView.y += 9;
        this.applyZoom();
        if (this.frames >= 10) { world.sound.play('mus_rimshot'); this.pose(this.sans, this.joke ? 'spr_sans_shrug2' : 'spr_sans_shrug1'); this.wait('zoomHold', 30); }
        break;
      case 'zoomHold': if (this.frames >= this.duration) this.wait('zoomOut', 0); break;
      case 'zoomOut':
        this.zoomView.width += 16; this.zoomView.height += 12;
        if (this.zoomView.x > this.zoomOrigin.x) this.zoomView.x -= 3;
        if (this.zoomView.y > this.zoomOrigin.y) this.zoomView.y -= 9;
        this.applyZoom();
        if (this.frames >= 10) {
          world.cameras.main.setZoom(1); world.updateCamera(); this.pose(this.sans, 'spr_sans_r'); this.pose(this.pap, 'spr_papyrus_lt_mad');
          if (!this.joke) this.show('bone', () => this.startZoom(1));
          else this.show('backbone', () => this.wait('papLeave', 0));
        }
        break;
      case 'papLeave':
        this.pap.x += 4; this.animate(this.pap, 'spr_papyrus_r', .5);
        if (this.pap.x > 2725) this.wait('papReturn', 0);
        break;
      case 'papReturn':
        this.pap.x -= 1; this.pose(this.pap, 'spr_papyrus_l');
        if (this.pap.x < 2670) { this.pose(this.pap, 'spr_papyrus_lt'); this.show('heh', () => { this.fadeOut = .01; this.wait('papLastLeave', 0); }); }
        break;
      case 'papLastLeave': case 'murderPapLeave': {
        const murder = this.stage === 'murderPapLeave';
        this.pap.x += murder ? 4 : 1; this.animate(this.pap, 'spr_papyrus_r', murder ? .5 : 0);
        if (this.pap.x > 2720) {
          this.pap.destroy();
          this.show(murder ? 'murderEnd' : 'comeOut', () => {
            if (murder) this.finish(); else { player.setVisible(true); player.y -= 60; this.outX = player.x; this.wait('comeOut', 0); }
          });
        }
        break;
      }
      case 'comeOut': player.x -= 2; if (player.x < this.outX - 30) this.finish(); break;
      case 'byeWalk':
        this.sans.x += this.byeSpeed; this.animate(this.sans, this.byeSpeed < 0 ? 'spr_sans_l' : 'spr_sans_r', .25);
        if (this.frames >= 20) { world.plot = 37; this.setMusic('mus_snowy', 1, this.murder ? .6 : .95); this.locked = false; this.stage = 'done'; }
        break;
    }
    if (this.stage === 'talking' && this.pap?.active) {
      const key = this.pap.texture.key.split(':')[0];
      this.animate(this.pap, key, key === 'spr_papyrus_mad1' ? .2 : key === 'spr_papyrus_cape' ? .25 : key === 'spr_papyrus_mad2' ? .4 : 0);
    }
    if (this.locked && !this.stage.startsWith('zoom')) world.updateCamera();
  }

  overlap(actor, target) {
    const s = this.world.dataSource.sprites.get(actor.texture.key.split(':')[0]);
    const t = this.world.dataSource.sprites.get('spr_treeshadow');
    return actor.x + s.MarginRight >= target.X + t.MarginLeft && actor.x + s.MarginLeft <= target.X + t.MarginRight
      && actor.y + s.MarginBottom >= target.Y + t.MarginTop && actor.y + s.MarginTop <= target.Y + t.MarginBottom;
  }

  updateTone() {
    const world = this.world, x = world.player.x;
    this.musicClock = 5;
    if (world.flags[47] === -1) { this.tone.destroy(); this.extraTone?.destroy(); this.tone = null; return; }
    if (world.flags[47] > 0 && this.played === 0 && x > 660) { this.tone.play(); this.played = 1; }
    if (world.flags[47] > 0 && this.played === 1 && x > 1350) { this.tone.setRate(1.68); this.played = 2; }
    if (world.flags[47] > 2 && this.played === 2 && x > 1600) {
      this.tone.setRate(2.12); this.extraTone = world.sound.add('mus_tone3', { loop: true, volume: .1, rate: 2.12 }); this.extraTone.play(); this.played = 3;
    }
    if (world.flags[47] > 2 && this.played === 3 && x > 1610) {
      this.musicClock = 3; this.tone.setVolume(Math.min(1, .2 + (x - 1610) / 860)); this.extraTone.setVolume(Math.min(1, .1 + (x - 1610) / 860));
    }
  }

  setMusic(key, volume = 1, rate = 1) {
    stopSnowdinMusic(this.world); this.fade = null; this.fadeOut = 0;
    this.music = this.world.snowdinMusic = this.world.sound.add(key, { loop: true, volume, rate }); this.music.play();
  }

  createPapyrus(stage) { this.pap = this.world.add.image(2720, this.sans.y - 12, 'spr_papyrus_l_mad:0').setOrigin(0); this.wait(stage, 0); }
  startZoom(joke) {
    const c = this.world.cameras.main; this.joke = joke;
    this.zoomOrigin = { x: c.scrollX, y: c.scrollY };
    this.zoomView = { x: c.scrollX, y: c.scrollY, width: 320, height: 240 }; this.wait('zoomIn', 0);
  }
  applyZoom() {
    const v = this.zoomView;
    this.world.cameras.main.setZoom(320 / v.width).centerOn(v.x + v.width / 2, v.y + v.height / 2);
  }

  finish() {
    const world = this.world;
    this.face('d'); world.player.setVisible(true); world.plot = 36; this.locked = false; this.stage = 'idle';
    this.pose(this.sans, 'spr_sans_d'); this.talkedTo = 0; this.addLampCollider();
    this.sansEntry = { item: { ObjectName: 'obj_sans_interactable1', X: this.sans.x, Y: this.sans.y, ScaleX: 1, ScaleY: 1 },
      object: world.dataSource.objects.get('obj_sans_interactable1'), sprite: world.dataSource.sprites.get('spr_sans_d'), image: this.sans };
    this.sansCollider = createCollider(world.dataSource, this.sansEntry.item); world.colliders.push(this.sansCollider);
    this.flowey = spawnStalkerFlowey(world, 80, 160);
  }

  checkTrigger(previous) {
    const world = this.world;
    if (this.locked) return false;
    if (world.plot < 35) {
      if (!this.fake && !((world.flags[275] ?? 0) >= 2 || world.flags[47] > 2) && touchesObject(world, world.player, this.fakeTrigger, 1, 999)) {
        const tree = this.trees.find((t) => t.item.ObjectName === 'obj_creeptree_sansmaker');
        this.fake = world.add.image(tree.item.X + 35, world.player.y, 'spr_sans_r_dark:0').setOrigin(0);
        world.flags[275] = 2; world.flags[47] = 3;
        this.walkNoise = world.sound.add('mus_snowwalk', { loop: true, rate: .8, pan: -1 }); this.walkNoise.play();
      }
      if (touchesObject(world, world.player, this.darkTrigger)) {
        world.flags[47] = -1; this.fadeOut = .5; this.locked = true; world.release(); this.wait('approach', 0);
        this.sans = world.add.image(world.cameras.main.scrollX - 70, world.player.y - 1, 'spr_sans_r_dark:0').setOrigin(0);
        this.walkNoise?.destroy(); this.walkNoise = world.sound.add('mus_snowwalk', { loop: true, rate: .8, pan: -1 }); this.walkNoise.play();
        return true;
      }
    }
    if (this.stage === 'idle' && [2380, 2680].some((x) => touchesObject(world, world.player, { ObjectName: 'obj_sansbyetrigger', X: x, Y: 0 }, 1, 999))) {
      world.player.setPosition(previous.x, previous.y); world.release(); this.locked = true;
      stopSnowdinMusic(world); this.fadeOut = 0; this.music = null;
      this.show(this.murder ? 'byeMurder' : 'bye', () => {
        this.byeSpeed = world.player.x > this.sans.x ? -3 : 4; this.sansCollider.disabled = true; this.wait('byeWalk', 20);
      }); return true;
    }
    return false;
  }

  interact() {
    const world = this.world;
    if (this.stage === 'idle' && inInteractionRange(world, this.sansEntry)) {
      const key = this.murder ? 'idleMurder' : this.talkedTo === 1 ? 'idleAgain' : this.talkedTo === 2 ? 'idleWell' : 'idle'; this.talkedTo++;
      this.show(key, () => { this.stage = 'idle'; }); return true;
    }
    const entry = world.roomObjects.find((e) => e.interactable && e.image?.active && ['obj_stick', 'obj_convenientlamp', 'obj_sanscheckpoint'].includes(e.item.ObjectName) && inInteractionRange(world, e));
    if (!entry) return false;
    const key = entry === this.stick ? this.broken ? 'brokenStick' : 'stick' : entry === this.lamp ? 'readLamp' : 'checkpoint';
    const stage = this.stage; this.show(key, () => { this.stage = stage; }); return true;
  }

  destroy() {
    for (const sound of [this.tone, this.extraTone, this.snap, this.walkNoise]) sound?.destroy();
    this.world.cameras.main.setZoom(1);
  }
}
