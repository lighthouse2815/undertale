// obj_hotland_rededge và obj_redpipev tại lối ra phòng thí nghiệm.
export class HotlandLabOutside {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.edges = []; this.pipes = [];
    for (const e of world.roomObjects.filter(e => ['obj_hotland_rededge','obj_redpipev'].includes(e.item.ObjectName))) {
      e.image.destroy(); const { X:x, Y:y, ScaleY:height } = e.item;
      if (e.item.ObjectName === 'obj_hotland_rededge') {
        for (let i = 0; i < height; i++) this.edges.push(world.add.image(x,y+i*40,`${i ? 'spr_hotland_rededge' : 'spr_hotland_rededge_top'}:0`).setOrigin(0).setDepth(-700000));
      } else {
        const pieces = [['spr_redpipe_top',y],['spr_redpipe_bottom',y+16+(height-1)*19],...Array.from({length:height},(_,i)=>['spr_redpipe_middle',y+1+i*19])];
        for (const [key,py] of pieces) this.pipes.push({ key, image: world.add.image(x,py,`${key}:0`).setOrigin(0).setDepth(-700000) });
      }
    }
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frame++;
      for (const image of this.edges) image.setAlpha(Math.abs(Math.sin(this.frame / 16)));
      for (const { key,image } of this.pipes) image.setTexture(`${key}:${Math.floor(this.frame / 4) % this.world.dataSource.sprites.get(key).TextureCount}`);
    }
  }
  destroy() { for (const image of this.edges) image.destroy(); for (const { image } of this.pipes) image.destroy(); }
}
