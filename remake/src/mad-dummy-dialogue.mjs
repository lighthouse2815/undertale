import text from './mad-dummy-dialogue.json' with {type:'json'};
import {murderLevel} from './route.mjs';

// obj_dummytrigger: nhắc lại cách người chơi xử lý hình nộm trong Ruins.
export function madDummyIntro(flags){
  const outcome=flags[355]??0,cousin=flags[14]??0,violent=murderLevel(flags)>=9&&!flags[27];
  const start=(violent?279:222)+Math.min(2,Math.max(0,outcome));
  const branches={0:[229,230,231,232,233,234,235,236],1:[241,242,243,244,245,246,251,252,253],2:[257,258,259,260,261,262],3:[267,268,269,270,271,272,273,274]};
  const ids=violent?[start,282,283,284,285,286,287,288,289]:[start,225,226,...(branches[cousin]??[])];
  return ids.map(id=>text[id]);
}
export function madDummyAfter(flags){return ((flags[36]??0)===0?[354,355,356,357]:[344,345,346,347,348,349,350]).map(id=>text[id]);}

// obj_maddummy Alarm 10: phản ứng đầu tiên khi chính đạn của Dummy bắn trúng.
export function madDummyFirstHit(){return [
  'OWWWW, you\nDUMMIES!!',
  "Watch where you're\naiming your MAGIC\nattacks!",
  '...',
  'Hey!\nYou! Forget\nI said anything\nabout MAGIC!!!',
];}
