// obj_maddummy: Check và Talk không tăng mercy; Talk ghi nhớ cờ 147.
export function madDummyAct(flags,action){
  if(action==='check')return ["* MAD DUMMY - ATK 30 DEF YES\n* Because they're a ghost,\n  physical attacks will fail."];
  if(action==='talk'){flags[147]=1;return ['* You talk to the DUMMY.\n* ...',"* It doesn't seem much for\n  conversation.",'* No one is happy with this.'];}
  throw new Error(`ACT Mad Dummy không hợp lệ: ${action}`);
}
