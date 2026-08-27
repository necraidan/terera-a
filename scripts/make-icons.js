/**
 * Génère les icônes de la PWA depuis le SVG défini ici même, donc sans binaire
 * source à versionner. Trois familles : « any », « maskable » (motif réduit dans
 * la zone sûre pour survivre au rognage Android) et apple-touch-icon, aplati sur
 * fond opaque car iOS affiche du noir derrière la transparence.
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
const PETAL_SHADE = '#e2dcc8';
const HEART = '#f7e9bb';

const PETAL_COUNT = 6;
const PETAL_STEP = 360 / PETAL_COUNT;

// Un pétale dans un repère local centré sur le cœur, pointe vers le haut :
// large, bout bien arrondi, incliné vers la droite pour l'effet d'hélice
// caractéristique de la tiaré (Gardenia taitensis).
const PETAL_PATH = [
  'M -6 -22',
  'C -68 -70 -60 -160 8 -202', // bord gauche, convexe, monte vers la pointe
  'C 34 -230 88 -216 98 -180', // bout large et arrondi
  'C 106 -115 72 -52 22 -16', // bord droit, concave, revient vers le cœur
  'C 12 -10 0 -14 -6 -22', // fermeture douce à la base
  'Z',
].join(' ');

/**
 * Fleur de tiaré : six pétales en hélice autour d'un petit cœur crème.
 *
 * Chaque pétale est précédé de son ombre de chevauchement, le même tracé pivoté
 * de quelques degrés vers le pétale précédent et découpé dans celui-ci, afin
 * que l'ombre n'apparaisse jamais sur le fond. Le pétale 0 est redessiné en
 * dernier pour fermer la spirale.
 *
 * @param {number} scale Fraction du canevas 512 occupée par la fleur (0 à 1).
 * @returns {string} Le SVG complet, canevas 512×512.
 */
function buildSvg(scale) {
  let clips = '';
  for (let i = 0; i < PETAL_COUNT; i += 1) {
    clips +=
      `<clipPath id="petal-${i}">` +
      `<path d="${PETAL_PATH}" transform="rotate(${i * PETAL_STEP})" />` +
      `</clipPath>`;
  }

  const petal = (i) => {
    const angle = i * PETAL_STEP;
    const previous = (i + PETAL_COUNT - 1) % PETAL_COUNT;
    return (
      `<g clip-path="url(#petal-${previous})">` +
      `<path d="${PETAL_PATH}" fill="${PETAL_SHADE}" transform="rotate(${angle - 8})" />` +
      `</g>` +
      `<path d="${PETAL_PATH}" fill="${PETAL}" transform="rotate(${angle})" />`
    );
  };

  let petals = '';
  for (let i = 0; i < PETAL_COUNT; i += 1) petals += petal(i);
  petals += petal(0);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="lagoon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${LAGOON_LIGHT}" />
      <stop offset="1" stop-color="${LAGOON_DARK}" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#lagoon)" />
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <g transform="translate(256 256)">
      ${clips}
      ${petals}
      <circle cx="0" cy="0" r="28" fill="${HEART}" />
    </g>
  </g>
</svg>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const anySvg = Buffer.from(buildSvg(0.92));
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

  // Favicon : les navigateurs modernes préfèrent un PNG, mais /favicon.ico est
  // encore demandé automatiquement à la racine : on écrit donc les deux, et le
  // .ico est un vrai conteneur ICO, pas un PNG renommé.
  const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
  const png32 = await sharp(anySvg).resize(32, 32).png().toBuffer();
  await writeFile(`${publicDir}favicon-32x32.png`, png32);
  console.log('✓ favicon-32x32.png');

  await writeFile(`${publicDir}favicon.ico`, buildIco(png32, 32));
  console.log('✓ favicon.ico');
}

/**
 * Emballe un PNG dans un conteneur ICO : le format accepte un PNG tel quel,
 * préfixé d'un en-tête ICONDIR et d'une entrée de répertoire. Évite une
 * dépendance de plus.
 */
function buildIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type 1 = icône
  header.writeUInt16LE(1, 4); // une seule image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // largeur (0 signifie 256)
  entry.writeUInt8(size === 256 ? 0 : size, 1); // hauteur
  entry.writeUInt8(0, 2); // palette : sans objet en PNG
  entry.writeUInt8(0, 3); // réservé
  entry.writeUInt16LE(1, 4); // plans de couleur
  entry.writeUInt16LE(32, 6); // bits par pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12); // décalage des données

  return Buffer.concat([header, entry, png]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
