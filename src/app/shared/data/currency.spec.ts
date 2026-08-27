import { XPF_PER_EUR, eurToXpf, formatEur, formatXpf, parseAmount, xpfToEur } from './currency';

/** Normalise les espaces insécables produits par Intl pour comparer un libellé. */
const normalizeSpaces = (value: string): string => value.replace(/[\s\u00a0\u202f]/g, ' ');

describe('parseAmount', () => {
  it('accepte le point et la virgule décimale', () => {
    expect(parseAmount('12.5')).toBe(12.5);
    expect(parseAmount('12,5')).toBe(12.5);
  });

  it('ignore les espaces de groupement, y compris insécables', () => {
    expect(parseAmount('12 500')).toBe(12500);
    expect(parseAmount('12 500')).toBe(12500);
    expect(parseAmount('12 500')).toBe(12500);
  });

  it('rejette une saisie vide, non numérique ou négative', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('   ')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('-5')).toBeNull();
  });
});

describe('conversions', () => {
  it('applique la parité fixe légale', () => {
    expect(XPF_PER_EUR).toBe(119.331742);
    // Le repère officiel : 1 000 XPF = 8,38 €.
    expect(xpfToEur(1000)).toBe(8.38);
  });

  it('arrondit les francs à l’unité et les euros au centime', () => {
    expect(eurToXpf(1)).toBe(119);
    expect(eurToXpf(10)).toBe(1193);
    expect(xpfToEur(5000)).toBe(41.9);
  });

  it('fait un aller-retour stable aux arrondis près', () => {
    const eur = 50;
    expect(xpfToEur(eurToXpf(eur))).toBeCloseTo(eur, 1);
  });

  it('gère zéro', () => {
    expect(eurToXpf(0)).toBe(0);
    expect(xpfToEur(0)).toBe(0);
  });
});

describe('formatage', () => {
  it('formate les francs sans décimale', () => {
    expect(normalizeSpaces(formatXpf(12500))).toBe('12 500 F');
  });

  it('formate les euros avec deux décimales', () => {
    expect(normalizeSpaces(formatEur(8.4))).toBe('8,40 €');
  });
});
