/**
 * Extrait les traits de côte de la carte depuis les « land polygons » d'
 * OpenStreetMapet les embarque en GeoJSON dans `src/app/shared/data/`.
 *
 * Outil de build, dans l'esprit de make-icons.js : il se lance à la main et ses
 * sorties sont commitées. L'app, elle, ne fait aucune requête réseau — le
 * GeoJSON est importé comme un module, donc bundlé puis précaché par le service
 * worker, sans `provideHttpClient` ni `assetGroup` supplémentaire.
 *
 * Source : https://osmdata.openstreetmap.de/data/land-polygons.html
 * Prendre impérativement une variante **4326** (degrés), pas la 3857 par défaut
 * (mètres Mercator) :
 *
 *   mkdir -p .cache && cd .cache
 *   curl -O https://osmdata.openstreetmap.de/download/land-polygons-split-4326.zip
 *   unzip land-polygons-split-4326.zip
 *   cd .. && node scripts/build-coastlines.js .cache/land-polygons-split-4326
 *
 * Données © contributeurs d'OpenStreetMap, sous licence ODbL : l'attribution
 * est affichée sur la page /carte (SCALE_NOTES dans islands.data.ts).
 *
 * Le shapefile est lu directement, sans dépendance : seule la géométrie nous
 * intéresse, le .dbf des attributs est ignoré. Les enregistrements portent leur
 * propre boîte englobante, ce qui permet de sauter sans les décoder les
 * centaines de milliers de polygones hors de la Polynésie.
 */
