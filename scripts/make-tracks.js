/**
 * Génère les tracés de randonnée de `src/app/shared/data/hikes.tracks.ts` depuis
 * OpenStreetMap, via l'API Overpass.
 *
 * Pourquoi un script et pas des coordonnées saisies à la main : un tracé est la
 * seule donnée de l'app qu'on ne peut ni vérifier de tête ni recalculer. Le
 * rendre reproductible, c'est pouvoir répondre à « d'où vient cette ligne ? »
 * par un identifiant de chemin OSM et une commande à relancer.
 *
 * Les chemins retenus sont déclarés ici, un par un, par leur identifiant OSM.
 * Aucune sélection automatique par proximité : c'est le seul moyen d'éviter
 * qu'une mise à jour d'OSM ne fasse silencieusement passer le tracé par un
 * sentier voisin.
 *
 * Les données OSM sont sous licence ODbL, qui impose l'attribution : chaque
 * fiche affiche son `trackCredit` sous le plan.
 *
 * Usage : pnpm make:tracks
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const OUT_FILE = fileURLToPath(new URL('../src/app/shared/data/hikes.tracks.ts', import.meta.url));
const BASEMAP_FILE = fileURLToPath(
  new URL('../src/app/shared/data/hikes.basemap.ts', import.meta.url),
);

const OVERPASS = 'https://overpass-api.de/api/interpreter';

/** Hors du dépôtet déjà ignoré par git. */
const CACHE_DIR = fileURLToPath(
  new URL('../node_modules/.cache/terera-a-tracks/', import.meta.url),
);

/** Précision de sortie : 5 décimales valent environ un mètre, largement assez. */
const DECIMALS = 5;

/** Le fond de carte se lit à l'échelle du cadre : dix mètres suffisent. */
const CONTEXT_DECIMALS = 4;

/** Au delà, le tracé pèse plus qu'il n'informe à l'échelle d'un écran de téléphone. */
const MAX_POINTS = 80;

/** Budget du fond par randonnée. C'est lui qui tient le poids de la feature. */
const MAX_CONTEXT_POINTS = 340;

/** Au delà, les libellés de sommets se chevauchent. */
const MAX_PEAKS = 5;

/** L'encart de localisation fait soixante-quatorze pixels : la silhouette suffit. */
const MAX_OUTLINE_POINTS = 150;

/** En deçà, c'est un motu ou un îlot : il n'aide pas à reconnaître l'île. */
const MIN_OUTLINE_RING_M = 1500;

/** Écart maximal toléré entre deux chemins bout à bout, en mètres. */
const JOIN_TOLERANCE_M = 250;

/** Reprises sur l'instance publique d'Overpass, qui sature régulièrement. */
const ATTEMPTS = 5;
const RETRY_DELAY_MS = 8000;

/**
 * Emprise de chaque île, pour la silhouette de l'encart de localisation. À
 * compléter quand une randonnée d'une autre île entre dans les données.
 *
 * Une emprise plutôt que la relation OSM de l'île : demander la géométrie de la
 * relation revient à télécharger tout le littoral de Tahiti nœud par nœud, ce
 * qu'Overpass refuse en pratique. Les lignes de côte sur une emprise déclarée
 * donnent la même silhouette pour une fraction du coût.
 */
const ISLAND_BOXES = {
  tahiti: { minLat: -17.895, maxLat: -17.47, minLon: -149.68, maxLon: -149.11 },
  moorea: { minLat: -17.61, maxLat: -17.44, minLon: -150.0, maxLon: -149.73 },
};

/**
 * Un tracé par randonnée, décrit par les chemins OSM qui le composent.
 *
 * `start` oriente le tracé : c'est le point de départ de la marche, sur quoi
 * l'enchaînement des chemins s'aligne. `note` documente ce que le tracé couvre
 * réellement, information reprise dans la fiche.
 */
