import { Game, Scene, Scale, CANVAS } from '../vendor/phaser.esm.min.js';
import { loadRoom } from './room-assets.mjs';
import { createColliders, movePlayer } from './movement.mjs';
import { Battle, BATTLE_CONFIGS } from './battle.mjs';
import { readSave, writeSave } from './save.mjs';
import { SaveMenu } from './save-menu.mjs';
import { RuinsTutorial } from './ruins-tutorial.mjs';
import { RuinsSwitches } from './ruins-switches.mjs';
import { DummyLesson } from './dummy-lesson.mjs';
import { DummyBattle } from './dummy-battle.mjs';

const state = window.__remake = { phase: 'loading', room: null, error: null, scene: null };
const status = document.getElementById('status');
const INTRO_TEXT = [
  'Long ago, two races\nruled over Earth:\nHUMANS and MONSTERS.',
  'One day, war broke\nout between the two\nraces.',
  'After a long battle,\nthe humans were\nvictorious.',
  'They sealed the monsters\nunderground with a magic\nspell.',
  'Many years later... ...',
  '      MT. EBOTT\n         201X',
  'Legends say that those\nwho climb the mountain\nnever return.',
];
const DIALOGUES = {
  obj_readable_flowers1: ['* (Golden flowers.)\n* (They must have\n  broken your fall.)'],
  obj_torinteractable7: ['* Do not worry about\n  me.', '* Someone has to take\n  care of these flowers.'],
  obj_savepoint: ['* (The shadow of the ruins\n  looms above, filling you with\n  determination.)', '* (HP fully restored.)'],
};
// Chỉ nối các phòng đã chuyển. A đi tới markerA của phòng kế, B quay về markerB.
const ROOM_EXITS = {
  room_area1: { A: 'room_area1_2' },
  room_area1_2: { A: 'room_ruins1', B: 'room_area1' },
  room_ruins1: { A: 'room_ruins2', B: 'room_area1_2' },
  room_ruins2: { A: 'room_ruins3', B: 'room_ruins1' },
  room_ruins3: { A: 'room_ruins4', B: 'room_ruins2' },
  room_ruins4: { A: 'room_ruins5', B: 'room_ruins3' },
  room_ruins5: { B: 'room_ruins4' },
};
function fail(error) {
  state.phase = 'error'; state.error = error.message;
  status.hidden = false; status.textContent = `Không mở được phòng: ${error.message}`;
  console.error(error);
}

class World extends Scene {
  constructor() { super('World'); }

  create() {
    this.game.registry.set('sourceCache', new Map());
    state.scene = this;
    this.setupInput();
    this.trackTime = (_time, delta) => { this.playTime = (this.playTime ?? 0) + delta; };
    this.game.events.on('step', this.trackTime);
    this.events.once('shutdown', () => this.game.events.off('step', this.trackTime));
    this.openRoom('room_area1').catch(fail);
  }

