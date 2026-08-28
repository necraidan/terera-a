/**
 * Randonnées de Tahiti, de sa presqu'île et de Moorea.
 *
 * Protocole de contenu, appliqué fiche par fiche et vérifié par hikes.spec.ts :
 *
 * 1. Inclusion : une randonnée entre ici seulement si sa durée est sourcée et sa
 *    difficulté cotable. Les activités encadrées qui ne sont pas de la marche
 *    (les lavatubes de Hitiaa relèvent du canyoning) restent dehors.
 * 2. Deux sources : chaque métrique est recoupée sur au moins deux sources
 *    indépendantes. Une source unique est signalée en commentaire.
 * 3. Désaccord : on retient la valeur la plus prudente, c'est à dire la plus
 *    longue et la plus dure, l'arbitrage est justifié en commentaire, et
 *    `metricsNote` le dit à l'utilisateur quand il doit le savoir.
 * 4. Introuvable : le champ est absent, jamais zéro ni une estimation.
 * 5. Réglementation : `accessNote` est formulé pour survivre à un changement de
 *    tarif ou d'horaire, et renvoie toujours à une vérification sur place.
 *
 * Les URLs restent ici, en commentaires : l'app fonctionne hors ligne et
 * content.spec.ts interdit tout lien http dans les données livrées. Le champ
 * `sources` porte les noms, affichés en pied de fiche.
 *
 * Vérification : août 2026. Une passe adversariale a corrigé trois valeurs de ce
 * lot, dont deux qui comptent : le mont Aorai ne demande pas de guide
 * obligatoire (sentier balisé, refuges), et le dénivelé du col des Trois Pinus
 * était surestimé de moitié.
 */
import { Hike } from './hikes.models';