const TRACKS = [
  {
    id: 'mont-aorai',
    // Chemin « Aorai », de la piste au dessus de Pirae jusqu'au sommet (2 066 m).
    ways: [711135875, 43993552],
    start: [-17.56492, -149.52887],
    note: 'sentier complet jusqu’au sommet',
  },
  {
    id: 'mont-marau',
    // Chaîne « Aratia Mont Marau » puis la crête, jusqu'aux antennes.
    ways: [737506646, 737506760, 737506790, 737506723, 737506722, 737506721, 612128338, 737506764],
    start: [-17.57859, -149.58295],
    note: 'piste complète jusqu’à la crête sommitale',
  },
  {
    id: 'vallee-fautaua',
    // Sentier de la haute vallée vers la cascade de Loti. La piste d'accès depuis
    // Papeete n'est pas cartographiée en sentier : le tracé ne couvre que la fin.
    ways: [303268077, 303268076, 303265872],
    start: [-17.58499, -149.52863],
    note: 'dernier tiers seulement, l’accès par la vallée n’est pas cartographié',
  },
  {
    id: 'col-trois-cocotiers',
    ways: [51193450, 1272615082, 221406911],
    start: [-17.54054, -149.82665],
    note: 'sentier complet du plateau d’Opunohu au col',
  },
  {
    id: 'col-trois-pinus',
    ways: [207272938, 832387498],
    start: [-17.53962, -149.82608],
    note: 'sentier complet depuis le belvédère',
  },
  {
    id: 'cascade-vaioro',
    // Sentier terminal vers la cascade. La piste depuis Afareaitu est une route.
    ways: [670618660, 199085930],
    start: [-17.54028, -149.79321],
    note: 'sentier terminal seulement, la piste depuis Afareaitu n’est pas cartographiée',
  },
  {
    id: 'mont-rotui',
    // « Partial Ascent Rōtui » puis la crête jusqu'au sommet (899 m). Le bas de
    // l'approche, depuis la côte, manque à OSM.
    ways: [207272932, 461278156],
    start: [-17.48695, -149.84513],
    note: 'montée et crête sommitale, sans le bas de l’approche',
  },
  {
    id: 'mont-mouaputa',
    // Sentier d'ascension depuis Afareaitu jusqu'au sommet percé (830 m).
    ways: [638808523],
    start: [-17.53836, -149.79642],
    note: 'partie haute de l’ascension jusqu’au sommet',
  },
];

const RAD = Math.PI / 180;
const EARTH_RADIUS_M = 6371000;

function distanceM(a, b) {
  const dLat = (b[0] - a[0]) * RAD;
  const dLon = (b[1] - a[1]) * RAD;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

function lengthM(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distanceM(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Cache disque des réponses Overpass, sous node_modules pour rester hors du
 * dépôt. Ce script sert à mettre au point des filtres d'affichage : refaire le
 * téléchargement à chaque essai coûterait des minutes d'attenteet solliciter
 * l'instance publique pour une donnée qu'on a déjà serait discourtois.
 * `pnpm make:tracks --refresh` ignore le cache.
 */
async function cached(query, work) {
  const key = createHash('sha256').update(query).digest('hex').slice(0, 16);
  const file = `${CACHE_DIR}${key}.json`;

  if (!process.argv.includes('--refresh')) {
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch {
      // Pas de cache pour cette requête : on la joue.
    }
  }

  const payload = await work();
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(payload), 'utf8');
  return payload;
}

async function overpass(query) {
  return cached(query, () => request(query));
}

/**
 * Interroge Overpass, avec reprises. L'instance publique répond régulièrement
 * un 504 quand elle est chargée : sans reprise, une génération sur deux
 * échouerait au milieu.
 */
async function request(query) {
  let lastError = null;

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      const wait = RETRY_DELAY_MS * 2 ** (attempt - 1);
      process.stdout.write(`    Overpass occupé, nouvelle tentative dans ${wait / 1000} s\n`);
      await delay(wait);
    }
    try {
      const response = await fetch(OVERPASS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Overpass refuse les requêtes anonymes par un 406 : se nommer est
          // d'ailleurs demandé par sa politique d'usage.
          'User-Agent': 'terera-a make-tracks (https://github.com/necraidan/terera-a)',
        },
        body: new URLSearchParams({ data: query }),
      });
      if (response.ok) {
        return await response.json();
      }
      lastError = new Error(`Overpass a répondu ${response.status} ${response.statusText}`);
      // Une requête mal formée ne passera pas davantage à la tentative suivante.
      if (response.status !== 429 && response.status !== 504 && response.status < 500) {
        throw lastError;
      }
    } catch (error) {
      if (error === lastError) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError ?? new Error('Overpass injoignable');
}

async function fetchGeometries(ids) {
  const payload = await overpass(`[out:json][timeout:180];way(id:${ids.join(',')});out geom;`);
  const byId = new Map();
  for (const element of payload.elements ?? []) {
    if (element.type === 'way' && Array.isArray(element.geometry)) {
      byId.set(
        element.id,
        element.geometry.map((point) => [point.lat, point.lon]),
      );
    }
  }
  return byId;
}

