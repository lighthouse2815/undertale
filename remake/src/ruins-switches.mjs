import { walkNpc } from './npc.mjs';
import { createCollider } from './movement.mjs';

// Chuyển obj_torieltrigger2 và obj_plotswitch1/2: plot 3 → 4 → 4.5 → 5.
export class RuinsSwitches {
  constructor(world) {
    this.world = world;
    this.text = world.dataSource.switchDialogue;
    this.hardMode = world.game.registry.get('charname')?.toLowerCase() === 'frisk';
    this.stage = world.plot < 4 ? 'waiting' : world.plot === 4 ? 'first' : world.plot === 4.5 ? 'second' : 'complete';
    this.locked = false;
    this.npcEntry = world.roomObjects.find(({ item }) => /^obj_tor(overworld4|interactable[12])$/.test(item.ObjectName));
    this.npc = this.npcEntry?.image;
    this.talkedTo = 0;
    if (this.npc) this.npc.setTexture(world.plot >= 4 ? 'spr_toriel_l:0' : 'spr_toriel_d:0');
    if (world.plot === 4 || world.plot === 4.5) this.enableNpcCollision();
    for (const entry of world.roomObjects) {
      if (this.hardMode && /^obj_switchadvice[12]$/.test(entry.item.ObjectName)) entry.image?.setVisible(false);
    }
    this.syncSwitches();
  }

  syncSwitches() {
    const world = this.world;
    for (const entry of world.roomObjects) {
      if (entry.item.ObjectName === 'obj_plotswitch1') entry.image.setTexture(`spr_switch:${world.plot > 4 ? 1 : 0}`);
      if (entry.item.ObjectName === 'obj_plotswitch2') entry.image.setTexture(`spr_switch:${world.plot > 4.5 ? 1 : 0}`);
      if (entry.item.ObjectName === 'obj_spikes_room') entry.image.setTexture(`spr_spiketile:${world.plot > 4.5 ? 1 : 0}`);
    }
    for (const collider of world.colliders) {
      if (collider.objectName === 'obj_plotwall1') collider.disabled = world.plot > 4;
    }
  }

  enableNpcCollision() {
    this.npcBody = createCollider(this.world.dataSource, { ...this.npcEntry.item, X: this.npc.x, Y: this.npc.y });
    this.world.colliders.push(this.npcBody);
  }

  walk(name, options, onComplete) {
    if (this.npcBody) this.npcBody.disabled = true;
    this.npcEntry.interactable = false;
    this.chain = walkNpc(this.world, this.npc, name, { ...options, onComplete });
  }

  waitAtSwitch(number) {
    this.stage = number === 1 ? 'first' : 'second';
    this.npcEntry.item = { ...this.npcEntry.item, ObjectName: `obj_torinteractable${number}`, X: this.npc.x, Y: this.npc.y };
    this.npcEntry.object = this.world.dataSource.objects.get(this.npcEntry.item.ObjectName);
    this.npcEntry.sprite = this.world.dataSource.sprites.get(this.npcEntry.object.Sprite);
    this.npcEntry.interactable = true;
    this.talkedTo = 0;
    this.npc.setTexture('spr_toriel_l:0');
    this.enableNpcCollision();
  }

  update() {
    const world = this.world;
    if (this.stage === 'waiting' && (world.player.x > 140 || world.player.y < 170)) {
      this.stage = 'intro';
      world.showDialogue(this.text[this.hardMode ? 'introHard' : 'intro'], { portrait: true, onClose: () => {
        this.stage = 'walkingFirst';
        this.walk('path_torielwalk3', { speed: 3.25 }, () => {
          if (world.plot < 4) world.plot = 4;
          this.waitAtSwitch(1);
        });
      } });
      return true;
    }
    if (this.stage === 'first' && world.plot === 4.5) {
      this.stage = 'walkingSecond';
      this.walk('path_torielwalk3_2', {}, () => this.waitAtSwitch(2));
    }
    if (this.stage === 'second' && world.plot === 5 && !this.locked) {
      this.stage = 'praise';
      if (this.npcBody) this.npcBody.disabled = true;
      this.npcEntry.interactable = false;
      world.showDialogue(this.text.praise, { portrait: true, onClose: () => {
        this.stage = 'leaving';
        this.walk('path_walkright', { absolute: false }, () => {
          this.npc.destroy(); this.stage = 'complete';
        });
      } });
      return true;
    }
    return this.locked;
  }

