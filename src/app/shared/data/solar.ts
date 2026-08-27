/**
 * Algorithme solaire de la NOAA, précis à la minute sous les tropiques. Calculer
 * plutôt que tabuler donne les heures exactes de n'importe quelle île, hors ligne.
 */

/** Réfraction atmosphérique incluse. */
const ZENITH_SUNRISE = 90.833;

/** Fin du crépuscule civil : au-delà, on ne lit plus sans lampe. */
const ZENITH_CIVIL = 96;

const RAD = Math.PI / 180;

export interface CalendarDate {
  readonly year: number;
  /** Mois de 1 à 12. */
  readonly month: number;
  readonly day: number;
}

/** Tout est exprimé en minutes depuis minuit UTC. */
export interface SunTimes {
  readonly sunrise: number | null;
  readonly sunset: number | null;
  readonly solarNoon: number;
  /** Bornes du crépuscule civil. */
  readonly dawn: number | null;
  readonly dusk: number | null;
  readonly dayLength: number | null;
}

/** Jour julien. */
function julianDay({ year, month, day }: CalendarDate): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

interface SolarPosition {
  /** En degrés. */
  readonly declination: number;
  /** En minutes. */
  readonly equationOfTime: number;
}

function solarPosition(julianCentury: number): SolarPosition {
  const t = julianCentury;

  const meanLongitude = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  // Écart entre orbite circulaire et orbite réelle.
  const center =
    Math.sin(meanAnomaly * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * meanAnomaly * RAD) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * meanAnomaly * RAD) * 0.000289;

  const trueLongitude = meanLongitude + center;

  // Nutation et aberration.
  const omega = 125.04 - 1934.136 * t;
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega * RAD);

  const meanObliquity =
    23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = meanObliquity + 0.00256 * Math.cos(omega * RAD);

  const declination =
    Math.asin(Math.sin(obliquity * RAD) * Math.sin(apparentLongitude * RAD)) / RAD;

  const y = Math.tan((obliquity / 2) * RAD) ** 2;
  const equationOfTime =
    (4 *
      (y * Math.sin(2 * meanLongitude * RAD) -
        2 * eccentricity * Math.sin(meanAnomaly * RAD) +
        4 * eccentricity * y * Math.sin(meanAnomaly * RAD) * Math.cos(2 * meanLongitude * RAD) -
        0.5 * y * y * Math.sin(4 * meanLongitude * RAD) -
        1.25 * eccentricity * eccentricity * Math.sin(2 * meanAnomaly * RAD))) /
    RAD;

  return { declination, equationOfTime };
}

/**
 * Angle horaire entre le midi solaire et le passage par un zénith donné.
 *
 * @returns `null` en jour ou nuit polaire, cas absent de Polynésie mais que la
 *   fonction refuse d'inventer.
 */
function hourAngle(zenith: number, latitude: number, declination: number): number | null {
  const cosH =
    Math.cos(zenith * RAD) / (Math.cos(latitude * RAD) * Math.cos(declination * RAD)) -
    Math.tan(latitude * RAD) * Math.tan(declination * RAD);

  if (cosH < -1 || cosH > 1) {
    return null;
  }
  return Math.acos(cosH) / RAD;
}

/**
 * @param date Date civile locale. Aux longitudes du Pacifique, le midi local
 *   tombe le même jour UTC, la date civile suffit donc telle quelle.
 */
export function sunTimes(date: CalendarDate, latitude: number, longitude: number): SunTimes {
  const julianCentury = (julianDay(date) - 2451545) / 36525;
  const { declination, equationOfTime } = solarPosition(julianCentury);

  const solarNoon = 720 - 4 * longitude - equationOfTime;

  const at = (zenith: number): { rise: number | null; set: number | null } => {
    const ha = hourAngle(zenith, latitude, declination);
    if (ha === null) {
      return { rise: null, set: null };
    }
    return { rise: solarNoon - 4 * ha, set: solarNoon + 4 * ha };
  };

  const day = at(ZENITH_SUNRISE);
  const civil = at(ZENITH_CIVIL);

  return {
    sunrise: day.rise,
    sunset: day.set,
    solarNoon,
    dawn: civil.rise,
    dusk: civil.set,
    dayLength: day.rise !== null && day.set !== null ? day.set - day.rise : null,
  };
}

/**
 * Minutes UTC vers heure murale locale. Le décalage vaut -10 dans la Société,
 * -9,5 aux Marquises, -9 aux Gambier.
 */
export function formatSolarTime(minutesUtc: number | null, utcOffsetHours: number): string {
  if (minutesUtc === null) {
    return '--:--';
  }
  const local = ((Math.round(minutesUtc + utcOffsetHours * 60) % 1440) + 1440) % 1440;
  const hours = Math.floor(local / 60);
  return `${String(hours).padStart(2, '0')}:${String(local % 60).padStart(2, '0')}`;
}

/** `11 h 05`. */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) {
    return '--';
  }
  const total = Math.round(minutes);
  return `${Math.floor(total / 60)} h ${String(total % 60).padStart(2, '0')}`;
}
