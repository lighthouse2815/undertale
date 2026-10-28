import { Scene } from '../vendor/phaser.esm.min.js';
import { readSave } from './save.mjs';

// obj_overworldcontroller, menuno 4: xem file cũ, Save/Return, xác nhận đã lưu.
export class SaveMenu extends Scene {
  constructor() { super('SaveMenu'); }

  create() {
    const state = window.__remake;
    this.world = this.game.scene.getScene('World');
    this.selection = 0;
    this.saved = false;
    this.add.rectangle(54, 49, 212, 87, 0xffffff).setOrigin(0);
    this.add.rectangle(57, 52, 206, 81, 0x000000).setOrigin(0);
    this.nameLabel = this.add.bitmapText(70, 60, 'fnt_maintext', '', 12);
    this.levelLabel = this.add.bitmapText(150, 60, 'fnt_maintext', '', 12);
    this.timeLabel = this.add.bitmapText(250, 60, 'fnt_maintext', '', 12).setOrigin(1, 0);
    this.roomLabel = this.add.bitmapText(70, 80, 'fnt_maintext', '', 12);
    this.saveLabel = this.add.bitmapText(85, 110, 'fnt_maintext', 'Save', 12);
    this.returnLabel = this.add.bitmapText(175, 110, 'fnt_maintext', 'Return', 12);
    this.heart = this.add.image(71, 113, 'spr_heartsmall:0').setOrigin(0);
    this.showFile(readSave());
    this.onKey = (event) => {
      if (event.repeat) return;
      if (event.code === 'KeyX') this.close();
      else if (['ArrowLeft', 'ArrowRight'].includes(event.code) && !this.saved) {
        this.selection = 1 - this.selection;
        this.heart.x = this.selection === 0 ? 71 : 161;
      } else if (event.code === 'KeyZ') {
        if (this.saved || this.selection === 1) this.close();
        else {
          // Chỉ đổi màn hình sang thành công sau khi localStorage ghi được.
          try {
            this.showFile(this.world.saveGame());
            this.saved = true;
            this.saveLabel.setText('File saved.');
            this.returnLabel.setVisible(false);
            this.heart.setVisible(false);
            for (const label of [this.nameLabel, this.levelLabel, this.timeLabel, this.roomLabel, this.saveLabel]) label.setFont('fnt_maintext:yellow');
            this.sound.play('snd_save', { volume: 0.87 });
          } catch {
            this.saveLabel.setText('Save failed.');
          }
        }
      }
    };
    window.addEventListener('keydown', this.onKey);
    this.events.once('shutdown', () => window.removeEventListener('keydown', this.onKey));
    state.phase = 'saving'; state.scene = this;
  }

  showFile(save) {
    this.nameLabel.setText(save?.name || 'EMPTY');
    this.levelLabel.setText(`LV ${save?.lv ?? (save ? 1 : 0)}`);
    const seconds = Math.floor((save?.playTime ?? 0) / 1000);
    this.timeLabel.setText(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`);
    this.roomLabel.setText(({ room_ruins1: 'Ruins - Entrance', room_ruins7: 'Ruins - Leaf Pile', room_ruins12A: 'Ruins - Mouse Hole', room_ruins19: 'Ruins - Home', room_tundra3: 'Snowdin - Box Road', room_tundra_spaghetti: 'Snowdin - Spaghetti', room_tundra_lesserdog: 'Snowdin - Dog House', room_tundra_town: 'Snowdin - Town', room_water2: 'Waterfall - Checkpoint', room_water4: 'Waterfall - Hallway', room_water_savepoint1: 'Waterfall - Crystal', room_water_friendlyhub: 'Waterfall - Quiet Area' })[save?.room] ?? ' ');
  }

  close() {
    this.world.confirmDown = false;
    this.world.confirmPressed = false;
    this.world.confirmWasDown = false;
    this.world.input.keyboard.resetKeys();
    this.world.touch.clear();
    this.world.interactionCooldown = 250;
    this.scene.stop();
    this.scene.resume('World');
    window.__remake.phase = 'running'; window.__remake.scene = this.world;
  }
}
