import { createCollider } from './movement.mjs';
import { inInteractionRange } from './npc.mjs';

const entries=[
  ['* Dear Diary:\n* Shyren\'s sister "fell down"\n  recently.',"* It's sad.\n* Without her sister to\n  speak for her...","* She's become more\n  reclusive than ever.",'* So I reached out to her,\n  and told her...','* That she, Blooky, and I\n  should all perform together\n  sometime.','* She seemed to like\n  that idea.'],
  ['* Dearer Diary:\n* I like to buy a new diary\n  for every entry I make.','* I love to collect diaries.'],
  ['* Dearest Diary:\n* Our cousin left the farm\n  to become a training dummy.','* That leaves just Blooky\n  and I.','* Blooky asked me if I was\n  going to try to become\n  corporeal, too.','* They sounded so...\n* Resigned...','* Come on, Blooky.\n* You know I\'d never leave\n  you behind.','* And besides...',"* I'd never find the kind\n  of body I'm looking for,\n  anyway."],
  ['* My Darling Diary:\n* I met someone...\n* Interesting today.','* Last week I posted that\n  advertisement for my\n  Human Fanclub.','* Today was our first meeting.','* Only one other person came.',"* Honestly, she's a dork.\n* And she's obsessed with\n  these awful cartoons.","* But she's kind of funny,\n  too...",'* I want to see her again.'],
  ['* Diary... My dear:\n* My diary collection is\n  going fabulously.','* I have like five now.'],
  ['* Dear Diary:\n* She surpised me with\n  something today.','* Sketches of a body that\n  she wants to create for\n  me...','* A form beyond my wildest\n  fantasies.','* In a form like that, I\n  could finally feel\n  like... "myself."',"* After all, there's no\n  way I can be a star\n  the way I am now.","* Sorry, Blooky.\n* My dreams can't wait\n  for anyone..."]
];

export class WaterfallBlookDiary {
  constructor(world){this.world=world;this.books=world.roomObjects.filter(e=>e.item.ObjectName==='obj_blookdiary').sort((a,b)=>a.item.X-b.item.X);for(const e of this.books)world.colliders.push(createCollider(world.dataSource,e.item));}
  interact(){const book=this.books.find(e=>inInteractionRange(this.world,e));if(!book)return false;this.world.showDialogue(entries[this.books.indexOf(book)]);return true;}
}
