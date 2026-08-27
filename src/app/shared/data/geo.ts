/**
 * Les distances sont calculées depuis les coordonnées plutôt que stockées : toute
 * paire d'îles devient comparableet il n'y a qu'une source à tenir à jour.
 */

export interface GeoPoint {
  /** Degrés décimaux, positifs vers le nord et vers l'est. */
  readonly lat: number;
  readonly lon: number;
}

const EARTH_RADIUS_KM = 6371;

const RAD = Math.PI / 180;

/**
 * Distance orthodromique, par haversine. L'hypothèse sphérique coûte 0,3 pour
 * cent d'erreur, sans conséquence à l'échelle d'un vol inter-îles.
 */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.lat - a.lat) * RAD;
  const dLon = (b.lon - a.lon) * RAD;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Cap initial de `from` vers `to`, en degrés depuis le nord. */
export function initialBearing(from: GeoPoint, to: GeoPoint): number {
  const dLon = (to.lon - from.lon) * RAD;
  const y = Math.sin(dLon) * Math.cos(to.lat * RAD);
  const x =
    Math.cos(from.lat * RAD) * Math.sin(to.lat * RAD) -
    Math.sin(from.lat * RAD) * Math.cos(to.lat * RAD) * Math.cos(dLon);

  return (Math.atan2(y, x) / RAD + 360) % 360;
}

/** Cap en français plutôt qu'en degrés. */
export function bearingLabel(bearing: number): string {
  const sectors = ['nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ouest', 'ouest', 'nord-ouest'];
  return sectors[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];
}

export interface Bounds {
  readonly minLat: number;
  readonly maxLat: number;
  readonly minLon: number;
  readonly maxLon: number;
}

export interface Projected {
  readonly x: number;
  readonly y: number;
}

/**
 * Projection équirectangulaire vers un viewBox SVG, longitude corrigée par le
 * cosinus de la latitude médiane : sans quoi la carte étirerait les archipels
 * d'est en ouest.
 */
export function projectToSvg(
  point: GeoPoint,
  bounds: Bounds,
  width: number,
  height: number,
  padding = 0,
): Projected {
  const midLat = (bounds.minLat + bounds.maxLat) / 2;
  const lonScale = Math.cos(midLat * RAD);

  const lonSpan = (bounds.maxLon - bounds.minLon) * lonScale;
  const latSpan = bounds.maxLat - bounds.minLat;

  const innerWidth = width - 2 * padding;
  const innerHeight = height - 2 * padding;

  const x = padding + (((point.lon - bounds.minLon) * lonScale) / lonSpan) * innerWidth;
  const y = padding + ((bounds.maxLat - point.lat) / latSpan) * innerHeight;

  return { x, y };
}

/** Boîte englobante, élargie d'une marge en degrés. */
export function boundsOf(points: readonly GeoPoint[], marginDegrees = 0): Bounds {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);

  return {
    minLat: Math.min(...lats) - marginDegrees,
    maxLat: Math.max(...lats) + marginDegrees,
    minLon: Math.min(...lons) - marginDegrees,
    maxLon: Math.max(...lons) + marginDegrees,
  };
}

/**
 * Anneau d'un contour, dans l'ordre GeoJSON : `[longitude, latitude]`, à
 * l'inverse de `GeoPoint`. C'est la forme dans laquelle arrivent les contours
 * de côte extraits d'OpenStreetMap (scripts/build-coastlines.js).
 */
export type Ring = readonly (readonly [number, number])[];

/** Le dixième de pixel suffit largement : au delà, ce sont des octets perdus. */
const roundPx = (value: number): number => {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded;
};

/**
 * Tracé SVG d'un ensemble d'anneaux, projetés comme le reste de la carte.
 *
 * Les anneaux sont concaténés en sous-chemins d'un même `d` : avec le
 * remplissage `nonzero` par défaut, un anneau tracé en sens inverse creuse
 * celui qui le contient. C'est ce qui donne son lagon à un atoll sans aucun
 * traitement particulier, à condition que le jeu de données respecte le sens
 * de la RFC 7946 — ce que garantit le script d'extraction.
 */
export function svgPathFromRings(
  rings: readonly Ring[],
  bounds: Bounds,
  width: number,
  height: number,
  padding = 0,
): string {
  let path = '';

  for (const ring of rings) {
    if (ring.length < 3) {
      continue;
    }
    let command = 'M';
    for (const [lon, lat] of ring) {
      const { x, y } = projectToSvg({ lat, lon }, bounds, width, height, padding);
      path += `${command}${roundPx(x)} ${roundPx(y)}`;
      command = 'L';
    }
    path += 'Z';
  }

  return path;
}

/**
 * Boîte englobante d'un contour, élargie d'une fraction de son emprise plutôt
 * que d'un nombre de degrés : un encart doit respirer autant autour de Maupiti
 * que d'une île cent fois plus grande.
 */
export function boundsOfRings(rings: readonly Ring[], marginRatio = 0): Bounds {
  const points: GeoPoint[] = [];
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      points.push({ lat, lon });
    }
  }

  const base = boundsOf(points);

  // Un contour réduit à un point donnerait une emprise nulle, donc une division
  // par zéro à la projection : on lui laisse le minimum vital.
  const latSpan = Math.max(base.maxLat - base.minLat, 1e-4);
  const lonSpan = Math.max(base.maxLon - base.minLon, 1e-4);

  return {
    minLat: base.minLat - latSpan * marginRatio,
    maxLat: base.minLat + latSpan * (1 + marginRatio),
    minLon: base.minLon - lonSpan * marginRatio,
    maxLon: base.minLon + lonSpan * (1 + marginRatio),
  };
}

/**
 * Élargit l'emprise sur son axe le plus court pour qu'elle remplisse un viewBox
 * du rapport demandé. Sans quoi la projection étirerait le dessin pour occuper
 * toute la place : une île plus haute que large sortirait aplatie d'un encart
 * carré.
 */
export function fitBoundsToAspect(bounds: Bounds, aspect: number): Bounds {
  const midLat = (bounds.minLat + bounds.maxLat) / 2;
  const lonScale = Math.cos(midLat * RAD);

  const latSpan = bounds.maxLat - bounds.minLat;
  const lonSpan = bounds.maxLon - bounds.minLon;

  if (lonSpan * lonScale < latSpan * aspect) {
    const grow = ((latSpan * aspect) / lonScale - lonSpan) / 2;
    return { ...bounds, minLon: bounds.minLon - grow, maxLon: bounds.maxLon + grow };
  }

  const grow = ((lonSpan * lonScale) / aspect - latSpan) / 2;
  return { ...bounds, minLat: bounds.minLat - grow, maxLat: bounds.maxLat + grow };
}

/** `28 km`, `1 400 km`. */
export function formatKm(km: number): string {
  const rounded = km < 100 ? Math.round(km) : Math.round(km / 10) * 10;
  return `${new Intl.NumberFormat('fr-FR').format(rounded)} km`;
}