import { closeSync, existsSync, openSync, readSync, readdirSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const ISLANDS_DATA = fileURLToPath(new URL('src/app/shared/data/islands.data.ts', ROOT));
const OVERVIEW_OUT = fileURLToPath(
  new URL('src/app/shared/data/coastlines-overview.geo.json', ROOT),
);
const DETAIL_OUT = fileURLToPath(new URL('src/app/shared/data/coastlines-detail.geo.json', ROOT));

/**
 * Doivent rester alignés sur islands.component.ts : la vue d'ensemble est
 * découpée et simplifiée pour ce viewBox là. Un écart ne déplacerait rien —
 * la projection est refaite à l'exécution — mais gâcherait des octets en
 * détail invisible, ou raboterait des côtes visibles.
 */
const MAP_WIDTH = 320;
const MAP_HEIGHT = 380;
const MAP_PADDING = 18;
const OVERVIEW_MARGIN_DEGREES = 1.5;
const INSET_SIZE = 160;
const INSET_PADDING = 8;

/**
 * Seuils exprimés en pixels du rendu final plutôt qu'en degrés : c'est la seule
 * façon de simplifier autant que l'échelle le permet sans jamais effacer ce qui
 * se verrait. 0,25 px de tolérance reste sous le pixel à toutes les échelles.
 */
const TOLERANCE_PX = 0.25;
const OVERVIEW_MIN_EXTENT_PX = 0.35;
const DETAIL_MIN_EXTENT_PX = 0.4;

/** ~11 m : bien plus fin que la tolérance de simplification, à 4 octets près. */
const COORD_DECIMALS = 4;

/** Emprise autour de chaque localité dans laquelle chercher son île. */
const CANDIDATE_RADIUS_KM = 110;

/**
 * Distance en deçà de laquelle deux polygones sont considérés comme la même
 * île. Un atoll est un chapelet de motu séparés par des hoa de quelques
 * centaines de mètres ; le chenal de Moorea, lui, fait une quinzaine de
 * kilomètres, donc Tahiti n'attire pas sa voisine.
 */
const LINK_KM = 8;

/**
 * Les coordonnées d'une île visent sa localité principale, donc la terre ferme :
 * le polygone qui la contient est le bon. Le repli sur le plus proche ne couvre
 * qu'un trait de côte imprécis de quelques centaines de mètres — au delà, c'est
 * qu'aucun polygone ne correspondet mieux vaut le dire que dessiner la voisine.
 */
const NEAREST_FALLBACK_KM = 5;

/** Marge autour du contour dans l'encart, en fraction de son emprise. */
const INSET_MARGIN_RATIO = 0.15;

/** Poids indicatifs au delà desquels le bundle commence à coûter cher. */
const OVERVIEW_BUDGET_KB = 40;
const DETAIL_BUDGET_KB = 150;

const KM_PER_DEGREE = 111.195;
const RAD = Math.PI / 180;

// --- Lecture du shapefile ----------------------------------------------------

const SHAPE_TYPE_POLYGON = 5;

/**
 * Fenêtre glissante sur le fichier : le .shp pèse plusieurs centaines de Mo et
 * se lit de bout en bout, une lecture par tranche de 4 Mio suffit donc. Le
 * tampon renvoyé est invalidé par la lecture suivante, d'où les copies aux
 * points où l'on garde des octets.
 */
function makeWindow(fd, fileSize) {
  const CHUNK = 1 << 22;
  let buffer = Buffer.alloc(0);
  let start = 0;

  return function read(offset, length) {
    if (offset < start || offset + length > start + buffer.length) {
      const size = Math.min(Math.max(CHUNK, length), fileSize - offset);
      const next = Buffer.allocUnsafe(size);
      const got = readSync(fd, next, 0, size, offset);
      buffer = next.subarray(0, got);
      start = offset;
    }
    const from = offset - start;
    if (from + length > buffer.length) {
      throw new Error(`fichier tronqué : lecture de ${length} octets à ${offset}`);
    }
    return buffer.subarray(from, from + length);
  };
}

/** Anneaux bruts d'un enregistrement Polygon, dans l'ordre du fichier. */
function readRings(body) {
  const partCount = body.readInt32LE(36);
  const pointCount = body.readInt32LE(40);
  const partsAt = 44;
  const pointsAt = partsAt + 4 * partCount;

  const rings = [];
  for (let part = 0; part < partCount; part += 1) {
    const from = body.readInt32LE(partsAt + 4 * part);
    const to = part + 1 < partCount ? body.readInt32LE(partsAt + 4 * (part + 1)) : pointCount;

    const ring = new Array(Math.max(0, to - from));
    for (let i = from; i < to; i += 1) {
      const at = pointsAt + 16 * i;
      ring[i - from] = [body.readDoubleLE(at), body.readDoubleLE(at + 8)];
    }
    rings.push(ring);
  }
  return rings;
}

/**
 * Parcourt le .shp et appelle `onMatch(keys, rings)` pour chaque polygone dont
 * la boîte englobante croise l'une des boîtes demandées. Les autres ne sont
 * jamais décodés : on saute leur contenu à la longueur annoncée.
 */
function scanShapefile(path, targets, onMatch) {
  const fd = openSync(path, 'r');
  try {
    const fileSize = statSync(path).size;
    const read = makeWindow(fd, fileSize);

    const header = Buffer.from(read(0, 100));
    if (header.readInt32BE(0) !== 9994) {
      throw new Error(`${path} n'est pas un shapefile (code de fichier inattendu)`);
    }
    const xMin = header.readDoubleLE(36);
    const xMax = header.readDoubleLE(52);
    if (Math.abs(xMin) > 180 || Math.abs(xMax) > 180) {
      throw new Error(
        `${path} est projeté en mètres (emprise ${xMin.toFixed(0)}…${xMax.toFixed(0)}).\n` +
          'Téléchargez la variante 4326 : land-polygons-split-4326.zip',
      );
    }

    if (header.readInt32LE(32) !== SHAPE_TYPE_POLYGON) {
      console.warn(`⚠ ${path} n'annonce pas des polygones (type ${header.readInt32LE(32)})`);
    }

    const end = Math.min(fileSize, header.readInt32BE(24) * 2);
    let offset = 100;
    let records = 0;
    let matches = 0;

    // Un enregistrement fait au moins 12 octets (en tête, puis une forme nulle),
    // et 52 avant d'atteindre le compte de points d'un polygone.
    while (offset + 12 <= end) {
      const head = Buffer.from(read(offset, Math.min(52, end - offset)));
      const contentBytes = head.readInt32BE(4) * 2;
      const next = offset + 8 + contentBytes;
      records += 1;

      if (head.length >= 52 && head.readInt32LE(8) === SHAPE_TYPE_POLYGON) {
        const box = {
          minLon: head.readDoubleLE(12),
          minLat: head.readDoubleLE(20),
          maxLon: head.readDoubleLE(28),
          maxLat: head.readDoubleLE(36),
        };
        const keys = targets.filter((target) => overlaps(box, target.box)).map((t) => t.key);
        if (keys.length > 0) {
          matches += 1;
          onMatch(keys, readRings(Buffer.from(read(offset + 8, contentBytes))));
        }
      }

      if (next <= offset) throw new Error(`enregistrement illisible à l'octet ${offset}`);
      offset = next;
    }

    return { records, matches };
  } finally {
    closeSync(fd);
  }
}

/** Accepte le .shp lui même, ou le dossier décompressé qui le contient. */
function findShapefile(input) {
  const path = resolve(process.cwd(), input);

  if (path.endsWith('.shp')) {
    if (!existsSync(path)) throw new Error(`introuvable : ${path}`);
    return path;
  }
  if (!existsSync(path) || !statSync(path).isDirectory()) {
    throw new Error(`introuvable : ${path}`);
  }

  const here = readdirSync(path).filter((name) => name.endsWith('.shp'));
  if (here.length > 0) return join(path, here[0]);

  // L'archive se décompresse dans un sous dossier : on regarde un cran plus bas.
  for (const name of readdirSync(path)) {
    const child = join(path, name);
    if (!statSync(child).isDirectory()) continue;
    const found = readdirSync(child).filter((file) => file.endsWith('.shp'));
    if (found.length > 0) return join(child, found[0]);
  }
  throw new Error(`aucun .shp dans ${path}`);
}

// --- Géométrie ---------------------------------------------------------------

const overlaps = (a, b) =>
  a.minLon <= b.maxLon && a.maxLon >= b.minLon && a.minLat <= b.maxLat && a.maxLat >= b.minLat;

function boxOf(points) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of points) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLon, maxLon, minLat, maxLat };
}

