import {
  FRANCE_TZ,
  TAHITI_TZ,
  hoursAheadOfTahiti,
  politeCallWindowInTahiti,
  shiftWallTime,
  zoneOffsetMinutes,
} from './timezones';

describe('zoneOffsetMinutes', () => {
  it('place Tahiti à UTC−10 toute l’année', () => {
    expect(zoneOffsetMinutes(new Date('2026-01-15T12:00:00Z'), TAHITI_TZ)).toBe(-600);
    expect(zoneOffsetMinutes(new Date('2026-07-15T12:00:00Z'), TAHITI_TZ)).toBe(-600);
  });

  it('suit l’heure d’été française', () => {
    expect(zoneOffsetMinutes(new Date('2026-01-15T12:00:00Z'), FRANCE_TZ)).toBe(60);
    expect(zoneOffsetMinutes(new Date('2026-07-15T12:00:00Z'), FRANCE_TZ)).toBe(120);
  });
});

describe('hoursAheadOfTahiti', () => {
  it('vaut 11 h en hiver et 12 h à l’heure d’été française', () => {
    expect(hoursAheadOfTahiti(new Date('2026-01-15T12:00:00Z'))).toBe(11);
    expect(hoursAheadOfTahiti(new Date('2026-07-15T12:00:00Z'))).toBe(12);
  });
});

describe('shiftWallTime', () => {
  it('reste le même jour quand le décalage ne franchit pas minuit', () => {
    expect(shiftWallTime(8 * 60, 11)).toEqual({ hours: 19, minutes: 0, dayShift: 0 });
  });

  it('passe au lendemain en franchissant minuit', () => {
    // 15 h à Tahiti + 12 h = 3 h du matin, le lendemain en France.
    expect(shiftWallTime(15 * 60, 12)).toEqual({ hours: 3, minutes: 0, dayShift: 1 });
  });

  it('passe à la veille avec un décalage négatif', () => {
    // 6 h en France − 11 h = 19 h la veille à Tahiti.
    expect(shiftWallTime(6 * 60, -11)).toEqual({ hours: 19, minutes: 0, dayShift: -1 });
  });

  it('préserve les minutes', () => {
    expect(shiftWallTime(9 * 60 + 45, 11)).toEqual({ hours: 20, minutes: 45, dayShift: 0 });
  });

  it('gère minuit pile', () => {
    expect(shiftWallTime(13 * 60, 11)).toEqual({ hours: 0, minutes: 0, dayShift: 1 });
  });
});

describe('politeCallWindowInTahiti', () => {
  it('propose un créneau matinal à Tahiti en hiver', () => {
    // 11 h d'écart : 8 h–21 h en France correspond à 21 h–10 h à Tahiti ; la
    // partie compatible avec la journée tahitienne est le petit matin.
    expect(politeCallWindowInTahiti(11)).toEqual({ startHour: 8, endHour: 10 });
  });

  it('décale le créneau d’une heure à l’heure d’été française', () => {
    expect(politeCallWindowInTahiti(12)).toEqual({ startHour: 8, endHour: 9 });
  });
});
