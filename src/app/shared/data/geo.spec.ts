import { bearingLabel, boundsOf, formatKm, haversineKm, initialBearing, projectToSvg } from './geo';

const PAPEETE = { lat: -17.5334, lon: -149.5667 };
const BORA_BORA = { lat: -16.5, lon: -151.75 };
const NUKU_HIVA = { lat: -8.9167, lon: -140.1 };
const RIKITEA = { lat: -23.1203, lon: -134.9694 };

describe('haversineKm', () => {
  it('donne zéro pour un point et lui même', () => {
    expect(haversineKm(PAPEETE, PAPEETE)).toBe(0);
  });

  it('retrouve la distance connue Tahiti vers Bora Bora', () => {
    // Environ 260 km, la valeur couramment citée pour ce trajet.
    expect(haversineKm(PAPEETE, BORA_BORA)).toBeGreaterThan(245);
    expect(haversineKm(PAPEETE, BORA_BORA)).toBeLessThan(275);
  });

  it('retrouve la distance connue Tahiti vers les Marquises', () => {
    // Environ 1 400 km jusqu'à Nuku Hiva.
    expect(haversineKm(PAPEETE, NUKU_HIVA)).toBeGreaterThan(1350);
    expect(haversineKm(PAPEETE, NUKU_HIVA)).toBeLessThan(1450);
  });

  it('est symétrique', () => {
    expect(haversineKm(PAPEETE, RIKITEA)).toBeCloseTo(haversineKm(RIKITEA, PAPEETE), 9);
  });

  it('mesure un degré de latitude à environ 111 km', () => {
    expect(haversineKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(111.19, 1);
  });
});

describe('initialBearing', () => {
  it('pointe vers le nord', () => {
    expect(initialBearing({ lat: 0, lon: 0 }, { lat: 10, lon: 0 })).toBeCloseTo(0, 6);
  });

  it('pointe vers l’est', () => {
    expect(initialBearing({ lat: 0, lon: 0 }, { lat: 0, lon: 10 })).toBeCloseTo(90, 6);
  });

  it('place les Marquises au nord-est de Tahiti', () => {
    const bearing = initialBearing(PAPEETE, NUKU_HIVA);
    expect(bearing).toBeGreaterThan(0);
    expect(bearing).toBeLessThan(90);
    expect(bearingLabel(bearing)).toBe('nord-est');
  });

  it('place les Gambier au sud-est de Tahiti', () => {
    expect(bearingLabel(initialBearing(PAPEETE, RIKITEA))).toBe('sud-est');
  });

  it('place Bora Bora à l’ouest nord-ouest de Tahiti', () => {
    const bearing = initialBearing(PAPEETE, BORA_BORA);
    expect(bearing).toBeGreaterThan(270);
    expect(bearing).toBeLessThan(360);
  });
});

describe('bearingLabel', () => {
  it('nomme les huit secteurs', () => {
    expect(bearingLabel(0)).toBe('nord');
    expect(bearingLabel(45)).toBe('nord-est');
    expect(bearingLabel(90)).toBe('est');
    expect(bearingLabel(135)).toBe('sud-est');
    expect(bearingLabel(180)).toBe('sud');
    expect(bearingLabel(225)).toBe('sud-ouest');
    expect(bearingLabel(270)).toBe('ouest');
    expect(bearingLabel(315)).toBe('nord-ouest');
  });

  it('repasse au nord au delà de 337 degrés', () => {
    expect(bearingLabel(350)).toBe('nord');
    expect(bearingLabel(360)).toBe('nord');
  });
});

describe('boundsOf', () => {
  it('englobe tous les points', () => {
    const bounds = boundsOf([PAPEETE, NUKU_HIVA, RIKITEA]);
    expect(bounds.minLat).toBeCloseTo(-23.1203, 4);
    expect(bounds.maxLat).toBeCloseTo(-8.9167, 4);
    expect(bounds.minLon).toBeCloseTo(-149.5667, 4);
    expect(bounds.maxLon).toBeCloseTo(-134.9694, 4);
  });

  it('applique la marge demandée', () => {
    const bounds = boundsOf([PAPEETE], 2);
    expect(bounds.maxLat - bounds.minLat).toBeCloseTo(4, 6);
    expect(bounds.maxLon - bounds.minLon).toBeCloseTo(4, 6);
  });
});

describe('projectToSvg', () => {
  const bounds = { minLat: -30, maxLat: -6, minLon: -156, maxLon: -132 };

  it('place le coin nord-ouest en haut à gauche', () => {
    const p = projectToSvg({ lat: -6, lon: -156 }, bounds, 100, 100);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it('place le coin sud-est en bas à droite', () => {
    const p = projectToSvg({ lat: -30, lon: -132 }, bounds, 100, 100);
    expect(p.x).toBeCloseTo(100, 6);
    expect(p.y).toBeCloseTo(100, 6);
  });

  it('inverse l’axe vertical, la latitude montant vers le nord', () => {
    const north = projectToSvg({ lat: -10, lon: -140 }, bounds, 100, 100);
    const south = projectToSvg({ lat: -25, lon: -140 }, bounds, 100, 100);
    expect(north.y).toBeLessThan(south.y);
  });

  it('respecte la marge intérieure', () => {
    const p = projectToSvg({ lat: -6, lon: -156 }, bounds, 100, 100, 10);
    expect(p.x).toBeCloseTo(10, 6);
    expect(p.y).toBeCloseTo(10, 6);
  });

  it('garde des proportions cohérentes entre est-ouest et nord-sud', () => {
    // Un degré de latitude et un degré de longitude ne couvrent pas la même
    // distance : la projection doit resserrer l'axe des longitudes, sinon la
    // carte étire artificiellement les archipels d'est en ouest.
    const origin = projectToSvg({ lat: -18, lon: -150 }, bounds, 100, 100);
    const oneDegreeEast = projectToSvg({ lat: -18, lon: -149 }, bounds, 100, 100);
    const oneDegreeNorth = projectToSvg({ lat: -17, lon: -150 }, bounds, 100, 100);

    const dx = oneDegreeEast.x - origin.x;
    const dy = origin.y - oneDegreeNorth.y;
    expect(dx).toBeLessThan(dy);
  });
});

describe('formatKm', () => {
  it('arrondit au kilomètre en dessous de cent', () => {
    expect(formatKm(28.4)).toBe('28 km');
  });

  it('arrondit à la dizaine au delà de cent', () => {
    // Une précision au kilomètre serait trompeuse sur un trajet de 1 400 km.
    expect(formatKm(259.3).replace(/[\s\u00a0\u202f]/g, ' ')).toBe('260 km');
    expect(formatKm(1404).replace(/[\s\u00a0\u202f]/g, ' ')).toBe('1 400 km');
  });
});
