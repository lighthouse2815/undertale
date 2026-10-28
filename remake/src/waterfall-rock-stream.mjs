import { murderLevel } from './route.mjs';

// obj_waterpushrockgen và hai loại đá tại room_water3.
export class WaterfallRockStream {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.rateTime = 90; this.alarm = murderLevel(world.flags) >= 8 && !world.flags[27] ? Infinity : 15;
    this.rocks = []; this.falling = false;
  }
  update(delta, paused = false) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(paused); }
    return this.falling;
  }
  spawn() {
    for (const [x, y] of [[235,-20],[325,-20],[255,-260],[345,-260],[235,-440],[255,-460],[325,-480],[345,-500]]) {
      this.rocks.push({ x, y, trail: false, age: 0, alpha: 1, image: this.world.add.image(x, y, 'spr_waterpushrock:0').setOrigin(0) });
    }
  }
  checkTrigger() {
    const w = this.world, p = w.player;
    if (this.falling || p.x + 19 < 220 || p.x > 380 || p.y + 29 < 180 || p.y + 19 > 260) return false;
    if (w.dialogue) { w.dialogueBox.destroy(); w.dialogueText.destroy(); w.dialoguePortrait?.destroy(); w.choiceUi.forEach((e) => e.destroy()); w.choiceUi = []; w.dialogue = null; }
    this.falling = true; p.setAlpha(.5); w.sound.play('snd_fall2'); w.release(); return true;
  }
  step(paused = false) {
    const w = this.world, p = w.player; this.frames++; let pushed = false;
    if (!paused) {
      this.rateTime++; this.alarm--;
      if (this.alarm <= 0) { if (this.rateTime > 85) { this.spawn(); this.rateTime = 0; this.alarm = 90; } else this.alarm = 5; }
    }
    for (const rock of this.rocks) {
      if (rock.trail) {
        rock.y += 7; rock.age++; if (rock.age > 17) rock.alpha = Math.max(0, rock.alpha - .1);
      } else if (!paused) {
        const speed = rock.y > 60 ? 4 : 8;
        if (!pushed && p.x + 19 >= rock.x + 2 && p.x <= rock.x + 18 && p.y + 29 >= rock.y + 21 && p.y + 19 <= rock.y + 21 + speed) {
          p.y += speed; if (w.keys.up.isDown || [...w.touch.values()].some((t) => t.direction === 'up')) p.y += 3;
          if ((w.keys.down.isDown || [...w.touch.values()].some((t) => t.direction === 'down')) && speed > 3) p.y -= 3;
          p.x = Math.round(p.x); p.y = Math.round(p.y); pushed = true;
        }
        rock.y += speed;
        if (rock.y > 180) { rock.trail = true; rock.age = 0; }
      }
      rock.image.setPosition(rock.x, rock.y).setAlpha(rock.alpha).setDepth(rock.trail ? -200 : rock.y + 20);
      if (!rock.alpha) rock.image.destroy();
    }
    this.rocks = this.rocks.filter((rock) => rock.image.active);
    if (!paused && !this.falling) this.checkTrigger();
    if (this.falling && !paused) {
      p.y += 6; w.updateCamera();
      if (p.y > 283) { p.setAlpha(1); p.x = Math.round(p.x); p.y = Math.round(p.y); this.falling = false; w.release(); }
    }
  }
  destroy() { this.rocks.forEach((rock) => rock.image.destroy()); }
}
