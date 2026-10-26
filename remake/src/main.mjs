import { Game, Scene, Scale, CANVAS } from '../vendor/phaser.esm.min.js';
import { loadRoom } from './room-assets.mjs';
import { createColliders, movePlayer } from './movement.mjs';

const state = window.__remake = { phase: 'loading', room: null, error: null, scene: null };
const status = document.getElementById('status');
function fail(error) {
  state.phase = 'error'; state.error = error.message;
  status.hidden = false; status.textContent = `Không mở được phòng: ${error.message}`;
  console.error(error);
}

class World extends Scene {
  create() {
    this.game.registry.set('sourceCache', new Map());
    state.scene = this;
    this.setupInput();
    this.openRoom('room_area1').catch(fail);
  }

  async openRoom(name) {
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
    const spawn = data.room.GameObjects.find((item) => item.ObjectName === 'obj_mainchara');
    if (!spawn) throw new Error(`Phòng ${name} không có vị trí nhân vật.`);
    const snap = (value) => value % 3 === 2 ? value + 1 : value % 3 === 1 ? value - 1 : value;
    this.player = this.add.image(snap(spawn.X), snap(spawn.Y), 'spr_maincharad:0').setOrigin(0);
    this.player.facing = 'd'; this.player.frameIndex = 0;
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
    window.addEventListener('blur', this.release);
    this.visibility = () => { if (document.hidden) this.release(); };
    document.addEventListener('visibilitychange', this.visibility);
    this.events.once('shutdown', () => {
      window.removeEventListener('blur', this.release);
      document.removeEventListener('visibilitychange', this.visibility);
    });
  }

  updateCamera() {
    this.cameras.main.setScroll(Math.max(0, Math.min(this.dataSource.room.Width - 320, Math.round(this.player.x - 150))),
      Math.max(0, Math.min(this.dataSource.room.Height - 240, Math.round(this.player.y - 110))));
  }

  update(_time, delta) {
    if (state.phase !== 'running') return;
    this.elapsed = Math.min(this.elapsed + delta, 200);
    while (this.elapsed >= 1000 / 30) {
      movePlayer(this, this.player, this.colliders,
        (direction) => this.keys[direction].isDown || [...this.touch.values()].some((pointer) => pointer.direction === direction));
      this.elapsed -= 1000 / 30;
    }
    this.updateCamera();
  }
}

state.game = new Game({ type: CANVAS, width: 320, height: 240, parent: 'game', backgroundColor: '#000000',
  pixelArt: true, antialias: false, banner: false, scene: World,
  scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH } });
document.getElementById('fullscreen').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(fail);
  else document.querySelector('main').requestFullscreen().catch(fail);
};
