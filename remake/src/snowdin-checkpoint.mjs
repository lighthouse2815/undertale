import { createCollider } from './movement.mjs';
import { inInteractionRange, touchesObject } from './npc.mjs';
import { startSnowdinMusic, stopSnowdinMusic } from './snowdin-start.mjs';
import { murderLevel } from './route.mjs';

// obj_papyrus1 ở room_tundra4, trạm gác/camera và cuộc gọi fun40–50.
export class SnowdinCheckpoint {
  constructor(world) {
    this.world = world; this.text = world.dataSource.checkpointDialogue; this.elapsed = 0; this.frames = 0;
    this.stage = world.plot >= 39 ? 'done' : 'waiting'; this.locked = false;
    this.murder = murderLevel(world.flags) >= 2 && !world.flags[27];
    this.trigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_papyrus1');
    if (this.stage === 'waiting') {
      this.sans = world.add.image(240, 110, 'spr_sans_d:0').setOrigin(0);
      this.pap = world.add.image(240, 130, 'spr_papyrus_ut:0').setOrigin(0);
      this.pose(this.sans, 'spr_sans_d'); this.pose(this.pap, 'spr_papyrus_ut');
    }
    this.checkpoint = world.roomObjects.find((e) => e.item.ObjectName === 'obj_papcheckpoint');
    world.colliders.push(createCollider(world.dataSource, this.checkpoint.item));
    this.checkpoint.image.setDepth(this.checkpoint.item.Y + this.checkpoint.sprite.Height);
    this.createFamily();
    Object.assign(this, startSnowdinMusic(world));
    const fun = world.flags[5] ?? 0;
    this.phoneType = world.flags[7] || world.flags[277] || world.plot >= 120 ? 0 : fun >= 40 && fun <= 45 ? 1 : fun > 45 && fun <= 50 ? 2 : 0;
    this.phoneTrigger = world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_otherphonecall');
  }