  async openRoom(name, spawnName = 'obj_mainchara') {
    state.phase = 'loading';
    this.ruinsTutorial?.destroy();
    this.ruinsTutorial = null;
    this.ruinsSwitches?.destroy();
    this.ruinsSwitches = null;
    this.dummyLesson?.destroy();
    this.dummyLesson = null;
    this.flags ??= {};
    const facing = this.player?.facing ?? 'd';
    const data = await loadRoom(this, name);
    this.children.removeAll(true);
    this.dataSource = data;
    for (const background of data.room.Backgrounds.filter((item) => item.Enabled && !item.Foreground)) {
      const image = this.add.image(background.X, background.Y, background.BackgroundAsset).setOrigin(0).setDepth(-2000000);
      if (background.Stretch) image.setDisplaySize(data.room.Width, data.room.Height);
    }
    for (const tile of data.room.Tiles) {
      const key = `tile:${tile.Asset}:${tile.SourceX}:${tile.SourceY}:${tile.Width}:${tile.Height}`;
      const texture = this.textures.get(tile.Asset);
      if (!texture.has(key)) texture.add(key, 0, tile.SourceX, tile.SourceY, tile.Width, tile.Height);
      this.add.image(tile.X, tile.Y, tile.Asset, key).setOrigin(0).setScale(tile.ScaleX, tile.ScaleY).setDepth(-tile.Depth);
    }
    this.roomObjects = [];
    const inherits = (name, target) => {
      for (let current = name; current; current = data.objects.get(current)?.ParentObject) if (current === target) return true;
      return false;
    };
    for (const item of data.room.GameObjects) {
      if (item.ObjectName === 'obj_mainchara') continue; // Vị trí gốc chỉ dùng để tạo player một lần.
      // Create/RoomStart gốc: không đọc hoa khi mới rơi xuống; Toriel ở đây khi plot = 25.
      if (item.ObjectName === 'obj_readable_flowers1' && (this.plot ?? 0) === 0) continue;
      if (item.ObjectName === 'obj_torinteractable7' && this.plot !== 25) continue;
      if (name === 'room_ruins2' && this.plot > 2 && ['obj_ruinsdoor1', 'obj_toroverworld3'].includes(item.ObjectName)) continue;
      if (name === 'room_ruins3') {
        if (item.ObjectName === 'obj_toroverworld4' && this.plot >= 4) continue;
        if (item.ObjectName === 'obj_torinteractable1' && this.plot !== 4) continue;
        if (item.ObjectName === 'obj_torinteractable2' && this.plot !== 4.5) continue;
      }
      if (name === 'room_ruins4') {
        if (item.ObjectName === 'obj_torinteractable4' && !(this.plot >= 5.4 && this.plot <= 6.5)) continue;
        if (item.ObjectName === 'obj_dummy1' && this.flags[14] === 1) continue;
      }
      const object = data.objects.get(item.ObjectName);
      const interactable = Boolean(object && (inherits(item.ObjectName, 'obj_readable') || inherits(item.ObjectName, 'obj_interactable')
        || item.ObjectName.includes('readable') || item.ObjectName.includes('torinteractable')));
      if ((!object?.Visible && !interactable) || !object.Sprite || item.ObjectName === 'obj_overworldcontroller' || item.ObjectName === 'obj_unfader') continue;
      const sprite = data.sprites.get(object.Sprite);
      const key = `${object.Sprite}:0`;
      const image = object.Visible ? this.add.image(item.X, item.Y, key)
        .setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height)
        .setScale(item.ScaleX ?? 1, item.ScaleY ?? 1)
        .setDepth(item.Depth ?? item.Y) : null;
      this.roomObjects.push({ item, object, sprite, image, interactable });
    }
    const spawn = data.room.GameObjects.find((item) => item.ObjectName === spawnName)
      ?? data.room.GameObjects.find((item) => item.ObjectName === 'obj_mainchara');
    if (!spawn) throw new Error(`Phòng ${name} không có vị trí nhân vật.`);
    const snap = (value) => value % 3 === 2 ? value + 1 : value % 3 === 1 ? value - 1 : value;
    // Create gốc căn lưới trước, rồi mới ghi đè bằng marker cửa: không căn lại marker.
    this.player = this.add.image(spawnName === 'obj_mainchara' ? snap(spawn.X) : spawn.X,
      spawnName === 'obj_mainchara' ? snap(spawn.Y) : spawn.Y, `spr_mainchara${facing}:0`).setOrigin(0);
    this.player.facing = facing; this.player.frameIndex = 0;
    this.doors = data.room.GameObjects.flatMap((item) => {
      const match = /^obj_door([AB])(musicfade)?$/.exec(item.ObjectName);
      const destination = match && ROOM_EXITS[name]?.[match[1]];
      if (!destination) return [];
      const sprite = data.sprites.get(data.objects.get(item.ObjectName).Sprite);
      return [{ destination, direction: match[1], marker: match[1] === 'A' ? 'obj_markerA' : 'obj_markerB',
        duration: (match[2] ? 13 : 8) * 1000 / 30,
        left: item.X + (sprite.MarginLeft - sprite.OriginX) * item.ScaleX,
        right: item.X + (sprite.MarginRight - sprite.OriginX) * item.ScaleX,
        top: item.Y + (sprite.MarginTop - sprite.OriginY) * item.ScaleY,
        bottom: item.Y + (sprite.MarginBottom - sprite.OriginY) * item.ScaleY }];
    });
    this.confirmDown = false;
    this.confirmPressed = false;
    this.confirmWasDown = false;
    this.interactionCooldown = 0;
    this.dialogue = null;
    this.hp = this.hp ?? 20;
    this.maxHp = this.maxHp ?? 20;
    this.lv = this.lv ?? 1;
    this.plot = this.plot ?? 0;
    this.playTime = this.playTime ?? 0;
    this.colliders = createColliders(data);
    this.elapsed = 0;
    this.cameras.main.setBounds(0, 0, data.room.Width, data.room.Height);
    this.updateCamera();
    if (name === 'room_ruins2') this.ruinsTutorial = new RuinsTutorial(this);
    if (name === 'room_ruins3') this.ruinsSwitches = new RuinsSwitches(this);
    if (name === 'room_ruins4') this.dummyLesson = new DummyLesson(this);
    state.room = name; state.phase = 'running'; status.hidden = true;
  }

  setupInput() {
    this.keys = this.input.keyboard.createCursorKeys();
    this.touch = new Map();
    for (const button of document.querySelectorAll('[data-direction]')) {
      button.onpointerdown = (event) => {
        event.preventDefault(); button.setPointerCapture(event.pointerId);
        this.touch.set(event.pointerId, { direction: button.dataset.direction, started: performance.now() });
      };
      button.onpointerup = button.onpointercancel = button.onlostpointercapture = (event) => {
        const pointer = this.touch.get(event.pointerId);
        if (!pointer) return;
        setTimeout(() => {
          if (this.touch.get(event.pointerId) === pointer) this.touch.delete(event.pointerId);
        }, Math.max(0, 50 - (performance.now() - pointer.started)));
      };
    }
    this.release = () => { this.input.keyboard.resetKeys(); this.touch.clear(); };
    this.confirmPress = (event) => { if (event.code === 'KeyZ' && !event.repeat) { this.confirmDown = true; this.confirmPressed = true; } };
    this.confirmRelease = (event) => { if (event.code === 'KeyZ') this.confirmDown = false; };
    window.addEventListener('keydown', this.confirmPress);
    window.addEventListener('keyup', this.confirmRelease);
    window.addEventListener('blur', this.release);
    this.visibility = () => { if (document.hidden) this.release(); };
    document.addEventListener('visibilitychange', this.visibility);
    this.events.once('shutdown', () => {
      window.removeEventListener('blur', this.release);
      window.removeEventListener('keydown', this.confirmPress);
      window.removeEventListener('keyup', this.confirmRelease);
      document.removeEventListener('visibilitychange', this.visibility);
    });
  }

  updateCamera() {
    this.cameras.main.setScroll(Math.max(0, Math.min(this.dataSource.room.Width - 320, Math.round(this.player.x - 150))),
      Math.max(0, Math.min(this.dataSource.room.Height - 240, Math.round(this.player.y - 110))));
  }

  update(_time, delta) {
    if (state.phase !== 'running') return;
    if (this.dialogue) {
      if (this.justConfirmed()) this.advanceDialogue();
      return;
    }
    if (this.ruinsTutorial?.update()) return;
    if (this.ruinsSwitches?.update()) return;
    if (this.dummyLesson?.update()) return;
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      movePlayer(this, this.player, this.colliders,
        (direction) => this.keys[direction].isDown || [...this.touch.values()].some((pointer) => pointer.direction === direction));
      this.elapsed -= 1000 / 30;
    }
    this.interactionCooldown = Math.max(0, this.interactionCooldown - delta);
    if (this.interactionCooldown === 0 && this.justConfirmed()) this.tryInteract();
    const door = this.findDoor(this.player.x, this.player.y);
    if (door) {
      state.phase = 'transition';
      this.cameras.main.once('camerafadeoutcomplete', async () => {
        try {
          await this.openRoom(door.destination, door.marker);
          this.cameras.main.fadeIn(1000 / 30 / 0.08);
        } catch (error) { fail(error); }
      });
      this.cameras.main.fadeOut(door.duration);
      return;
    }
    this.updateCamera();
  }

  findDoor(x, y) {
    const sprite = this.dataSource.sprites.get(`spr_mainchara${this.player.facing}`);
    return this.doors.find((entry) => !(entry.direction === 'A' && this.ruinsTutorial && !this.ruinsTutorial.gateOpen)
      && x + sprite.MarginRight >= entry.left
      && x + sprite.MarginLeft <= entry.right
      && y + sprite.MarginBottom >= entry.top
      && y + sprite.MarginTop <= entry.bottom);
  }

  tryInteract() {
    if (this.dummyLesson) { this.dummyLesson.interact(); return; }
    if (this.ruinsSwitches) {
      const entry = this.roomObjects.find((entry) => entry.interactable
        && this.ruinsSwitches.canInteract(entry) && this.ruinsSwitches.inReach(entry));
      if (entry) this.ruinsSwitches.interact(entry);
      return;
    }
    const target = this.roomObjects
      .filter((entry) => entry.interactable && (DIALOGUES[entry.item.ObjectName]
        || (this.dataSource.name === 'room_ruins2' && entry.item.ObjectName === 'obj_readable_room1')))
      .map((entry) => ({ entry, distance: Math.hypot(this.player.x - entry.item.X, this.player.y - entry.item.Y) }))
      .filter(({ distance }) => distance < 45)
      .sort((a, b) => a.distance - b.distance)[0];
    if (!target) return;
    if (target.entry.item.ObjectName === 'obj_savepoint') {
      this.hp = Math.max(this.hp, this.maxHp);
      this.sound.play('snd_power', { volume: 0.88 });
      this.showDialogue(DIALOGUES.obj_savepoint, { onClose: () => {
        this.plot = Math.max(this.plot, 2);
        this.scene.pause();
        this.scene.launch('SaveMenu');
      } });
    } else this.showDialogue(target.entry.item.ObjectName === 'obj_readable_room1'
      ? this.dataSource.tutorialDialogue.sign : DIALOGUES[target.entry.item.ObjectName]);
  }

  showDialogue(lines, { portrait = false, onClose } = {}) {
    this.confirmPressed = false;
    this.confirmWasDown = this.confirmDown;
    this.dialogue = { lines, index: 0, onClose };
    const y = this.player.y - this.cameras.main.scrollY > 130 ? 8 : 160;
    this.dialogueBox = this.add.rectangle(8, y, 304, 70, 0x000000).setOrigin(0).setScrollFactor(0).setDepth(100000).setStrokeStyle(2, 0xffffff);
    const x = portrait ? 68 : 18;
    this.dialogueText = this.cache.bitmapFont.exists('fnt_maintext')
      ? this.add.bitmapText(x, y + 8, 'fnt_maintext', lines[0], 12).setMaxWidth(300 - x)
      : this.add.text(x, y + 10, lines[0], { fontFamily: 'monospace', fontSize: '9px', color: '#fff', lineSpacing: 3 });
    this.dialogueText.setScrollFactor(0).setDepth(100001);
    this.dialoguePortrait = portrait ? this.add.image(23, y + 19, `${typeof portrait === 'string' ? portrait : 'spr_face_torielhappytalk'}:0`).setOrigin(0).setScrollFactor(0).setDepth(100001) : null;
    this.interactionCooldown = 250;
  }

  justConfirmed() {
    const down = this.confirmDown;
    const just = this.confirmPressed || (down && !this.confirmWasDown);
    this.confirmPressed = false;
    this.confirmWasDown = down;
    return just;
  }

  advanceDialogue() {
    this.dialogue.index += 1;
    if (this.dialogue.index >= this.dialogue.lines.length) {
      const onClose = this.dialogue.onClose;
      this.dialogueBox.destroy(); this.dialogueText.destroy(); this.dialogue = null;
      this.dialoguePortrait?.destroy();
      onClose?.();
    } else this.dialogueText.setText(this.dialogue.lines[this.dialogue.index]);
    this.interactionCooldown = 250;
  }

  saveGame() {
    return writeSave({ name: this.game.registry.get('charname'), room: this.dataSource.name,
      x: this.player.x, y: this.player.y, hp: this.hp, maxHp: this.maxHp, lv: this.lv,
      playTime: this.playTime, flags: { ...this.flags, plot: this.plot } });
  }

  async restoreGame() {
    const save = readSave();
    if (!save) return false;
    this.game.registry.set('charname', save.name);
    this.hp = save.hp;
    this.maxHp = save.maxHp ?? 20;
    this.lv = save.lv ?? 1;
    this.plot = save.flags?.plot ?? 0;
    this.flags = { ...(save.flags ?? {}) };
    delete this.flags.plot;
    this.playTime = save.playTime ?? 0;
    await this.openRoom(save.room);
    this.player.setPosition(save.x, save.y);
    this.updateCamera();
    return true;
  }
}

