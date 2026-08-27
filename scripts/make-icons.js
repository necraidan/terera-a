/**
 * Génère toutes les icônes de la PWA depuis une source SVG définie ici même.
 *
 * Pas de binaire source à versionner : l'icône est décrite en SVG, donc
 * modifiable et reproductible (`pnpm make:icons`).
 *
 * Trois familles sont produites dans public/icons/ :
 *  - icon-NxN.png       : icône « any », le motif occupe presque tout le carré ;
 *  - maskable-NxN.png   : icône « maskable », motif réduit dans la zone sûre
 *                         (80 % centraux) pour survivre au rognage Android ;
 *  - apple-touch-icon.png : 180×180, aplati sur fond opaque — iOS n'applique pas
 *                         de fond derrière la transparence et affiche du noir.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OUT_DIR = fileURLToPath(new URL('../public/icons/', import.meta.url));
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];
const APPLE_TOUCH_SIZE = 180;

const LAGOON_LIGHT = '#2dd4bf';
const LAGOON_DARK = '#0b6b7a';
const PETAL = '#fdfbf5';
const HEART = '#f2c14e';

/**
 * Fleur de tiaré stylisée : six pétales en gouttes autour d'un cœur.
 *
 * @param {number} scale Fraction du canevas 512 occupée par la fleur (0–1).
 * @returns {string} Le SVG complet, canevas 512×512.
 */
function buildSvg(scale) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = i * 60;
    // Pétale dessiné vers le haut depuis le centre, puis pivoté autour de lui.
    return `<path d="M 256 256 C 212 196, 216 118, 256 76 C 296 118, 300 196, 256 256 Z"
        transform="rotate(${angle} 256 256)" fill="${PETAL}" />`;
  }).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="lagoon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${LAGOON_LIGHT}" />
      <stop offset="1" stop-color="${LAGOON_DARK}" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#lagoon)" />
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
      ${petals}
    <circle cx="256" cy="256" r="46" fill="${HEART}" />
  </g>
</svg>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // « any » : la fleur remplit largement le carré.
  const anySvg = Buffer.from(buildSvg(0.92));
  // « maskable » : réduite à la zone sûre, le rognage ne coupe aucun pétale.
  const maskableSvg = Buffer.from(buildSvg(0.62));

  for (const size of SIZES) {
    const file = `${OUT_DIR}icon-${size}x${size}.png`;
    await sharp(anySvg).resize(size, size).png().toFile(file);
    console.log(`✓ icon-${size}x${size}.png`);
  }

  for (const size of MASKABLE_SIZES) {
    const file = `${OUT_DIR}maskable-${size}x${size}.png`;
    await sharp(maskableSvg).resize(size, size).png().toFile(file);
    console.log(`✓ maskable-${size}x${size}.png`);
  }

  // iOS : fond aplati, sans canal alpha.
  await sharp(anySvg)
    .resize(APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE)
    .flatten({ background: LAGOON_DARK })
    .png()
    .toFile(`${OUT_DIR}apple-touch-icon.png`);
  console.log('✓ apple-touch-icon.png');

  // Favicon : un PNG 32×32 suffit aux navigateurs modernes, mais on garde le
  // .ico historique pour les vieux agents — on écrit donc les deux.
  const favicon = fileURLToPath(new URL('../public/favicon.ico', import.meta.url));
  await writeFile(favicon, await sharp(anySvg).resize(32, 32).png().toBuffer());
  console.log('✓ favicon.ico');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
