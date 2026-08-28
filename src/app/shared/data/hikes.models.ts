/**
 * Randonnées par île.
 *
 * Règle du jeu de données : une métrique introuvable dans les sources est
 * absente, jamais zéro ni une estimation. Les écrans affichent « non publiée »
 * plutôt que d'inventeret les filtres excluent ce qu'on ne sait pas mesurer.
 *
 * Les URLs des sources et les arbitrages vivent en commentaires de
 * hikes.data.ts : l'app est hors ligne et aucun lien http n'a sa place dans les
 * données livrées. Le champ `sources` en porte les noms, affichés sur la fiche.
 */

/** Cotation à quatre niveaux, celle des topo-guides polynésiens. */
export type HikeDifficulty = 'facile' | 'moyen' | 'difficile' | 'tres-difficile';

/** Forme du parcours : ce qui décide de l'organisation du transport. */
export type HikeKind = 'aller-retour' | 'boucle' | 'traversee';

/**
 * Encadrement. `obligatoire` couvre la réglementation comme le foncier privé,
 * `conseille` l'usage local fortement recommandé, `facultatif` les sentiers
 * praticables seul.
 */
export type GuideLevel = 'facultatif' | 'conseille' | 'obligatoire';

/** Point du tracé : latitude, longitude, en degrés décimaux. */
export type TrackPoint = readonly [number, number];

/**
 * Ce que le tracé couvre réellement. `partiel` est fréquent : les sentiers
 * polynésiens ne sont cartographiés qu'en partieet prétendre le contraire
 * serait la pire des erreurs sur un plan de randonnée.
 */
export type TrackCoverage = 'complet' | 'partiel';

/**
 * Nature d'une ligne du fond de carte. Quatre catégories seulement : au delà,
 * le décor concurrence le sentier au lieu de le situer.
 */
export type BaseMapLineKind = 'coast' | 'river' | 'road' | 'path';

export interface BaseMapLine {
  readonly kind: BaseMapLineKind;
  readonly points: readonly TrackPoint[];
}

export interface BaseMapPeak {
  readonly lat: number;
  readonly lon: number;
  readonly name: string;
  /** Altitude en mètres, quand OSM la renseigne. */
  readonly ele?: number;
}

/** Ce qui est dessiné derrière le tracé, pour répondre à « où suis-je ». */
export interface HikeBaseMap {
  readonly water: readonly (readonly TrackPoint[])[];
  readonly lines: readonly BaseMapLine[];
  readonly peaks: readonly BaseMapPeak[];
}

export interface HikeWaypoint {
  readonly lat: number;
  readonly lon: number;
  /** Court, il est écrit sur le plan : « Départ », « Sommet, 899 m ». */
  readonly label: string;
}

export interface Hike {
  /** Kebab-case, segment d'URL et clé de favori : ne pas renommer sans redirection. */
  readonly id: string;
  readonly name: string;
  /** Référence `Island.id` de islands.data.ts, jamais un nom en clair. */
  readonly islandId: string;
  /**
   * `images/hikes/<id>.webp`, 660 × 440. Absente quand aucune photo libre ne
   * montre ce sentier précisément : une vue « de l'île » serait trompeuse.
   */
  readonly image?: string;
  /** Auteur et licence, affichés sous la photo. Obligatoire avec `image`. */
  readonly photoCredit?: string;
  readonly difficulty: HikeDifficulty;
  readonly kind: HikeKind;
  /** Distance totale du parcours en km, absente si aucune source ne la publie. */
  readonly lengthKm?: number;
  /** Durée de marche en minutes, pauses non comprises. 210 vaut 3 h 30. */
  readonly durationMin?: number;
  /** Dénivelé positif cumulé en mètres. */
  readonly elevationGainM?: number;
  /** Désaccord notable entre sources, dit à l'utilisateur plutôt que masqué. */
  readonly metricsNote?: string;
  readonly guide: GuideLevel;
  /** Pourquoi un guide. Obligatoire dès que `guide` n'est pas `facultatif`. */
  readonly guideNote?: string;
  /** Billet, autorisation, propriété privée. Formulé pour survivre à un changement de tarif. */
  readonly accessNote?: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly advice: readonly string[];
  /** Affichés avant tout le reste. Obligatoires si `tres-difficile` ou guide obligatoire. */
  readonly warnings: readonly string[];
  /** Ce que le tracé couvre, quand il y en a un. */
  readonly trackCoverage?: TrackCoverage;
  /** Points remarquables posés sur le plan, coordonnées vérifiables. */
  readonly waypoints?: readonly HikeWaypoint[];
  /** Provenance des métriques, affichée en pied de fiche. */
  readonly sources: readonly string[];
  /** Date ISO de la dernière vérification humaine, affichée sur la fiche. */
  readonly reviewedOn: string;
}

export const DIFFICULTY_LABELS: Readonly<Record<HikeDifficulty, string>> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
  'tres-difficile': 'Très difficile',
};