export const HIKES: readonly Hike[] = [
  // Sources : tahiti-rando.fr/rando-tahiti-vallee-fautaua.php,
  // ville-papeete.pf/articles.php?id=300 (billet), blog-trotting.fr.
  // Désaccord : 9,8 km et +200 m chez tahiti-rando contre 11 km et +170 m
  // ailleurs. Retenu tahiti-rando, seule source à détailler les deux variantes.
  {
    id: 'vallee-fautaua',
    name: 'Vallée de la Fautaua',
    islandId: 'tahiti',
    difficulty: 'difficile',
    kind: 'aller-retour',
    lengthKm: 9.8,
    durationMin: 240,
    elevationGainM: 200,
    metricsNote:
      'La variante des vasques du Fachoda ajoute du dénivelé et des portions raides équipées de cordes : comptez 10,2 km et 600 m de montée.',
    guide: 'facultatif',
    accessNote:
      'La vallée est un domaine de la ville de Papeete : l’accès est payant et nominatif, le billet se retire à la mairie de Papeete en semaine. Renseignez vous à la mairie avant de partir, le tarif et les horaires changent.',
    summary:
      'La grande vallée au dessus de Papeete, remontée le long de la rivière jusqu’à la cascade de Loti. Le décor est celui d’une forêt humide de fond de vallée, à vingt minutes de la ville.',
    highlights: [
      'La cascade de Loti, l’une des plus hautes accessibles à pied sur Tahiti',
      'La rivière et ses vasques, baignade possible selon le niveau d’eau',
      'La variante des vasques du Fachoda, plus raide et plus sportive',
    ],
    advice: [
      'Retirer le billet à la mairie en semaine, avant un départ le week-end',
      'Chaussures qui tiennent au mouillé : le sentier traverse la rivière',
      'Deux litres d’eau par personne, l’air de la vallée est très humide',
    ],
    warnings: [
      'La rivière monte vite : ne vous engagez pas après de fortes pluies, et renoncez si le courant a forci.',
    ],
    trackCoverage: 'partiel',
    waypoints: [
      { lat: -17.58499, lon: -149.52863, label: 'Début du tracé' },
      { lat: -17.59656, lon: -149.52429, label: 'Cascade de Loti' },
    ],
    sources: ['tahiti-rando.fr', 'ville de Papeete', 'blog-trotting.fr'],
    reviewedOn: '2026-08-28',
  },

  // Sources : tahiti-rando.fr/rando-tahiti-mont-aorai.php, todotahiti.com,
  // iaorana.com. Durée 8 à 10 h selon les sources, retenu 9 h (le plus prudent).
  // Correction adversariale : guideRequired était à vrai. Le sentier est balisé
  // et jalonné de refuges, et plusieurs sources indépendantes le donnent
  // faisable sans guide. Ramené à « conseillé », la crête reste sérieuse.
  {
    id: 'mont-aorai',
    name: 'Mont Aorai',
    islandId: 'tahiti',
    difficulty: 'tres-difficile',
    kind: 'aller-retour',
    lengthKm: 18,
    durationMin: 540,
    elevationGainM: 1500,
    metricsNote:
      'Les sources donnent 8 à 10 h de marche selon la météo et la forme du jour. La plus longue est retenue.',
    guide: 'conseille',
    guideNote:
      'Le sentier est balisé et jalonné de deux refuges, mais la crête finale est aérienne et les nuages tombent souvent l’après-midi. Un accompagnateur qui connaît la montagne change la marge d’erreur.',
    summary:
      'Le troisième sommet de Tahiti, à 2 066 m, par une longue crête qui part des hauteurs de Pirae. C’est la grande course de l’île, à la journée complète.',
    highlights: [
      'La crête panoramique, avec Moorea d’un côté et l’intérieur de Tahiti de l’autre',
      'Les refuges Fare Mato et Fare Ata, étapes sur le parcours',
      'La vue sur l’Orohena et le Pitohiti, les deux sommets plus hauts',
    ],
    advice: [
      'Partir vers 5 h avec une frontale, pour être sur la crête avant les nuages',
      'Trois à quatre litres d’eau par personne, il n’y a pas de source sûre',
      'Coupe vent et polaire : il fait froid et venteux au dessus de 1 500 m',
      'Vérifier la météo la veille et renoncer si la pluie est annoncée',
    ],
    warnings: [
      'Passages de crête exposés, avec du vide de chaque côté.',
      'Terrain glissant et argileux : ne vous engagez pas après la pluie.',
      'Des secours héliportés ont déjà été nécessaires sur cet itinéraire.',
    ],
    trackCoverage: 'complet',
    waypoints: [
      { lat: -17.56492, lon: -149.52887, label: 'Départ du sentier' },
      { lat: -17.61327, lon: -149.49505, label: 'Sommet, 2 066 m' },
    ],
    sources: ['tahiti-rando.fr', 'todotahiti.com', 'iaorana.com'],
    reviewedOn: '2026-08-28',
  },

  // Sources : tahiti-rando.fr/rando-tahiti-mont-marau.php, iaorana.com.
  {
    id: 'mont-marau',
    name: 'Antennes du mont Marau',
    islandId: 'tahiti',
    difficulty: 'moyen',
    kind: 'aller-retour',
    lengthKm: 17.5,
    durationMin: 360,
    elevationGainM: 960,
    guide: 'facultatif',
    summary:
      'Une longue montée sur piste large jusqu’aux antennes de la crête du Marau, au dessus de Punaauia. Beaucoup de dénivelé mais aucune difficulté technique : c’est la grande vue de Tahiti sans l’engagement de l’Aorai.',
    highlights: [
      'La vue sur Moorea, le lagon ouest et toute la côte de Punaauia',
      'Le regard plongeant sur la vallée de la Fautaua et sa cascade',
      'Une piste dégagée du début à la fin, rare sur les hauteurs de Tahiti',
    ],
    advice: [
      'Partir tôt : la piste est en plein soleil sur presque tout le parcours',
      'Deux à trois litres d’eau, aucun point d’eau sur le parcours',
      'Un 4x4 peut monter une partie de la piste et raccourcir la marche',
    ],
    warnings: ['La piste est ravinée et très glissante après la pluie.'],
    trackCoverage: 'complet',
    waypoints: [
      { lat: -17.57859, lon: -149.58295, label: 'Départ de la piste' },
      { lat: -17.60973, lon: -149.5327, label: 'Crête sommitale, vers 1 440 m' },
    ],
    sources: ['tahiti-rando.fr', 'iaorana.com'],
    reviewedOn: '2026-08-28',
  },

  // Sources : tahitirevatrek.com, todotahiti.com, wikiloc.com, tahitisuntours.com.
  // Correction adversariale : la distance était donnée introuvable, alors que
  // tahitisuntours publie environ 9 km et un dénivelé quasi nul. Le dénivelé
  // reste absent, aucune source ne le chiffre vraiment.
  // Pas de tracé : aucun sentier de cette côte n'est cartographié dans OSM.
  {
    id: 'te-pari',
    name: 'Te Pari, les falaises de la presqu’île',
    islandId: 'tahiti',
    difficulty: 'moyen',
    kind: 'traversee',
    lengthKm: 9,
    durationMin: 390,
    metricsNote:
      'Le dénivelé n’est pas publié : le parcours reste côtier, mais l’enchaînement des rochers et des passages dans l’eau rend la progression bien plus lente qu’un sentier de plaine.',
    guide: 'obligatoire',
    guideNote:
      'La côte n’est accessible qu’en bateau, le cheminement passe par des passages aquatiques et des terrains habités, et il n’existe aucune échappatoire une fois engagé. Les opérateurs de la presqu’île encadrent la traversée.',
    accessNote:
      'Accès uniquement par la mer depuis Teahupoo. Renseignez vous auprès d’un opérateur de la presqu’île pour la navette et l’encadrement.',
    summary:
      'La côte sauvage du bout de Tahiti Iti, là où la route s’arrête. Une journée entière entre falaises, sites anciens et passages les pieds dans l’eau, dans la partie la plus isolée de l’île.',
    highlights: [
      'Les falaises du Fenua Aihere, sans route ni village',
      'Les sites archéologiques et les grottes du littoral',
      'La bascule vers la côte au vent, complètement déserte',
    ],
    advice: [
      'Sac étanche : plusieurs passages se font dans l’eau',
      'Chaussures fermées qui tiennent au mouillé, pas de tongs',
      'Partir tôt, la traversée occupe la journée entière',
    ],
    warnings: [
      'Aucune échappatoire une fois engagé : la sortie se fait par la mer.',
      'La houle rend certains passages infranchissables, la décision revient au guide.',
      'Ne partez jamais seul sur cette côte, il n’y a ni réseau ni secours proche.',
    ],
    sources: ['tahitirevatrek.com', 'todotahiti.com', 'Wikiloc', 'tahitisuntours.com'],
    reviewedOn: '2026-08-28',
  },

  // Sources : tahiti-rando.fr/rando-moorea-opunohu.php, denivpositif.com,
  // decathlon-outdoor.com, tahiti-infos.com.
  // Désaccord marqué : 4,3 km et +198 m (denivpositif), 5,9 km et +298 m
  // (decathlon), 7 km et 3 h (tahiti-rando), selon le point de départ retenu sur
  // le plateau. Retenu le plus long et le plus raide, exposé dans metricsNote.
  {
    id: 'col-trois-cocotiers',
    name: 'Col des Trois Cocotiers',
    islandId: 'moorea',
    difficulty: 'facile',
    kind: 'aller-retour',
    lengthKm: 7,
    durationMin: 180,
    elevationGainM: 298,
    metricsNote:
      'Selon le point de départ retenu sur le plateau d’Opunohu, les sources annoncent de 4,3 à 7 km. Les valeurs les plus longues sont retenues ici.',
    guide: 'facultatif',
    summary:
      'La randonnée classique de Moorea, au départ du plateau d’Opunohu : une montée régulière en forêt de mape jusqu’au col, entre les deux baies.',
    highlights: [
      'La forêt de mape, les châtaigniers tahitiens aux racines en éventail',
      'La vue sur les baies d’Opunohu et de Cook depuis le col',
      'Les marae du plateau, sur le chemin du départ',
    ],
    advice: [
      'Partir le matin, avant la chaleur et les averses de l’après midi',
      'Un litre et demi d’eau par personne',
      'Se garer au belvédère ou près des marae, selon la variante choisie',
    ],
    warnings: ['Terrain argileux très glissant après la pluie, et quelques cordes près du col.'],
    trackCoverage: 'complet',
    waypoints: [
      { lat: -17.54054, lon: -149.82665, label: 'Départ, plateau d’Opunohu' },
      { lat: -17.54768, lon: -149.84084, label: 'Col' },
    ],
    sources: ['tahiti-rando.fr', 'denivpositif.com', 'decathlon-outdoor.com', 'tahiti-infos.com'],
    reviewedOn: '2026-08-28',
  },

  // Sources : tahiti-rando.fr/rando-moorea-opunohu.php, denivpositif.com.
  // Correction adversariale : le dénivelé annoncé à +200 m est incompatible avec
  // les altitudes du belvédère (207 m) et du col (280 m). Ramené à 130 m, valeur
  // de denivpositif, seule cohérente avec le terrain.
  {
    id: 'col-trois-pinus',
    name: 'Col des Trois Pinus',
    islandId: 'moorea',
    difficulty: 'facile',
    kind: 'aller-retour',
    lengthKm: 3,
    durationMin: 90,
    elevationGainM: 130,
    guide: 'facultatif',
    summary:
      'La petite sœur des Trois Cocotiers, au départ du même belvédère : une heure et demie de marche facile jusqu’à un col ouvert sur la vallée d’Opunohu.',
    highlights: [
      'Un marae et un grand banian sur le parcours',
      'Le point de vue du col, sans la longueur des Trois Cocotiers',
      'Une sortie courte, faisable en fin de journée',
    ],
    advice: [
      'Se garer au belvédère d’Opunohu, le sentier part sur la gauche',
      'Un litre d’eau suffit',
      'À combiner avec les marae du plateau pour une demi journée complète',
    ],
    warnings: ['Sentier étroit et glissant après la pluie.'],
    trackCoverage: 'complet',
    waypoints: [
      { lat: -17.53962, lon: -149.82608, label: 'Belvédère d’Opunohu' },
      { lat: -17.53442, lon: -149.82212, label: 'Col' },
    ],
    sources: ['tahiti-rando.fr', 'denivpositif.com'],
    reviewedOn: '2026-08-28',
  },

  // Source : tahiti-rando.fr/rando-moorea-cascade-vaioro.php. Source unique pour
  // les métriques ; la cascade elle même et sa position sont confirmées par
  // OpenStreetMap, où elle est nommée.
  {
    id: 'cascade-vaioro',
    name: 'Cascade de la Vaioro',
    islandId: 'moorea',
    difficulty: 'facile',
    kind: 'aller-retour',
    lengthKm: 4.3,
    durationMin: 90,
    elevationGainM: 120,
    guide: 'facultatif',
    accessNote:
      'Le chemin part d’Afareaitu et traverse des terrains habités : restez sur le sentier, et demandez si un accès paraît fermé.',
    summary:
      'Une marche facile depuis Afareaitu jusqu’à une cascade encaissée, avec un bassin où l’on peut se baigner quand le niveau d’eau le permet.',
    highlights: [
      'Le bassin de la cascade et ses vasques',
      'Une tête de tiki gravée dans la roche, à droite de la chute',
      'Le fond de vallée d’Afareaitu, très vert et très calme',
    ],
    advice: [
      'Le premier kilomètre suit une piste, le sentier commence ensuite',
      'Chaussures qui tiennent au mouillé, la fin du parcours est humide',
      'Y aller le matin : la vallée perd le soleil tôt',
    ],
    warnings: ['Les roches du bassin sont glissantes, et la rivière grossit vite après la pluie.'],
    trackCoverage: 'partiel',
    waypoints: [
      { lat: -17.54028, lon: -149.79321, label: 'Début du tracé' },
      { lat: -17.53726, lon: -149.79821, label: 'Cascade de la Vaioro' },
    ],
    sources: ['tahiti-rando.fr', 'OpenStreetMap'],
    reviewedOn: '2026-08-28',
  },

  // Sources : alltrails.com (mount-rotui-depuis-faimano),
  // polynesie.liliguide.com, wikiloc.com. Traces de 7 à 9 km et de 800 à 900 m
  // de dénivelé : retenu le plus long et le plus raide.
  {
    id: 'mont-rotui',
    name: 'Mont Rotui',
    islandId: 'moorea',
    difficulty: 'tres-difficile',
    kind: 'aller-retour',
    lengthKm: 8,
    durationMin: 360,
    elevationGainM: 900,
    metricsNote:
      'Les traces publiées vont de 7 à 9 km et de 800 à 900 m de dénivelé. Les valeurs les plus élevées sont retenues.',
    guide: 'conseille',
    guideNote:
      'La crête est étroite et exposée, avec des passages d’escalade et une végétation qui masque le cheminement. L’itinéraire se perd facilement, et des secours héliportés ont déjà été nécessaires.',
    summary:
      'La montagne qui sépare les baies de Cook et d’Opunohu, gravie par sa crête jusqu’à 899 m. La plus engagée des randonnées de Moorea.',
    highlights: [
      'La crête entre les deux grandes baies, avec le lagon des deux côtés',
      'Le sommet à 899 m, au dessus de tout Moorea',
      'Un itinéraire de crête continu, rare dans l’archipel',
    ],
    advice: [
      'Partir à l’aube : la montée est longue et il faut redescendre avant la pluie',
      'Trois litres d’eau par personne, aucun point d’eau',
      'Gants de travail : on s’aide beaucoup des mains et des racines',
      'Renoncer si la roche est mouillée, la crête devient très dangereuse',
    ],
    warnings: [
      'Crête étroite et très exposée, avec des passages d’escalade sans protection.',
      'Le cheminement se perd dans la végétation : ne vous engagez pas sans connaître l’itinéraire.',
      'Des secours héliportés ont déjà été nécessaires sur cette montagne.',
    ],
    trackCoverage: 'partiel',
    waypoints: [
      { lat: -17.48695, lon: -149.84513, label: 'Début du tracé' },
      { lat: -17.51061, lon: -149.83835, label: 'Sommet, 899 m' },
    ],
    sources: ['AllTrails', 'liliguide.com', 'Wikiloc'],
    reviewedOn: '2026-08-28',
  },

  // Sources : alltrails.com/trail/french-polynesia/moorea/mou-aputa,
  // moanavoyages.com, manawa.com. Désaccord très large, de 3,5 à 9 km selon les
  // traces : retenu 7 km, valeur médiane haute, désaccord exposé à l'écran.
  {
    id: 'mont-mouaputa',
    name: 'Mont Mou’aputa, la montagne percée',
    islandId: 'moorea',
    difficulty: 'tres-difficile',
    kind: 'aller-retour',
    lengthKm: 7,
    durationMin: 360,
    elevationGainM: 800,
    metricsNote:
      'Les traces publiées vont de 3,5 à 9 km selon le point de départ. Comptez sur la durée plutôt que sur la distance pour dimensionner la sortie.',
    guide: 'conseille',
    guideNote:
      'La partie haute est équipée de cordes fixes, de chaînes et d’échelles, sur un terrain très exposé. L’équipement en place n’est pas entretenu par un service public : un guide sait ce qui tient.',
    summary:
      'Le sommet percé de Moorea, à 830 m : un trou dans la crête, visible depuis la côte est. L’ascension est courte mais franchement verticale sur la fin.',
    highlights: [
      'Le trou du sommet, la « montagne percée » de la légende',
      'La vue plongeante sur Afareaitu et la côte est',
      'Une ascension très directe, presque toute en montée',
    ],
    advice: [
      'Partir tôt, la montée est raide et exposée au soleil sur la fin',
      'Deux à trois litres d’eau par personne',
      'Gants de travail pour les cordes et les chaînes',
      'Renoncer par temps humide : les cordes et la roche deviennent glissantes',
    ],
    warnings: [
      'Cordes fixes, chaînes et échelles sur la partie haute, au dessus du vide.',
      'L’équipement en place n’est entretenu par personne : ne comptez pas dessus aveuglément.',
      'Terrain glissant après la pluie, exposition extrême sur les derniers mètres.',
    ],
    trackCoverage: 'partiel',
    waypoints: [
      { lat: -17.53836, lon: -149.79642, label: 'Début du tracé' },
      { lat: -17.52629, lon: -149.80328, label: 'Sommet percé, 830 m' },
    ],
    sources: ['AllTrails', 'moanavoyages.com', 'manawa.com'],
    reviewedOn: '2026-08-28',
  },
];

/**
 * Ce que l'app dit d'elle même sur les randonnées, affiché en pied de liste.
 *
 * Ce n'est pas une clause de style : les sentiers polynésiens sont rarement
 * balisés, souvent sur du foncier privé, et les cotations varient d'une source à
 * l'autre. Mieux vaut le dire une fois clairement que le laisser découvrir.
 */
export const HIKE_DISCLAIMER: readonly string[] = [
  'Les sentiers sont rarement balisés et traversent souvent des terrains privés : demandez sur place avant de vous engager.',
  'La pluie change tout : un sentier facile devient glissant et une rivière peut monter en une heure.',
  'Partez tôt. La nuit tombe vite et sans crépuscule sous les tropiques.',
  'Les informations sont vérifiées à la date indiquée sur chaque fiche, mais un accès peut fermer sans préavis.',
];
