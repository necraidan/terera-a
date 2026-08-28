/**
 * Traits de côte de la carte, dérivés des « land polygons » d'OpenStreetMap
 * (ODbL) par scripts/build-coastlines.js.
 *
 * Ils sont importés comme des modules, donc compilés dans le bundle : le
 * service worker les précache avec le reste du code, sans requête réseau ni
 * `assetGroup` dédié. Le détail, plus lourd, part dans un chunk séparé chargé à
 * la demande — un JS servi depuis la même origine, donc précaché lui aussi.
 *
 * Les fichiers livrés peuvent être vides tant que le script n'a pas été passé
 * sur le shapefile source : la carte perd son fond, rien d'autre.
 */
import overview from './coastlines-overview.geo.json';
import { Ring } from './geo';

/** Géométrie GeoJSON minimale : `[polygone][anneau][point][lon, lat]`. */
interface MultiPolygon {
  readonly type: string;
  readonly coordinates: readonly (readonly (readonly (readonly number[])[])[])[];
}

/**
 * Aplatit les polygones en une liste d'anneaux : un seul `<path>` les porte
 * touset le remplissage `nonzero` continue de creuser les trous (cf.
 * `svgPathFromRings`).
 */
const ringsOf = (geometry: MultiPolygon): readonly Ring[] =>
  geometry.coordinates.flat() as unknown as readonly Ring[];

/** Les cinq archipels d'un coup, simplifiés pour l'échelle de la carte. */
export const OVERVIEW_RINGS: readonly Ring[] = ringsOf(overview as unknown as MultiPolygon);

/** Contour détaillé de chaque île, indexé par identifiant. */
export type CoastlineDetail = ReadonlyMap<string, readonly Ring[]>;

export async function loadCoastlineDetail(): Promise<CoastlineDetail> {
  const module = await import('./coastlines-detail.geo.json');
  const detail = module.default as unknown as Readonly<Record<string, MultiPolygon>>;

  return new Map(Object.entries(detail).map(([id, geometry]) => [id, ringsOf(geometry)]));
}
