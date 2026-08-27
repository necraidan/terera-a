/**
 * Le franc pacifique est arrimé à l'euro par une parité fixe fixée par décret :
 * 1 000 XPF = 8,38 EUR, soit 1 EUR = 119,331 742 XPF exactement.
 *
 * Ce n'est pas un taux de marché : il ne bouge pas. L'app n'a donc aucune API de
 * change à interroger, ce qui est précisément ce qui la rend utilisable sur un
 * motu sans réseau.
 */
export const XPF_PER_EUR = 119.331742;

/**
 * Espaces à ignorer dans une saisie ou un résultat recopié : l'espace ordinaire,
 * l'insécable (U+00A0) et la fine insécable (U+202F), ces deux dernières étant
 * les séparateurs de milliers que produit `Intl.NumberFormat` en français.
 */
const GROUPING_SPACES = /[\s\u00a0\u202f]/g;

/**
 * Interprète une saisie utilisateur en nombre.
 *
 * Le pavé décimal iOS en français produit une virgule : on accepte les deux
 * séparateurs décimaux.
 *
 * @returns Le montant, ou `null` si la saisie n'est pas un nombre exploitable.
 */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(GROUPING_SPACES, '').replace(',', '.');

  if (cleaned === '') {
    return null;
  }

  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : null;
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

/** Ex. `12 500 F` — le franc pacifique n'a pas de subdivision en circulation. */
export function formatXpf(xpf: number): string {
  return `${xpfFormatter.format(xpf)} F`;
}

/** Ex. `104,75 €`. */
export function formatEur(eur: number): string {
  return `${eurFormatter.format(eur)} €`;
}
