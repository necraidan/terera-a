/**
 * Niveau de risque réel pour un humain, sans dramatiser ni minimiser.
 *
 * `aucun` ne veut pas dire qu'on peut toucher : la plupart de ces espèces sont
 * protégéeset le risque décrit ici est celui couru par l'humain, pas celui
 * que l'humain fait courir à l'animal.
 */
export type MarineRisk = 'aucun' | 'faible' | 'modere' | 'eleve';

export interface MarineSpecies {
  readonly id: string;
  readonly nameFr: string;
  readonly nameTy?: string;
  readonly nameSci: string;
  /** Photo de l'espece, hors ligne comme le reste. */
  readonly image: string;
  /** Auteur et licence, a afficher partout ou la photo est visible en grand. */
  readonly photoCredit: string;
  readonly where: string;
  readonly season: string;
  readonly sizeTypical: string;
  readonly risk: MarineRisk;
  readonly riskNote: string;
  readonly rules: readonly string[];
  readonly protection: string;
}

export interface MarineRegulation {
  readonly title: string;
  readonly text: string;
}

export const RISK_LABELS: Readonly<Record<MarineRisk, string>> = {
  aucun: 'Aucun risque',
  faible: 'Risque faible',
  modere: 'Risque modéré',
  eleve: 'Risque élevé',
};

/** Classe Tailwind de la pastille de risque. */
export const RISK_CLASSES: Readonly<Record<MarineRisk, string>> = {
  aucun: 'bg-surface-2 text-ink-2',
  faible: 'bg-accent text-accent-ink',
  modere: 'bg-coral text-surface-1',
  eleve: 'bg-danger text-surface-1',
};
