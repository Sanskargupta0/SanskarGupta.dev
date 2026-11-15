const sharp = require("sharp");
const path = require("node:path");

async function build() {
  const output = path.join(process.cwd(), "public/mascots");
  const tile = await sharp(path.join(output, "sanskar-directions.webp"))
    .extract({ left: 512, top: 512, width: 256, height: 256 })
    .ensureAlpha()
    .raw()
    .toBuffer();
  let left = 256,
    right = 0,
    top = 256,
    bottom = 0;
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      if (tile[(y * 256 + x) * 4 + 3] > 128) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  // A head-only crop reads clearly at the browser's tiny tab size.
  const head = await sharp(tile, { raw: { width: 256, height: 256, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: Math.round((bottom - top + 1) * 0.79) })
    .resize(184, 184, { fit: "contain", background: "#00000000" })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: "#00000000" })
    .png()
    .toBuffer();
  await sharp(head).toFile(path.join(output, "sanskar-icon.png"));
  const photo = sharp("src/assets/images/profile-portrait.png");
  const { width, height } = await photo.metadata();
  const side = Math.floor(Math.min(width, height) * 0.54);
  await photo
    .extract({
      left: Math.floor(width * 0.24),
      top: Math.floor(height * 0.16),
      width: side,
      height: side,
    })
    .resize(192, 192)
    .png()
    .toFile(path.join(output, "sanskar-photo-icon.png"));
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
