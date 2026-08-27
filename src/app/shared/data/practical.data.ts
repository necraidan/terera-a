import { PracticalSheet } from './practical.models';

/**
 * Fiches pratiques, entièrement statiques : ce sont des informations stables
 * (numéros d'urgence, tension du réseau, usages) qui doivent rester lisibles
 * quand il n'y a plus une barre de réseau.
 */
export const PRACTICAL_SHEETS: readonly PracticalSheet[] = [
  {
    id: 'urgences',
    title: 'Urgences',
    icon: '🚨',
    summary: 'Les numéros à connaître avant d’en avoir besoin',
    sections: [
      {
        kind: 'paragraph',
        text: 'Les numéros courts fonctionnent depuis un mobile local comme depuis un numéro français, sans indicatif.',
      },
      {
        kind: 'facts',
        items: [
          { label: 'SAMU (urgence médicale)', value: '15', href: 'tel:15' },
          { label: 'Police / Gendarmerie', value: '17', href: 'tel:17' },
          { label: 'Pompiers', value: '18', href: 'tel:18' },
          { label: 'Urgences (numéro européen)', value: '112', href: 'tel:112' },
          { label: 'Secours en mer (JRCC Tahiti)', value: '16', href: 'tel:16' },
        ],
      },
      {
        kind: 'paragraph',
        text: 'Le centre hospitalier du Taaone, à Pirae près de Papeete, est le principal hôpital du territoire. Les îles éloignées disposent de dispensaires ; une évacuation sanitaire vers Tahiti peut être nécessaire, ce qui rend l’assurance voyage vraiment utile ici.',
      },
    ],
  },
  {
    id: 'telephone',
    title: 'Téléphone et internet',
    icon: '📱',
    summary: 'Indicatif +689, appeler la France, réseau',
    sections: [
      {
        kind: 'facts',
        items: [
          { label: 'Indicatif de la Polynésie française', value: '+689' },
          { label: 'Appeler la France depuis place', value: '+33 puis le numéro sans le 0' },
          { label: 'Appeler un mobile local', value: '+689 8x xx xx' },
        ],
      },
      {
        kind: 'paragraph',
        text: 'La Polynésie française n’est pas dans la zone d’itinérance « France » de la plupart des forfaits métropolitains : le roaming y est facturé au tarif international. Vérifiez votre forfait avant le départ, ou prenez une carte SIM locale (Vini, Vodafone, Ora) à l’aéroport de Faa’a.',
      },
      {
        kind: 'list',
        items: [
          'Le wifi est courant dans les hôtels et pensions, souvent lent.',
          'La 4G couvre bien Tahiti et Moorea, plus inégalement les Tuamotu et les Marquises.',
          'Sur un motu ou en excursion, prévoyez de n’avoir aucun réseau — d’où cette app hors ligne.',
        ],
      },
    ],
  },
  {
    id: 'electricite',
    title: 'Électricité',
    icon: '🔌',
    summary: '220 V, prises françaises — aucun adaptateur',
    sections: [
      {
        kind: 'facts',
        items: [
          { label: 'Tension', value: '220 V' },
          { label: 'Fréquence', value: '60 Hz (50 Hz dans certaines îles)' },
          { label: 'Prises', value: 'Types C et E — identiques à la métropole' },
        ],
      },
      {
        kind: 'paragraph',
        text: 'Bonne nouvelle : vos chargeurs français se branchent directement, sans adaptateur ni transformateur. La fréquence de 60 Hz n’a aucune incidence sur un chargeur USB ou un ordinateur portable.',
      },
      {
        kind: 'list',
        items: [
          'Quelques pensions isolées fonctionnent au solaire, avec coupures la nuit.',
          'Une batterie externe est précieuse pour les journées d’excursion.',
        ],
      },
    ],
  },
  {
    id: 'usages',
    title: 'Usages et politesse',
    icon: '🌺',
    summary: 'Pourboire, tenue, rythme de vie',
    sections: [
      {
        kind: 'paragraph',
        text: 'Le pourboire n’est pas dans la culture locale : le service est inclus et ne rien laisser ne choque personne. Un « Māuruuru » sincère vaut mieux qu’une pièce.',
      },
      {
        kind: 'list',
        items: [
          'On se salue volontiers, même entre inconnus : un « Ia ora na » ouvre beaucoup de portes.',
          'Le maillot de bain reste sur la plage : en ville et dans les commerces, on se couvre.',
          'Le monoï et les crèmes solaires classiques abîment le corail — préférez une protection minérale « reef safe ».',
          'Retirez vos chaussures avant d’entrer chez quelqu’un.',
          'Le rythme est tranquille : beaucoup de commerces ferment tôt, et le dimanche est très calme.',
          'Demandez avant de photographier une personne, une cérémonie ou un marae (site sacré).',
        ],
      },
      {
        kind: 'paragraph',
        text: 'Fleur à l’oreille : à droite pour signaler qu’on est en couple, à gauche que l’on est disponible — un usage souvent taquiné, jamais obligatoire.',
      },
    ],
  },
  {
    id: 'monnaie',
    title: 'Monnaie et paiements',
    icon: '💵',
    summary: 'Le franc pacifique en pratique',
    sections: [
      {
        kind: 'facts',
        items: [
          { label: 'Monnaie', value: 'Franc pacifique (XPF, aussi noté CFP ou F)' },
          { label: 'Taux fixe légal', value: '1 € = 119,331742 F' },
          { label: 'Repère de calcul', value: '1 000 F ≈ 8,38 €' },
          { label: 'Billets', value: '500, 1 000, 5 000 et 10 000 F' },
          { label: 'Pièces', value: '1, 2, 5, 10, 20, 50 et 100 F' },
        ],
      },
      {
        kind: 'paragraph',
        text: 'Le taux est fixé par la loi et ne varie pas : le convertisseur de cette app est donc exact en permanence, sans connexion.',
      },
      {
        kind: 'list',
        items: [
          'La carte bancaire passe bien à Tahiti et Bora Bora, moins dans les petites pensions et les atolls.',
          'Gardez des espèces pour les marchés, les roulottes, les taxis-boat et les excursions.',
          'Les distributeurs sont rares hors des îles principales : retirez avant de partir vers les Tuamotu.',
          'La vie est chère : comptez large sur l’alimentation et les transports inter-îles.',
        ],
      },
    ],
  },
  {
    id: 'calendrier',
    title: 'Saisons et jours fériés',
    icon: '📅',
    summary: 'Quand il pleut, quand tout ferme',
    sections: [
      {
        kind: 'paragraph',
        text: 'Deux saisons : la saison sèche et fraîche de mai à octobre (l’hiver austral, le meilleur moment pour voyager), et la saison chaude et humide de novembre à avril, plus pluvieuse et propice aux dépressions tropicales.',
      },
      {
        kind: 'list',
        items: [
          'Températures entre 24 °C et 31 °C toute l’année, eau autour de 26–29 °C.',
          'Baleines à bosse : de juillet à octobre.',
          'Houle et surf : plus forte de mai à septembre sur les côtes sud.',
        ],
      },
      {
        kind: 'facts',
        items: [
          { label: 'Fêtes françaises', value: 'Les jours fériés nationaux s’appliquent' },
          { label: '5 mars', value: 'Arrivée de l’Évangile' },
          { label: 'Juillet', value: 'Heiva i Tahiti — grand festival de danse et de chant' },
          { label: '29 juin', value: 'Fête de l’autonomie' },
        ],
      },
      {
        kind: 'paragraph',
        text: 'Pendant le Heiva et les fêtes de fin d’année, hébergements et vols intérieurs se remplissent longtemps à l’avance.',
      },
    ],
  },
];
