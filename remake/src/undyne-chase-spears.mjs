// obj_uspeargen và obj_undynespear: mô phỏng ở tọa độ phòng, 30 Hz.
const radians = degrees => degrees * Math.PI / 180;
const aim = (x, y, targetX, targetY) => Math.atan2(y - targetY, targetX - x) * 180 / Math.PI;

export class UndyneChaseSpears {
  constructor(random = Math.random) { this.random = random; this.frame = 0; this.next = 10; this.amount = 0; this.spears = []; }
  create(x, y, player, room) {
    const random = this.random, rotationSpeed = 36 + Math.floor(random() * 9);
    const offset = -2 + random() * 4;
    const initialAim = aim(x, y, player.x + (room === 'room_water9' ? 300 : 7) + offset, player.y + 15);
    let rotation = initialAim - 12;
    for (let i = 0; i * 2 < rotationSpeed; i++) rotation -= rotationSpeed - i * 2;
    const direction = random() * 360;
    return { x, y, offset, rotationSpeed, rotation, direction, speed: 3.2, alpha: .2, state: 'windup', age: 0,
      launchAt: Math.floor(30 + random() * 4), contact: 0 };
  }
  step({ x, y, player, room = 'room_water8', moving = 0, interacting = false, touching = () => false, flags = {} }) {
    this.frame++; let volley = false, hit = false, sound = false;
    if (interacting) this.next++;
    if (this.frame >= this.next) {
      const originX = room === 'room_water9' ? -100 : x, originY = room === 'room_water9' ? (this.random() < .5 ? 240 : 0) : y;
      for (let i = 0; i < 3; i++) this.spears.push(this.create(originX - 5, originY + 5, player, room));
      if (this.amount < 35) { this.amount += .3; if (this.amount > 13) this.amount += .4; }
      else { sound = true; if (room === 'room_water8') flags[284] = 1; }
      this.next = this.frame + Math.max(1, Math.floor(48 - this.amount)); volley = true;
    }
    for (const spear of this.spears) {
      spear.age++;
      if (spear.state === 'windup' && spear.age >= spear.launchAt) {
        spear.direction = aim(spear.x, spear.y, player.x + (room === 'room_water9' ? 400 : 7) + spear.offset, player.y + 15);
        spear.rotation = spear.direction; spear.speed = 5; spear.state = 'flying';
      }
      if (spear.state === 'windup') {
        spear.rotation += spear.rotationSpeed;
        if (spear.rotationSpeed > 0) spear.rotationSpeed -= 2;
        else {
          spear.rotationSpeed = 0; const ideal = aim(spear.x, spear.y, player.x + 7 + spear.offset, player.y + 15);
          spear.rotation %= 360; let difference = spear.rotation - ideal;
          for (const [limit, change] of [[12, 4], [6, 2], [3, 1]]) { if (difference > limit) spear.rotation -= change; if (difference < -limit) spear.rotation += change; difference = spear.rotation - ideal; }
        }
        spear.speed = Math.max(0, spear.speed - .1);
      } else if (spear.state === 'flying') spear.speed += .3;
      if (spear.state !== 'fading') spear.alpha = Math.min(1, spear.alpha + .1);
      const angle = radians(spear.direction); spear.x += Math.cos(angle) * spear.speed + moving / 3; spear.y -= Math.sin(angle) * spear.speed;
      if (spear.state === 'flying') {
        spear.contact = touching(spear) ? spear.contact + 1 : 0;
        if (spear.contact === 2 && !interacting && spear.y > player.y + 15 - 60) hit = true;
      } else if (spear.state === 'fading') { spear.alpha -= .05; if (spear.alpha < .01) spear.dead = true; }
      if (spear.y > (player.roomHeight ?? 300) || spear.x > (player.roomWidth ?? 2100)) spear.state = 'fading';
    }
    if (hit) { this.spears = []; this.next += 20; flags[15] = 1; flags[16] = 1; flags[370] = 1; }
    else this.spears = this.spears.filter(spear => !spear.dead);
    return { volley, hit, sound };
  }
}
