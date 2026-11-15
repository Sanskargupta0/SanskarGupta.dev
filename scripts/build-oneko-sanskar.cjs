// Pack generated artwork into the 8x4, 32px-cell atlas used by src/lib/oneko.js.
// Usage: node scripts/build-oneko-sanskar.cjs path/to/generated-sheet.png
const sharp = require("sharp");

async function build() {
  const source = process.argv[2];
  if (!source) throw new Error("Pass the generated 8x4 source PNG path.");
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const tiles = [];
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 8; col++) {
      const x0 = Math.round((col * info.width) / 8),
        x1 = Math.round(((col + 1) * info.width) / 8);
      const y0 = Math.round((row * info.height) / 4),
        y1 = Math.round(((row + 1) * info.height) / 4);
      let left = x1,
        right = x0,
        top = y1,
        bottom = y0;
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          if (data[(y * info.width + x) * 4 + 3] > 64) {
            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
          }
        }
      if (left > right || top > bottom) throw new Error(`Empty sprite at ${col},${row}`);
      const sleeping = col === 2 && row < 2;
      const tile = await sharp(data, { raw: info })
        .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
        .resize(28, sleeping ? 16 : 29, { fit: "inside", kernel: "nearest" })
        .png()
        .toBuffer();
      const bounds = await sharp(tile).metadata();
      tiles.push({
        input: tile,
        left: col * 32 + Math.floor((32 - bounds.width) / 2),
        top: row * 32 + 31 - bounds.height,
      });
    }
  await sharp({ create: { width: 256, height: 128, channels: 4, background: "#00000000" } })
    .composite(tiles)
    .gif({ colours: 128, dither: 0, effort: 7 })
    .toFile("public/oneko/oneko-sanskar.gif");
  console.log("Built public/oneko/oneko-sanskar.gif (256x128, 32 poses).");
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
