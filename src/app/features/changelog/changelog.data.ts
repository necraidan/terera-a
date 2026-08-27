export interface ChangelogEntry {
  /** Version semver, doit correspondre à `version` dans package.json. */
  readonly version: string;
  /** Date de publication au format ISO (AAAA-MM-JJ). */
  readonly date: string;
  readonly changes: readonly string[];
}

/**
 * Journal des versions, plus récente en premier.
 *
 * Tenu à la main : à chaque release, on ajoute une entrée en tête **et** on
 * incrémente `version` dans package.json. Le test de ce fichier échoue si les
 * deux divergent, ce qui évite de publier une mise à jour muette.
 */
export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2026-08-27',
    changes: [
      'Première version 🌺',
      'Convertisseur euro ↔ franc pacifique, au taux fixe légal, sans connexion.',
      'Heure de Tahiti et de la France côte à côte, avec convertisseur d’heure et créneau d’appel.',
      'Lexique tahitien avec recherche et favoris.',
      'Fiches pratiques : urgences, téléphone, électricité, usages, monnaie, saisons.',
      'Installation sur l’écran d’accueil et fonctionnement complet hors ligne.',
    ],
  },
];
