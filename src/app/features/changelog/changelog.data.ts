export interface ChangelogEntry {
  /** Doit correspondre à `version` dans package.json. */
  readonly version: string;
  readonly date: string;
  readonly changes: readonly string[];
}

/**
 * À chaque release : ajouter une entrée en tête et incrémenter la version dans
 * package.json. Le test de ce fichier échoue si les deux divergent.
 */
export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2026-08-27',
    changes: [
      'Billets et pièces : photos réelles, à l’échelle, et les pièges de reconnaissance.',
      'Soleil et marées par île, calculés hors ligne.',
      'Carte des cinq archipels et distances.',
      'Faune marine : photos, saisons, risques et distances légales.',
      'Convertisseur d’unités : milles nautiques, nœuds, pieds.',
      'Liens utiles, épinglables en favoris.',
      'Prononciation des noms de lieux, dans le lexique.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-08-27',
    changes: [
      'Première version 🌺',
      'Convertisseur euro et franc pacifique, au taux fixe légal.',
      'Heure de Tahiti et de la France, avec créneau d’appel.',
      'Lexique tahitien, avec recherche et favoris.',
      'Infos pratiques : urgences, téléphone, électricité, usages, monnaie, saisons.',
      'Installation sur l’écran d’accueil et fonctionnement hors ligne.',
    ],
  },
];
