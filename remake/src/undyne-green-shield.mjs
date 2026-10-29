// Hướng của obj_spearblocker: trái=0, dưới=90, phải=180, trên=270.
export class UndyneGreenShield {
  constructor() { this.direction = 0; this.ideal = 270; this.flash = 0; }
  step(input) {
    if (input.down) this.ideal = 90;
    if (input.up) this.ideal = 270;
    if (input.left) this.ideal = 0;
    if (input.right) this.ideal = 180;
    let direction = this.direction;
    if (this.ideal === 0 && direction > 180) direction -= 360;
    if (this.ideal === 270 && direction >= 0 && direction < 90) direction = 360;
    const difference = this.ideal - direction;
    direction += difference * (2 / 3);
    this.direction = Math.abs(difference) < 15 ? this.ideal : (direction + 360) % 360;
    this.flash = Math.max(0, this.flash - 1);
    return this.direction;
  }
  block(site) {
    const side = [0, 180, 90, 270][site];
    if (side !== this.ideal) return false;
    this.direction = this.ideal; this.flash = 5; return true;
  }
}
