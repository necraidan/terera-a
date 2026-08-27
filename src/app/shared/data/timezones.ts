export const TAHITI_TZ = 'Pacific/Tahiti';
export const FRANCE_TZ = 'Europe/Paris';

/**
 * Décalage d'un fuseau par rapport à UTC, en minutes. On compare l'heure murale à
 * l'heure UTC : `Intl` est la seule source fiable sur les changements d'heure.
 */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  // `hour` peut valoir 24 en hour12:false pour minuit, Date.UTC le normalise.
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );

  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** 11 h en hiver, 12 h à l'heure d'été française. Tahiti n'a pas de DST. */
export function hoursAheadOfTahiti(instant: Date): number {
  return (zoneOffsetMinutes(instant, FRANCE_TZ) - zoneOffsetMinutes(instant, TAHITI_TZ)) / 60;
}

export interface WallTime {
  readonly hours: number;
  readonly minutes: number;
  /** −1 la veille, 0 le même jour, +1 le lendemain. */
  readonly dayShift: -1 | 0 | 1;
}

/**
 * @param minutesOfDay Heure de départ, en minutes depuis minuit.
 * @param offsetHours Positif quand le fuseau cible est devant.
 */
export function shiftWallTime(minutesOfDay: number, offsetHours: number): WallTime {
  const total = minutesOfDay + offsetHours * 60;
  const dayMinutes = 24 * 60;

  // Modulo positif : -90 min donne 22 h 30 la veille, pas -1 h 30.
  const normalized = ((total % dayMinutes) + dayMinutes) % dayMinutes;
  const shift = Math.floor(total / dayMinutes);

  return {
    hours: Math.floor(normalized / 60),
    minutes: normalized % 60,
    dayShift: Math.max(-1, Math.min(1, shift)) as -1 | 0 | 1,
  };
}

/** Plage horaire où l'on accepte d'être appelé, heure locale. */
const POLITE_START_HOUR = 8;
const POLITE_END_HOUR = 21;

/**
 * Intersection des plages 8 h–21 h locales des deux côtés, en heure de Tahiti.
 *
 * La plage française ramenée à Tahiti tombe à cheval sur minuit : on ne peut donc
 * pas replier ses bornes indépendamment modulo 24. On essaie chaque copie décalée
 * d'un jour entier et on garde la plus large intersection.
 */
export function politeCallWindowInTahiti(
  offsetHours: number,
): { readonly startHour: number; readonly endHour: number } | null {
  const franceStart = POLITE_START_HOUR - offsetHours;
  const franceEnd = POLITE_END_HOUR - offsetHours;

  let best: { startHour: number; endHour: number } | null = null;

  for (let day = -1; day <= 1; day++) {
    const start = Math.max(POLITE_START_HOUR, franceStart + day * 24);
    const end = Math.min(POLITE_END_HOUR, franceEnd + day * 24);

    if (end - start > (best ? best.endHour - best.startHour : 0)) {
      best = { startHour: start, endHour: end };
    }
  }

  return best;
}
