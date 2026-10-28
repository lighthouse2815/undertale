import assert from 'node:assert/strict';

export async function testPapyrusBattle(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(75); };
  const start = async (flags = {}) => { await page.evaluate(async (flags) => { const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = 65; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = 0; w.weapon = 3; w.armor = 4; w.armorDefense = w.weaponStrength = 0; w.inventory = []; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('papyrus'); }, flags); await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.music); };
  await start();
  assert.deepEqual(await page.evaluate(() => { const s=__remake.scene; return [s.sys.settings.key,s.enemyHp,s.enemies[0].def,s.previousScene.flags[67],s.previousScene.flags[68],s.music.key,s.truefight]; }), ['PapyrusBattle',680,2,-1,1,'mus_papyrus',false]);
  await key('ArrowRight'); await key('z'); await key('z'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.message.text), /ATK 20 DEF 20/);
  await key('z'); assert.match(await page.evaluate(() => __remake.scene.message.text), /NYEH/);
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.wave.constructor.name), 'PapyrusBones');
  await page.evaluate(() => { const s=__remake.scene; s.scene.pause(); s.invFrames=9999; for(let i=0;i<140;i++)s.updateSoul(1000/30); });
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'menu');
  await page.evaluate(() => { const s=__remake.scene; s.scene.resume(); s.dummyTurn(); });
  assert.match(await page.evaluate(() => __remake.scene.message.text), /WON'T\s+FIGHT/); await key('z'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.wave.constructor.name), 'PapyrusBlueAttack');
  await page.evaluate(() => { const s=__remake.scene; s.scene.pause(); s.wave.timer=600; s.wave.alarms[0]=1; s.invFrames=0; s.soul.setPosition(120,170); for(let i=0;i<500 && s.mode==='soul';i++)s.updateSoul(1000/30); s.scene.resume(); });
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'pages'); assert.match(await page.evaluate(() => __remake.scene.message.text), /BLUE NOW/);
  await key('z'); await key('z'); await key('z');
  await page.evaluate(() => { const s=__remake.scene; s.scene.pause(); for(let i=0;i<4 && s.mode==='soul';i++)s.updateSoul(1000/30); s.scene.resume(); });
  assert.deepEqual(await page.evaluate(() => { const s=__remake.scene; return [s.mode,s.truefight,s.music.key,s.status]; }), ['menu',true,'mus_papyrusboss',"* You're blue now."]);
  await page.evaluate(() => { const s=__remake.scene; s.dummyTurn(); }); await key('z');
  assert.deepEqual(await page.evaluate(() => {const s=__remake.scene;return [s.wave.constructor.name,s.fighto,s.soulMovement];}), ['PapyrusBones',0,2]);
  await page.evaluate(() => { const s=__remake.scene; s.scene.pause(); for(const b of [...s.wave.bullets])s.wave.remove(b); s.invFrames=0; s.hp=1; s.soul.setPosition(150,176); s.wave.add(300,350); s.updateSoul(1000/30); s.scene.resume(); });
  assert.deepEqual(await page.evaluate(() => { const s=__remake.scene;return [s.hp,s.wave.constructor.name,s.previousScene.flags[67]];}),[1,'PapyrusCapture',-1]);
  await page.evaluate(() => {const s=__remake.scene; s.scene.pause(); for(let i=0;i<45 && s.mode==='soul';i++)s.updateSoul(1000/30); s.scene.resume();});
  assert.match(await page.evaluate(() => __remake.scene.message.text), /TOO WEAK/);
  for(let i=0;i<6;i++)await key('z');
  await page.evaluate(() => {const s=__remake.scene;s.scene.pause();for(let i=0;i<55 && __remake.phase==='battle';i++)s.updateSoul(1000/30);});
  assert.deepEqual(await page.evaluate(() => {const w=__remake.game.scene.getScene('World');return [__remake.phase,w.hp,w.flags[67]];}),['running',20,-1]);
  await start();
  await key('ArrowRight'); await key('z'); await key('z'); await key('ArrowRight'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.message.text), /FL-FLIRTING/); for(let i=0;i<3;i++)await key('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.kind,__remake.scene.previousScene.flags[66]]), ['flirtChoice',1]);
  await key('ArrowDown'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.message.text), /HUMILITY/); assert.equal(await page.evaluate(() => __remake.scene.heard),7);
  await page.evaluate(() => __remake.scene.finishBattle());
  await start({67:-1});
  assert.deepEqual(await page.evaluate(() => {const s=__remake.scene;return [s.truefight,s.previousScene.flags[67],s.music.key];}),[true,-2,'mus_papyrusboss']);
  await page.evaluate(() => {const s=__remake.scene;s.act('flirt');}); assert.match(await page.evaluate(() => __remake.scene.message.text), /busy FIGHTing/); await key('z'); await key('z');
  const loop = await page.evaluate(() => {const s=__remake.scene; s.wave?.destroy(); s.wave=null; s.mode='menu'; s.fighto=14; s.xfight=0; s.command=40; const random=Math.random; Math.random=()=>0; s.beginWave(); Math.random=random; return [s.fighto,s.xfight,s.wave.rolledTurn,s.wave.duration,s.wave.bullets[0].vx];});
  assert.deepEqual(loop, [14,1,2,240,4]);
  await page.evaluate(() => {const s=__remake.scene; s.wave.destroy(); s.wave=null; s.fighto=14; s.xfight=4; s.beginWave(); s.scene.pause(); for(let i=0;i<80 && s.mode==='soul';i++)s.updateSoul(1000/30); s.scene.resume();});
  for (const [stage, pages] of [[0,2],[1,1],[2,2],[3,2],[4,3]]) {
    await page.waitForFunction((stage) => __remake.scene.mode==='pages' && __remake.scene.wave?.stage===stage, stage);
    if (stage===3) { const x=await page.evaluate(() => __remake.scene.wave.dog.x); await page.waitForTimeout(150); assert.ok(await page.evaluate((x) => __remake.scene.wave.dog.x>x, x)); }
    for(let i=0;i<pages;i++)await key('z');
  }
  await page.waitForFunction(() => __remake.scene.mode==='menu');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.fighto,__remake.scene.xfight]),[15,0]);
  await page.evaluate(() => {const s=__remake.scene; s.wave?.destroy(); s.wave=null; s.mode='menu'; s.xfight=0; s.fighto=15; s.beginWave(); s.scene.pause(); s.invFrames=99999; for(let i=0;i<1300 && s.mode==='soul';i++)s.updateSoul(1000/30); s.scene.resume();});
  assert.match(await page.evaluate(() => __remake.scene.message.text), /HUFF/); for(let i=0;i<5;i++)await key('z');
  assert.deepEqual(await page.evaluate(() => {const s=__remake.scene; return [s.mode,s.spareable(),s.enemies[0].mercy,s.status,s.arena.x,s.arena.width];}), ['menu',true,8000,'* Papyrus is sparing you.',16,285]);
  await page.evaluate(() => {const s=__remake.scene; s.beginWave(); s.scene.pause(); s.invFrames=9999; for(let i=0;i<4;i++)s.updateSoul(1000/30); s.scene.resume();});
  assert.deepEqual(await page.evaluate(() => [__remake.scene.mode,__remake.scene.fighto,__remake.scene.status,__remake.scene.soul.texture.key.startsWith('spr_heartblue:')]), ['menu',16,'* Papyrus is sparing you.',true]);
  await page.evaluate(() => {__remake.scene.menuIndex=3;}); await key('z'); await key('z'); await page.waitForFunction(() => __remake.phase==='running');
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene;return [w.flags[67],w.plot,w.xp,w.kills];}), [0,100,0,0]);
  await start(); await page.evaluate(() => {const s=__remake.scene; localStorage.removeItem('undertale-remake-papyrus-kills'); s.enemies[0].hp=s.enemyHp=1; s.menuIndex=0; s.time.timeScale=10;});
  await key('z'); await key('z'); await page.evaluate(() => {const s=__remake.scene;s.attackX=156;s.attackSpeed=0;}); await key('z'); assert.match(await page.evaluate(() => __remake.scene.message.text), /\d/); await key('z');
  await page.waitForFunction(() => __remake.scene.mode==='pages' && /ALAS/.test(__remake.scene.message.text)); await key('z'); await page.waitForFunction(() => __remake.scene.dusts.some((d) => d.key==='body'));
  await page.waitForFunction(() => __remake.scene.mode==='pages' && /STILL HAVE/.test(__remake.scene.message.text)); await key('z'); await page.waitForFunction(() => __remake.scene.dusts.some((d) => d.key==='head')); await page.waitForFunction(() => __remake.phase==='running');
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene;const memory=localStorage.getItem('undertale-remake-papyrus-kills');localStorage.removeItem('undertale-remake-papyrus-kills');w.game.scene.getScene('PapyrusBattle').time.timeScale=1;return [w.flags[67],w.plot,w.xp,w.kills,memory];}), [1,100,200,1,'1']);
  await start({26:7});
  assert.deepEqual(await page.evaluate(() => {const s=__remake.scene;return [s.murder,s.enemies[0].def,s.previousScene.flags[290],s.spareable()];}), [true,-20000,1,true]);
  await page.evaluate(() => __remake.scene.act('check')); assert.match(await page.evaluate(() => __remake.scene.message.text), /ATK 3 DEF 3/); await key('z'); await page.evaluate(() => {const s=__remake.scene;s.scene.pause();s.beginWave();});
  assert.deepEqual(await page.evaluate(() => [__remake.scene.wave.constructor.name,__remake.scene.wave.duration]), ['PapyrusBones',2]); await page.evaluate(() => __remake.scene.finishBattle());
  await start(); assert.deepEqual(await page.evaluate(() => [__remake.scene.wave,__remake.scene.soulColor]), [null,null]); await page.evaluate(() => __remake.scene.act('check')); await key('z'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.wave.constructor.name), 'PapyrusBones'); await page.evaluate(() => __remake.scene.finishBattle());
  console.log('✓ Trận Papyrus: menu/Check-Flirt, đợt đầu/chuyển xanh/lượt tiếp theo, bị bắt/hồi HP, tha/giết và tuyến diệt chủng');
}