const extentOf = (box) => Math.max(box.maxLon - box.minLon, box.maxLat - box.minLat);

/** Écart entre deux boîtes, nul si elles se touchent. */
function gapKm(a, b, midLat) {
  const dLat = Math.max(0, a.minLat - b.maxLat, b.minLat - a.maxLat) * KM_PER_DEGREE;
  const dLon =
    Math.max(0, a.minLon - b.maxLon, b.minLon - a.maxLon) * KM_PER_DEGREE * Math.cos(midLat * RAD);
  return Math.hypot(dLat, dLon);
}

/** Aire signée : négative pour un anneau horaire, la convention shapefile. */
function signedArea(ring) {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return sum / 2;
}

/** Lancer de rayon en règle pair-impair. */
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Regroupe les anneaux d'un enregistrement en polygones : le shapefile trace
 * les contours extérieurs dans le sens horaire et les trous dans l'autre, un
 * anneau horaire ouvre donc un nouveau polygone. C'est ce qui donne son lagon
 * à un atoll, dessiné comme un trou dans l'anneau de terre.
 */
function groupPolygons(rings) {
  const polygons = [];
  for (const ring of rings) {
    if (signedArea(ring) < 0 || polygons.length === 0) {
      polygons.push([ring]);
    } else {
      polygons[polygons.length - 1].push(ring);
    }
  }
  return polygons;
}

/**
 * Douglas-Peucker, itératif pour ne pas empiler des dizaines de milliers
 * d'appels sur un long trait de côte. Les distances sont mesurées en degrés :
 * sous ces latitudes un degré de longitude vaut 0,95 degré de latitude, l'écart
 * est sans conséquence sur un seuil sous-pixel.
 */
function simplify(points, tolerance) {
  if (points.length <= 4) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let farthest = -1;
    let best = tolerance * tolerance;

    for (let i = first + 1; i < last; i += 1) {
      const distance = squareSegmentDistance(points[i], points[first], points[last]);
      if (distance > best) {
        best = distance;
        farthest = i;
      }
    }

    if (farthest !== -1) {
      keep[farthest] = 1;
      stack.push([first, farthest], [farthest, last]);
    }
  }

  return points.filter((_, index) => keep[index] === 1);
}

