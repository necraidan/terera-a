/**
 * Recale les coordonnées des localités de src/app/shared/data/towns.data.ts
 * sur OpenStreetMap, via Overpass. Outil de build à lancer à la main, comme
 * build-coastlines.js : la liste et les rangs restent rédigés dans le fichier,
 * seul le couple (lat, lon) de chaque ligne est réécrit.
 *
 *   node scripts/build-towns.js
 *
 * Une seule requête récupère tous les `place=town|village|hamlet` de
 * l'emprise ; chaque localité est ensuite rapprochée par nom normalisé
 * (accents, apostrophes) du nœud le plus proche de son île, dans un rayon de
 * 60 km. Les localités introuvables sont listées et conservées telles quelles.
 *
 * Données © contributeurs d'OpenStreetMap, ODbL.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const TOWNS_FILE = fileURLToPath(new URL('src/app/shared/data/towns.data.ts', ROOT));
const ISLANDS_FILE = fileURLToPath(new URL('src/app/shared/data/islands.data.ts', ROOT));
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const BBOX = '-28.5,-155,-7.5,-134';
const MAX_DISTANCE_KM = 60;
const DECIMALS = 3;

const normalize = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'ʻ‘\-\s]/g, '')
    .toLowerCase();

const haversineKm = (a, b) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

const islandsSource = await readFile(ISLANDS_FILE, 'utf8');
const islands = new Map();
for (const m of islandsSource.matchAll(
  /id: '([^']+)',(?:(?!id: ')[\s\S])*?lat: (-?[\d.]+),\s*lon: (-?[\d.]+)/g,
)) {
  islands.set(m[1], { lat: Number(m[2]), lon: Number(m[3]) });
}

const query = `[out:json][timeout:60];node["place"~"^(city|town|village|hamlet)$"](${BBOX});out body;`;
const response = await fetch(OVERPASS, {
  method: 'POST',
  headers: { 'User-Agent': 'terera-a build-towns (github.com/necraidan/terera-a)' },
  body: `data=${encodeURIComponent(query)}`,
});
if (!response.ok) {
  throw new Error(`Overpass : ${response.status} ${response.statusText}`);
}
const nodes = (await response.json()).elements.map((n) => ({
  lat: n.lat,
  lon: n.lon,
  names: [n.tags.name, n.tags['name:ty'], n.tags['name:fr'], n.tags.alt_name]
    .filter(Boolean)
    .flatMap((v) => v.split(';'))
    .map(normalize),
}));
console.log(`${nodes.length} localités OSM dans l'emprise`);

const source = await readFile(TOWNS_FILE, 'utf8');
const line = /t\('([^']+)', '([^']+)', ([123]), (-?[\d.]+), (-?[\d.]+)\)/g;
let updated = 0;
const missing = [];

const output = source.replace(line, (whole, name, islandId, rank, lat, lon) => {
  const island = islands.get(islandId);
  if (!island) {
    missing.push(`${name} (île inconnue : ${islandId})`);
    return whole;
  }
  const wanted = normalize(name);
  const candidates = nodes
    .filter((n) => n.names.includes(wanted))
    .map((n) => ({ n, d: haversineKm(n, island) }))
    .filter(({ d }) => d < MAX_DISTANCE_KM)
    .sort((a, b) => a.d - b.d);
  if (candidates.length === 0) {
    missing.push(`${name} (${islandId})`);
    return whole;
  }
  const { n } = candidates[0];
  const moved = haversineKm(n, { lat: Number(lat), lon: Number(lon) });
  if (moved > 0.2) {
    updated++;
    console.log(`  ${name.padEnd(12)} déplacée de ${moved.toFixed(1)} km`);
  }
  return `t('${name}', '${islandId}', ${rank}, ${n.lat.toFixed(DECIMALS)}, ${n.lon.toFixed(DECIMALS)})`;
});

await writeFile(TOWNS_FILE, output);
console.log(`${updated} localités recalées.`);
if (missing.length > 0) {
  console.log(`Introuvables sur OSM, conservées telles quelles :\n  ${missing.join('\n  ')}`);
}
