/** Origine et licence d'une photo, pour créditer correctement. */
export interface ImageCredit {
  readonly author: string;
  readonly licence: string;
}

export interface Banknote {
  readonly id: string;
  readonly value: number;
  readonly theme: string;
  readonly colorName: string;
  readonly colorHex: string;
  readonly accentHex: string;
  readonly recto: string;
  readonly verso: string;
  readonly security: string;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly buys: string;
  readonly recognition: string;
  /** Photos réelles, recto puis verso. */
  readonly imageRecto: string;
  readonly imageVerso: string;
}

export interface Coin {
  readonly id: string;
  readonly value: number;
  readonly theme: string;
  readonly alloy: string;
  readonly toneName: string;
  readonly toneHex: string;
  readonly secondaryToneHex?: string;
  readonly diameterMm: number;
  readonly shape: string;
  /**
   * Face portant le motif central.
   *
   * L'IEOM et les catalogues numismatiques ne s'accordent pas sur laquelle des
   * deux faces est l'avers : on décrit donc les faces par ce qu'elles portent,
   * ce qui est de toute façon plus utile pour reconnaître une pièce.
   */
  readonly motifSide: string;
  /** Face portant la valeur faciale et les mentions de l'émetteur. */
  readonly valueSide: string;
  readonly buys: string;
  readonly recognition: string;
  /** Photos réelles : face au motif, puis face à la valeur. */
  readonly imageMotif: string;
  readonly imageValeur: string;
}
