import text from './shyren-dialogue.json' with { type:'json' };

// obj_shyren: phản ứng ACT và thông báo giữa các lượt.
export function shyrenAct(state, action, random=Math.random) {
  const count=state.encourage??0; let ids;
  if(action==='check') ids=[count===0?502:count===1?503:504];
  else if(action==='hum') {
    ids=count===0?[514+Math.floor(random()*3)]:count===1?[517,518]:count===2?[519]:count===3?[520,521]:count===4?[522,523,524]:[514+Math.floor(random()*3)];
    state.encourage=count+1;state.emotion=1;state.defense=-150;state.mercyModifier=140;
  } else if(action==='smile') {
    ids=count>1?[540,541]:state.creep?[539]:[537,538];state.creep=1;
  } else if(action==='conduct') ids=[count>1?551:550];
  else throw new Error(`ACT Shyren không hợp lệ: ${action}`);
  return ids.map(id=>text[id]);
}

export function shyrenStatus(command, flags, encourage, hp) {
  let id=command>=90?474:command>=70?473:command>=50?472:command>=25?471:470;
  if(hp<30)id=475;
  if(encourage===1)id=476;
  if(encourage===2)id=flags[67]===1?480:479;
  if(encourage===3)id=482;
  if(encourage===4)id=483;
  return encourage>4?' ':text[id];
}
