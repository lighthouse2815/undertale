import { Game, Scene, Scale, CANVAS } from '../vendor/phaser.esm.min.js';
import { loadRoom } from './room-assets.mjs';
import { createColliders, movePlayer } from './movement.mjs';
import { Battle } from './battle.mjs';

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
  obj_readable_flowers1: ['The flowers are growing\nthere.', 'They look like they\nhave a mind of their own.'],
  obj_torinteractable7: ['* Someone has to take\n  care of these flowers.'],
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
    this.openRoom('room_area1').catch(fail);
  }

  async openRoom(name, spawnName = 'obj_mainchara') {
    state.phase = 'loading';
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
    this.player = this.add.image(snap(spawn.X), snap(spawn.Y), 'spr_maincharad:0').setOrigin(0);
    this.player.facing = 'd'; this.player.frameIndex = 0;
    this.confirmDown = false;
    this.confirmPressed = false;
    this.confirmWasDown = false;
    this.interactionCooldown = 0;
    this.dialogue = null;
    this.colliders = createColliders(data);
    this.elapsed = 0;
    this.cameras.main.setBounds(0, 0, data.room.Width, data.room.Height);
    this.updateCamera();
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
    this.confirmPress = (event) => { if (event.code === 'KeyZ') { this.confirmDown = true; this.confirmPressed = true; } };
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
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      movePlayer(this, this.player, this.colliders,
        (direction) => this.keys[direction].isDown || [...this.touch.values()].some((pointer) => pointer.direction === direction));
      this.elapsed -= 1000 / 30;
    }
    this.interactionCooldown = Math.max(0, this.interactionCooldown - delta);
    if (this.interactionCooldown === 0 && this.justConfirmed()) this.tryInteract();
    if (this.dataSource.name === 'room_area1' && this.player.x >= this.dataSource.room.Width - 35) {
      this.openRoom('room_area1_2', 'obj_markerA').catch(fail);
      return;
    }
    if (this.dataSource.name === 'room_area1_2' && this.player.y >= this.dataSource.room.Height - 35) {
      this.openRoom('room_area1', 'obj_markerB').catch(fail);
      return;
    }
    this.updateCamera();
  }

  tryInteract() {
    const target = this.roomObjects
      .filter((entry) => entry.interactable && DIALOGUES[entry.item.ObjectName])
      .map((entry) => ({ entry, distance: Math.hypot(this.player.x - entry.item.X, this.player.y - entry.item.Y) }))
      .filter(({ distance }) => distance < 45)
      .sort((a, b) => a.distance - b.distance)[0];
    if (!target) return;
    this.dialogue = { lines: DIALOGUES[target.entry.item.ObjectName], index: 0 };
    this.dialogueBox = this.add.rectangle(8, 160, 304, 70, 0x000000, .94).setOrigin(0).setScrollFactor(0).setDepth(100000);
    this.dialogueText = this.add.text(18, 170, this.dialogue.lines[0], { fontFamily: 'monospace', fontSize: '9px', color: '#fff', lineSpacing: 3 }).setScrollFactor(0).setDepth(100001);
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
      this.dialogueBox.destroy(); this.dialogueText.destroy(); this.dialogue = null;
    } else this.dialogueText.setText(this.dialogue.lines[this.dialogue.index]);
    this.interactionCooldown = 250;
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
  pixelArt: true, antialias: false, banner: false, scene: [Intro, Title, Name, World, Battle],
  scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH } });
state.startBattle = () => state.game.scene.start('Battle');
document.getElementById('fullscreen').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(fail);
  else document.querySelector('main').requestFullscreen().catch(fail);
};