  canInteract(entry) {
    const name = entry.item.ObjectName;
    if (this.hardMode && /^obj_switchadvice[12]$/.test(name)) return false;
    if (/^obj_torinteractable[12]$/.test(name)) return entry === this.npcEntry && ['first', 'second'].includes(this.stage);
    return ['obj_plotswitch1', 'obj_plotswitch2', 'obj_readable_switch1', 'obj_readable_sign1',
      'obj_readable_room1', 'obj_switchadvice1', 'obj_switchadvice2'].includes(name);
  }

  // Vùng tương tác của obj_mainchara User0 theo hướng nhìn.
  inReach(entry) {
    const { x, y, facing } = this.world.player;
    const regions = { r: [x + 10, y + 19, x + 35, y + 30], l: [x - 15, y + 19, x + 10, y + 30],
      d: [x + 4, y + 20, x + 16, y + 45], u: [x + 4, y + 8, x + 16, y + 25] };
    const [left, top, right, bottom] = regions[facing];
    const { item, object, sprite } = entry;
    const current = this.world.dataSource.sprites.get(object.MaskSprite ?? object.Sprite) ?? sprite;
    return right >= item.X + current.MarginLeft && left <= item.X + current.MarginRight
      && bottom >= item.Y + current.MarginTop && top <= item.Y + current.MarginBottom;
  }

  interact(entry) {
    const name = entry.item.ObjectName;
    const world = this.world;
    if (name === 'obj_plotswitch1' || name === 'obj_plotswitch2') {
      if (name === 'obj_plotswitch1' && world.plot <= 4) world.plot = 4.5;
      if (name === 'obj_plotswitch2' && world.plot <= 4.5) {
        world.plot = 5;
        this.locked = true;
        world.sound.play('snd_screenshake');
        const camera = world.cameras.main;
        const originalX = camera.scrollX;
        let offset = 4;
        this.shakeTimer = world.time.addEvent({ delay: 1000 / 30, callback: () => {
          camera.scrollX += offset;
          if (offset < 0) offset += 1;
          offset = -offset;
          if (offset === 0) {
            this.shakeTimer.remove();
            camera.scrollX = originalX;
            this.locked = false;
          } else this.shakeTimer.delay = 2 * 1000 / 30;
        }, loop: true });
      }
      this.syncSwitches();
      world.interactionCooldown = 250;
      return;
    }
    let key, portrait = false;
    if (/^obj_torinteractable[12]$/.test(name)) {
      key = `${name.endsWith('1') ? 'first' : 'second'}${this.talkedTo++ ? 'Repeat' : 'Help'}`;
      if (this.hardMode && key.startsWith('second')) key += 'Hard';
      portrait = 'spr_face_torieltalk';
    } else if (name === 'obj_readable_switch1') {
      key = world.plot >= 5 ? 'wrongAfter' : this.stage === 'second' ? (this.hardMode ? 'wrongSwitchHard' : 'wrongSwitch') : 'wrongWithoutToriel';
      if (this.stage === 'second' && world.plot < 5) portrait = 'spr_face_torieltalkside';
      if (key === 'wrongWithoutToriel') world.sound.play('snd_wrongvictory');
    } else key = { obj_readable_sign1: 'sign', obj_readable_room1: 'wallSign', obj_switchadvice1: 'firstAdvice', obj_switchadvice2: 'secondAdvice' }[name];
    world.showDialogue(this.text[key], { portrait });
  }

  destroy() {
    this.chain?.stop();
    this.shakeTimer?.remove();
  }
}
