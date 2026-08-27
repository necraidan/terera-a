/** Un bloc de contenu d'une fiche pratique. */
export type PracticalSection =
  | { readonly kind: 'paragraph'; readonly text: string }
  | {
      readonly kind: 'facts';
      readonly items: readonly {
        readonly label: string;
        readonly value: string;
        /** Rend la valeur cliquable — `tel:` fonctionne hors ligne. */
        readonly href?: string;
      }[];
    }
  | { readonly kind: 'list'; readonly items: readonly string[] };

export interface PracticalSheet {
  /** Segment d'URL de la fiche (/infos/:id) — ne pas renommer sans redirection. */
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  /** Accroche affichée dans la liste. */
  readonly summary: string;
  readonly sections: readonly PracticalSection[];
}