/** Pastille de difficulté, même gamme que RISK_CLASSES de la faune. */
export const DIFFICULTY_CLASSES: Readonly<Record<HikeDifficulty, string>> = {
  facile: 'bg-accent text-accent-ink',
  moyen: 'bg-surface-2 text-ink-1',
  difficile: 'bg-coral text-surface-1',
  'tres-difficile': 'bg-danger text-surface-1',
};

/** Ordre de lecture : du plus accessible au plus engagé. */
export const DIFFICULTY_ORDER: readonly HikeDifficulty[] = [
  'facile',
  'moyen',
  'difficile',
  'tres-difficile',
];

export const KIND_LABELS: Readonly<Record<HikeKind, string>> = {
  'aller-retour': 'Aller-retour',
  boucle: 'Boucle',
  traversee: 'Traversée',
};

export const GUIDE_LABELS: Readonly<Record<GuideLevel, string>> = {
  facultatif: 'Faisable en autonomie',
  conseille: 'Guide conseillé',
  obligatoire: 'Guide obligatoire',
};

export const COVERAGE_LABELS: Readonly<Record<TrackCoverage, string>> = {
  complet: 'Tracé du sentier complet',
  partiel: 'Tracé partiel',
};

/**
 * Attribution des tracés, affichée sous chaque plan.
 *
 * La licence ODbL d'OpenStreetMap impose de créditer la source : ce n'est pas
 * une politesse, c'est la condition d'usage des données. Les identifiants des
 * chemins retenus sont en commentaires de hikes.tracks.ts.
 */
export const TRACK_CREDIT = 'Tracé d’après les contributeurs d’OpenStreetMap, licence ODbL';

export type LengthBucket = 'courte' | 'moyenne' | 'longue';

export const LENGTH_LABELS: Readonly<Record<LengthBucket, string>> = {
  courte: 'Moins de 5 km',
  moyenne: '5 à 10 km',
  longue: 'Plus de 10 km',
};

export const LENGTH_ORDER: readonly LengthBucket[] = ['courte', 'moyenne', 'longue'];

export type DurationBucket = 'demi-journee' | 'journee' | 'grande-journee';

export const DURATION_LABELS: Readonly<Record<DurationBucket, string>> = {
  'demi-journee': 'Moins de 3 h',
  journee: '3 à 5 h',
  'grande-journee': 'Plus de 5 h',
};

export const DURATION_ORDER: readonly DurationBucket[] = [
  'demi-journee',
  'journee',
  'grande-journee',
];

/**
 * Une randonnée sans distance publiée ne correspond à aucune tranche : filtrer
 * sur la longueur exclut honnêtement ce qu'on ne sait pas mesurer. Elle reste
 * visible sans filtre, où sa carte affiche « topo non chiffré ».
 */
export function matchesLength(hike: Hike, bucket: LengthBucket): boolean {
  const km = hike.lengthKm;
  if (km === undefined) {
    return false;
  }
  switch (bucket) {
    case 'courte':
      return km < 5;
    case 'moyenne':
      return km >= 5 && km <= 10;
    case 'longue':
      return km > 10;
  }
}

/** Même règle que `matchesLength`, aux bornes de 3 h et 5 h. */
export function matchesDuration(hike: Hike, bucket: DurationBucket): boolean {
  const minutes = hike.durationMin;
  if (minutes === undefined) {
    return false;
  }
  switch (bucket) {
    case 'demi-journee':
      return minutes < 180;
    case 'journee':
      return minutes >= 180 && minutes <= 300;
    case 'grande-journee':
      return minutes > 300;
  }
}

/** `45 min`, `3 h`, `3 h 30`. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`;
}

/** `9,8 km`, `3 km`. Les distances de sentier se lisent au dixième. */
export function formatHikeKm(km: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(km)} km`;
}

/** `+200 m`, `+1 500 m`. Un dénivelé à quatre chiffres se lit mal sans séparateur. */
export function formatElevation(metres: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(metres)} m`;
}

/**
 * Distance à parcourir dans un sens. Un aller-retour publie la distance totale,
 * alors que le tracé, lui, ne décrit qu'un aller : sans cette conversion, toute
 * comparaison entre les deux serait fausse d'un facteur deux.
 */
export function oneWayKm(hike: Hike): number | undefined {
  if (hike.lengthKm === undefined) {
    return undefined;
  }
  return hike.kind === 'aller-retour' ? hike.lengthKm / 2 : hike.lengthKm;
}

/**
 * Durée de marche estimée en heures, par une règle de Naismith adaptée au
 * terrain tropical : quatre kilomètres par heure à plat, quatre cent cinquante
 * mètres de montée par heure. Sert de garde fou aux tests, pas d'affichage :
 * la durée montrée est toujours celle des sources.
 */
export function naismithHours(km: number, elevationGainM: number): number {
  return km / 4 + elevationGainM / 450;
}
