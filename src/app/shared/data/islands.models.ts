export type ArchipelagoId = 'societe' | 'tuamotu' | 'marquises' | 'australes' | 'gambier';

/**
 * Régime de marée de l'archipel.
 *
 * `solaire` est le cas remarquable de la Société : les heures de marée sont
 * quasiment fixes dans la journée. `lunaire` est le régime habituel, avec un
 * décalage d'environ cinquante minutes par jour.
 */
export type TideRegime = 'solaire' | 'lunaire';

export interface Archipelago {
  readonly id: ArchipelagoId;
  readonly name: string;
  readonly shortName: string;
  readonly colorVar: string;
  readonly kind: string;
  readonly islandCount: number;
  readonly character: string;
  readonly highlights: readonly string[];
  readonly tideRegime: TideRegime;
}

export interface Island {
  readonly id: string;
  readonly name: string;
  /** Localité de référence, quand les coordonnées visent un village précis. */
  readonly place?: string;
  readonly archipelagoId: ArchipelagoId;
  readonly lat: number;
  readonly lon: number;
  /** Décalage horaire, constant toute l'année dans tout le territoire. */
  readonly utcOffsetHours: number;
  readonly type: string;
  readonly areaKm2: number;
  readonly population: number;
  readonly access: readonly ('avion' | 'bateau')[];
  /** Durée de vol approximative depuis Papeete, quand l'île a une piste. */
  readonly flightMinutesFromPapeete?: number;
  /** Île de référence pour les calculs de distance. */
  readonly isReference?: true;
}

export interface SeaLink {
  readonly route: string;
  readonly note: string;
}
