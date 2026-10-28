import assert from 'node:assert/strict';
import { grillbyNpcDialogue as dialogue } from '../remake/src/grillby-npc-dialogue.mjs';

export async function testGrillbyNpcDialogue() {
  const names=['grillbynpc_hotandbothered','grillbynpc_foodmonster','grillbynpc_lesserdog','grillbynpc_womandog','grillbynpc_mandog','grillbynpc_doggo','grillbynpc_grillby','grillbynpc_hot2','townnpc_weirdfish','townnpc_hatescity'];
  for(const name of names) for(const flags of [{},{7:1},{67:1},{52:1,53:1,54:1},{350:1},{7:1,67:1,52:1,53:1,54:1,350:1}]) for(const plot of [101,122,123]) for(const talked of [0,1]) for(const sansmode of [false,true]) {
    const pages=dialogue(name,flags,plot,talked,sansmode); assert.ok(pages.length && pages.every(p=>typeof p==='string' && p.length),`${name} thiếu lời`);
  }
  assert.notDeepEqual(dialogue('grillbynpc_foodmonster',{},101,0,false),dialogue('grillbynpc_foodmonster',{},101,1,false));
  assert.deepEqual(dialogue('grillbynpc_hot2',{7:1,67:1,350:1},101,0,true),dialogue('grillbynpc_hot2',{350:1},101,0,false));
  assert.deepEqual(dialogue('grillbynpc_grillby',{7:1},101,0,true),dialogue('grillbynpc_grillby',{},101,0,true));
  console.log('✓ Lời khách Grillby: mười NPC, lượt lặp và thứ tự ưu tiên cờ/plot/Sans');
}
