const path = require('path');
const fs = require('fs');

async function makeCircle() {
  // Coba require sharp dari node_modules lokal
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Sharp not available directly:', e.message);
    return;
  }

  const inputPath = path.join(__dirname, '..', 'public', 'img', 'logo-web.png');
  const metadata = await sharp(inputPath).metadata();
  const size = Math.min(metadata.width, metadata.height);

  const circleSvg = Buffer.from(
    '<svg width="' + size + '" height="' + size + '"><circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + (size / 2) + '" fill="#fff"/></svg>'
  );

  const circlePngPath = path.join(__dirname, '..', 'public', 'img', 'logo-circle.png');
  const faviconIcoPath = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
  const appIconPath = path.join(__dirname, '..', 'src', 'app', 'icon.png');
  const appleIconPath = path.join(__dirname, '..', 'src', 'app', 'apple-icon.png');

  // Buat circular logo PNG resolusi tinggi
  await sharp(inputPath)
    .resize(size, size)
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toFile(circlePngPath);
  console.log('Saved:', circlePngPath);

  // Buat circular favicon 48x48
  const circle48Svg = Buffer.from(
    '<svg width="48" height="48"><circle cx="24" cy="24" r="24" fill="#fff"/></svg>'
  );
  const faviconBuffer = await sharp(inputPath)
    .resize(48, 48)
    .composite([{ input: circle48Svg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  fs.writeFileSync(faviconIcoPath, faviconBuffer);
  fs.writeFileSync(appIconPath, faviconBuffer);

  // Buat circular apple-icon 180x180
  const apple180Svg = Buffer.from(
    '<svg width="180" height="180"><circle cx="90" cy="90" r="90" fill="#fff"/></svg>'
  );
  const appleBuffer = await sharp(inputPath)
    .resize(180, 180)
    .composite([{ input: apple180Svg, blend: 'dest-in' }])
    .png()
    .toBuffer();
  fs.writeFileSync(appleIconPath, appleBuffer);

  console.log('Semua icon lingkaran berhasil di-generate!');
}

makeCircle();

