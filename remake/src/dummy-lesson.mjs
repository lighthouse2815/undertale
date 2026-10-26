import { inInteractionRange, touchesObject, walkNpc } from './npc.mjs';
import { createCollider } from './movement.mjs';

export class DummyLesson {
  constructor(world) {
    this.world = world;
    this.text = world.dataSource.dummyDialogue;
    this.stage = world.plot > 6 ? 'complete' : world.plot === 6 ? 'afterBattle' : world.plot === 5.5 ? 'practice' : 'intro';
    this.dummy = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_dummy1');
    this.toriel = world.roomObjects.find(({ item }) => item.ObjectName === 'obj_torinteractable4');
    this.buster = world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_toribuster');
    this.talkedTo = 0;
    this.locked = false;
    if (this.dummy) world.colliders.push(this.dummyBody = createCollider(world.dataSource, this.dummy.item));
    if (this.toriel) this.setTorielWaiting();
  }

  setTorielWaiting() {
    this.toriel.image.setTexture('spr_toriel_d:0');
    this.toriel.item = { ...this.toriel.item, X: this.toriel.image.x, Y: this.toriel.image.y };
    this.world.colliders.push(this.torielBody = createCollider(this.world.dataSource, this.toriel.item));
  }

  update() {
    const world = this.world;
    if (this.stage === 'intro' && world.plot === 5) {
      this.stage = 'lesson';
      const item = { ...world.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_torinteractable4'), X: 60, Y: 100 };
      const image = world.add.image(60, 100, 'spr_toriel_d:0').setOrigin(0).setDepth(108);
      this.toriel = { item, image, object: world.dataSource.objects.get(item.ObjectName) };
      this.toriel.sprite = world.dataSource.sprites.get(this.toriel.object.Sprite);
      world.showDialogue(this.text.lesson, { portrait: true, onClose: () => {
        this.stage = 'walking';
        this.chain = walkNpc(world, image, 'path_torielwalk4', { absolute: false, speed: 4, onComplete: () => {
          world.plot = 5.5; this.stage = 'practice'; this.setTorielWaiting();
        } });
      } });
      return true;
    }
    if (this.stage === 'afterBattle' && !this.locked) {
      const result = [10, 11, 12, 13].find((flag) => world.flags[flag] === 1);
      if (result) {
        this.locked = true;
        this.timer = world.time.delayedCall(15 * 1000 / 30, () => {
          this.stage = 'feedback';
          if (this.torielBody) this.torielBody.disabled = true;
          world.showDialogue(this.text[{ 10: 'talkFeedback', 11: 'fleeFeedback', 12: 'killFeedback', 13: 'boredFeedback' }[result]],
            { portrait: result === 11 ? 'spr_face_torielwhatside' : 'spr_face_torielhappytalk', onClose: () => {
              world.plot = 7; this.stage = 'leaving'; this.locked = false;
              this.chain = walkNpc(world, this.toriel.image, 'path_torielwalk4_2', { absolute: false,
                onComplete: () => { this.toriel.image.destroy(); this.stage = 'complete'; } });
            } });
        });
      } else return true;
    }
    if (this.stage === 'leaving' && this.toriel?.image.active && touchesObject(world, this.toriel.image, this.buster)) {
      this.chain.stop(); this.toriel.image.destroy(); this.stage = 'complete';
    }
    return this.locked;
  }

  interact() {
    const world = this.world;
    if (this.dummy?.image.active && world.plot < 6 && inInteractionRange(world, this.dummy)) {
      for (const flag of [10, 11, 12, 13]) world.flags[flag] = 0;
      world.plot = 6; this.stage = 'afterBattle';
      window.__remake.startBattle('dummy');
    } else if (this.stage === 'practice' && this.toriel?.image.active && inInteractionRange(world, this.toriel)) {
      world.showDialogue(this.text[this.talkedTo++ ? 'helpRepeat' : 'help'], { portrait: 'spr_face_torieltalk' });
    }
  }

  removeDummy() {
    this.dummy?.image.destroy();
    if (this.dummyBody) this.dummyBody.disabled = true;
  }

  destroy() { this.chain?.stop(); this.timer?.remove(); }
}