/** Carré de la distance d'un point au segment ab, ou au point a si a vaut b. */
function squareSegmentDistance(point, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

const round = (value) => {
  const factor = 10 ** COORD_DECIMALS;
  const rounded = Math.round(value * factor) / factor;
  return rounded === 0 ? 0 : rounded;
};

/**
 * Arrondit, referme l'anneau et le retourne : le shapefile trace les contours
 * extérieurs dans le sens horaire, GeoJSON (RFC 7946) dans l'autre. Retourner
 * tous les anneaux préserve leur sens relatif, donc les trous.
 */
function finishRing(points) {
  const out = [];
  for (const [lon, lat] of points) {
    const point = [round(lon), round(lat)];
    const last = out[out.length - 1];
    if (!last || last[0] !== point[0] || last[1] !== point[1]) out.push(point);
  }

  const first = out[0];
  const last = out[out.length - 1];
  if (!first) return null;
  if (first[0] !== last[0] || first[1] !== last[1]) out.push([first[0], first[1]]);
  if (out.length < 4) return null;

  out.reverse();
  return out;
}

/** Simplifie un polygone, ou le rejette s'il ne se verrait pas. */
function prepare(polygon, tolerance, minExtent) {
  const [outer, ...holes] = polygon;
  if (extentOf(boxOf(outer)) < minExtent) return null;

  const simplified = finishRing(simplify(outer, tolerance));
  if (!simplified) return null;

  const rings = [simplified];
  for (const hole of holes) {
    if (extentOf(boxOf(hole)) < minExtent) continue;
    const ring = finishRing(simplify(hole, tolerance));
    if (ring) rings.push(ring);
  }
  return rings;
}

// --- Emprises ----------------------------------------------------------------

/**
 * Échelle du rendu, en pixels par degré. La projection de l'app corrige la
 * longitude par le cosinus de la latitude médiane : on prend l'axe le plus
 * serré des deux, celui qui décide de ce qui reste visible.
 */
function pixelsPerDegree(box, width, height, padding) {
  const midLat = (box.minLat + box.maxLat) / 2;
  const lonSpan = (box.maxLon - box.minLon) * Math.cos(midLat * RAD);
  const latSpan = box.maxLat - box.minLat;
  return Math.min((width - 2 * padding) / lonSpan, (height - 2 * padding) / latSpan);
}

function expandBox(box, degrees) {
  return {
    minLon: box.minLon - degrees,
    maxLon: box.maxLon + degrees,
    minLat: box.minLat - degrees,
    maxLat: box.maxLat + degrees,
  };
}

/**
 * Lit les îles dans islands.data.ts plutôt que de les recopier : les
 * coordonnées n'ont qu'une source de véritéet une île ajoutée là bas est
 * prise en compte ici sans rien toucher.
 */
async function readIslands() {
  const source = await readFile(ISLANDS_DATA, 'utf8');
  const from = source.indexOf('export const ISLANDS');
  const to = source.indexOf('\n];', from);
  if (from === -1 || to === -1) {
    throw new Error(`impossible de retrouver le tableau ISLANDS dans ${ISLANDS_DATA}`);
  }

  const block = source.slice(from, to);
  const starts = [...block.matchAll(/\bid: '([^']+)'/g)];

  return starts.map((match, index) => {
    const next = starts[index + 1];
    const entry = block.slice(match.index, next ? next.index : block.length);
    const field = (name, pattern) => {
      const found = entry.match(new RegExp(`\\b${name}: ${pattern}`));
      if (!found) throw new Error(`champ ${name} manquant pour l'île ${match[1]}`);
      return found[1];
    };

    return {
      id: match[1],
      name: field('name', "'([^']*)'"),
      lat: Number(field('lat', '(-?[\\d.]+)')),
      lon: Number(field('lon', '(-?[\\d.]+)')),
    };
  });
}

// --- Programme ---------------------------------------------------------------

async function main() {
  const input = process.argv[2];
  if (!input) {
    throw new Error(
      'usage : node scripts/build-coastlines.js <dossier land-polygons-split-4326>\n' +
        'Source : https://osmdata.openstreetmap.de/data/land-polygons.html (ODbL)',
    );
  }

  const shapefile = findShapefile(input);
  const islands = await readIslands();
  console.log(`Îles : ${islands.length}`);
  console.log(`Shapefile : ${shapefile}`);

  // Même emprise que la carte : boundsOf(ISLANDS, 1.5) dans islands.component.ts.
  const overviewBox = expandBox(boxOf(islands.map((i) => [i.lon, i.lat])), OVERVIEW_MARGIN_DEGREES);
  const overviewScale = pixelsPerDegree(overviewBox, MAP_WIDTH, MAP_HEIGHT, MAP_PADDING);
  const overviewTolerance = TOLERANCE_PX / overviewScale;
  const overviewMinExtent = OVERVIEW_MIN_EXTENT_PX / overviewScale;
  console.log(
    `Vue d'ensemble : ${overviewScale.toFixed(1)} px/degré, ` +
      `tolérance ${overviewTolerance.toFixed(4)}°, seuil ${overviewMinExtent.toFixed(4)}°`,
  );

  const candidateDegrees = CANDIDATE_RADIUS_KM / KM_PER_DEGREE;
  const targets = [
    { key: '', box: overviewBox },
    ...islands.map((island) => ({
      key: island.id,
      box: expandBox(
        { minLon: island.lon, maxLon: island.lon, minLat: island.lat, maxLat: island.lat },
        candidateDegrees,
      ),
    })),
  ];

  const overview = [];
  const candidates = new Map(islands.map((island) => [island.id, []]));

  const { records, matches } = scanShapefile(shapefile, targets, (keys, rings) => {
    const polygons = groupPolygons(rings);

    if (keys.includes('')) {
      for (const polygon of polygons) {
        const kept = prepare(polygon, overviewTolerance, overviewMinExtent);
        if (kept) overview.push(kept);
      }
    }

    for (const key of keys) {
      if (key === '') continue;
      // Le détail est préparé après coup : sa tolérance dépend de l'emprise
      // finale de l'île, qu'on ne connaît qu'une fois ses polygones réunis.
      candidates.get(key).push(...polygons);
    }
  });

  console.log(`Enregistrements lus : ${records}, retenus : ${matches}`);
  console.log(`Vue d'ensemble : ${overview.length} polygones`);

  const detail = {};
  const missing = [];

  for (const island of islands) {
    const rings = selectIsland(island, candidates.get(island.id));
    if (rings.length === 0) {
      missing.push(island);
      continue;
    }

    const box = boxOf(rings.flat().flat());
    const margin = extentOf(box) * INSET_MARGIN_RATIO;
    const scale = pixelsPerDegree(expandBox(box, margin), INSET_SIZE, INSET_SIZE, INSET_PADDING);

    const polygons = [];
    let points = 0;
    for (const polygon of rings) {
      const kept = prepare(polygon, TOLERANCE_PX / scale, DETAIL_MIN_EXTENT_PX / scale);
      if (kept) {
        polygons.push(kept);
        points += kept.reduce((sum, ring) => sum + ring.length, 0);
      }
    }

    if (polygons.length === 0) {
      missing.push(island);
      continue;
    }

    detail[island.id] = { type: 'MultiPolygon', coordinates: polygons };
    const widthKm = (box.maxLon - box.minLon) * KM_PER_DEGREE * Math.cos(island.lat * RAD);
    const heightKm = (box.maxLat - box.minLat) * KM_PER_DEGREE;
    console.log(
      `  ${island.name.padEnd(12)} ${String(polygons.length).padStart(4)} polygones, ` +
        `${String(points).padStart(6)} points, ${widthKm.toFixed(0)} × ${heightKm.toFixed(0)} km`,
    );
  }

  for (const island of missing) {
    console.warn(`⚠ aucun contour pour ${island.name} (${island.id}) : l'encart restera vide`);
  }

  await write(OVERVIEW_OUT, { type: 'MultiPolygon', coordinates: overview }, OVERVIEW_BUDGET_KB);
  await write(DETAIL_OUT, detail, DETAIL_BUDGET_KB);
}

/**
 * Retient les polygones qui forment l'île : celui qui contient la localité (ou
 * le plus proche), puis de proche en proche tout ce qui s'en trouve à moins de
 * LINK_KM. Une simple boîte ne suffirait pas — depuis Papeete, un rayon assez
 * large pour atteindre le sud de Tahiti attrape aussi Moorea.
 */
function selectIsland(island, polygons) {
  if (polygons.length === 0) return [];

  const boxes = polygons.map((polygon) => boxOf(polygon[0]));

  let primary = polygons.findIndex((polygon) => pointInRing(island.lon, island.lat, polygon[0]));
  if (primary === -1) {
    const point = {
      minLon: island.lon,
      maxLon: island.lon,
      minLat: island.lat,
      maxLat: island.lat,
    };
    let nearest = NEAREST_FALLBACK_KM;
    boxes.forEach((box, index) => {
      const distance = gapKm(point, box, island.lat);
      if (distance < nearest) {
        nearest = distance;
        primary = index;
      }
    });
    if (primary === -1) return [];
    console.warn(
      `⚠ ${island.name} : la localité tombe hors des terres, contour le plus proche à ` +
        `${nearest.toFixed(1)} km — vérifiez ses coordonnées`,
    );
  }

  const kept = new Set([primary]);
  for (let grew = true; grew;) {
    grew = false;
    for (let i = 0; i < polygons.length; i += 1) {
      if (kept.has(i)) continue;
      for (const index of kept) {
        if (gapKm(boxes[index], boxes[i], island.lat) <= LINK_KM) {
          kept.add(i);
          grew = true;
          break;
        }
      }
    }
  }

  return [...kept].map((index) => polygons[index]);
}

async function write(path, value, budgetKb) {
  const json = JSON.stringify(value);
  await writeFile(path, `${json}\n`, 'utf8');

  const kb = (json.length + 1) / 1024;
  const name = path.slice(path.lastIndexOf('/') + 1);
  console.log(`✓ ${name} — ${kb.toFixed(1)} ko`);
  if (kb > budgetKb) {
    console.warn(`⚠ ${name} dépasse la cible de ${budgetKb} ko`);
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
