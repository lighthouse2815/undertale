// obj_waterboardpuzzle1: bốn hạt đã dừng liên tiếp tạo cầu ngang hoặc dọc.
export function findWaterfallBridge(boards) {
  for (const board of boards) {
    if (board.using !== 3) continue;
    for (const [dx, dy] of [[20, 0], [0, 20]]) {
      const line = [board];
      for (const sign of [-1, 1]) {
        for (let distance = 1; distance <= 3; distance++) {
          const x = board.x + dx * distance * sign, y = board.y + dy * distance * sign;
          const next = boards.find((candidate) => candidate.x === x && candidate.y === y);
          if (!next || next.using !== 3) break;
          line.push(next);
        }
      }
      if (line.length >= 4) return line;
    }
  }
  return [];
}

// Create của phòng 5 đặt cầu có sẵn khi đi ngược hoặc sau khi vượt câu đố.
export function waterfallBridgeSeeds(entrance, plot) {
  const seeds = [];
  if (entrance === 2) for (let i = 0; i < 4; i++) seeds.push({ x: 420 + i * 20, y: 400 });
  if (plot > 106) for (let i = 0; i < 4; i++) seeds.push({ x: 220, y: 180 + i * 20 });
  return seeds;
}

// obj_waterboard Step 2: đặt hạt sát nhân vật, rồi trôi 2 px/frame tới vật cản.
export function releaseWaterfallSeed(player, direction, occupied, water) {
  const offsets = { d: [10, 40, 0, 30], u: [10, 0, 0, 0], r: [30, 20, 20, 10], l: [-10, 20, -20, 10] };
  const offset = offsets[direction];
  if (!offset) return null;
  const [px, py, dx, dy] = offset;
  if (!water(player.x + px, player.y + py) || occupied(player.x + px, player.y + py, direction)) return null;
  const snap = (value) => Math.round(value / 20) * 20;
  return { x: snap(player.x + dx), y: snap(player.y + dy), direction, using: 2 };
}

export function advanceWaterfallSeed(seed, blocked) {
  if (seed.using !== 2) return false;
  const directions = { u: [0, -2, 10, -2], r: [2, 0, 20, 10], d: [0, 2, 10, 22], l: [-2, 0, -2, 10] };
  const movement = directions[seed.direction];
  if (!movement) throw new Error(`Hướng hạt cầu không hợp lệ: ${seed.direction}`);
  const [dx, dy, probeX, probeY] = movement;
  seed.x += dx; seed.y += dy;
  if (!blocked(seed.x + probeX, seed.y + probeY)) return false;
  seed.x = Math.round(seed.x / 20) * 20; seed.y = Math.round(seed.y / 20) * 20; seed.using = 3;
  return true;
}
