import { parseDecimalInput } from './number-input';

/**
 * Parité fixe légale, pas un taux de marché : 1 000 XPF = 8,38 EUR exactement.
 * C'est ce qui dispense l'app de toute API de change.
 */
export const XPF_PER_EUR = 119.331742;

/** Un montant est toujours positif : les valeurs négatives sont rejetées. */
export function parseAmount(raw: string): number | null {
  return parseDecimalInput(raw);
}

/** Convertit des euros en francs pacifique (arrondi au franc : pas de centime). */
export function eurToXpf(eur: number): number {
  return Math.round(eur * XPF_PER_EUR);
}

/** Convertit des francs pacifique en euros (arrondi au centime). */
export function xpfToEur(xpf: number): number {
  return Math.round((xpf / XPF_PER_EUR) * 100) / 100;
}

const xpfFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Ex. `12 500 F`. Le franc pacifique n'a pas de subdivision. */
export function formatXpf(xpf: number): string {
  return `${xpfFormatter.format(xpf)} F`;
}

/** Ex. `104,75 €`. */
export function formatEur(eur: number): string {
  return `${eurFormatter.format(eur)} €`;
}
