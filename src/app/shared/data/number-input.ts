/**
 * Lecture d'un nombre saisi au clavier français : le pavé décimal iOS produit une
 * virgule, et un résultat recopié depuis l'app contient les espaces insécables
 * qu'insère `Intl.NumberFormat`.
 */

const GROUPING_SPACES = /[\s\u00a0\u202f]/g;

export interface ParseOptions {
  readonly allowNegative?: boolean;
}

/** @returns Le nombre saisi, ou `null` si la saisie n'est pas exploitable. */
export function parseDecimalInput(raw: string, options: ParseOptions = {}): number | null {
  const cleaned = raw.replace(GROUPING_SPACES, '').replace(',', '.');

  // Un signe moins seul est une saisie en cours, pas une erreur à signaler.
  if (cleaned === '' || cleaned === '-') {
    return null;
  }

  const value = Number(cleaned);
  if (!Number.isFinite(value)) {
    return null;
  }
  return options.allowNegative === true || value >= 0 ? value : null;
}