  createFamily() {
    const world = this.world;
    this.child = world.roomObjects.find((e) => e.item.ObjectName === 'obj_snowdrakenpc'); this.childTalked = 0;
    if (world.plot <= 100 || world.flags[203]) {
      this.child.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.child); this.child = null; return;
    }
    this.child.image.setDepth(this.child.item.Y + this.child.sprite.Height);
    world.colliders.push(createCollider(world.dataSource, this.child.item));
    if (world.flags[7] !== 1) return;
    for (const [name, spriteName, dx, dy] of [['obj_npc_room', 'spr_amalgam_fridgenpc', 40, -8], ['obj_snowdrakedad', 'spr_snowdrakedad', 100, 0]]) {
      if (name === 'obj_snowdrakedad' && murderLevel(world.flags) >= 12) continue;
      const object = { ...world.dataSource.objects.get(name), Sprite: spriteName }; world.dataSource.objects.set(name, object);
      const sprite = world.dataSource.sprites.get(spriteName), item = { ObjectName: name, X: this.child.item.X + dx, Y: this.child.item.Y + dy, ScaleX: 1, ScaleY: 1 };
      const image = world.add.image(item.X, item.Y, `${spriteName}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(item.Y + sprite.Height);
      world.roomObjects.push({ item, object, sprite, image }); world.colliders.push(createCollider(world.dataSource, item));
    }
  }

  show(key, next) {
    const world = this.world, pages = this.text[key]; this.stage = 'talking';
    world.showDialogue(pages.map((p) => p.text), { portrait: pages[0].portrait,
      onPage: (index) => {
        const page = pages[index]; world.setDialoguePortrait(page.portrait);
        world.dialogueText.setFont(page.font, page.font === 'fnt_papyrus' ? 8 : page.font === 'fnt_comicsans' ? 10 : 12);
      }, onClose: next });
  }

  wait(stage, duration) { this.stage = stage; this.frames = 0; this.duration = duration; }
  pose(actor, sprite) { actor.setTexture(`${sprite}:0`).setDepth(actor.y + actor.height); }
  alert() { this.icon?.destroy(); this.icon = this.world.add.image(this.pap.x + 3, this.pap.y - 12, 'spr_exc:0').setOrigin(0).setDepth(10000); this.iconFrames = 30; }

  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }

  step() {
    const world = this.world, camera = world.cameras.main; this.frames++;
    if (this.iconFrames && --this.iconFrames === 0) this.icon?.destroy();
    if (this.fadeOut && !this.music.pendingRemove) this.music.setVolume(Math.max(0, this.music.volume - this.fadeOut));
    for (const [actor, speed, sprite] of [[this.pap, this.papSpeed, 'spr_papyrus_r'], [this.sans, this.sansSpeed, 'spr_sans_r']]) {
      if (!actor?.active || !speed) continue;
      actor.x += speed; actor.setTexture(`${sprite}:${Math.floor(this.frames * .2) % this.text.sprites[sprite]}`);
    }
    switch (this.stage) {
      case 'turnWait':
        if (this.frames >= this.duration) { this.look = 0; this.spin = 0; this.turn(); }
        break;
      case 'turning':
        if (this.frames >= this.duration) this.turn();
        break;
      case 'panWait':
        if (this.frames >= this.duration) this.wait('panLeft', 0);
        break;
      case 'panLeft':
        camera.setScroll(Math.max(-40, camera.scrollX - 1), camera.scrollY);
        if (camera.scrollX <= -40) this.wait('rockWait', 30);
        break;
      case 'rockWait':
        if (this.frames >= this.duration) {
          this.pose(this.sans, 'spr_sans_d');
          this.show(this.murder ? 'rockMurder' : this.met > 0 ? 'rockAgain' : 'rock', () => this.wait('panBack', 0));
        }
        break;
      case 'panBack':
        camera.setScroll(Math.min(0, camera.scrollX + 4), camera.scrollY);
        if (camera.scrollX >= 0) {
          this.pose(this.pap, 'spr_papyrus_ut');
          this.show(this.murder ? 'ohMurder' : 'oh', () => {
            camera.useBounds = true; world.updateCamera(); this.pose(this.sans, 'spr_sans_l');
            this.show('front', () => {
              this.alert(); this.pose(this.sans, 'spr_sans_d'); this.pose(this.pap, 'spr_papyrus_lt'); this.wait('surpriseWait', 30);
            });
          });
        }
        break;
      case 'surpriseWait':
        if (this.frames >= this.duration) this.show('surprise', () => {
          this.pose(this.pap, 'spr_papyrus_ut');
          this.show(this.murder ? 'humanMurder' : 'human', () => {
            this.show(this.murder ? 'yesMurder' : 'yes', () => {
              this.pose(this.sans, 'spr_sans_l'); this.pose(this.pap, 'spr_papyrus_lt');
              this.show(this.murder ? 'planMurder' : 'plan', () => {
                this.pose(this.sans, 'spr_sans_d'); this.pose(this.pap, 'spr_papyrus_r'); this.papSpeed = 5;
                this.show('laugh', () => {
                  this.fadeOut = .04; this.pose(this.sans, 'spr_sans_l');
                  this.show(murderLevel(world.flags) >= 2 ? 'byeMurder' : 'bye', () => {
                    this.pose(this.sans, 'spr_sans_r'); this.sansSpeed = 3; this.wait('leaving', 30);
                  });
                });
              });
            });
          });
        });
        break;
      case 'leaving':
        if (this.frames >= this.duration) {
          this.setMusic('mus_snowy', this.murder ? .4 : .95);
          world.plot = 40; this.locked = false; this.stage = 'done'; this.sans.destroy(); this.pap.destroy(); world.saveGame(true);
          world.release(); world.confirmPressed = false; world.menuPressed = false;
        }
        break;
      case 'phoneWait':
        if (this.frames >= this.duration) {
          this.music.pause(); world.sound.play('snd_phone');
          this.show('phoneRing', () => {
            if (this.phoneType === 2) this.show('phoneAlphys', () => this.finishPhone());
            else this.show('phoneGaster', () => {
              world.showChoice(this.text.phoneQuestion[0].text, ['yes', 'no'], (choice) => this.show(choice === 0 ? 'phoneYes' : 'phoneNo', () => this.finishPhone()));
              world.dialogueText.setFont('fnt_comicsans', 10);
            });
          });
        }
        break;
    }
  }

  turn() {
    const n = this.look;
    if (n === 27) {
      this.met = Number(localStorage.getItem('undertale-remake-papyrus-meetings') ?? 0);
      localStorage.setItem('undertale-remake-papyrus-meetings', String(this.met + 1));
      this.show(this.murder ? 'noticeMurder' : this.met > 0 ? 'noticeAgain' : 'notice', () => {
        this.pose(this.sans, 'spr_sans_l'); this.pose(this.pap, 'spr_papyrus_l');
        this.world.cameras.main.useBounds = false; this.wait('panWait', 30);
      }); return;
    }
    let delay;
    if (n < 23) {
      this.pose(this.pap, n % 2 ? 'spr_papyrus_l' : 'spr_papyrus_u');
      this.pose(this.sans, n % 2 ? 'spr_sans_d' : 'spr_sans_l');
      delay = [30, 30, 24, 24, 16, 16, 12, 12, 10, 7, 6, 5, 4, 3][n] ?? 2; this.look++;
    } else if (n === 23) {
      this.pose(this.pap, this.pap.texture.key === 'spr_papyrus_l:0' ? 'spr_papyrus_u' : 'spr_papyrus_l');
      this.pose(this.sans, this.sans.texture.key === 'spr_sans_l:0' ? 'spr_sans_d' : 'spr_sans_l');
      delay = 2; if (++this.spin > 5) { this.spin = 0; this.look++; }
    } else if (n === 24) {
      this.pose(this.pap, `spr_papyrus_${['d', 'r', 'u', 'l'][Math.floor(Math.random() * 4)]}`);
      this.pose(this.sans, `spr_sans_${['d', 'r', 'u', 'l'][Math.floor(Math.random() * 4)]}`);
      delay = 1; if (++this.spin > 37) this.look++;
    } else {
      this.pose(this.pap, n === 25 ? 'spr_papyrus_l' : 'spr_papyrus_rt');
      this.pose(this.sans, n === 25 ? 'spr_sans_l' : 'spr_sans_r'); delay = n === 25 ? 50 : 30; this.look++;
    }
    this.wait('turning', delay);
  }

  setMusic(key, rate = 1, volume = 1) {
    stopSnowdinMusic(this.world); this.fadeOut = 0;
    this.music = this.world.snowdinMusic = this.world.sound.add(key, { loop: true, rate, volume }); this.music.play();
  }

  finishPhone() {
    this.show('phoneClick', () => {
      this.music.resume(); this.world.flags[277] = 1; this.phoneType = 0; this.locked = false; this.stage = this.phoneReturn;
      this.world.release(); this.world.confirmPressed = false;
    });
  }

  checkTrigger() {
    const world = this.world;
    if (this.locked || world.dialogue) return false;
    if (this.stage === 'waiting' && touchesObject(world, world.player, this.trigger, 1, 999)) {
      this.locked = true; this.fadeOut = .5; world.release();
      this.show(this.murder ? 'introMurder' : 'intro', () => {
        this.setMusic('mus_papyrus', 1, .6); this.pose(this.pap, 'spr_papyrus_l'); this.alert(); this.wait('turnWait', 50);
      }); return true;
    }
    if (this.phoneType && touchesObject(world, world.player, this.phoneTrigger)) {
      this.locked = true; this.phoneReturn = this.stage; world.release(); world.sound.play('snd_phone'); this.wait('phoneWait', 30); return true;
    }
    return false;
  }

  interact() {
    const world = this.world;
    const entry = world.roomObjects.find((e) => ['obj_papcheckpoint', 'obj_readable_room3', 'obj_snowdrakenpc', 'obj_npc_room', 'obj_snowdrakedad'].includes(e.item.ObjectName)
      && inInteractionRange(world, { ...e, item: { ...e.item, X: e.item.X - e.sprite.OriginX, Y: e.item.Y - e.sprite.OriginY } }));
    if (!entry) return false;
    const name = entry.item.ObjectName;
    let key = name === 'obj_papcheckpoint' ? world.flags[7] === 1 ? 'checkpointEnd' : 'checkpoint' : 'camera';
    if (name === 'obj_snowdrakenpc') { key = world.flags[7] === 1 ? 'snowdrakeEnd' : this.childTalked ? 'snowdrakeAgain' : 'snowdrake'; this.childTalked++; }
    if (name === 'obj_npc_room') key = 'mother';
    if (name === 'obj_snowdrakedad') key = world.flags[57] === 2 ? 'fatherLost' : world.flags[425] === 1 ? 'fatherJob' : 'father';
    this.show(key, () => { this.stage = world.plot >= 39 ? 'done' : 'waiting'; });
    return true;
  }

  destroy() {
    this.icon?.destroy(); this.world.cameras.main.useBounds = true;
    if (this.music === this.world.snowdinMusic && this.music?.isPaused) this.music.resume();
  }
}
