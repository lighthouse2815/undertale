// obj_sans_sleep, obj_snoozer và các chữ Z bay lên.
export class HotlandSleepingSans {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.particles = [];
    this.sans = world.roomObjects.find(entry => entry.item.ObjectName === 'obj_sans_sleep');
    if (this.sans && (world.plot > 121 || world.flags[67] === 1 || (world.flags[413] ?? 0) > 0)) {
      this.sans.image.destroy(); world.roomObjects = world.roomObjects.filter(entry => entry !== this.sans); this.sans = null;
    }
  }
  update(delta) {
    if (!this.sans) return;
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frame++;
      this.sans.image.setTexture(`spr_sans_sleep:${Math.floor(this.frame * .05) % 2}`);
      const phase = (this.frame - 11) % 100;
      if (this.frame >= 11 && (phase === 0 || phase === 20 || phase === 40)) {
        const previous = this.particles.at(-1);
        const speed = phase === 0 || !previous ? Math.random() - .5 : previous.speed;
        this.particles.push({ image: this.world.add.image(this.sans.item.X + 12.5, this.sans.item.Y - 1, 'spr_zzz:0').setOrigin(0).setDepth(this.sans.item.Y + 40).setAlpha(.2), age: 0, speed });
      }
      for (const particle of this.particles) {
        particle.age++; particle.image.y--; particle.image.x += particle.speed + Math.sin(particle.age / 8) * .5;
        particle.speed = Math.sign(particle.speed) * Math.max(0, Math.abs(particle.speed) - .01);
        particle.image.setTexture(`spr_zzz:${Math.min(2, Math.floor(particle.age * .1))}`);
        if (particle.age < 40) particle.image.alpha = Math.min(1, particle.image.alpha + .05);
        if (particle.age > 50) particle.image.alpha -= .05;
        if (particle.image.alpha <= 0) particle.image.destroy();
      }
      this.particles = this.particles.filter(particle => particle.image.active);
    }
  }
  destroy() { for (const particle of this.particles) particle.image.destroy(); this.particles = []; }
}
