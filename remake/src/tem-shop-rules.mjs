// Giá bán theo scr_itemvalue; các vật phẩm đặc biệt có giá -1 không thể bán.
const values = [0, 25, 10, 150, 150, 3, 3, 30, 10, 10, 60, 180, 100, 100, 50, 50, 40, 2, 2, 5, 2, 8, 2, 76, 80, 80, 15, 999, 8, 3, 2, 4, 1, 4, 3, 25, 50, 5, 10, 11, 15, 5, 10, 40, 50, 50, 100, 100, 100, 100, 250, 250, 500, 500, 300, 250, -1, -1, 35, 1, -1, 14, 150, 350, 500];

export function temSellValue(id) { return values[id] ?? 0; }
export function temArmorPrice(deaths) {
  const prices = [9999, 9000, 8000, 7000, 6000, 5000, 4500, 4000, 3500, 3000, 2800, 2600, 2400, 2200, 2000, 1800, 1600, 1400, 1250, 1100];
  const count = Math.max(0, Math.floor(Number(deaths) || 0));
  return count >= 25 ? 750 : count >= 20 ? 1000 : prices[count];
}
export function temFirstOffer(value) { return value + 1; }
export function temSecondOffer(value) { return Math.ceil(value * 1.25) + 1; }
