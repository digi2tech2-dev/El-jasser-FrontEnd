import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import toIco from 'to-ico';

const repoRoot = process.cwd();
const inputPath = path.join(repoRoot, 'public', 'elgny.PNG');
const outDir = path.join(repoRoot, 'public');
const androidResDir = path.join(repoRoot, 'android', 'app', 'src', 'main', 'res');

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const renderPng = async (size) => {
  const image = sharp(inputPath, { failOn: 'none' });

  // Keep logo identity without harsh cropping: contain + transparent padding.
  const buffer = await image
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  return buffer;
};

const main = async () => {
  await ensureDir(outDir);

  const png16 = await renderPng(16);
  const png32 = await renderPng(32);
  const png180 = await renderPng(180);

  await Promise.all([
    fs.writeFile(path.join(outDir, 'favicon-16x16.png'), png16),
    fs.writeFile(path.join(outDir, 'favicon-32x32.png'), png32),
    fs.writeFile(path.join(outDir, 'apple-touch-icon.png'), png180),
  ]);

  const ico = await toIco([png16, png32]);
  await fs.writeFile(path.join(outDir, 'favicon.ico'), ico);

  // Optional: also keep a higher-res PNG for Android/desktop shortcuts.
  const png192 = await renderPng(192);
  await fs.writeFile(path.join(outDir, 'android-chrome-192x192.png'), png192);

  // Android launcher assets: a rich navy backdrop preserves the character's
  // edges in both legacy and adaptive icon launchers.
  const androidIcon = async (size, { foreground = false } = {}) => {
    const canvas = { width: size, height: size, channels: 4, background: foreground ? { r: 0, g: 0, b: 0, alpha: 0 } : '#071B42' };
    const scale = foreground ? 0.76 : 0.96;
    const character = await sharp(inputPath, { failOn: 'none' })
      .resize(Math.round(size * scale), Math.round(size * scale), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    return sharp({ create: canvas })
      .composite([{ input: character, gravity: 'center' }])
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
  };

  const androidDensities = [
    ['mdpi', 48, 108],
    ['hdpi', 72, 162],
    ['xhdpi', 96, 216],
    ['xxhdpi', 144, 324],
    ['xxxhdpi', 192, 432],
  ];

  await Promise.all(androidDensities.flatMap(async ([density, iconSize, foregroundSize]) => {
    const dir = path.join(androidResDir, `mipmap-${density}`);
    await ensureDir(dir);
    const [icon, foreground] = await Promise.all([
      androidIcon(iconSize),
      androidIcon(foregroundSize, { foreground: true }),
    ]);
    await Promise.all([
      fs.writeFile(path.join(dir, 'ic_launcher.png'), icon),
      fs.writeFile(path.join(dir, 'ic_launcher_round.png'), icon),
      fs.writeFile(path.join(dir, 'ic_launcher_foreground.png'), foreground),
    ]);
  }));

  // eslint-disable-next-line no-console
  console.log('Favicons and El-Jasser Android launcher icons generated.');
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
