/**
 * Tous les facteurs sont des définitions exactes, pas des approximations : le
 * mille nautique vaut 1 852 m par convention, le pied 0,3048 m depuis 1959.
 */

export interface Unit {
  readonly id: string;
  readonly symbol: string;
  readonly label: string;
  readonly toBase: (value: number) => number;
  readonly fromBase: (value: number) => number;
  readonly decimals: number;
  readonly note?: string;
}

export interface UnitCategory {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly defaultUnitId: string;
  readonly units: readonly Unit[];
  readonly hint: string;
}

/** @param factor Combien d'unités de base vaut une unité de celle-ci. */
function linear(
  id: string,
  symbol: string,
  label: string,
  factor: number,
  decimals: number,
  note?: string,
): Unit {
  return {
    id,
    symbol,
    label,
    decimals,
    note,
    toBase: (value) => value * factor,
    fromBase: (value) => value / factor,
  };
}

export const UNIT_CATEGORIES: readonly UnitCategory[] = [
  {
    id: 'distance',
    title: 'Distance',
    icon: '📏',
    defaultUnitId: 'nautical-mile',
    hint: 'Les distances entre îles et les sorties bateau se comptent en milles nautiques.',
    units: [
      // Base : le kilomètre.
      linear('kilometre', 'km', 'kilomètres', 1, 2),
      linear(
        'nautical-mile',
        'NM',
        'milles nautiques',
        1.852,
        2,
        'Un mille nautique vaut 1 852 m, soit une minute d’arc de méridien.',
      ),
      linear('mile', 'mi', 'milles terrestres', 1.609344, 2, 'Le mile des sources anglo-saxonnes.'),
      linear('metre', 'm', 'mètres', 0.001, 0),
    ],
  },
  {
    id: 'speed',
    title: 'Vitesse',
    icon: '💨',
    defaultUnitId: 'knot',
    hint: 'Le nœud est un mille nautique par heure : c’est l’unité des bateaux et du vent.',
    units: [
      // Base : le kilomètre par heure.
      linear('kmh', 'km/h', 'kilomètres par heure', 1, 1),
      linear('knot', 'kn', 'nœuds', 1.852, 1, 'Un nœud vaut exactement 1,852 km/h.'),
      linear('ms', 'm/s', 'mètres par seconde', 3.6, 1, 'L’unité des bulletins météo marine.'),
      linear('mph', 'mph', 'miles par heure', 1.609344, 1),
    ],
  },
  {
    id: 'depth',
    title: 'Profondeur',
    icon: '🤿',
    defaultUnitId: 'metre',
    hint: 'Les cartes marines anciennes et le matériel de plongée américain sont en pieds ou en brasses.',
    units: [
      // Base : le mètre.
      linear('metre', 'm', 'mètres', 1, 1),
      linear('foot', 'ft', 'pieds', 0.3048, 1, 'Un pied vaut exactement 0,3048 m.'),
      linear('fathom', 'brasses', 'brasses', 1.8288, 2, 'Une brasse vaut six pieds.'),
    ],
  },
  {
    id: 'temperature',
    title: 'Température',
    icon: '🌡️',
    defaultUnitId: 'celsius',
    hint: 'L’eau du lagon tourne autour de 27 °C toute l’année.',
    units: [
      // Base : le degré Celsius. L'échelle Fahrenheit a un décalage, elle n'est
      // donc pas proportionnelle et ne passe pas par linear().
      {
        id: 'celsius',
        symbol: '°C',
        label: 'degrés Celsius',
        decimals: 1,
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'fahrenheit',
        symbol: '°F',
        label: 'degrés Fahrenheit',
        decimals: 1,
        note: 'Échelle des sources américaines.',
        toBase: (value) => ((value - 32) * 5) / 9,
        fromBase: (value) => (value * 9) / 5 + 32,
      },
    ],
  },
];

/** Convertit une valeur d'une unité vers une autre de la même catégorie. */
export function convertUnit(value: number, from: Unit, to: Unit): number {
  return to.fromBase(from.toBase(value));
}

/** Les zéros décimaux inutiles sont retirés : 1,50 NM se lit « 1,5 NM ». */
export function formatUnitValue(value: number, unit: Unit): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: unit.decimals,
  }).format(value);
}

export function findCategory(id: string): UnitCategory | undefined {
  return UNIT_CATEGORIES.find((category) => category.id === id);
}

/** Se rabat sur l'unité par défaut si l'identifiant est inconnu. */
export function findUnit(category: UnitCategory, id: string): Unit {
  return (
    category.units.find((unit) => unit.id === id) ??
    category.units.find((unit) => unit.id === category.defaultUnitId) ??
    category.units[0]
  );
}
