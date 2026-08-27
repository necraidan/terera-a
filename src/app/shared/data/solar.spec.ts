import { formatDuration, formatSolarTime, sunTimes } from './solar';

/** Papeete, Tahiti. Décalage fixe de UTC-10, sans heure d'été. */
const PAPEETE = { lat: -17.5334, lon: -149.5667, offset: -10 };

/** Nuku Hiva, Marquises. Décalage de UTC-9h30. */
const NUKU_HIVA = { lat: -8.9167, lon: -140.1, offset: -9.5 };

describe('sunTimes, durée du jour', () => {
  it('donne environ 12 h 07 à l’équinoxe', () => {
    // À l'équinoxe la déclinaison est nulle : le jour dure douze heures partout,
    // plus quelques minutes dues à la réfraction atmosphérique.
    const { dayLength } = sunTimes({ year: 2026, month: 3, day: 20 }, PAPEETE.lat, PAPEETE.lon);
    expect(dayLength).not.toBeNull();
    expect(dayLength as number).toBeGreaterThan(12 * 60);
    expect(dayLength as number).toBeLessThan(12 * 60 + 15);
  });

  it('donne la journée la plus courte au solstice de juin', () => {
    // Hémisphère sud : juin est l'hiver austral. Environ 11 h 05 à cette latitude.
    const { dayLength } = sunTimes({ year: 2026, month: 6, day: 21 }, PAPEETE.lat, PAPEETE.lon);
    expect(dayLength as number).toBeGreaterThan(11 * 60 - 10);
    expect(dayLength as number).toBeLessThan(11 * 60 + 15);
  });

  it('donne la journée la plus longue au solstice de décembre', () => {
    // Été austral : environ 13 h 11.
    const { dayLength } = sunTimes({ year: 2026, month: 12, day: 21 }, PAPEETE.lat, PAPEETE.lon);
    expect(dayLength as number).toBeGreaterThan(13 * 60 - 15);
    expect(dayLength as number).toBeLessThan(13 * 60 + 20);
  });

  it('varie moins près de l’équateur', () => {
    // Aux Marquises, à 9 degrés de latitude, l'écart entre les deux solstices est
    // nettement plus faible qu'à Tahiti.
    const june = sunTimes({ year: 2026, month: 6, day: 21 }, NUKU_HIVA.lat, NUKU_HIVA.lon);
    const december = sunTimes({ year: 2026, month: 12, day: 21 }, NUKU_HIVA.lat, NUKU_HIVA.lon);
    const marquesasSpread = (december.dayLength as number) - (june.dayLength as number);

    const tahitiJune = sunTimes({ year: 2026, month: 6, day: 21 }, PAPEETE.lat, PAPEETE.lon);
    const tahitiDecember = sunTimes({ year: 2026, month: 12, day: 21 }, PAPEETE.lat, PAPEETE.lon);
    const tahitiSpread = (tahitiDecember.dayLength as number) - (tahitiJune.dayLength as number);

    expect(marquesasSpread).toBeGreaterThan(0);
    expect(marquesasSpread).toBeLessThan(tahitiSpread);
  });
});

describe('sunTimes, ordre des évènements', () => {
  it('enchaîne aube, lever, midi solaire, coucher, crépuscule', () => {
    const t = sunTimes({ year: 2026, month: 8, day: 27 }, PAPEETE.lat, PAPEETE.lon);
    expect(t.dawn as number).toBeLessThan(t.sunrise as number);
    expect(t.sunrise as number).toBeLessThan(t.solarNoon);
    expect(t.solarNoon).toBeLessThan(t.sunset as number);
    expect(t.sunset as number).toBeLessThan(t.dusk as number);
  });

  it('place le lever et le coucher symétriquement autour du midi solaire', () => {
    const t = sunTimes({ year: 2026, month: 8, day: 27 }, PAPEETE.lat, PAPEETE.lon);
    const beforeNoon = t.solarNoon - (t.sunrise as number);
    const afterNoon = (t.sunset as number) - t.solarNoon;
    expect(beforeNoon).toBeCloseTo(afterNoon, 6);
  });

  it('donne un crépuscule court sous les tropiques', () => {
    // Entre le coucher et la nuit civile, il reste une vingtaine de minutes.
    const t = sunTimes({ year: 2026, month: 8, day: 27 }, PAPEETE.lat, PAPEETE.lon);
    const twilight = (t.dusk as number) - (t.sunset as number);
    expect(twilight).toBeGreaterThan(15);
    expect(twilight).toBeLessThan(30);
  });
});

describe('sunTimes, heures locales', () => {
  it('place le midi solaire de Papeete vers midi, heure locale', () => {
    // Papeete est presque au centre de son fuseau : le midi solaire y tombe à
    // quelques minutes de midi toute l'année.
    const t = sunTimes({ year: 2026, month: 8, day: 27 }, PAPEETE.lat, PAPEETE.lon);
    expect(formatSolarTime(t.solarNoon, PAPEETE.offset)).toMatch(/^1[12]:\d{2}$/);
  });

  it('donne des heures de lever et coucher plausibles à Tahiti', () => {
    const t = sunTimes({ year: 2026, month: 6, day: 21 }, PAPEETE.lat, PAPEETE.lon);
    // Solstice de juin : lever vers 06 h 25, coucher vers 17 h 30.
    expect(formatSolarTime(t.sunrise, PAPEETE.offset)).toMatch(/^06:[0-5]\d$/);
    expect(formatSolarTime(t.sunset, PAPEETE.offset)).toMatch(/^17:[0-5]\d$/);
  });

  it('gère un décalage à la demi-heure', () => {
    // Les Marquises sont à UTC-9h30 : le format doit rester valide.
    const t = sunTimes({ year: 2026, month: 6, day: 21 }, NUKU_HIVA.lat, NUKU_HIVA.lon);
    expect(formatSolarTime(t.sunrise, NUKU_HIVA.offset)).toMatch(/^0[5-7]:[0-5]\d$/);
  });
});

describe('formatSolarTime', () => {
  it('ramène un instant dans la journée locale', () => {
    // Minuit UTC vu depuis UTC-10 : la veille à 14 h.
    expect(formatSolarTime(0, -10)).toBe('14:00');
    // Un coucher calculé au delà de minuit UTC revient à l'heure locale du soir.
    expect(formatSolarTime(1676, -10)).toBe('17:56');
  });

  it('affiche un gabarit quand l’évènement n’existe pas', () => {
    expect(formatSolarTime(null, -10)).toBe('--:--');
  });
});

describe('formatDuration', () => {
  it('met en forme une durée en heures et minutes', () => {
    expect(formatDuration(665)).toBe('11 h 05');
    expect(formatDuration(791)).toBe('13 h 11');
  });

  it('affiche un gabarit quand la durée est inconnue', () => {
    expect(formatDuration(null)).toBe('--');
  });
});