/**
 * Met les chemins bout à bout depuis le point de départ, en retournant celui
 * qui est parcouru à l'envers. Le premier chemin retenu est le plus proche du
 * départ, puis on avance de proche en proche.
 */
function chain(segments, start) {
  const remaining = segments.map((points) => [...points]);
  const ordered = [];
  let tail = start;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    let bestReversed = false;

    remaining.forEach((points, index) => {
      const toHead = distanceM(tail, points[0]);
      const toEnd = distanceM(tail, points[points.length - 1]);
      if (toHead < bestDistance) {
        bestDistance = toHead;
        bestIndex = index;
        bestReversed = false;
      }
      if (toEnd < bestDistance) {
        bestDistance = toEnd;
        bestIndex = index;
        bestReversed = true;
      }
    });

    if (ordered.length > 0 && bestDistance > JOIN_TOLERANCE_M) {
      throw new Error(
        `chemins disjoints : ${Math.round(bestDistance)} m entre deux tronçons, revoir la liste`,
      );
    }

    const [picked] = remaining.splice(bestIndex, 1);
    const points = bestReversed ? picked.reverse() : picked;
    // Le point de jonction est commun aux deux chemins : on ne le répète pas.
    ordered.push(...(ordered.length > 0 ? points.slice(1) : points));
    tail = points[points.length - 1];
  }

  return ordered;
}

/** Distance d'un point au segment `a`-`b`, en mètres, dans un plan local. */
function perpendicularM(point, a, b) {
  const scale = Math.cos(a[0] * RAD);
  const toXy = (p) => [
    (p[1] - a[1]) * scale * RAD * EARTH_RADIUS_M,
    (p[0] - a[0]) * RAD * EARTH_RADIUS_M,
  ];
  const [px, py] = toXy(point);
  const [bx, by] = toXy(b);
  const squared = bx * bx + by * by;
  if (squared === 0) {
    return Math.hypot(px, py);
  }
  const t = Math.max(0, Math.min(1, (px * bx + py * by) / squared));
  return Math.hypot(px - t * bx, py - t * by);
}

/** Douglas-Peucker : garde la forme du sentier en jetant les points alignés. */
function simplify(points, toleranceM) {
  if (points.length < 3) {
    return points;
  }
  let farthest = 0;
  let maxDistance = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularM(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      farthest = i;
    }
  }
  if (maxDistance <= toleranceM) {
    return [points[0], points[points.length - 1]];
  }
  return [
    ...simplify(points.slice(0, farthest + 1), toleranceM).slice(0, -1),
    ...simplify(points.slice(farthest), toleranceM),
  ];
}

/** Relâche la tolérance jusqu'à tenir sous le plafond de points. */
function simplifyToBudget(points) {
  let tolerance = 10;
  let result = simplify(points, tolerance);
  while (result.length > MAX_POINTS && tolerance < 500) {
    tolerance *= 1.5;
    result = simplify(points, tolerance);
  }
  return { points: result, tolerance: Math.round(tolerance) };
}

const round = (value) => Number(value.toFixed(DECIMALS));
const roundContext = (value) => Number(value.toFixed(CONTEXT_DECIMALS));

/** Emprise du fond de carte, assez large pour couvrir le cadre du plan. */
function contextBox(points) {
  const lats = points.map(([lat]) => lat);
  const lons = points.map(([, lon]) => lon);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const midLon = (Math.min(...lons) + Math.max(...lons)) / 2;

  const latKm = distanceM([Math.min(...lats), midLon], [Math.max(...lats), midLon]) / 1000;
  const lonKm = distanceM([midLat, Math.min(...lons)], [midLat, Math.max(...lons)]) / 1000;

  // Le plan élargit le cadre sur l'axe le plus court pour ne pas déformer le
  // tracé : le fond doit donc couvrir un carré, pas la seule emprise du sentier.
  const halfKm = Math.max(latKm, lonKm, 0.4) * 0.8;
  const dLat = halfKm / 110.574;
  const dLon = halfKm / (111.32 * Math.cos(midLat * RAD));

  return {
    minLat: midLat - dLat,
    maxLat: midLat + dLat,
    minLon: midLon - dLon,
    maxLon: midLon + dLon,
    diagKm: Math.hypot(2 * halfKm, 2 * halfKm),
  };
}

const inBox = ([lat, lon], box) =>
  lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon;

/**
 * Découpe une polyligne sur l'emprise, en gardant un point au delà de chaque
 * bord : sans lui, une route s'arrêterait net avant le bord du cadre.
 */
