export type LexiconCategory =
  | 'salutations'
  | 'politesse'
  | 'essentiels'
  | 'nombres'
  | 'restaurant'
  | 'nature'
  | 'urgence'
  | 'toponymes';

export interface LexiconEntry {
  /** Identifiant stable, sert de clé aux favoris, ne jamais le renommer. */
  readonly id: string;
  /** Le français. */
  readonly fr: string;
  /** Le tahitien (reo tahiti). */
  readonly ty: string;
  /** Prononciation approchée pour un francophone. */
  readonly pron: string;
  readonly category: LexiconCategory;
  /** Piege de prononciation ou precision, affichee sous l'entree. */
  readonly note?: string;
}

export const CATEGORY_LABELS: Readonly<Record<LexiconCategory, string>> = {
  salutations: 'Se saluer',
  politesse: 'Politesse',
  essentiels: 'L’essentiel',
  nombres: 'Compter',
  restaurant: 'À table',
  nature: 'Mer et nature',
  urgence: 'En cas de souci',
  toponymes: 'Noms de lieux',
};

/** Ordre d'affichage des sections : du plus utile au plus circonstanciel. */
export const CATEGORY_ORDER: readonly LexiconCategory[] = [
  'salutations',
  'politesse',
  'essentiels',
  'restaurant',
  'nature',
  'nombres',
  'toponymes',
  'urgence',
];
