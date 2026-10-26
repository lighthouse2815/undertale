// Chuyển obj_torieltrigger1, obj_floorswitch1 và obj_wallswitchcut1 sang JavaScript.
export class RuinsTutorial {
  constructor(world) {
    this.world = world;
    this.stage = world.plot > 2 ? 'complete' : 'waiting';
    this.gateOpen = world.plot > 2;
    this.locked = false;
    this.timers = [];
    this.npc = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_toroverworld3')?.image;
    this.gate = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_ruinsdoor1')?.image;
    this.switches = world.roomObjects.filter(({ item }) => item.ObjectName === 'obj_floorswitch1');
    this.wallSwitch = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_wallswitchcut1');
    this.trigger = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torieltrigger1');
    this.buster = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_toribuster');
  }

  // Collision gốc dùng bbox phần chân, cả với Frisk và Toriel.
  touches(actor, target, widthScale = 1) {
    const sprites = this.world.dataSource.sprites;
    const actorSprite = sprites.get(actor.texture.key.split(':')[0]);
    const object = this.world.dataSource.objects.get(target.ObjectName);
    const sprite = sprites.get(object.MaskSprite ?? object.Sprite);
    return actor.x + actorSprite.MarginRight >= target.X + sprite.MarginLeft * widthScale
      && actor.x + actorSprite.MarginLeft <= target.X + (sprite.MarginRight + 1) * widthScale - 1
      && actor.y + actorSprite.MarginBottom >= target.Y + sprite.MarginTop
      && actor.y + actorSprite.MarginTop <= target.Y + sprite.MarginBottom;
  }

  update() {
    const world = this.world;
    for (const entry of this.switches) {
      if (entry.on) continue;
      if (this.touches(world.player, entry.item) || (this.npc?.active && this.touches(this.npc, entry.item))) {
        entry.on = true;
        entry.image.setTexture('spr_groundswitch1:1');
        world.sound.play('snd_noise');
      }
    }
    if (this.stage === 'waiting' && this.touches(world.player, this.trigger, 50)) {
      this.stage = 'welcome'; this.locked = true;
      world.showDialogue(world.dataSource.tutorialDialogue.welcome, { portrait: true, onClose: () => this.demonstrate() });
    }
    if (this.stage === 'complete' && this.npc?.active && Math.abs(world.player.y - this.npc.y) < 50) {
      this.stage = 'leaving';
      this.walk('path_walkup', false, () => { this.npc.destroy(); });
    }
    if (this.stage === 'leaving' && this.npc?.active && this.touches(this.npc, this.buster)) {
      this.chain.stop(); this.npc.destroy();
    }
    return this.locked;
  }

  walk(name, absolute, onComplete) {
    const points = this.world.dataSource.paths.get(name).Points;
    const offsetX = absolute ? 0 : this.npc.x - points[0].X;
    const offsetY = absolute ? 0 : this.npc.y - points[0].Y;
    if (absolute) this.npc.setPosition(points[0].X, points[0].Y);
    this.chain = this.world.tweens.chain({
      targets: this.npc,
      tweens: points.slice(1).map((point, index) => {
        const previous = points[index];
        const dx = point.X - previous.X, dy = point.Y - previous.Y;
        const direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
        return { x: point.X + offsetX, y: point.Y + offsetY,
          duration: Math.hypot(dx, dy) / (90 * point.Speed / 100) * 1000,
          onStart: () => { this.direction = direction; },
          onUpdate: () => {
            this.npc.setTexture(`spr_toriel_${direction}:${Math.floor(this.world.time.now / (1000 / 6)) % 4}`);
            this.npc.setDepth(this.npc.y + 8);
          } };
      }),
      onComplete: () => { this.npc.setTexture(`spr_toriel_${this.direction}:0`); onComplete(); },
    });
  }

  demonstrate() {
    this.stage = 'demonstrating';
    this.walk('path_torielwalk2', true, () => {
      this.wallSwitch.on = true;
      this.wallSwitch.image.setTexture('spr_switch:1');
      this.world.sound.play('snd_noise');
      this.gateOpen = true;
      this.gate.destroy();
      this.npc.setTexture('spr_toriel_u:0');
      this.timers.push(this.world.time.delayedCall(20 * 1000 / 30, () => {
        this.stage = 'returning';
        this.walk('path_torielwalk2_2', true, () => { this.npc.setTexture('spr_toriel_d:0'); });
        this.timers.push(this.world.time.delayedCall(40 * 1000 / 30, () => {
          this.stage = 'explanation';
          this.world.showDialogue(this.world.dataSource.tutorialDialogue.explanation, { portrait: true, onClose: () => {
            this.world.plot = 3;
            this.stage = 'complete'; this.locked = false;
          } });
        }));
      }));
    });
  }

  destroy() {
    this.chain?.stop();
    for (const timer of this.timers) timer.remove();
  }
}