class Intro extends Scene {
  constructor() { super('Intro'); }

  preload() {
    for (let frame = 0; frame < 11; frame++) this.load.image(`intro:${frame}`, new URL(`../assets/sprites/spr_introimage/spr_introimage_${frame}.png`, import.meta.url).href);
    this.load.image('title', new URL('../assets/sprites/spr_undertaletitle/spr_undertaletitle_0.png', import.meta.url).href);
  }

  create() {
    this.frame = 0;
    this.story = this.add.image(0, 0, 'intro:0').setOrigin(0);
    this.caption = this.add.text(18, 152, '', { fontFamily: 'monospace', fontSize: '10px', color: '#fff', lineSpacing: 2 });
    this.hint = this.add.text(160, 225, 'Z / ENTER để tiếp tục', { fontFamily: 'monospace', fontSize: '8px', color: '#aaa' }).setOrigin(.5);
    this.startedAt = performance.now();
    this.input.keyboard.on('keydown-Z', this.advance, this);
    this.input.keyboard.on('keydown-ENTER', this.advance, this);
    this.input.keyboard.on('keydown-SPACE', this.advance, this);
    this.showFrame();
    state.phase = 'intro'; state.room = 'room_introstory'; state.scene = this;
    status.hidden = true;
  }

  shutdown() {
    this.input.keyboard.off('keydown-Z', this.advance, this);
    this.input.keyboard.off('keydown-ENTER', this.advance, this);
    this.input.keyboard.off('keydown-SPACE', this.advance, this);
  }