function clip(points, box) {
  const runs = [];
  let current = null;
  points.forEach((point, index) => {
    if (inBox(point, box)) {
      if (!current) {
        current = index > 0 ? [points[index - 1]] : [];
        runs.push(current);
      }
      current.push(point);
    } else if (current) {
      current.push(point);
      current = null;
    }
  });
  return runs.filter((run) => run.length >= 2);
}

/**
 * Trie ce qui mérite d'être dessiné derrière le sentier.
 *
 * Le brut est inexploitable : cinq cents pistes et deux cent soixante-dix
 * ruisseaux pour une seule emprise noieraient le tracé et pèseraient plus que
 * tout le reste de l'app. On garde ce qui sert à se situer, à l'échelle où on
 * lit le plan : la côte, l'eau, les rivières, les routes, les sentiers voisins
 * assez longs pour être des optionset les sommets nommés.
 */
function pickContext(elements, box, ownWays) {
  const lines = [];
  const water = [];
  const peaks = [];

  const minLine = box.diagKm * 0.12;
  const minPath = box.diagKm * 0.15;

  for (const element of elements) {
    const tags = element.tags ?? {};

    if (element.type === 'node') {
      if (tags.natural === 'peak' && tags.name && inBox([element.lat, element.lon], box)) {
        peaks.push({
          lat: element.lat,
          lon: element.lon,
          name: tags.name,
          ele: tags.ele === undefined ? undefined : Math.round(Number(tags.ele)),
        });
      }
      continue;
    }

    const geometry = (element.geometry ?? []).map((point) => [point.lat, point.lon]);
    if (geometry.length < 2) {
      continue;
    }

    if (tags.natural === 'water' && geometry.length >= 4) {
      if (geometry.some((point) => inBox(point, box))) {
        water.push(geometry);
      }
      continue;
    }

    let kind = null;
    if (tags.natural === 'coastline') {
      kind = 'coast';
    } else if (tags.waterway === 'river') {
      kind = 'river';
    } else if (tags.waterway === 'stream') {
      kind = 'stream';
    } else if (['primary', 'secondary', 'tertiary', 'unclassified'].includes(tags.highway)) {
      kind = 'road';
    } else if (['path', 'footway'].includes(tags.highway) && !ownWays.has(element.id)) {
      kind = 'path';
    }
    if (kind === null) {
      continue;
    }

    for (const run of clip(geometry, box)) {
      const km = lengthM(run) / 1000;
      if (kind === 'stream' && km < minLine) {
        continue;
      }
      if (kind === 'path' && km < minPath) {
        continue;
      }
      lines.push({ kind: kind === 'stream' ? 'river' : kind, points: run });
    }
  }

  // Les sommets les plus hauts d'abord : au delà de cinq libellés, le plan
  // devient un nuage de texte sur un écran de téléphone.
  peaks.sort((a, b) => (b.ele ?? 0) - (a.ele ?? 0));

  return { lines, water, peaks: peaks.slice(0, MAX_PEAKS) };
}

/** Simplifie tout le fond, en relâchant la tolérance jusqu'à tenir le budget. */
function fitContext(context, box) {
  let tolerance = Math.max(12, box.diagKm * 5);
  let result = context;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    result = {
      lines: context.lines
        .map((line) => ({ kind: line.kind, points: simplify(line.points, tolerance) }))
        .filter((line) => line.points.length >= 2),
      water: context.water
        .map((polygon) => simplify(polygon, tolerance))
        .filter((polygon) => polygon.length >= 4),
      peaks: context.peaks,
    };
    const total = countPoints(result);
    if (total <= MAX_CONTEXT_POINTS) {
      break;
    }
    tolerance *= 1.6;
  }

  return { context: result, tolerance: Math.round(tolerance) };
}

const countPoints = (context) =>
  context.lines.reduce((sum, line) => sum + line.points.length, 0) +
  context.water.reduce((sum, polygon) => sum + polygon.length, 0);

/**
 * Récupère le décor de toutes les emprises en une seule requête.
 *
 * Deux leçons de la première version, qui enchaînait une requête par
 * randonnée. D'abord, une requête par emprise multiplie les occasions de
 * tomber sur une instance saturée : ici, tout tient en un appel. Ensuite, les
 * filtres par expression régulière sur `highway` forcent un balayage côté
 * serveur, qui répondait alors par des délais dépassés ; demander la clé
 * entière et trier ici est bien plus rapide, au prix d'une réponse plus grosse.
 */
