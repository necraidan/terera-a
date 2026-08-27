import { ArchipelagoId, TideRegime } from './islands.models';

/**
 * Les marées en Polynésie françaiseet pourquoi celles de la Société sont un
 * cas rare dans le monde.
 *
 * L'archipel de la Société se trouve pratiquement sur un point amphidromique de
 * l'onde lunaire M2, le point autour duquel cette onde tourne et où son
 * amplitude s'annule. La composante lunaire y est donc presque effacée (6,1 cm à
 * Papeete) et c'est la composante solaire S2 qui domine (7,2 cm), renforcée par
 * K2. Or S2 a une période de douze heures exactement, calée sur le jour solaire :
 * la marée suit l'horloge et non la luneet les mêmes heures reviennent tous les
 * jours de l'année, sans le décalage habituel d'une cinquantaine de minutes.
 *
 * Attention à ne pas surinterpréter : ce sont les HEURES qui suivent le soleil,
 * pas l'amplitude. Le cycle lunaire vives-eaux et mortes-eaux reste le premier
 * facteur de marnageet la régularité des heures se dégrade en mortes-eaux.
 *
 * Cette application ne calcule aucune hauteur de marée : elle donne des repères
 * pour organiser une journée. Seuls le lever et le coucher du soleil sont
 * calculés (voir solar.ts).
 */

export interface TideGuidance {
  readonly archipelagoId: ArchipelagoId;
  readonly regime: TideRegime;
  /** Résumé en une phrase, affiché en tête. */
  readonly summary: string;
  /** Heures approximatives de pleine mer, heure locale. Vide si régime lunaire. */
  readonly highTideHours: readonly string[];
  readonly lowTideHours: readonly string[];
  /** Marnage typique en centimètres. */
  readonly amplitudeCm: string;
  readonly tips: readonly string[];
}

export const TIDE_GUIDANCE: readonly TideGuidance[] = [
  {
    archipelagoId: 'societe',
    regime: 'solaire',
    summary:
      'Ici la marée suit l’horloge, pas la lune : les mêmes heures reviennent tous les jours de l’année.',
    highTideHours: ['00:40', '12:40'],
    lowTideHours: ['06:40', '18:40'],
    amplitudeCm: '18 à 19 cm en moyenne, 36 cm au maximum annuel',
    tips: [
      'Vous n’avez pas besoin d’annuaire des marées : mer basse en début de matinée et en début de soirée, mer haute autour de midi et au milieu de la nuit.',
      'Avec 20 cm de marnage, la marée n’est presque jamais un facteur limitant. Ce qui gouverne le lagon, c’est le vent, la houle du large et la turbidité après un gros grain.',
      'Marche sur le platier et exploration des cuvettes : le niveau est au plus bas vers 6 h 30 et vers 18 h 30, donc à peu près au lever et au coucher du soleil. Chaussons fermés obligatoires, le corail coupe et le nohu se cache.',
      'Snorkeling sur le platier intérieur : un peu plus d’eau vers 12 h 30, ce qui tombe bien puisque c’est aussi le meilleur moment pour la lumière. Le gain reste modeste.',
      'Bungalow sur pilotis : l’échelle reste utilisable à toute heure, la profondeur sous le plancher ne change quasiment pas.',
      'Passes de la Société : les courants de marée restent faibles. Le risque vient de la houle qui lève à l’entrée et du trafic, pas du courant.',
      'Le soleil commande les heures, mais la lune commande encore l’amplitude : le cycle vives-eaux et mortes-eaux, sur 14,77 jours, pèse plus du double du cycle saisonnier. Comptez environ 25 cm de marnage autour de la nouvelle et de la pleine luneet bien moins entre les deux.',
      'Corollaire utile : la règle des heures fixes est presque parfaite en vives-eauxet nettement moins fiable en mortes-eaux, quand la marée est de toute façon si faible qu’elle ne change plus rien.',
    ],
  },
  {
    archipelagoId: 'tuamotu',
    regime: 'lunaire',
    summary:
      'Changez de logique : la marée y est lunaire, elle se décale d’environ 50 minutes par jouret l’horloge de Tahiti ne s’applique pas.',
    highTideHours: [],
    lowTideHours: [],
    amplitudeCm: 'moins de 30 cm dans les lagons du nord et du centre, jusqu’à 60 cm vers l’est',
    tips: [
      'Les courants de passe sont la vraie affaire : jusqu’à 8 nœuds à Tiputa, à Rangiroaet 9 nœuds en sortie de la passe Garuae à Fakarava par forte houle de sud. Le courant entrant dépasse rarement 3 nœuds.',
      'La renverse est très rapide, quelques minutes. Demandez l’heure d’étale du jour à la pension ou au centre de plongée : c’est le seul renseignement fiable.',
      'Plongée dérivante : les passes se font sur le courant entrant, quand l’eau claire du large entre dans le lagon. Sur le sortant, l’eau du lagon ressort, plus chargée.',
      'Une forte houle de sud qui déferle par dessus le récif remplit le lagon. Le niveau intérieur monte, le courant sortant s’installe en permanenceet le courant entrant peut ne jamais revenir, quelle que soit l’heure de la marée.',
      'Pension sur pilotis : le niveau bouge peu, mais le courant sous le plancher peut être sensible près d’une passe ou d’un hoa. Ne laissez pas partir masque et tongs.',
    ],
  },
  {
    archipelagoId: 'marquises',
    regime: 'lunaire',
    summary:
      'Le seul archipel où la marée change vraiment quelque chose : pas de lagon, pas de barrièreet un marnage nettement plus fort.',
    highTideHours: [],
    lowTideHours: [],
    amplitudeCm: 'jusqu’à 1,50 m en pleine lune dans la baie de Taiohae',
    tips: [
      'Marée lunaire classique, avec le décalage habituel d’une cinquantaine de minutes par jour. Le calendrier lunaire redevient utile.',
      'C’est la seule région de Polynésie où le niveau compte pour un débarquement en annexe ou pour une échelle de quai.',
      'Pas de lagon protecteur : la houle arrive directement à la côteet la baignade tranquille est rare.',
    ],
  },
  {
    archipelagoId: 'australes',
    regime: 'lunaire',
    summary: 'Marée lunaire, avec un marnage supérieur à celui de la Société.',
    highTideHours: [],
    lowTideHours: [],
    amplitudeCm: 'supérieur à la Société, valeur précise non vérifiée',
    tips: [
      'Marée lunaire classique : décalage d’environ 50 minutes par jour, le calendrier lunaire s’applique.',
      'Climat plus frais et plus venté que dans la Société : le vent joue souvent plus que la marée sur les conditions du jour.',
    ],
  },
  {
    archipelagoId: 'gambier',
    regime: 'lunaire',
    summary: 'Marée lunaire, dans un lagon fermé unique en Polynésie.',
    highTideHours: [],
    lowTideHours: [],
    amplitudeCm: 'supérieur à la Société, valeur précise non vérifiée',
    tips: [
      'Marée lunaire classique : décalage d’environ 50 minutes par jour.',
      'Le lagon est fermé et abrité, mais les navettes vers l’aéroport de Totegegie dépendent surtout de la météo.',
    ],
  },
];

