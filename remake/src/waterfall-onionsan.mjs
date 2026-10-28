import { murderLevel } from './route.mjs';
import { startWaterfallMusic } from './waterfall-music.mjs';
import text from './waterfall-onionsan.json' with { type:'json' };

const faces=['spr_onionsan_kawaii','spr_onionsan_yhear','spr_onionsan_wistful','spr_onionsan_disappoint'];
const tentSprites=['spr_oniont_l','spr_oniont_r','spr_oniont_coyl','spr_oniont_coyd','spr_oniont_bye'];

export class WaterfallOnionsan {
  constructor(world) {
    this.world=world; this.elapsed=0; this.frames=0; this.stage='walking'; this.timer=0; this.tents=[]; this.once=false;
    if(murderLevel(world.flags)>=8)world.flags[496]=-1;
    world.flags[20]=0; this.head={x:100,y:62,on:0,height:0,alpha:0,follow:false,speed:0};
    this.head.blue=world.add.image(100,62,'spr_onionblue:0').setDepth(-950000).setVisible(false);
    this.head.image=world.add.image(0,0,'spr_onionsan_kawaii:0').setOrigin(0).setDepth(-950000).setVisible(false);
    this.addTent(140,62,4,2,false);
    if((world.flags[496]??0)>=1 && world.flags[496]<=7) {this.head.on=2;this.head.follow=true;}
    startWaterfallMusic(world,true);
  }
  addTent(x,y,type,on,follow,special=false) {
    const w=this.world, t={x,y,type,on,follow,special,height:0,alpha:0,speed:0};
    t.blue=w.add.image(x,y,'spr_oniontblue:0').setDepth(-900000).setVisible(false);
    t.image=w.add.image(0,0,`${tentSprites[type]}:0`).setOrigin(0).setDepth(-900000).setVisible(false);
    this.tents.push(t);return t;
  }
  show(ids,onClose,onPage) {
    const w=this.world,pages=ids.map(id=>text[id]);this.stage='talking';w.release();
    w.showDialogue(pages.map(p=>p.text),{onPage:i=>{if(pages[i].face!==null)w.flags[20]=pages[i].face;onPage?.(i);},onClose});
  }
  showEvent(ids,onClose,onPage) { this.show(ids.map(i=>`obj_onionsan_event_${i}`),onClose,onPage); }
  update(delta) {
    this.elapsed=Math.min(200,this.elapsed+delta);
    while(this.elapsed>=1000/30){this.elapsed-=1000/30;this.step();}
    return this.stage!=='walking';
  }
  step() {
    const w=this.world,p=w.player,f=w.flags;this.frames++;this.drawActors();
    if(this.stage==='introWait' && --this.timer<=0) {
      for(const t of this.tents){t.image.destroy();t.blue.destroy();}this.tents=[];
      this.head.x=p.x+10;this.head.follow=false;this.head.on=1;this.addTent(this.head.x-32,62,2,1,false,true);this.addTent(this.head.x+8,82,3,1,false,true);
      this.stage='blueWait';this.timer=50;
    } else if(this.stage==='blueWait' && --this.timer<=0) {this.head.on=2;for(const t of this.tents)t.on=2;this.stage='riseWait';this.timer=150;}
    else if(this.stage==='riseWait' && --this.timer<=0) this.showEvent([181,182],()=>{this.head.follow=true;this.head.on=2;this.stage='walking';},i=>{if(i===1)for(const t of this.tents)t.on=4;});
    else if(this.stage==='rejectWait' && --this.timer<=0){this.head.on=4;for(const t of this.tents)t.on=4;this.stage='rejectSink';this.timer=120;}
    else if(this.stage==='rejectSink' && --this.timer<=0){this.stage='walking';w.release();}
    if(this.stage!=='walking'||w.dialogue)return;
    if((f[496]??0)===0) {
      if(p.x>100&&!this.tent1){this.tent1=this.addTent(p.x,70,0,2,true);w.sound.play('snd_splash');}
      if(p.x>210&&!this.tent2){this.tent2=this.addTent(p.x,220,1,2,true);w.sound.play('snd_splash');}
      if(p.x>420&&this.tent2){f[496]=1;for(const t of [this.tent1,this.tent2])t.on=4;w.sound.play('snd_splash');w.release();this.stage='introWait';this.timer=90;return;}
    }
    const groups={1:[550,[211,212]],2:[700,[224,225,226,227,228]],3:[850,[241,242,243]],4:[1000,[256,257,258]]},group=groups[f[496]];
    if(group&&p.x>group[0]) {f[496]++;this.showEvent(group[1],()=>{this.stage='walking';},i=>{if(f[496]===5&&i===2){this.head.on=4;this.head.follow=false;for(const t of this.tents)t.on=4;}});return;}
    if(p.x>600&&p.x<640&&this.head.on!==0&&this.head.on!==4&&!this.once) {
      if(f[496]===5){f[496]=6;this.once=true;this.show([5455,5456,5457,5458,5459,5460,5461].map(i=>`SCR_TEXT_${i}`),()=>w.showChoice(' ',['Yeah','No'],choice=>{if(choice===0)this.show(['SCR_TEXT_5471'],()=>{this.stage='walking';});else{f[496]=-1;this.stage='rejectWait';this.timer=60;}}));}
      else if(f[496]===6){this.once=true;if(f[7]===1){f[496]=7;this.showEvent([317,318,319,320],()=>{this.stage='walking';});}else this.showEvent([312,313,314],()=>{this.stage='walking';});}
      else if(f[496]===7){this.once=true;this.showEvent([337],()=>{this.stage='walking';});}
    }
  }
  drawActors() {
    const w=this.world,p=w.player,h=this.head;
    if(h.follow){if(h.x<p.x-4){h.speed+=.17;h.x++;}if(h.x>p.x+6){h.speed-=.17;h.x--;}h.speed*=.9;h.x=Math.max(162,Math.min(1048,Math.floor(h.x+h.speed)));}
    if(h.on>=1&&h.on<=3)h.alpha=Math.min(1,h.alpha+.05);
    if(h.on===2||h.on===3)h.height=Math.min(62,h.height+.5);
    if(h.on===4){if(h.height>0)h.height=Math.max(0,h.height-.5);else h.alpha=Math.max(0,h.alpha-.05);}
    const wave=Math.sin(this.frames/4)*.05;h.blue.setPosition(h.x,h.y).setScale(.1+h.alpha+wave,h.alpha+wave).setAlpha(h.alpha).setVisible(h.alpha>0);
    const key=faces[w.flags[20]]??faces[0],sprite=w.dataSource.sprites.get(key),height=Math.floor(h.height);
    h.image.setTexture(`${key}:${Math.floor(this.frames/6)%sprite.TextureCount}`).setPosition(h.x-32,h.y-height).setCrop(0,0,63,height).setVisible(height>0);
    for(const t of this.tents){
      if(t.follow){if(t.x<p.x+6)t.speed+=.17;if(t.x>p.x+16)t.speed-=.17;t.speed*=.9;t.x=Math.max(162,Math.min(1048,Math.floor(t.x+t.speed)));}
      if(t.on>=1&&t.on<=3)t.alpha=Math.min(1,t.alpha+.1);
      const key=tentSprites[t.type],s=w.dataSource.sprites.get(key);
      if(t.on===2||t.on===3)t.height=Math.min(s.Height,t.height+(t.special ? .25 : 1));
      if(t.on===4){if(t.height>0)t.height=Math.max(0,t.height-1);else t.alpha=Math.max(0,t.alpha-.1);}
      const offset=t.type===3?22:t.type===4?6:Math.floor(s.Width/2),height=Math.floor(t.height);
      t.blue.setPosition(t.x,t.y).setScale(.1+t.alpha+wave,t.alpha+wave).setAlpha(t.alpha).setVisible(t.alpha>0);
      t.image.setTexture(`${key}:${Math.floor(this.frames/6)%s.TextureCount}`).setPosition(t.x-offset,t.y-height).setCrop(0,0,s.Width,height).setVisible(height>0);
    }
  }
  destroy(){this.head.blue.destroy();this.head.image.destroy();for(const t of this.tents){t.blue.destroy();t.image.destroy();}}
}
