import { haversineKm } from './geo';
import { HIKE_BASEMAPS, ISLAND_OUTLINES } from './hikes.basemap';
import { HIKES, HIKE_DISCLAIMER } from './hikes.data';
import {
  DIFFICULTY_ORDER,
  DURATION_ORDER,
  Hike,
  LENGTH_ORDER,
  formatDuration,
  formatHikeKm,
  matchesDuration,
  matchesLength,
  naismithHours,
  oneWayKm,
} from './hikes.models';
import { HIKE_TRACKS } from './hikes.tracks';
import { ISLANDS } from './islands.data';

const trackKm = (points: readonly (readonly [number, number])[]): number => {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineKm(
      { lat: points[i - 1][0], lon: points[i - 1][1] },
      { lat: points[i][0], lon: points[i][1] },
    );
  }
  return total;
};

const islandOf = (hike: Hike) => ISLANDS.find((island) => island.id === hike.islandId);

describe('cohérence des randonnées', () => {
  it('utilise des identifiants uniques', () => {
    // Les id servent de segment d'URL (/randonnees/:id) et de clé de favori :
    // un doublon rendrait une fiche inaccessible et l'étoile incohérente.
    const ids = HIKES.map((hike) => hike.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('n’utilise que des identifiants sûrs en URL', () => {
    for (const hike of HIKES) {
      expect(hike.id, hike.name).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('rattache chaque randonnée à une île décrite', () => {
    // Sans cette jointure, une fiche existerait sans jamais apparaître dans le
    // filtre par île, puisque la liste des îles est dérivée d'ISLANDS.
    for (const hike of HIKES) {
      expect(islandOf(hike), `${hike.id} : île ${hike.islandId} inconnue`).toBeDefined();
    }
  });

  it('renseigne le texte de chaque fiche', () => {
    for (const hike of HIKES) {
      expect(hike.name.trim(), hike.id).not.toBe('');
      expect(hike.summary.trim(), hike.id).not.toBe('');
      expect(hike.highlights.length, hike.id).toBeGreaterThan(0);
      expect(hike.advice.length, hike.id).toBeGreaterThan(0);
      expect(hike.sources.length, hike.id).toBeGreaterThan(0);
    }
  });

  it('n’embarque aucun lien http dans les données', () => {
    // L'app est hors ligne : les URLs des sources restent en commentaires du
    // fichier de données, jamais dans ce qui est livré à l'écran.
    for (const hike of HIKES) {
      const text = JSON.stringify(hike);
      expect(text, hike.id).not.toMatch(/https?:\/\//);
    }
  });

  it('date la vérification de chaque fiche, sans anticiper', () => {
    for (const hike of HIKES) {
      expect(hike.reviewedOn, hike.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const reviewed = new Date(hike.reviewedOn);
      expect(Number.isNaN(reviewed.getTime()), hike.id).toBe(false);
      expect(reviewed.getTime(), `${hike.id} : vérifiée dans le futur`).toBeLessThanOrEqual(
        Date.now(),
      );
    }
  });
});

describe('sécurité des fiches de randonnée', () => {
  it('avertit sur toute randonnée très difficile ou à guide obligatoire', () => {
    // C'est l'invariant qui compte le plus de ce fichier : l'Aorai et le Rotui
    // ont déjà nécessité des secours héliportés. Une fiche qui décrirait la vue
    // sans dire le danger serait pire que pas de fiche.
    for (const hike of HIKES) {
      if (hike.difficulty === 'tres-difficile' || hike.guide === 'obligatoire') {
        expect(hike.warnings.length, `${hike.id} : avertissement manquant`).toBeGreaterThan(0);
      }
    }
  });

  it('explique pourquoi un guide est nécessaire dès qu’il l’est', () => {
    for (const hike of HIKES) {
      if (hike.guide !== 'facultatif') {
        expect((hike.guideNote ?? '').trim(), `${hike.id} : guideNote manquante`).not.toBe('');
      }
    }
  });

  it('ne laisse aucun avertissement ni encart vide', () => {
    for (const hike of HIKES) {
      for (const warning of hike.warnings) {
        expect(warning.trim(), hike.id).not.toBe('');
      }
      if (hike.accessNote !== undefined) {
        expect(hike.accessNote.trim(), hike.id).not.toBe('');
      }
      if (hike.metricsNote !== undefined) {
        expect(hike.metricsNote.trim(), hike.id).not.toBe('');
      }
    }
  });

  it('rappelle les règles générales en pied de liste', () => {
    expect(HIKE_DISCLAIMER.length).toBeGreaterThan(0);
  });
});

describe('plausibilité des métriques', () => {
  it('reste dans des bornes crédibles pour une randonnée à la journée', () => {
    for (const hike of HIKES) {
      if (hike.lengthKm !== undefined) {
        expect(hike.lengthKm, hike.id).toBeGreaterThan(0.5);
        expect(hike.lengthKm, hike.id).toBeLessThanOrEqual(30);
      }
      if (hike.durationMin !== undefined) {
        expect(hike.durationMin, hike.id).toBeGreaterThanOrEqual(30);
        expect(hike.durationMin, hike.id).toBeLessThanOrEqual(720);
      }
      if (hike.elevationGainM !== undefined) {
        expect(hike.elevationGainM, hike.id).toBeGreaterThanOrEqual(0);
        // Le point culminant du territoire, l'Orohena, est à 2 241 m.
        expect(hike.elevationGainM, hike.id).toBeLessThanOrEqual(1800);
      }
    }
  });

  it('donne des durées compatibles avec la distance et le dénivelé', () => {
    // Naismith adapté au tropical : une durée hors de la plage signale une
    // valeur saisie de travers, un aller confondu avec un aller-retour, ou un
    // dénivelé fantaisiste. C'est ce test qui a rattrapé les 6,5 km de Makatea.
    for (const hike of HIKES) {
      const { lengthKm, durationMin, elevationGainM } = hike;
      if (lengthKm === undefined || durationMin === undefined || elevationGainM === undefined) {
        continue;
      }
      const ratio = durationMin / 60 / naismithHours(lengthKm, elevationGainM);
      expect(ratio, `${hike.id} : ${ratio.toFixed(2)} fois la durée estimée`).toBeGreaterThan(0.7);
      expect(ratio, `${hike.id} : ${ratio.toFixed(2)} fois la durée estimée`).toBeLessThan(2);
    }
  });

  it('garde les atolls plats', () => {
    // Un dénivelé de montagne sur un atoll des Tuamotu ne peut être qu'une
    // erreur de saisie : ils culminent à quelques mètres, Makatea exceptée.
    for (const hike of HIKES) {
      if (islandOf(hike)?.archipelagoId !== 'tuamotu') {
        continue;
      }
      expect(hike.elevationGainM ?? 0, hike.id).toBeLessThanOrEqual(120);
    }
  });
});

describe('tracés des randonnées', () => {
  it('associe un tracé à toute fiche qui en annonce unet réciproquement', () => {
    for (const hike of HIKES) {
      const track = HIKE_TRACKS[hike.id];
      if (hike.trackCoverage === undefined) {
        expect(track, `${hike.id} : tracé présent sans couverture déclarée`).toBeUndefined();
      } else {
        expect(track, `${hike.id} : couverture déclarée sans tracé`).toBeDefined();
      }
    }
    for (const id of Object.keys(HIKE_TRACKS)) {
      expect(
        HIKES.some((hike) => hike.id === id),
        `tracé orphelin : ${id}`,
      ).toBe(true);
    }
  });

  it('donne à chaque tracé assez de points pour dessiner un sentier', () => {
    for (const [id, track] of Object.entries(HIKE_TRACKS)) {
      expect(track.length, id).toBeGreaterThanOrEqual(5);
      // Au delà, le tracé pèse plus qu'il n'informe à l'échelle d'un téléphone.
      expect(track.length, id).toBeLessThanOrEqual(80);
    }
  });

  it('place chaque tracé sur l’île de sa randonnée', () => {
    // Une longitude au signe inversé enverrait le sentier à l'autre bout du
    // Pacifiqueet le plan afficherait une ligne vide.
    for (const hike of HIKES) {
      const track = HIKE_TRACKS[hike.id];
      const island = islandOf(hike);
      if (!track || !island) {
        continue;
      }
      for (const [lat, lon] of track) {
        const away = haversineKm(island, { lat, lon });
        expect(away, `${hike.id} : point à ${Math.round(away)} km de ${island.name}`).toBeLessThan(
          40,
        );
      }
    }
  });

  it('accorde la longueur du tracé complet avec la distance publiée', () => {
    // Un tracé annoncé complet qui ferait la moitié de la distance publiée
    // signale soit un tronçon oublié, soit un aller-retour compté pour un aller.
    for (const hike of HIKES) {
      const track = HIKE_TRACKS[hike.id];
      const oneWay = oneWayKm(hike);
      if (!track || hike.trackCoverage !== 'complet' || oneWay === undefined) {
        continue;
      }
      const ratio = trackKm(track) / oneWay;
      expect(ratio, `${hike.id} : tracé à ${ratio.toFixed(2)} de la distance`).toBeGreaterThan(0.7);
      expect(ratio, `${hike.id} : tracé à ${ratio.toFixed(2)} de la distance`).toBeLessThan(1.3);
    }
  });

  it('garde les tracés partiels plus courts que le parcours annoncé', () => {
    // Un tracé partiel plus long que la randonnée elle même voudrait dire qu'il
    // suit un autre sentier : c'est le sens même du mot partiel.
    for (const hike of HIKES) {
      const track = HIKE_TRACKS[hike.id];
      const oneWay = oneWayKm(hike);
      if (!track || hike.trackCoverage !== 'partiel' || oneWay === undefined) {
        continue;
      }
      const ratio = trackKm(track) / oneWay;
      expect(ratio, `${hike.id} : tracé partiel à ${ratio.toFixed(2)} de la distance`).toBeLessThan(
        0.9,
      );
    }
  });

  it('pose chaque point remarquable sur son tracé', () => {
    // Un waypoint loin du tracé serait affiché hors du plan, ou en étirerait le
    // cadrage jusqu'à écraser le sentier.
    for (const hike of HIKES) {
      const track = HIKE_TRACKS[hike.id];
      if (!track) {
        expect(hike.waypoints, `${hike.id} : points remarquables sans tracé`).toBeUndefined();
        continue;
      }
      for (const waypoint of hike.waypoints ?? []) {
        const nearest = Math.min(...track.map(([lat, lon]) => haversineKm(waypoint, { lat, lon })));
        expect(
          nearest,
          `${hike.id} / ${waypoint.label} : à ${Math.round(nearest * 1000)} m du tracé`,
        ).toBeLessThan(0.25);
      }
    }
  });
});

describe('fond de carte des plans', () => {
  const KINDS = ['coast', 'river', 'road', 'path'];

  it('donne un fond à chaque tracéet rien d’orphelin', () => {
    for (const id of Object.keys(HIKE_TRACKS)) {
      expect(HIKE_BASEMAPS[id], `${id} : fond manquant`).toBeDefined();
    }
    for (const id of Object.keys(HIKE_BASEMAPS)) {
      expect(HIKE_TRACKS[id], `fond orphelin : ${id}`).toBeDefined();
    }
  });

  it('reste dans son budget de points', () => {
    // C'est ce budget qui tient le poids de la feature : sans lui, une seule
    // emprise apporte dix-neuf mille points de décor.
    for (const [id, basemap] of Object.entries(HIKE_BASEMAPS)) {
      const points =
        basemap.lines.reduce((sum, line) => sum + line.points.length, 0) +
        basemap.water.reduce((sum, polygon) => sum + polygon.length, 0);
      expect(points, `${id} : ${points} points de fond`).toBeLessThanOrEqual(400);
      expect(basemap.peaks.length, id).toBeLessThanOrEqual(5);
    }
  });

  it('n’utilise que des natures de ligne dessinables', () => {
    // Une nature inconnue serait simplement absente du plan, sans erreur.
    for (const [id, basemap] of Object.entries(HIKE_BASEMAPS)) {
      for (const line of basemap.lines) {
        expect(KINDS, id).toContain(line.kind);
        expect(line.points.length, id).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('place le fond autour de la randonnée qu’il décrit', () => {
    for (const hike of HIKES) {
      const basemap = HIKE_BASEMAPS[hike.id];
      const island = islandOf(hike);
      if (!basemap || !island) {
        continue;
      }
      const all = [
        ...basemap.lines.flatMap((line) => line.points),
        ...basemap.water.flat(),
        ...basemap.peaks.map((peak) => [peak.lat, peak.lon] as const),
      ];
      for (const [lat, lon] of all) {
        const away = haversineKm(island, { lat, lon });
        expect(away, `${hike.id} : décor à ${Math.round(away)} km de ${island.name}`).toBeLessThan(
          60,
        );
      }
    }
  });

  it('nomme chaque sommet et lui donne une altitude crédible', () => {
    for (const [id, basemap] of Object.entries(HIKE_BASEMAPS)) {
      for (const peak of basemap.peaks) {
        expect(peak.name.trim(), id).not.toBe('');
        if (peak.ele !== undefined) {
          expect(peak.ele, `${id} / ${peak.name}`).toBeGreaterThan(0);
          // L'Orohena, point culminant du territoire, est à 2 241 m.
          expect(peak.ele, `${id} / ${peak.name}`).toBeLessThanOrEqual(2300);
        }
      }
    }
  });

  it('donne une silhouette à chaque île qui porte une randonnée', () => {
    for (const hike of HIKES) {
      const rings = ISLAND_OUTLINES[hike.islandId];
      expect(rings, `${hike.islandId} : contour manquant`).toBeDefined();
      expect(rings.length, hike.islandId).toBeGreaterThan(0);
      for (const ring of rings) {
        expect(ring.length, hike.islandId).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('garde les silhouettes assez légères pour un encart', () => {
    for (const [islandId, rings] of Object.entries(ISLAND_OUTLINES)) {
      const points = rings.reduce((sum, ring) => sum + ring.length, 0);
      expect(points, `${islandId} : ${points} points de contour`).toBeLessThanOrEqual(160);
    }
  });

  it('englobe chaque tracé dans la silhouette de son île', () => {
    // Un contour qui ne couvrirait pas le sentier placerait le repère de
    // l'encart en pleine mer.
    for (const hike of HIKES) {
      const track = HIKE_TRACKS[hike.id];
      const rings = ISLAND_OUTLINES[hike.islandId];
      if (!track || !rings) {
        continue;
      }
      const lats = rings.flat().map(([lat]) => lat);
      const lons = rings.flat().map(([, lon]) => lon);
      for (const [lat, lon] of track) {
        expect(lat, hike.id).toBeGreaterThanOrEqual(Math.min(...lats));
        expect(lat, hike.id).toBeLessThanOrEqual(Math.max(...lats));
        expect(lon, hike.id).toBeGreaterThanOrEqual(Math.min(...lons));
        expect(lon, hike.id).toBeLessThanOrEqual(Math.max(...lons));
      }
    }
  });
});

describe('filtres et mise en forme', () => {
  it('classe les longueurs aux bornes annoncées', () => {
    const at = (km: number): Hike => ({ ...HIKES[0], lengthKm: km });
    expect(matchesLength(at(4.9), 'courte')).toBe(true);
    expect(matchesLength(at(5), 'courte')).toBe(false);
    expect(matchesLength(at(5), 'moyenne')).toBe(true);
    expect(matchesLength(at(10), 'moyenne')).toBe(true);
    expect(matchesLength(at(10.1), 'moyenne')).toBe(false);
    expect(matchesLength(at(10.1), 'longue')).toBe(true);
  });

  it('exclut des filtres de longueur ce qui n’est pas chiffré', () => {
    // Plutôt que de ranger arbitrairement une randonnée sans distance publiée
    // dans une tranche, on l'exclut : elle reste visible sans filtre.
    const unknown: Hike = { ...HIKES[0], lengthKm: undefined };
    for (const bucket of LENGTH_ORDER) {
      expect(matchesLength(unknown, bucket), bucket).toBe(false);
    }
  });

  it('classe les durées aux bornes annoncées', () => {
    const at = (minutes: number): Hike => ({ ...HIKES[0], durationMin: minutes });
    expect(matchesDuration(at(179), 'demi-journee')).toBe(true);
    expect(matchesDuration(at(180), 'demi-journee')).toBe(false);
    expect(matchesDuration(at(180), 'journee')).toBe(true);
    expect(matchesDuration(at(300), 'journee')).toBe(true);
    expect(matchesDuration(at(301), 'journee')).toBe(false);
    expect(matchesDuration(at(301), 'grande-journee')).toBe(true);
  });

  it('exclut des filtres de durée ce qui n’est pas chiffré', () => {
    const unknown: Hike = { ...HIKES[0], durationMin: undefined };
    for (const bucket of DURATION_ORDER) {
      expect(matchesDuration(unknown, bucket), bucket).toBe(false);
    }
  });

  it('couvre toutes les randonnées par au moins une tranche quand elles sont chiffrées', () => {
    for (const hike of HIKES) {
      if (hike.lengthKm !== undefined) {
        expect(
          LENGTH_ORDER.some((bucket) => matchesLength(hike, bucket)),
          hike.id,
        ).toBe(true);
      }
      if (hike.durationMin !== undefined) {
        expect(
          DURATION_ORDER.some((bucket) => matchesDuration(hike, bucket)),
          hike.id,
        ).toBe(true);
      }
    }
  });

  it('écrit les durées comme on les dit', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(90)).toBe('1 h 30');
    expect(formatDuration(210)).toBe('3 h 30');
    expect(formatDuration(240)).toBe('4 h');
    expect(formatDuration(540)).toBe('9 h');
  });

  it('écrit les distances au dixième de kilomètre', () => {
    expect(formatHikeKm(9.8)).toBe('9,8 km');
    expect(formatHikeKm(3)).toBe('3 km');
  });

  it('ramène un aller-retour à sa distance dans un sens', () => {
    expect(oneWayKm({ ...HIKES[0], kind: 'aller-retour', lengthKm: 18 })).toBe(9);
    expect(oneWayKm({ ...HIKES[0], kind: 'boucle', lengthKm: 8 })).toBe(8);
    expect(oneWayKm({ ...HIKES[0], kind: 'traversee', lengthKm: 9 })).toBe(9);
    expect(oneWayKm({ ...HIKES[0], lengthKm: undefined })).toBeUndefined();
  });

  it('n’utilise que des difficultés affichables', () => {
    for (const hike of HIKES) {
      expect(DIFFICULTY_ORDER, hike.id).toContain(hike.difficulty);
    }
  });
});
