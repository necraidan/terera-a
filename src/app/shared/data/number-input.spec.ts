import { parseDecimalInput } from './number-input';

describe('parseDecimalInput', () => {
  it('accepte le point et la virgule décimale', () => {
    expect(parseDecimalInput('12.5')).toBe(12.5);
    expect(parseDecimalInput('12,5')).toBe(12.5);
  });

  it('ignore les séparateurs de milliers, y compris insécables', () => {
    expect(parseDecimalInput('12 500')).toBe(12500);
    expect(parseDecimalInput('12 500')).toBe(12500);
    expect(parseDecimalInput('12 500')).toBe(12500);
  });

  it('rejette une saisie vide ou non numérique', () => {
    expect(parseDecimalInput('')).toBeNull();
    expect(parseDecimalInput('   ')).toBeNull();
    expect(parseDecimalInput('abc')).toBeNull();
  });

  it('rejette les valeurs négatives par défaut', () => {
    expect(parseDecimalInput('-5')).toBeNull();
  });

  it('accepte les valeurs négatives quand c’est demandé', () => {
    expect(parseDecimalInput('-5', { allowNegative: true })).toBe(-5);
    expect(parseDecimalInput('-12,5', { allowNegative: true })).toBe(-12.5);
  });

  it('traite un signe moins seul comme une saisie en cours', () => {
    // Sinon l'écran afficherait une erreur dès que l'utilisateur tape le signe.
    expect(parseDecimalInput('-', { allowNegative: true })).toBeNull();
  });

  it('rejette l’infini', () => {
    expect(parseDecimalInput('Infinity', { allowNegative: true })).toBeNull();
  });
});
