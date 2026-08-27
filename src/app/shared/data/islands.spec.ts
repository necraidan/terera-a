import { haversineKm } from './geo';
import { ARCHIPELAGOS, ISLANDS, REFERENCE_ISLAND, SCALE_NOTES, SEA_LINKS } from './islands.data';
import { ArchipelagoId } from './islands.models';

/** Emprise de la Polynésie française, marge comprise. */
const BOUNDS = { minLat: -29, maxLat: -7, minLon: -156, maxLon: -133 };

/** Les trois seuls décalages horaires du territoire. */
const OFFSETS = [-10, -9.5, -9];

const distanceFromPapeete = (id: string): number => {
  const island = ISLANDS.find((i) => i.id === id);
  if (!island) {
    throw new Error(`île inconnue : ${id}`);
  }
  return haversineKm(REFERENCE_ISLAND, island);
};

describe('cohérence des îles', () => {
  it('utilise des identifiants uniques', () => {
    const ids = ISLANDS.map((island) => island.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rattache chaque île à un archipel déclaré', () => {
    const known = new Set<ArchipelagoId>(ARCHIPELAGOS.map((a) => a.id));
    for (const island of ISLANDS) {
      expect(known.has(island.archipelagoId), island.id).toBe(true);
    }
  });

  it('place chaque île dans l’emprise de la Polynésie française', () => {
    // Un signe oublié sur une longitude enverrait une île en Afrique et
    // ruinerait à la fois la carte et le calcul de lever du soleil.
    for (const island of ISLANDS) {
      expect(island.lat, island.id).toBeGreaterThan(BOUNDS.minLat);
      expect(island.lat, island.id).toBeLessThan(BOUNDS.maxLat);
      expect(island.lon, island.id).toBeGreaterThan(BOUNDS.minLon);
      expect(island.lon, island.id).toBeLessThan(BOUNDS.maxLon);
    }
  });

  it('n’utilise que les trois décalages horaires du territoire', () => {
    for (const island of ISLANDS) {
      expect(OFFSETS, island.id).toContain(island.utcOffsetHours);
    }
  });

  it('donne aux Marquises leur décalage propre', () => {
    // Les Marquises ont 30 minutes d'avance sur le reste du territoire.
    for (const island of ISLANDS.filter((i) => i.archipelagoId === 'marquises')) {
      expect(island.utcOffsetHours, island.id).toBe(-9.5);
    }
    for (const island of ISLANDS.filter((i) => i.archipelagoId === 'gambier')) {
      expect(island.utcOffsetHours, island.id).toBe(-9);
    }
  });

  it('déclare exactement une île de référence', () => {
    expect(ISLANDS.filter((island) => island.isReference === true).length).toBe(1);
    expect(REFERENCE_ISLAND.id).toBe('tahiti');
  });

  it('déclare au moins un moyen d’accès par île', () => {
    for (const island of ISLANDS) {
      expect(island.access.length, island.id).toBeGreaterThan(0);
    }
  });

  it('ne donne une durée de vol qu’aux îles accessibles en avion', () => {
    for (const island of ISLANDS) {
      if (island.flightMinutesFromPapeete !== undefined) {
        expect(island.access, island.id).toContain('avion');
      }
    }
  });
});

describe('distances calculées depuis les coordonnées', () => {
  it('retrouve les distances établies vers les îles principales', () => {
    // Repères vérifiables : ils valident les coordonnées elles mêmes, puisque
    // aucune distance n'est stockée dans les données.
    expect(distanceFromPapeete('bora-bora')).toBeGreaterThan(245);
    expect(distanceFromPapeete('bora-bora')).toBeLessThan(270);

    expect(distanceFromPapeete('nuku-hiva')).toBeGreaterThan(1350);
    expect(distanceFromPapeete('nuku-hiva')).toBeLessThan(1450);

    expect(distanceFromPapeete('rapa')).toBeGreaterThan(1200);
    expect(distanceFromPapeete('rapa')).toBeLessThan(1300);
  });

  it('place Moorea juste en face de Tahiti', () => {
    // Une trentaine de kilomètres de centre à centre. Le chenal lui même,
    // celui que traverse le ferry, ne fait qu'une vingtaine de kilomètres.
    expect(distanceFromPapeete('moorea')).toBeLessThan(40);
  });

  it('éloigne les Marquises et les Gambier plus que toute la Société', () => {
    const society = ISLANDS.filter((i) => i.archipelagoId === 'societe').map((i) =>
      haversineKm(REFERENCE_ISLAND, i),
    );
    const farthestSociety = Math.max(...society);

    for (const island of ISLANDS.filter(
      (i) => i.archipelagoId === 'marquises' || i.archipelagoId === 'gambier',
    )) {
      expect(haversineKm(REFERENCE_ISLAND, island), island.id).toBeGreaterThan(farthestSociety);
    }
  });

  it('donne des durées de vol compatibles avec les distances', () => {
    // Un ATR croise entre 300 et 550 km/h. Une durée hors de cette plage
    // signale une valeur saisie de travers, ou une coordonnée fausse.
    for (const island of ISLANDS) {
      const minutes = island.flightMinutesFromPapeete;
      if (minutes === undefined || minutes < 20) {
        continue;
      }
      const impliedSpeed = (haversineKm(REFERENCE_ISLAND, island) / minutes) * 60;
      expect(impliedSpeed, `${island.id} : ${Math.round(impliedSpeed)} km/h`).toBeGreaterThan(200);
      expect(impliedSpeed, `${island.id} : ${Math.round(impliedSpeed)} km/h`).toBeLessThan(600);
    }
  });
});

describe('cohérence des archipels', () => {
  it('utilise des identifiants uniques', () => {
    const ids = ARCHIPELAGOS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('compte au moins une île décrite par archipel', () => {
    for (const archipelago of ARCHIPELAGOS) {
      const count = ISLANDS.filter((i) => i.archipelagoId === archipelago.id).length;
      expect(count, archipelago.id).toBeGreaterThan(0);
    }
  });

  it('annonce plus d’îles dans l’archipel qu’on n’en décrit', () => {
    // La liste des îles est un choix des principales, pas un inventaire.
    for (const archipelago of ARCHIPELAGOS) {
      const described = ISLANDS.filter((i) => i.archipelagoId === archipelago.id).length;
      expect(archipelago.islandCount, archipelago.id).toBeGreaterThanOrEqual(described);
    }
  });

  it('ne réserve le régime de marée solaire qu’à la Société', () => {
    // C'est le fait remarquable du territoire : l'étendre par erreur à un autre
    // archipel donnerait des repères d'horaires faux là où la marée est lunaire.
    for (const archipelago of ARCHIPELAGOS) {
      const expected = archipelago.id === 'societe' ? 'solaire' : 'lunaire';
      expect(archipelago.tideRegime, archipelago.id).toBe(expected);
    }
  });

  it('décrit chaque archipel', () => {
    for (const archipelago of ARCHIPELAGOS) {
      expect(archipelago.character.trim(), archipelago.id).not.toBe('');
      expect(archipelago.highlights.length, archipelago.id).toBeGreaterThan(0);
    }
  });
});

describe('contenu rédactionnel', () => {
  it('décrit des liaisons maritimes', () => {
    expect(SEA_LINKS.length).toBeGreaterThan(0);
    for (const link of SEA_LINKS) {
      expect(link.route.trim()).not.toBe('');
      expect(link.note.trim()).not.toBe('');
    }
  });

  it('explique l’échelle du territoire', () => {
    expect(SCALE_NOTES.length).toBeGreaterThan(0);
  });
});