/** Ce que la règle des heures fixes ne dit paset ne peut pas dire. */
export const TIDE_LIMITS: readonly string[] = [
  'La règle des heures fixes vaut pour la Société et ses abords immédiats, là où se trouve le point amphidromique. Elle ne s’applique ni aux Tuamotu, ni aux Marquises, ni aux Australes, ni aux Gambier.',
  'Les heures ne sont pas rigides. Sur une année de prédictions à Papeete, les pleines mers se répartissent surtout entre 23 h et 2 h 30, puis entre 11 h et 14 h 30, avec un écart type de l’ordre d’une heure et demie.',
  'Le marnage est si faible dans la Société que la météo le masque facilement. Une dépression, un alizé soutenu ou une grosse houle australe décalent le niveau réel d’autant ou plus que la marée astronomique.',
  'Ces repères donnent des hauteurs, pas des courants. Même dans la Société, une passe peut avoir du courant sortant à l’heure d’une pleine mer, le lagon évacuant l’eau accumulée.',
  'Pour de la navigation réelle, ces repères ne remplacent ni un annuaire officiel du SHOM ni les instructions nautiques. Ils servent à organiser une journée, pas à franchir une passe à l’estime.',
];

/** Les constantes harmoniques de Papeete, pour qui veut la preuve du fait. */
export const PAPEETE_HARMONICS: readonly {
  readonly wave: string;
  readonly amplitudeCm: number;
  readonly origin: string;
}[] = [
  { wave: 'S2', amplitudeCm: 7.2, origin: 'solaire' },
  { wave: 'M2', amplitudeCm: 6.1, origin: 'lunaire' },
  { wave: 'K2', amplitudeCm: 2.2, origin: 'solaire' },
  { wave: 'O1', amplitudeCm: 1.5, origin: 'lunaire' },
  { wave: 'N2', amplitudeCm: 0.7, origin: 'lunaire' },
  { wave: 'K1', amplitudeCm: 0.6, origin: 'mixte' },
];

/** Retrouve les repères de marée d'un archipel. */
export function tideGuidanceFor(archipelagoId: ArchipelagoId): TideGuidance {
  const found = TIDE_GUIDANCE.find((guidance) => guidance.archipelagoId === archipelagoId);
  if (!found) {
    throw new Error(`aucun repère de marée pour l’archipel ${archipelagoId}`);
  }
  return found;
}
