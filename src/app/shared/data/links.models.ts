export interface UsefulLink {
  readonly title: string;
  readonly url: string;
  /** À quoi le lien sertet à quel moment du voyage. */
  readonly purpose: string;
  /** Vrai pour les liens qu'il vaut mieux avoir consultés avant de partir. */
  readonly essential: boolean;
}

export interface LinkCategory {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly links: readonly UsefulLink[];
}

/** Le seul écran de l'application qui ne fonctionne pas hors ligne. */
export const LINKS_OFFLINE_WARNING =
  'Ces liens ouvrent des sites externes : ils sont les seuls éléments de l’application à exiger une connexion. La couverture mobile est bonne à Tahiti et Moorea, plus irrégulière dans les Tuamotu, les Marquises et les Australes : consultez les pages importantes avant de quitter une zone couverte.';
