// Mask PNG tĩnh dùng kênh đỏ; cả vùng trắng và đen đều có alpha255 trong dữ liệu gốc.
// Giữ pixel theo texture để tránh drawImage/getImageData cho từng điểm va chạm mỗi frame.
const masks = new WeakMap();

export function maskContains(scene, key, x, y) {
  const texture = scene.textures.get(key);
  let mask = masks.get(texture);
  if (!mask) {
    const image = texture.getSourceImage(), canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0);
    mask = { width: canvas.width, height: canvas.height, pixels: context.getImageData(0, 0, canvas.width, canvas.height).data };
    masks.set(texture, mask);
  }
  x = Math.floor(x); y = Math.floor(y);
  return x >= 0 && y >= 0 && x < mask.width && y < mask.height && mask.pixels[(y * mask.width + x) * 4] > 0;
}
