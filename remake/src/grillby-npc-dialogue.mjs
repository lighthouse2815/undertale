import data from './grillby-npc-dialogue.json' with { type: 'json' };

// Thứ tự ghi đè của Alarm 0 quyết định lời khi nhiều điều kiện cùng đúng.
export function grillbyNpcDialogue(name, flags, plot, talked, sansmode) {
  const f = flags, dead = f[52] === 1 && f[53] === 1 && f[54] === 1, end = f[7] === 1, pap = f[67] === 1;
  let ids;
  switch (name) {
    case 'grillbynpc_hotandbothered':
      ids = talked ? [75] : [73,74]; if (plot >= 122) ids = [79,80]; if (sansmode) ids = [84,85]; if (dead) ids = [90,91]; if (end) ids = [98,99,100]; if (pap) ids = [105,106]; break;
    case 'grillbynpc_foodmonster':
      ids = talked ? [80] : [73,74,75,76,77]; if (plot >= 122) ids = talked ? [90,91] : [84,85,86,87]; if (pap) ids = talked ? [104] : [97,98,99,100,101,102]; if (end) ids = [109,110]; if (sansmode) ids = [115,116]; break;
    case 'grillbynpc_lesserdog':
      ids = [71,72]; if (plot > 122) ids = [76]; if (end) ids = [81]; break;
    case 'grillbynpc_womandog':
      ids = [76,77,78]; if (pap) ids = [81]; if (plot >= 122) ids = [86,87]; if (sansmode) ids = [92,93]; if (f[52] === 1) ids = [97]; if (f[52] === 1 && f[54] === 1) ids = [99]; if (end) ids = [105,106]; break;
    case 'grillbynpc_mandog':
      ids = [75,76]; if (pap) ids = [80]; if (plot >= 122) ids = [85,86]; if (sansmode) ids = [91,92]; if (f[54] === 1) ids = [96]; if (f[52] === 1 && f[54] === 1) ids = [98]; if (end) ids = [103,104,105,106]; break;
    case 'grillbynpc_doggo':
      ids = [74,75]; if (plot >= 122) ids = [79,80,81]; if (pap) ids = [86]; if (f[350] === 1) ids = [91]; if (sansmode) ids = [96,97]; if (f[53] === 1) ids = [101,102]; if (f[53] === 1 && f[54] === 1) ids = [104,105,106]; if (end) ids = [110,111]; break;
    case 'grillbynpc_grillby':
      ids = [73,74]; if (end) ids = [78]; if (sansmode) ids = [83,84]; break;
    case 'grillbynpc_hot2':
      ids = talked ? [77] : [73,74,75]; if (sansmode) ids = [81,82]; if (plot >= 122) ids = [87]; if (dead) ids = [92,93,94]; if (end) ids = [101,102,103]; if (pap) ids = [109,110]; if (f[350] === 1) ids = [115,116]; break;
    case 'townnpc_weirdfish':
      ids = talked ? [76] : [72,73,74,75]; if (plot >= 122) ids = [80]; if (sansmode) ids = [85,86]; if (pap) ids = [91,92,93,94]; if (end) ids = [99,100,101,102]; break;
    case 'townnpc_hatescity':
      ids = talked ? [73] : [70,71,72]; if (plot > 121) ids = [77,78]; if (end) ids = [83,84,85,86]; if (dead || pap) ids = [91,92]; break;
    default: throw new Error(`Không có lời NPC Grillby: ${name}`);
  }
  return ids.map((id) => data[name][id]);
}