async function fetchContext(boxes) {
  const clauses = boxes
    .map((box) => {
      const bbox = `${box.minLat},${box.minLon},${box.maxLat},${box.maxLon}`;
      return [
        `  way["highway"](${bbox});`,
        `  way["waterway"](${bbox});`,
        `  way["natural"="coastline"](${bbox});`,
        `  way["natural"="water"](${bbox});`,
        `  node["natural"="peak"](${bbox});`,
      ].join('\n');
    })
    .join('\n');

  const payload = await overpass(`[out:json][timeout:300];\n(\n${clauses}\n);\nout geom;`);
  return payload.elements ?? [];
}

/** Silhouettes d'îles, pour l'encart de localisation du plan. */
async function fetchOutlines() {
  const clauses = Object.values(ISLAND_BOXES)
    .map(
      (box) =>
        `  way["natural"="coastline"](${box.minLat},${box.minLon},${box.maxLat},${box.maxLon});`,
    )
    .join('\n');
  const elements =
    (await overpass(`[out:json][timeout:300];\n(\n${clauses}\n);\nout geom;`)).elements ?? [];

  const outlines = {};
  for (const [islandId, box] of Object.entries(ISLAND_BOXES)) {
    // La côte est découpée en plusieurs chemins : on garde tous ceux qui
    // tombent dans l'emprise et dépassent le kilomètre et demi, ce qui écarte
    // les motu et les îlots sans amputer l'île. Ne garder que les plus longs
    // coupait la pointe nord de Mooreaet le départ du Rotui avec elle.
    const rings = elements
      .map((element) => (element.geometry ?? []).map((point) => [point.lat, point.lon]))
      .filter(
        (geometry) =>
          geometry.length >= 3 &&
          geometry.every((point) => inBox(point, box)) &&
          lengthM(geometry) > MIN_OUTLINE_RING_M,
      );

    if (rings.length === 0) {
      throw new Error(`silhouette de ${islandId} introuvable dans son emprise`);
    }

    // La tolérance part fine et ne se relâche que pour tenir le budget : à
    // 150 m d'emblée, la pointe nord de Moorea disparaissaitet le repère de
    // l'encart tombait hors de l'île pour le mont Rotui.
    let tolerance = 40;
    let simplified = rings.map((ring) => simplify(ring, tolerance));
    while (simplified.reduce((sum, ring) => sum + ring.length, 0) > MAX_OUTLINE_POINTS) {
      tolerance *= 1.6;
      simplified = rings.map((ring) => simplify(ring, tolerance));
    }
    outlines[islandId] = simplified.filter((ring) => ring.length >= 3);
  }
  return outlines;
}

function serializePoints(points, indent, rounder) {
  return points.map(([lat, lon]) => `${indent}[${rounder(lat)}, ${rounder(lon)}],`).join('\n');
}

function serializeContext(id, context) {
  const lines = context.lines
    .map(
      (line) =>
        `      { kind: '${line.kind}', points: [\n${serializePoints(line.points, '        ', roundContext)}\n      ] },`,
    )
    .join('\n');
  const water = context.water
    .map((polygon) => `      [\n${serializePoints(polygon, '        ', roundContext)}\n      ],`)
    .join('\n');
  const peaks = context.peaks
    .map(
      (peak) =>
        `      { lat: ${roundContext(peak.lat)}, lon: ${roundContext(peak.lon)}, name: '${peak.name.replace(/'/g, "\\'")}'` +
        `${peak.ele === undefined ? '' : `, ele: ${peak.ele}`} },`,
    )
    .join('\n');

  return (
    `  '${id}': {\n` +
    `    water: [\n${water}\n    ],\n` +
    `    lines: [\n${lines}\n    ],\n` +
    `    peaks: [\n${peaks}\n    ],\n` +
    `  },`
  );
}