  showFrame() {
    this.story.setTexture(`intro:${this.frame}`);
    this.caption.setText(INTRO_TEXT[Math.min(this.frame, INTRO_TEXT.length - 1)] ?? '');
    this.caption.setVisible(this.frame < INTRO_TEXT.length);
    this.startedAt = performance.now();
  }

  advance() {
    if (state.phase !== 'intro') return;
    if (this.frame < 10) { this.frame += 1; this.showFrame(); return; }
    this.scene.start('Title');
  }

  update() {
    if (state.phase === 'intro' && performance.now() - this.startedAt > 4200) this.advance();
  }
}

class Title extends Scene {
  constructor() { super('Title'); }

  create() {
    this.add.image(0, 0, 'title').setOrigin(0);
    this.add.text(160, 180, 'Z / ENTER để bắt đầu', { fontFamily: 'monospace', fontSize: '10px', color: '#aaa' }).setOrigin(.5);
    this.add.text(160, 232, 'UNDERTALE v1.08 (C) Toby Fox 2015-2017', { fontFamily: 'monospace', fontSize: '5px', color: '#888' }).setOrigin(.5);
    this.input.keyboard.once('keydown-Z', () => this.scene.start('Name'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Name'));
    state.phase = 'title'; state.room = 'room_introimage'; state.scene = this;
  }
}

class Name extends Scene {
  constructor() { super('Name'); }

  create() {
    this.name = '';
    this.lastKey = '';
    this.lastKeyAt = 0;
    this.cursor = 0;
    this.add.text(160, 35, 'Name the fallen human.', { fontFamily: 'monospace', fontSize: '10px', color: '#fff' }).setOrigin(.5);
    this.label = this.add.text(160, 70, '_'.repeat(6), { fontFamily: 'monospace', fontSize: '16px', color: '#fff' }).setOrigin(.5);
    this.add.text(160, 200, 'Gõ tên bằng bàn phím · ENTER xác nhận', { fontFamily: 'monospace', fontSize: '7px', color: '#aaa' }).setOrigin(.5);
    this.input.keyboard.on('keydown', this.onKey, this);
    state.phase = 'name'; state.room = 'room_intromenu'; state.scene = this;
  }

  onKey(event) {
    if (event.repeat || (event.key === this.lastKey && performance.now() - this.lastKeyAt < 40)) return;
    this.lastKey = event.key;
    this.lastKeyAt = performance.now();
    if (event.key === 'Backspace') this.name = this.name.slice(0, -1);
    else if (event.key === 'Enter' && this.name.length) {
      this.game.registry.set('charname', this.name);
      this.scene.start('World');
      return;
    } else if (/^[a-zA-Z0-9]$/.test(event.key) && this.name.length < 6) this.name += event.key.toUpperCase();
    this.label.setText(`${this.name}${this.name.length < 6 ? '_' : ''}`);
  }
}

state.game = new Game({ type: CANVAS, width: 320, height: 240, parent: 'game', backgroundColor: '#000000',
  pixelArt: true, antialias: false, banner: false, scene: [Intro, Title, Name, World, Battle, DummyBattle, SaveMenu],
  scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH } });
state.startBattle = (config = 'dummy') => {
  if (!BATTLE_CONFIGS[config]) throw new Error(`Không có cấu hình quái ${config}.`);
  if (state.phase !== 'running') return;
  state.game.registry.set('battleConfig', config);
  const world = state.scene;
  state.phase = 'loading';
  world.scene.pause();
  world.scene.launch(config === 'dummy' ? 'DummyBattle' : 'Battle');
};
document.getElementById('fullscreen').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(fail);
  else document.querySelector('main').requestFullscreen().catch(fail);
};
