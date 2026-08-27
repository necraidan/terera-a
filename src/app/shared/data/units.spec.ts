import { UNIT_CATEGORIES, convertUnit, findCategory, findUnit, formatUnitValue } from './units';

/** Normalise les espaces insécables produits par Intl pour comparer un libellé. */
const normalizeSpaces = (value: string): string => value.replace(/[\s\u00a0\u202f]/g, ' ');

/** Raccourci de test : récupère une unité par catégorie et identifiant. */
function unit(categoryId: string, unitId: string) {
  const category = findCategory(categoryId);
  if (!category) {
    throw new Error(`catégorie inconnue : ${categoryId}`);
  }
  const found = category.units.find((u) => u.id === unitId);
  if (!found) {
    throw new Error(`unité inconnue : ${categoryId}/${unitId}`);
  }
  return found;
}

describe('conversions de distance', () => {
  it('applique la définition exacte du mille nautique', () => {
    // 1 852 m par convention internationale.
    expect(
      convertUnit(1, unit('distance', 'nautical-mile'), unit('distance', 'metre')),
    ).toBeCloseTo(1852, 6);
    expect(
      convertUnit(1, unit('distance', 'nautical-mile'), unit('distance', 'kilometre')),
    ).toBeCloseTo(1.852, 9);
  });

  it('applique la définition exacte du mile terrestre', () => {
    expect(convertUnit(1, unit('distance', 'mile'), unit('distance', 'metre'))).toBeCloseTo(
      1609.344,
      6,
    );
  });

  it('convertit des kilomètres en milles nautiques', () => {
    // Moorea est à environ 17 km de Tahiti, soit un peu plus de 9 milles.
    expect(
      convertUnit(17, unit('distance', 'kilometre'), unit('distance', 'nautical-mile')),
    ).toBeCloseTo(9.18, 2);
  });
});

describe('conversions de vitesse', () => {
  it('fait du nœud un mille nautique par heure', () => {
    expect(convertUnit(1, unit('speed', 'knot'), unit('speed', 'kmh'))).toBeCloseTo(1.852, 9);
  });

  it('convertit les mètres par seconde des bulletins marine', () => {
    // 10 m/s vaut 36 km/h, soit un peu plus de 19 nœuds.
    expect(convertUnit(10, unit('speed', 'ms'), unit('speed', 'kmh'))).toBeCloseTo(36, 9);
    expect(convertUnit(10, unit('speed', 'ms'), unit('speed', 'knot'))).toBeCloseTo(19.438, 3);
  });
});

describe('conversions de profondeur', () => {
  it('applique la définition exacte du pied', () => {
    expect(convertUnit(1, unit('depth', 'foot'), unit('depth', 'metre'))).toBeCloseTo(0.3048, 9);
  });

  it('fait de la brasse six pieds', () => {
    expect(convertUnit(1, unit('depth', 'fathom'), unit('depth', 'foot'))).toBeCloseTo(6, 9);
  });

  it('convertit une profondeur de plongée', () => {
    // La limite loisir de 40 m se lit 131 pieds sur un ordinateur américain.
    expect(convertUnit(40, unit('depth', 'metre'), unit('depth', 'foot'))).toBeCloseTo(131.23, 2);
  });
});

describe('conversions de température', () => {
  it('gère le décalage de l’échelle Fahrenheit', () => {
    const c = unit('temperature', 'celsius');
    const f = unit('temperature', 'fahrenheit');

    expect(convertUnit(0, c, f)).toBeCloseTo(32, 9);
    expect(convertUnit(100, c, f)).toBeCloseTo(212, 9);
    expect(convertUnit(27, c, f)).toBeCloseTo(80.6, 9);
    expect(convertUnit(80.6, f, c)).toBeCloseTo(27, 9);
  });

  it('retrouve la valeur d’origine par aller-retour', () => {
    const c = unit('temperature', 'celsius');
    const f = unit('temperature', 'fahrenheit');
    expect(convertUnit(convertUnit(31, c, f), f, c)).toBeCloseTo(31, 9);
  });
});

describe('formatUnitValue', () => {
  it('retire les décimales inutiles', () => {
    expect(formatUnitValue(12, unit('distance', 'kilometre'))).toBe('12');
    expect(formatUnitValue(1.5, unit('distance', 'nautical-mile'))).toBe('1,5');
  });

  it('respecte la précision de l’unité', () => {
    // Le mètre s'affiche sans décimale, la brasse avec deux.
    expect(normalizeSpaces(formatUnitValue(1852.4, unit('distance', 'metre')))).toBe('1 852');
    expect(formatUnitValue(1.8288, unit('depth', 'fathom'))).toBe('1,83');
  });
});

describe('findUnit', () => {
  it('retrouve une unité existante', () => {
    const category = findCategory('speed');
    expect(category).toBeDefined();
    expect(findUnit(category!, 'knot').symbol).toBe('kn');
  });

  it('se rabat sur l’unité par défaut si l’identifiant est inconnu', () => {
    // Cas d'une préférence mémorisée devenue obsolète après une mise à jour.
    const category = findCategory('speed');
    expect(findUnit(category!, 'furlong-par-quinzaine').id).toBe(category!.defaultUnitId);
  });
});

describe('cohérence du catalogue', () => {
  it('utilise des identifiants de catégorie uniques', () => {
    const ids = UNIT_CATEGORIES.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('utilise des identifiants d’unité uniques dans chaque catégorie', () => {
    for (const category of UNIT_CATEGORIES) {
      const ids = category.units.map((u) => u.id);
      expect(new Set(ids).size, category.id).toBe(ids.length);
    }
  });

  it('déclare une unité par défaut qui existe', () => {
    for (const category of UNIT_CATEGORIES) {
      const ids = category.units.map((u) => u.id);
      expect(ids, category.id).toContain(category.defaultUnitId);
    }
  });

  it('déclare exactement une unité de base par catégorie', () => {
    // L'unité de base est celle dont la conversion est l'identité. Sans elle,
    // toutes les valeurs de la catégorie seraient décalées d'un facteur.
    for (const category of UNIT_CATEGORIES) {
      const bases = category.units.filter((u) => u.toBase(1) === 1 && u.fromBase(1) === 1);
      expect(bases.length, category.id).toBe(1);
    }
  });

  it('propose au moins deux unités par catégorie', () => {
    for (const category of UNIT_CATEGORIES) {
      expect(category.units.length, category.id).toBeGreaterThan(1);
    }
  });
});