async function main() {
  const ids = TRACKS.flatMap((track) => track.ways);
  process.stdout.write(`Téléchargement de ${ids.length} chemins OSM...\n`);
  const geometries = await fetchGeometries(ids);

  // Les tracés d'abord : leurs emprises déterminent ce qu'il faut demander
  // pour le décoret une seule requête suffit ensuite pour tous.
  const drawn = TRACKS.map((track) => {
    const segments = track.ways.map((id) => {
      const geometry = geometries.get(id);
      if (!geometry) {
        throw new Error(`chemin OSM ${id} introuvable (supprimé ?), tracé ${track.id}`);
      }
      return geometry;
    });

    const full = chain(segments, track.start);
    const { points, tolerance } = simplifyToBudget(full);
    process.stdout.write(
      `  ${track.id.padEnd(22)} ${String(full.length).padStart(4)} pts → ` +
        `${String(points.length).padStart(3)} (±${tolerance} m) · ` +
        `${(lengthM(points) / 1000).toFixed(2)} km\n`,
    );
    return { track, points, box: contextBox(points) };
  });

  process.stdout.write('Téléchargement du décor...\n');
  const elements = await fetchContext(drawn.map((item) => item.box));
  process.stdout.write(`  ${elements.length} objets reçus\n`);

  const blocks = [];
  const contextBlocks = [];
  for (const { track, points, box } of drawn) {
    const raw = pickContext(elements, box, new Set(track.ways));
    const { context, tolerance: contextTolerance } = fitContext(raw, box);

    process.stdout.write(
      `  ${track.id.padEnd(22)} fond ${String(countPoints(context)).padStart(3)} pts ` +
        `(±${contextTolerance} m), ${context.lines.length} lignes, ` +
        `${context.water.length} plans d’eau, ${context.peaks.length} sommets\n`,
    );

    const coordinates = points
      .map(([lat, lon]) => `    [${round(lat)}, ${round(lon)}],`)
      .join('\n');

    blocks.push(
      `  // OSM ${track.ways.join(', ')} · ${track.note} · ` +
        `${(lengthM(points) / 1000).toFixed(2)} km\n` +
        `  '${track.id}': [\n${coordinates}\n  ],`,
    );
    contextBlocks.push(serializeContext(track.id, context));
  }

  process.stdout.write('Téléchargement des contours d’îles...\n');
  const outlines = await fetchOutlines();
  const outlineBlocks = Object.entries(outlines).map(
    ([islandId, rings]) =>
      `  '${islandId}': [\n` +
      rings
        .map((ring) => `    [\n${serializePoints(ring, '      ', roundContext)}\n    ],`)
        .join('\n') +
      `\n  ],`,
  );
  for (const [islandId, rings] of Object.entries(outlines)) {
    const total = rings.reduce((sum, ring) => sum + ring.length, 0);
    process.stdout.write(`  ${islandId.padEnd(22)} ${total} pts de contour\n`);
  }

  const contents = `/**
 * Tracés des randonnées, dérivés d'OpenStreetMap (licence ODbL).
 *
 * FICHIER GÉNÉRÉ par \`pnpm make:tracks\`, ne pas éditer à la main : les chemins
 * OSM retenus sont déclarés dans scripts/make-tracks.js, avec ce que chaque
 * tracé couvre réellement.
 *
 * Un tracé est un schéma d'orientation, pas un outil de navigation : il est
 * simplifié, parfois partielet l'écran le dit.
 */
import { TrackPoint } from './hikes.models';

export const HIKE_TRACKS: Readonly<Record<string, readonly TrackPoint[]>> = {
${blocks.join('\n')}
};
`;

  const basemap = `/**
 * Fond de carte des plans de randonnée, dérivé d'OpenStreetMap (licence ODbL).
 *
 * FICHIER GÉNÉRÉ par \`pnpm make:tracks\`, ne pas éditer à la main.
 *
 * Le fond est trié, pas exhaustif : la côte, l'eau, les rivières, les routes,
 * les sentiers voisins assez longs pour être des optionset les sommets
 * nommés. Les pistes et les ruisseaux courts sont écartés, sinon le tracé se
 * noierait dans son propre décor et le fond pèserait plus que toute l'app.
 *
 * Pas de tuiles raster : elles coûteraient des centaines de kilo-octets par
 * sentier à préchargeret laisseraient croire à un GPS.
 */
import { HikeBaseMap, TrackPoint } from './hikes.models';

export const HIKE_BASEMAPS: Readonly<Record<string, HikeBaseMap>> = {
${contextBlocks.join('\n')}
};

/** Silhouette des îles, pour situer le sentier dans l'encart du plan. */
export const ISLAND_OUTLINES: Readonly<Record<string, readonly (readonly TrackPoint[])[]>> = {
${outlineBlocks.join('\n')}
};
`;

  await writeFile(OUT_FILE, contents, 'utf8');
  await writeFile(BASEMAP_FILE, basemap, 'utf8');
  process.stdout.write(`Écrit ${OUT_FILE}\n`);
  process.stdout.write(`Écrit ${BASEMAP_FILE}\n`);
}

await main();
