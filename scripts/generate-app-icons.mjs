import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const source = path.join(root, 'src', 'assets', 'تطبيق.jpeg');
const resourceDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

const densities = [
  ['mdpi', 48, 108],
  ['hdpi', 72, 162],
  ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324],
  ['xxxhdpi', 192, 432],
];

const renderIcon = (size) => sharp(source).resize(size, size).webp({ quality: 92 }).toBuffer();

const renderForeground = async (size) => {
  const image = await sharp(source)
    .resize(Math.round(size * 0.68), Math.round(size * 0.68))
    .webp({ quality: 92 })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: image, gravity: 'center' }])
    .webp({ quality: 92 })
    .toBuffer();
};

await Promise.all(densities.map(async ([density, iconSize, foregroundSize]) => {
  const directory = path.join(resourceDir, `mipmap-${density}`);
  const [icon, foreground] = await Promise.all([
    renderIcon(iconSize),
    renderForeground(foregroundSize),
  ]);

  await Promise.all([
    fs.writeFile(path.join(directory, 'ic_launcher.webp'), icon),
    fs.writeFile(path.join(directory, 'ic_launcher_round.webp'), icon),
    fs.writeFile(path.join(directory, 'ic_launcher_foreground.webp'), foreground),
  ]);
}));

const anyDensityDirectory = path.join(resourceDir, 'mipmap-anydpi-v26');
// Android's adaptive icon XML already owns ic_launcher and ic_launcher_round
// in this directory. Only its foreground image belongs here.
await Promise.all([
  fs.rm(path.join(anyDensityDirectory, 'ic_launcher.webp'), { force: true }),
  fs.rm(path.join(anyDensityDirectory, 'ic_launcher_round.webp'), { force: true }),
  fs.writeFile(path.join(anyDensityDirectory, 'ic_launcher_foreground.webp'), await renderForeground(432)),
]);
