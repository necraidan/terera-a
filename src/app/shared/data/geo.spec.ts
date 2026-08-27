import {
  Ring,
  bearingLabel,
  boundsOf,
  boundsOfRings,
  fitBoundsToAspect,
  formatKm,
  haversineKm,
  initialBearing,
  projectToSvg,
  svgPathFromRings,
} from './geo';

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

describe('svgPathFromRings', () => {
  // Emprise carrée : la correction de longitude par le cosinus s'applique à la
  // fois au point et à l'étendue, elle se simplifie donc, et les coordonnées
  // attendues se lisent à la main.
  const bounds = { minLat: 0, maxLat: 10, minLon: 0, maxLon: 10 };
  const square: Ring = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0],
  ];

  it('projette un carré connu sur un viewBox connu', () => {
    // La latitude monte vers le nord, donc le coin (0, 0) tombe en bas à gauche.
    expect(svgPathFromRings([square], bounds, 100, 100)).toBe('M0 100L100 100L100 0L0 0L0 100Z');
  });

  it('respecte la marge intérieure', () => {
    expect(svgPathFromRings([square], bounds, 100, 100, 10)).toBe(
      'M10 90L90 90L90 10L10 10L10 90Z',
    );
  });

  it('enchaîne les anneaux en sous-chemins d’un même tracé', () => {
    // C'est ce qui permet à un anneau de sens inverse de creuser le précédent :
    // le lagon d'un atoll est un trou, pas un second tracé.
    const hole: Ring = [
      [2, 2],
      [2, 8],
      [8, 8],
      [8, 2],
      [2, 2],
    ];
    const path = svgPathFromRings([square, hole], bounds, 100, 100);
    expect(path.match(/M/g)).toHaveLength(2);
    expect(path.endsWith('Z')).toBe(true);
  });

  it('ignore un anneau dégénéré', () => {
    expect(svgPathFromRings([[[1, 1]]], bounds, 100, 100)).toBe('');
    expect(svgPathFromRings([], bounds, 100, 100)).toBe('');
  });
});

describe('boundsOfRings', () => {
  const ring: Ring = [
    [1, 2],
    [3, 2],
    [3, 6],
    [1, 6],
    [1, 2],
  ];

  it('englobe l’anneau', () => {
    const bounds = boundsOfRings([ring]);
    expect(bounds.minLon).toBeCloseTo(1, 6);
    expect(bounds.maxLon).toBeCloseTo(3, 6);
    expect(bounds.minLat).toBeCloseTo(2, 6);
    expect(bounds.maxLat).toBeCloseTo(6, 6);
  });

  it('applique la marge en fraction de l’emprise', () => {
    // Un quart de part et d'autre : la longitude s'étend de 2, la latitude de 4.
    const bounds = boundsOfRings([ring], 0.25);
    expect(bounds.minLon).toBeCloseTo(0.5, 6);
    expect(bounds.maxLon).toBeCloseTo(3.5, 6);
    expect(bounds.minLat).toBeCloseTo(1, 6);
    expect(bounds.maxLat).toBeCloseTo(7, 6);
  });

  it('donne une emprise non nulle à un contour réduit à un point', () => {
    // Sans cela la projection diviserait par zéro et l'encart afficherait NaN.
    const bounds = boundsOfRings([
      [
        [5, 5],
        [5, 5],
      ],
    ]);
    expect(bounds.maxLat).toBeGreaterThan(bounds.minLat);
    expect(bounds.maxLon).toBeGreaterThan(bounds.minLon);
  });
});

describe('fitBoundsToAspect', () => {
  // Latitude médiane nulle : le cosinus vaut 1, les degrés se comparent tels quels.
  const square = { minLat: -5, maxLat: 5, minLon: -5, maxLon: 5 };

  it('laisse une emprise carrée dans un viewBox carré', () => {
    const bounds = fitBoundsToAspect(square, 1);
    expect(bounds.maxLon - bounds.minLon).toBeCloseTo(10, 6);
    expect(bounds.maxLat - bounds.minLat).toBeCloseTo(10, 6);
  });

  it('élargit en longitude pour un viewBox plus large que haut', () => {
    const bounds = fitBoundsToAspect(square, 2);
    expect(bounds.maxLon - bounds.minLon).toBeCloseTo(20, 6);
    expect(bounds.maxLat - bounds.minLat).toBeCloseTo(10, 6);
  });

  it('élargit en latitude pour une emprise plus large que le viewBox', () => {
    const wide = { minLat: -2, maxLat: 2, minLon: -10, maxLon: 10 };
    const bounds = fitBoundsToAspect(wide, 1);
    expect(bounds.maxLon - bounds.minLon).toBeCloseTo(20, 6);
    expect(bounds.maxLat - bounds.minLat).toBeCloseTo(20, 6);
  });

  it('reste centré sur la même emprise', () => {
    const bounds = fitBoundsToAspect(square, 2);
    expect((bounds.minLon + bounds.maxLon) / 2).toBeCloseTo(0, 6);
  });

  it('ne déforme pas le dessin, quel que soit le rapport', () => {
    // Un carré géographique doit ressortir carré à l'écran : c'est tout l'objet
    // de la fonction, et le contrôle passe par la projection elle même.
    const bounds = fitBoundsToAspect({ minLat: -1, maxLat: 1, minLon: -3, maxLon: 3 }, 160 / 116);
    const a = projectToSvg({ lat: -1, lon: -1 }, bounds, 160, 116);
    const b = projectToSvg({ lat: 1, lon: -1 }, bounds, 160, 116);
    const c = projectToSvg({ lat: -1, lon: 1 }, bounds, 160, 116);

    // Deux degrés de latitude et deux de longitude, à l'équateur : même longueur.
    expect(c.x - a.x).toBeCloseTo(a.y - b.y, 6);
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
