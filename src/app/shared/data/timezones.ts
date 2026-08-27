export const TAHITI_TZ = 'Pacific/Tahiti';
export const FRANCE_TZ = 'Europe/Paris';

/**
 * Décalage d'un fuseau par rapport à UTC, en minutes, à un instant donné.
 *
 * Calculé en comparant l'heure murale du fuseau à l'heure UTC : c'est la seule
 * méthode fiable côté navigateur, `Intl` étant la seule source de vérité sur les
 * règles de changement d'heure.
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

  // `hour` peut valoir 24 en hour12:false pour minuit — Date.UTC le normalise.
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

/**
 * Décalage de la France par rapport à Tahiti, en heures (toujours positif).
 *
 * Tahiti est à UTC−10 toute l'année, la France à UTC+1 ou UTC+2 : le décalage
 * vaut donc 11 h en hiver et 12 h à l'heure d'été française.
 */
export function hoursAheadOfTahiti(instant: Date): number {
  return (zoneOffsetMinutes(instant, FRANCE_TZ) - zoneOffsetMinutes(instant, TAHITI_TZ)) / 60;
}

/** Heure murale : minutes depuis minuit, plus le décalage de jour éventuel. */
export interface WallTime {
  readonly hours: number;
  readonly minutes: number;
  /** −1 la veille, 0 le même jour, +1 le lendemain. */
  readonly dayShift: -1 | 0 | 1;
}

/**
 * Traduit une heure murale d'un fuseau vers l'autre.
 *
 * @param minutesOfDay Heure de départ, en minutes depuis minuit (0–1439).
 * @param offsetHours Décalage à appliquer (positif = le fuseau cible est devant).
 */
export function shiftWallTime(minutesOfDay: number, offsetHours: number): WallTime {
  const total = minutesOfDay + offsetHours * 60;
  const dayMinutes = 24 * 60;

  // Modulo positif : -90 min doit donner 22 h 30 la veille, pas -1 h 30.
  const normalized = ((total % dayMinutes) + dayMinutes) % dayMinutes;
  const shift = Math.floor(total / dayMinutes);

  return {
    hours: Math.floor(normalized / 60),
    minutes: normalized % 60,
    dayShift: Math.max(-1, Math.min(1, shift)) as -1 | 0 | 1,
  };
}

/** Plage horaire pendant laquelle on accepte d'être appelé, heure locale. */
const POLITE_START_HOUR = 8;
const POLITE_END_HOUR = 21;

/**
 * Créneau d'appel confortable pour les deux interlocuteurs, exprimé en heure de
 * Tahiti : l'intersection des plages 8 h–21 h locales de chaque côté.
 *
 * La plage française, ramenée en heure de Tahiti, tombe à cheval sur minuit (avec
 * 11 h d'écart, 8 h–21 h en France correspond à 21 h–10 h à Tahiti). On ne peut
 * donc pas replier ses bornes indépendamment modulo 24 : on essaie chaque copie
 * de l'intervalle décalée d'un nombre entier de jours et on garde la plus large
 * intersection avec la journée tahitienne.
 *
 * @returns Les bornes en heures de Tahiti, ou `null` si aucun créneau ne convient
 *   aux deux côtés.
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
