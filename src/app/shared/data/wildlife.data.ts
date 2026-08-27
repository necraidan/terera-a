import { MarineRegulation, MarineSpecies } from './wildlife.models';

/**
 * La faune marine que rencontre un voyageuret ce que la loi polynesienne
 * autorise a son sujet.
 *
 * Les regles d'approche ne sont pas des conseils de politesse : la Polynesie
 * francaise est un sanctuaire des mammiferes marins depuis 2002, tous les
 * requins y sont protegeset les infractions sont penalement sanctionnees.
 */
export const MARINE_SPECIES: readonly MarineSpecies[] = [
  {
    id: 'raie-pastenague',
    nameFr: 'Raie pastenague à queue en fouet',
    nameTy: 'fai',
    nameSci: 'Pateobatis fai (anciennement Himantura fai)',
    image: 'images/wildlife/raie-pastenague.webp',
    photoCredit: 'Charles J. Sharp, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      "Fonds de sable du lagon, souvent par moins de deux mètres d'eau. Sites classiques à Moorea (secteur Tiahura) et à Bora Bora, en snorkeling depuis un bateau ou debout sur le sable. On la croise aussi sur les platiers sableux, près des motu et à l'entrée des chenaux.",
    season: "Toute l'année, pas de saisonnalité marquée.",
    sizeTypical:
      "1 à 1,5 m de largeur de disque, jusqu'à 2 m, avec une queue en fouet plus longue que le corps.",
    risk: 'modere',
    riskNote:
      "L'animal n'est pas agressif, mais il porte un ou deux dards venimeux à la base de la queue. Les blessures sérieuses arrivent quand on marche dessus sans l'avoir vue, ou quand on la manipule sur les sites où des prestataires les ont habituées à monter sur les nageurs. Une piqûre est très douloureuse et demande un avis médical.",
    protection:
      "Les pastenagues ne figurent pas sur la liste des espèces protégées de Polynésie française. Elles restent couvertes par l'interdiction générale de perturbation intentionnelle de la faune sauvage et par l'interdiction d'attirer à soi les espèces sauvages avec de la nourriture (art. LP. 2200-1 du code de l'environnement).",
    rules: [
      "Marcher en glissant les pieds sur le sable plutôt qu'en posant le pied à plat : la raie s'écarte avant le contact.",
      'Ne pas la nourrir, ne pas la soulever, ne pas la caresser sur le dos, ne jamais toucher la queue.',
      "Rester à l'horizontale et garder ses distances au milieu d'un groupe de raies habituées au nourrissage.",
      "En cas de piqûre : sortir de l'eau, immerger la plaie dans l'eau la plus chaude supportable (environ 45 degrés) pendant 30 à 90 minutes, puis consulter, des fragments de dard peuvent rester dans la plaie.",
    ],
  },
  {
    id: 'raie-manta',
    nameFr: 'Raie manta de récif',
    nameTy: 'fafapiti (fafa piti)',
    nameSci: 'Mobula alfredi',
    image: 'images/wildlife/raie-manta.webp',
    photoCredit: 'Shiyam ElkCloner, CC BY-SA 3.0, via Wikimedia Commons',
    where:
      'Stations de nettoyage et zones de courant. Le site le plus connu est Anau, au nord du lagon de Bora Bora. Également Tikehau, Rangiroa, Maupiti et Tahaa. En snorkeling ou en plongée, souvent à faible profondeur au-dessus des patates de corail.',
    season:
      "Présence toute l'année sur les stations de nettoyage, avec des fréquences variables selon les sites, la saison et l'état de la mer.",
    sizeTypical: "3 à 4 m d'envergure, exceptionnellement 5 m.",
    risk: 'aucun',
    riskNote:
      "Filtreuse de plancton, sans dard ni dents dangereuses. Le risque est à l'envers : le contact abîme le mucus qui protège sa peauet la pression touristique fait déserter les stations de nettoyage.",
    protection:
      "Espèce protégée. Le genre Mobula sp. est inscrit sur la liste des espèces protégées de catégorie A du code de l'environnement de la Polynésie française : destruction, mutilation, perturbation intentionnelle, capture, détention, commerce, import et export sont interdits.",
    rules: [
      "Ne jamais toucher, ne pas poursuivre, ne pas couper sa trajectoire, ne pas nager au-dessus d'elle.",
      "Rester sur le côté et laisser l'animal venir. Les prestataires locaux appliquent une distance minimale d'environ 3 m.",
      'Pas de palmage brusque, pas de flash rapproché, pas de bulles sous le ventre en plongée.',
      "Ne pas s'installer sur la station de nettoyage elle-même : les raies renoncent à s'y faire nettoyer.",
    ],
  },
  {
    id: 'requin-pointe-noire',
    nameFr: 'Requin à pointes noires du lagon',
    nameTy: "ma'o mauri, ma'o 'ere'ere",
    nameSci: 'Carcharhinus melanopterus',
    image: 'images/wildlife/requin-pointe-noire.webp',
    photoCredit: 'Charles J. Sharp, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      "Le requin le plus courant du lagon : platiers, chenaux, bords de motu, parfois par moins d'un mètre d'eau. Visible depuis la plage, en snorkeling et sur toutes les excursions lagon de Moorea, Bora Bora, Rangiroa, Fakarava.",
    season: "Toute l'année.",
    sizeTypical: '1,2 à 1,6 m, rarement plus de 1,8 m.',
    risk: 'faible',
    riskNote:
      "Craintif, il s'écarte du nageur. Les rares incidents sont des morsures de confusion ou de compétition, presque toujours liées à du nourrissage, à de la pêche sous-marine (poisson blessé porté à la ceinture) ou à une main tendue. C'est un prédateur sauvage, pas un poisson d'aquarium.",
    protection:
      "Espèce protégée. Toutes les espèces de requins sont inscrites sur la liste des espèces protégées de catégorie B (arrêté n° 396 CM du 28 avril 2006 modifié, protection étendue ensuite à l'ensemble des requins). Pêche, mutilation, détention, transport, commerce et consommation sont interdits.",
    rules: [
      "Ne pas nourrir, ne pas attirer avec du poisson ou du pain : c'est interdit par le code de l'environnement.",
      'Ne pas toucher, ne pas saisir la queue ni les ailerons, ne pas bloquer un requin dans un cul-de-sac.',
      "Ne pas se baigner près d'un nettoyage de poisson, ni garder sur soi du poisson pêché.",
      'Éviter la baignade de nuit et au crépuscule, dans les passeset dans une eau chargée après de fortes pluies.',
    ],
  },
  {
    id: 'requin-pointe-blanche-recif',
    nameFr: 'Requin corail, dit pointe blanche de récif',
    nameSci: 'Triaenodon obesus',
    image: 'images/wildlife/requin-pointe-blanche-recif.webp',
    photoCredit: 'Diego Delso, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      'Posé sous les patates de corail, dans les grottes et les surplombs pendant la journée. Très commun en plongée aux Tuamotu, à Moorea et à Tahiti, plus rarement vu en snorkeling.',
    season: "Toute l'année.",
    sizeTypical: '1,2 à 1,7 m.',
    risk: 'faible',
    riskNote:
      "Placide et souvent immobile sur le fond. Il ne mord que s'il est manipulé, tiré de son abri, ou en présence de poisson blessé. Il chasse activement la nuit.",
    protection:
      "Espèce protégée au titre de l'inscription de toutes les espèces de requins sur la liste des espèces protégées de catégorie B du code de l'environnement.",
    rules: [
      "Ne pas le sortir de sa grotte, ne pas le toucher, ne pas l'éclairer longuement en plongée de nuit.",
      'Garder ses distances lors des chasses nocturnes en groupe.',
      'Pas de nourrissage, pas de pêche sous-marine sur les sites de plongée.',
    ],
  },
  {
    id: 'requin-citron',
    nameFr: 'Requin citron à faucille',
    nameTy: "ma'o 'arava",
    nameSci: 'Negaprion acutidens',
    image: 'images/wildlife/requin-citron.webp',
    photoCredit: 'Patrick Quinn-Graham from Vancouver, Canada, CC BY 2.0, via Wikimedia Commons',
    where:
      'Pentes externes, abords des passes, parfois entrées de lagon. Sites réguliers à Moorea et Tahiti sur les tombants, où il vient au contact des plongeurs. Rencontre surtout en plongée bouteille.',
    season: "Toute l'année.",
    sizeTypical: "2 à 3 m, jusqu'à 3,4 m.",
    risk: 'modere',
    riskNote:
      "Gros requin trapu, lent et curieux, qui s'approche parfois à courte distance. Très peu d'incidents documentés en Polynésie, mais sa taille et l'habitude prise sur d'anciens sites de nourrissage imposent de la prudence et un comportement calme.",
    protection:
      "Espèce protégée au titre de l'inscription de toutes les espèces de requins sur la liste des espèces protégées de catégorie B du code de l'environnement.",
    rules: [
      "Rester groupé, garder l'animal en vue, ne pas s'éloigner en palmant vite en surface.",
      'Ne rien tenir dans les mains qui puisse passer pour une proie : poisson, sac brillant, objet agité.',
      "Ne pas nourrir ni provoquer d'attroupement autour du bateau.",
      "Rester le long du récif plutôt qu'en pleine eauet remonter le long du tombant.",
    ],
  },
  {
    id: 'requin-gris-recif',
    nameFr: 'Requin gris de récif',
    nameSci: 'Carcharhinus amblyrhynchos',
    image: 'images/wildlife/requin-gris-recif.webp',
    photoCredit: 'NOAA Photo Library, CC BY 2.0, via Wikimedia Commons',
    where:
      "Dans les passes à courant entrant, souvent en banc de plusieurs dizaines d'individus : passe sud de Fakarava (Tumakohua), passe de Tiputa à Rangiroa, Tahaa, Moorea. Rencontre typique en plongée, plus rarement en snorkeling dérivant encadré.",
    season:
      "Toute l'année. Les rassemblements les plus spectaculaires de la passe sud de Fakarava se produisent en juin et juillet, autour de la reproduction des mérous.",
    sizeTypical: '1,5 à 2 m.',
    risk: 'faible',
    riskNote:
      'Habitué aux plongeurs, il ignore le plus souvent les visiteurs. Il peut adopter une posture de menace, nage saccadée, dos arqué, pectorales baissées, si on le poursuit ou si on lui coupe la retraite : dans ce cas il faut reculer lentement.',
    protection:
      "Espèce protégée au titre de l'inscription de toutes les espèces de requins sur la liste des espèces protégées de catégorie B du code de l'environnement.",
    rules: [
      'Se tenir contre le récif dans le courant, ne pas nager vers le banc en pleine eau.',
      'Savoir reconnaître la posture de menace et se retirer sans mouvement brusque.',
      'Pas de nourrissage, pas de pêche sous-marine sur ces sites.',
      'Plonger les passes avec un professionnel, au bon moment de marée.',
    ],
  },
  {
    id: 'requin-tigre',
    nameFr: 'Requin tigre',
    nameSci: 'Galeocerdo cuvier',
    image: 'images/wildlife/requin-tigre.webp',
    photoCredit: 'Albert kok, CC BY-SA 3.0, via Wikimedia Commons',
    where:
      "Eaux extérieures, abords des passes et pentes externes, parfois au large des spots de surf ou près des zones où l'on rejette des déchets de poisson. Rencontre rare et imprévisible ; quelques sites de Tahiti et Moorea en signalent régulièrement.",
    season: "Toute l'année.",
    sizeTypical: "3 à 4 m, jusqu'à plus de 5 m.",
    risk: 'eleve',
    riskNote:
      "C'est l'une des rares espèces présentes en Polynésie capables de blesser gravement un humain. Les accidents restent très rares dans le territoire et sont presque toujours liés à du nourrissage, à de la pêche sous-marine ou à une eau trouble. Une rencontre en plongée se termine dans la grande majorité des cas par un passage tranquille de l'animal.",
    protection:
      "Espèce protégée au titre de l'inscription de toutes les espèces de requins sur la liste des espèces protégées de catégorie B du code de l'environnement.",
    rules: [
      "Ne jamais nourrir ni participer à une observation basée sur l'appâtage : c'est interdit.",
      "Si un requin tigre s'intéresse de près à vous, sortir de l'eau sans mouvement brusque en gardant l'animal en vue.",
      'Éviter de nager seul au large, de nuit, au crépuscule, ou dans une eau chargée après la pluie.',
      'Ne pas garder sur soi du poisson pêché.',
    ],
  },
  {
    id: 'requin-baleine',
    nameFr: 'Requin baleine',
    nameSci: 'Rhincodon typus',
    image: 'images/wildlife/requin-baleine.webp',
    photoCredit: 'Abe Khao Lak, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      "En pleine eau, au large ou à l'entrée des passes. Observations dispersées et imprévisibles, signalées notamment aux Tuamotu et aux Marquises. Ce n'est pas une rencontre que l'on peut programmer en Polynésie française.",
    season: 'Aucune saison fiable établie localement : les observations sont ponctuelles.',
    sizeTypical: "6 à 10 m couramment, jusqu'à 12 m et plus.",
    risk: 'aucun',
    riskNote:
      "Filtreur de plancton, totalement inoffensif. Le seul danger vient de la puissance de sa nageoire caudale si l'on se place juste derrière lui.",
    protection:
      "Espèce protégée au titre de l'inscription de toutes les espèces de requins sur la liste des espèces protégées de catégorie B du code de l'environnement.",
    rules: [
      'Ne pas toucher, ne pas se laisser tirer par une nageoire, ne pas se mettre sur sa trajectoire.',
      'Rester à environ 3 m du corps et 4 m de la caudale, selon le code de conduite international appliqué par les prestataires.',
      "Peu de nageurs à l'eau à la fois, mise à l'eau en douceur, sans sauter sur l'animal.",
      'Pas de flash, pas de scooter sous-marin, ne pas bloquer sa descente.',
    ],
  },
  {
    id: 'baleine-a-bosse',
    nameFr: 'Baleine à bosse',
    nameTy: "tohora (Tahiti), to'ora (Australes), paraoa (Tuamotu), pa'aoa (Marquises)",
    nameSci: 'Megaptera novaeangliae',
    image: 'images/wildlife/baleine-a-bosse.webp',
    photoCredit: 'Juan Cruzado Cortés, CC BY 4.0, via Wikimedia Commons',
    where:
      "Eaux extérieures, le long des récifs barrières et des pentes, souvent visible depuis le rivage. L'approche se fait en mer avec un prestataire autorisé : Rurutu et Tubuai aux Australes, Moorea, Tahiti, Bora Bora, Huahine, Raiatea, Tahaa, Tetiaroaet les Marquises. La recherche et l'approche sont interdites dans les lagons, les baies et les passes, ainsi que dans un rayon de 1 km centré sur l'axe d'une passe.",
    season:
      "Hiver austral : présence de juillet à novembre, avec un pic en août, septembre et octobre. Pour la saison vérifiée, l'observation encadrée n'est autorisée que du 20 juillet au 20 novembre, de 7h30 à 17h30 ; ces bornes sont fixées par arrêté et peuvent changer d'une année sur l'autre. Les mères et leurs baleineaux sont souvent les dernières à repartir.",
    sizeTypical: '12 à 15 m pour 25 à 40 tonnes ; un baleineau naît autour de 4 à 5 m.',
    risk: 'modere',
    riskNote:
      "Aucune agressivité, mais un animal de plusieurs dizaines de tonnes : un coup de caudale, une parade de mâles ou un saut à proximité peuvent blesser gravement ou tuer. L'autre enjeu est le dérangement : les baleines ne se nourrissent pas en Polynésie, chaque fuite provoquée coûte une énergie qu'elles ne peuvent pas reconstituer sur place.",
    protection:
      "Espèce protégée de catégorie B et couverte par le sanctuaire polynésien des mammifères marins. La recherche et l'approche professionnelle ou habituelle sans autorisation, le harcèlement, la capture et la consommation sont interdits. Les atteintes à une espèce protégée sont punies jusqu'à 2 ans d'emprisonnement et 17 800 000 F CFP d'amende.",
    rules: [
      'Distance minimale de 100 m pour les navires des prestataires autorisés, 300 m pour tous les autres bateaux depuis la réforme applicable au 1er décembre 2024.',
      "Trois navires au maximum dans la zone d'observation, un seul par groupe d'entreprises.",
      "Mise à l'eau réservée aux sorties autorisées : 6 personnes maximum accompagnées d'un guide formé, jamais à moins de 15 m de l'animalet jamais déposées sur la trajectoire de la baleine.",
      "Vitesse limitée à 3 noeuds dans un rayon de 300 m, route parallèle et dans le même sens, aucun changement brusque de cap ou de régime moteur, moteur au point mort et non coupé si l'animal se rapproche.",
      "Ne pas encercler, ne pas séparer une mère de son baleineau, ne pas bloquer un animal contre le récif ou le rivage, ne pas s'approcher d'un jeune seul.",
      "Ne pas rester plus de 15 minutes dans la zone d'observation, moins encore en présence d'un nouveau-né.",
      'Sonars autres que ceux de la navigation interdits ; aéronefs et drones à plus de 300 m de hauteur.',
    ],
  },
  {
    id: 'dauphins',
    nameFr: 'Dauphins et globicéphales',
    nameTy: "ou'a (Tahiti et Australes), kouka (Tuamotu)",
    nameSci:
      'Stenella longirostris (dauphin à long bec), Tursiops truncatus (grand dauphin), Steno bredanensis (dauphin à bec étroit), Globicephala macrorhynchus (globicéphale tropical)',
    image: 'images/wildlife/dauphins.webp',
    photoCredit: 'source non identifiée, image fournie',
    where:
      "Abords des passes et pleine mer. Les grands dauphins de la passe de Tiputa à Rangiroa sont les plus connus ; les dauphins à long bec s'observent en petits groupes près des côtes, souvent en repos dans la journée ; globicéphales et dauphins de haute mer se voient au large, notamment aux Marquises et aux Tuamotu.",
    season: "Toute l'année, en résidents ou de passage selon les espèces.",
    sizeTypical:
      "1,8 à 2,3 m pour le dauphin à long bec, 2,5 à 3,8 m pour le grand dauphin, jusqu'à 5,5 m pour le globicéphale.",
    risk: 'faible',
    riskNote:
      "Pas de danger en soi, mais ce sont de grands prédateurs sauvages : morsures et coups sont possibles si on les touche ou si on s'impose à eux. Les groupes en repos, en particulier les dauphins à long bec en journée, sont très sensibles au dérangement.",
    protection:
      'Toutes les espèces de dauphinset plus généralement tous les mammifères marins, sont des espèces protégées de catégorie B, dans le sanctuaire polynésien des mammifères marins.',
    rules: [
      "Distance de sécurité minimale de 30 m entre l'embarcation et un dauphin ou un globicéphale (art. A. 2213-1-7 du code de l'environnement).",
      "Ne pas poursuivre, ne pas couper la route, suivre une route parallèle dans le même sens ; si l'animal s'approche de lui-même, moteur au point mort et non coupé.",
      "Ne pas se mettre à l'eau au milieu d'un groupe, ne pas encercler, ne pas séparer une mère de son petit.",
      "L'approche professionnelle ou habituelle est soumise à autorisation de la direction de l'environnement ; l'observation est interdite dans les lagons, les baies et les passes.",
      "Ne pas toucher, ne pas nourrir, ne pas nager après un groupe qui s'éloigne.",
    ],
  },
  {
    id: 'tortue-verte',
    nameFr: 'Tortue verte',
    nameTy: 'honu, tifai',
    nameSci: 'Chelonia mydas',
    image: 'images/wildlife/tortue-verte.webp',
    photoCredit: 'Charles J. Sharp, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      'Lagon, platiers, herbiers et patates de corail. Fréquente à Moorea, Bora Bora, Tikehau, Maupitiet sur les sites de ponte de Tetiaroa et des atolls de Scilly (Manuae) et Bellingshausen. Rencontre en snorkeling comme en plongée.',
    season:
      "Présence toute l'année. Saison de ponte de fin septembre à mars, avec un pic de décembre à février ; sur les sites suivis, l'accès aux plages est encadré à cette période.",
    sizeTypical: '80 cm à 1,10 m de carapace, 100 à 180 kg.',
    risk: 'aucun',
    riskNote:
      'Aucun danger. Un animal acculé peut mordre, mais le problème est inverse : une tortue empêchée de remonter ne respire paset une femelle dérangée à terre renonce à pondre et repart en mer.',
    protection:
      "Espèce protégée. Les tortues marines sont protégées en Polynésie française depuis 1971, avec un renforcement en 1990, aujourd'hui repris par le code de l'environnement : la tortue verte est en catégorie B, les quatre autres espèces en catégorie A. Capture, mutilation, transport, détention, commerce, consommation, taxidermie et ramassage des oeufs sont interdits.",
    rules: [
      'Ne jamais toucher, chevaucher ni saisir la carapace, ne pas la poursuivre.',
      "Laisser toujours libre l'accès à la surface : elle doit respirer.",
      "Rester à plusieurs mètres, sur le côté et non au-dessuset ne pas s'interposer entre l'animal et le large.",
      'Sur une plage de ponte la nuit : pas de lumière blanche, pas de flash, pas de bruit, rester loin de la femelle, des traces et du nid.',
      'Ne rien ramasser, même une écaille sur un animal mort : la détention est interdite.',
    ],
  },
  {
    id: 'tortue-imbriquee',
    nameFr: 'Tortue imbriquée, dite tortue à écailles',
    nameTy: 'honu (nom générique des tortues)',
    nameSci: 'Eretmochelys imbricata',
    image: 'images/wildlife/tortue-imbriquee.webp',
    photoCredit: 'Thierry Caro, CC BY-SA 3.0, via Wikimedia Commons',
    where:
      'Plus discrète que la tortue verte, sur les tombants et les récifs riches en éponges et en coraux mous. Observée surtout en plongée aux Tuamotu, à Moorea et à Tahiti.',
    season:
      "Présence toute l'année. Pontes ponctuelles en Polynésie française, beaucoup moins documentées que celles de la tortue verte.",
    sizeTypical: '60 à 90 cm de carapace, 40 à 70 kg.',
    risk: 'aucun',
    riskNote:
      "Aucun danger pour l'homme. Comme pour la tortue verte, le risque porte sur l'animal : blocage de la remontée, poursuite, contact.",
    protection:
      "Espèce protégée de catégorie A en Polynésie française (liste des espèces protégées du code de l'environnement) et classée en danger critique par l'UICN au niveau mondial.",
    rules: [
      'Ne pas toucher, ne pas poursuivre, ne pas bloquer sa remontée vers la surface.',
      'Rester sur le côté, à plusieurs mètreset la laisser continuer son chemin.',
      'Refuser tout objet en écaille de tortue proposé à la vente : détention, achat et export sont interdits.',
    ],
  },
  {
    id: 'murene',
    nameFr: 'Murènes',
    nameTy: 'puhi, puhi miti',
    nameSci: 'Gymnothorax javanicus (murène javanaise), Gymnothorax meleagris et autres espèces',
    image: 'images/wildlife/murene.webp',
    photoCredit: 'Diego Delso, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      "Dans les trous du récif et sous les patates de corail, tête sortie de l'anfractuosité. Partout, en snorkeling comme en plongée, du platier aux tombants.",
    season: "Toute l'année.",
    sizeTypical:
      "1,2 à 2 m pour la murène javanaise, jusqu'à 2,5 m ; 60 cm à 1 m pour les espèces plus petites.",
    risk: 'faible',
    riskNote:
      "Aucune agressivité envers un nageur qui passe. Presque toutes les morsures viennent d'une main mise dans un trou, d'un nourrissage ou d'une chasse sous-marine. La morsure est profonde, s'infecte facilement et impose des soins médicaux.",
    protection:
      'Non protégées. Leur capture relève de la réglementation générale de la pêche lagonaire.',
    rules: [
      "Ne jamais mettre la main dans une anfractuosité ni sous un corail, ne pas s'accrocher au récif à l'aveugle.",
      'Ne pas nourrir : une murène habituée associe la main à la nourriture.',
      'Ne pas la caresser, même si elle paraît familière avec les plongeurs.',
      'Ne pas consommer les grosses murènes : elles concentrent la ciguatera.',
    ],
  },
  {
    id: 'poisson-pierre',
    nameFr: 'Poisson pierre',
    nameTy: 'nohu',
    nameSci: 'Synanceia verrucosa',
    image: 'images/wildlife/poisson-pierre.webp',
    photoCredit: 'Karelj, CC BY-SA 3.0, via Wikimedia Commons',
    where:
      "Immobile sur les fonds de sable, de corail mort et de cailloux du lagon, souvent par très peu d'eau, y compris à l'endroit où l'on entre dans l'eau depuis la plage. Camouflage parfait : on ne le voit presque jamais.",
    season: "Toute l'année.",
    sizeTypical: "20 à 35 cm, jusqu'à 40 cm.",
    risk: 'eleve',
    riskNote:
      "Ses épines dorsales sont venimeuses. La piqûre provoque une douleur extrême, un gonflement, parfois un malaise général ; elle est rarement mortelle mais constitue une urgence médicale. Le poisson ne pique jamais volontairement : c'est un accident de pied nu ou de main posée.",
    protection: 'Non protégé.',
    rules: [
      'Ne jamais marcher pieds nus dans le lagon : chaussons ou sandales fermées, y compris pour les quelques mètres depuis la plage.',
      "Ne pas poser la main ni s'asseoir sur un fond corallien ou un amas de cailloux.",
      'Ne pas le manipuler, même mort ou échoué : les épines restent actives.',
      "En cas de piqûre : sortir de l'eau, alerter les secours, immerger le membre dans l'eau la plus chaude supportable (environ 45 degrés), retirer les débris visibles, ne pas garrotter, consulter en urgence.",
    ],
  },
  {
    id: 'poulpe',
    nameFr: 'Poulpe de récif',
    nameTy: "fe'e",
    nameSci: 'Octopus cyanea',
    image: 'images/wildlife/poulpe.webp',
    photoCredit: 'Ahmed Abdul Rahman, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      'Platiers et lagon, caché dans un trou souvent signalé par un amas de coquilles vides. Se repère à ses changements de couleur et de texture. Snorkeling de jour, très présent à Moorea et dans les atolls.',
    season: "Toute l'année.",
    sizeTypical: '40 à 80 cm bras étendus.',
    risk: 'aucun',
    riskNote:
      "Inoffensif pour l'homme. Il peut pincer avec son bec s'il est saisiet son encre est sans danger. Le stress répété le fait déserter son abri.",
    protection:
      'Non protégé ; la pêche est encadrée par la réglementation de la pêche lagonaire et par les rahui communaux.',
    rules: [
      "Ne pas le sortir de son trou, ne pas le manipuler, ne pas le faire changer de couleur pour la photo : c'est une perturbation intentionnelle.",
      'Ne pas retourner les cailloux et les coraux du platier pour le trouver.',
      'Ne le pêcher que dans le cadre de la réglementation locale de pêche lagonaire.',
    ],
  },
  {
    id: 'benitier',
    nameFr: 'Bénitier',
    nameTy: 'pahua',
    nameSci: 'Tridacna maxima, Tridacna squamosa',
    image: 'images/wildlife/benitier.webp',
    photoCredit: 'Diego Delso, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      "Encastré dans le corail et les patates du lagon, manteau bleu, vert, brun ou jaune bien visible en snorkeling. Très abondant dans certains atolls de l'est des Tuamotu.",
    season: "Toute l'année.",
    sizeTypical: '15 à 40 cm de coquille.',
    risk: 'aucun',
    riskNote:
      "Aucun danger. Le bénitier qui se referme sur le pied d'un plongeur est une légende : la fermeture est lente et le mollusque n'a pas la force de retenir un membre. La coquille, en revanche, coupe la peau.",
    protection:
      'Espèce réglementée. Il est interdit de pêcher, transporter, détenir, commercialiser et consommer un bénitier dont la coquille mesure moins de 12 cm dans sa plus grande longueur (délibération n° 88-184 AT du 8 décembre 1988 modifiée). Des arrêtés fixent périodes, quotas et modalités de commercialisation par île.',
    rules: [
      'Ne pas mettre les doigts dans le manteau pour le faire se refermer.',
      'Ne pas prélever un bénitier vivant : la pêche est interdite en dessous de 12 cm de coquille et encadrée par des quotas, des périodes et des fermetures selon les îles.',
      "Ne pas emporter de coquille sans vérifier la réglementation : le genre Tridacna est inscrit à l'annexe II de la CITES.",
      'Ne pas marcher sur les patates de corail où ils vivent.',
    ],
  },
  {
    id: 'poisson-perroquet',
    nameFr: 'Poissons perroquets',
    nameTy: "ho'u",
    nameSci: 'Scarus spp. et Chlorurus spp., dont Chlorurus microrhinos et Scarus ghobban',
    image: 'images/wildlife/poisson-perroquet.webp',
    photoCredit: 'Rickard Zerpe, CC BY 2.0, via Wikimedia Commons',
    where:
      "Partout sur le platier et le récif, en train de brouter le corail ; le grattement de leur bec est audible sous l'eau en snorkeling. La nuit, ils dorment dans une bulle de mucus, calés dans une anfractuosité.",
    season: "Toute l'année.",
    sizeTypical: "30 à 50 cm selon les espèces, jusqu'à 70 cm pour les plus gros mâles.",
    risk: 'aucun',
    riskNote:
      'Aucun danger. Un individu curieux peut mordiller un doigt tendu. Ce sont des acteurs clés du récif : en broutant le corail, ils produisent une grande partie du sable blanc des plages.',
    protection:
      'Non protégés, mais la pêche est réglementée et de nombreuses communes appliquent des zones de pêche réglementée (rahui) où tout prélèvement est interdit.',
    rules: [
      'Ne pas nourrir : le pain et les restes déséquilibrent leur régime et concentrent artificiellement les poissons.',
      'Ne pas les poursuivre pour la photo, ne pas les éclairer ni les toucher la nuit pendant leur sommeil.',
      'Si vous pêchez, respecter les tailles minimales, les engins autorisés et les zones de rahui.',
    ],
  },
  {
    id: 'napoleon',
    nameFr: 'Napoléon',
    nameSci: 'Cheilinus undulatus',
    image: 'images/wildlife/napoleon.webp',
    photoCredit: 'Julien Bidet for MDC Seamarc, CC BY-SA 4.0, via Wikimedia Commons',
    where:
      'Tombants, pentes externes et abords des passes. Rencontre en plongée aux Tuamotu, notamment Fakarava et Rangiroaet dans les îles Sous-le-Vent. Devenu rare près des îles les plus peuplées.',
    season: "Toute l'année.",
    sizeTypical:
      "60 cm à 1,20 m couramment, jusqu'à 2 m et environ 180 kg pour les très vieux mâles.",
    risk: 'aucun',
    riskNote:
      "Aucun danger, souvent curieux et confiant avec les plongeurs. L'enjeu est sa rareté : espèce à croissance lente, territoriale et facile à pêcher, elle est en danger à l'échelle mondiale.",
    protection:
      "À notre vérification, le napoléon n'est pas inscrit sur la liste des espèces protégées de Polynésie française. Il est classé en danger par l'UICN et inscrit à l'annexe II de la CITES, ce qui encadre son commerce international.",
    rules: [
      "Ne pas nourrir, ne pas caresser, ne pas s'appuyer sur le corail pour l'approcher.",
      'Ne pas le tirer au fusil ; sa chair est souvent ciguatérique en Polynésie.',
      "Signaler les observations aux associations locales de suivi quand c'est possible.",
    ],
  },
];

/** La reglementation, citee avec ses references. */
export const MARINE_REGULATIONS: readonly MarineRegulation[] = [
  {
    title: 'Un sanctuaire des mammifères marins depuis 2002',
    text: "La Polynésie française a créé en 2002 un sanctuaire pour la protection et la sauvegarde des baleines et des autres mammifères marins (arrêtés n° 622 CM et n° 623 CM du 13 mai 2002). Il couvre les eaux intérieures, la mer territoriale et la zone économique exclusive, soit environ 5 millions de km2, ce qui en fait l'un des plus vastes sanctuaires du monde. Le principe est aujourd'hui inscrit dans le code de l'environnement aux articles LP. 2213-1-1 (rédaction issue de la loi du pays n° 2023-11 du 23 janvier 2023) et A. 2213-1-1.",
  },
  {
    title: 'Ce qui est interdit dans le sanctuaire',
    text: "Pour les baleines et autres mammifères marins, espèces protégées de catégorie B, sont interdits : la mutilation, la recherche et l'approche professionnelle ou habituelle sans autorisation, le harcèlement, la capture ou l'enlèvement, la consommation et la chasse, ainsi que la détention, le transport, l'importation et l'exportation. Le code définit le harcèlement comme toute manoeuvre ou activité d'observation qui modifie le comportement des animaux, les contraint à changer de direction, de vitesse ou de durée d'immersion, les fait fuir, ou les bloque contre le récif ou le rivage.",
  },
  {
    title: "Distances d'approche des mammifères marins",
    text: "Le code de l'environnement (art. A. 2213-1-7) fixe une distance de sécurité minimale de 100 m entre une embarcation et une baleineet de 30 m pour les dauphins et les autres mammifères marins, sauf si l'animal réduit lui-même la distance : dans ce cas le moteur est mis au point mort, sans être coupé. Depuis la réforme applicable au 1er décembre 2024, seuls les prestataires autorisés, dont les capitaines et les guides sont formés, peuvent approcher une baleine à 100 m ; tous les autres navires, plaisanciers compris, doivent rester à 300 m. Les nageurs et plongeurs approchent latéralement, la mise à l'eau étant interdite à moins de 15 m de l'animal.",
  },
  {
    title: "Mise à l'eau et nage avec les baleines",
    text: "La nage avec les baleines n'est pas interdite en soi, mais elle est réservée en pratique aux sorties d'un prestataire autorisé : 6 personnes maximum à l'eau, accompagnées d'un guide formé, jamais à moins de 15 m de l'animalet il est interdit de déposer les nageurs sur la trajectoire de la baleine. Un particulier, tenu de rester à 300 m, ne peut pas se mettre à l'eau avec une baleine.",
  },
  {
    title: "Manoeuvres, vitesse et durée d'observation",
    text: "La poursuite est strictement interdite, de même que couper la route des animaux : l'embarcation suit une route parallèle, dans le même sens de déplacement. La vitesse d'approche ne doit pas dépasser 3 noeuds dans un rayon de 300 m, avec les pavillons Romeo-Yankee hissés. Tout changement brusque de direction ou de régime moteur est interdit. Plusieurs bateaux ne peuvent pas encercler les animaux et doivent se tenir du même côté ; trois navires au maximum sont admis dans une zone d'observation. L'usage de sonars à des fréquences autres que celles de la navigation est interdit. Depuis un aéronef ou un drone, la hauteur doit rester supérieure à 300 m. La direction de l'environnement recommande de ne pas rester plus de 15 minutes dans la zone d'observation, moins encore en présence d'un nouveau-né.",
  },
  {
    title: "Lieux où l'observation est interdite",
    text: "La recherche et l'approche des baleines et autres mammifères marins aux fins d'observation, de prise de vue ou de son sont interdites à toute personne, quel que soit le moyen utilisé, dans les lagons, les baies, les passes et dans un rayon de 1 km centré sur l'axe de la passe (art. A. 2213-1-4). Le nombre de passagers à bord d'un navire pratiquant cette activité ne peut pas dépasser douze.",
  },
  {
    title: 'Saison, horaires et quotas du whale watching',
    text: "L'observation encadrée des baleines n'est autorisée que du 20 juillet au 20 novembre, de 7h30 à 17h30. Chaque navire doit être couvert par une autorisation nominative et incessible délivrée par arrêté du président de la Polynésie française, après instruction par la direction de l'environnement, la demande passant par le téléservice Paraoa. Des quotas de navires par île, réévalués périodiquement, limitent le nombre d'autorisations, avec un seul navire par groupe d'entreprises. Les prestataires doivent tenir un registre des observations et suivre les formations de la direction de l'environnement.",
  },
  {
    title: 'Nourrissage des requins et des raies : interdit',
    text: "Le nourrissage de la faune sauvage est interdit par le code de l'environnement : l'article LP. 2200-1 prohibe le fait d'attirer à soi de quelque manière que ce soit des espèces sauvages, notamment par des gestes, des bruits ou des promesses de nourriture, lorsque la pratique gêne les autres usagers ou attire des prédateurs. Cette interdiction, en place depuis la loi du pays n° 2017-25 du 5 octobre 2017 relative au code de l'environnement, met fin au shark feeding : une activité d'observation de requins préalablement attirés par de la nourriture n'est pas autorisée. Le nourrissage des raies pastenagues tombe sous la même règleet le plan de gestion de l'espace maritime de Moorea de 2021 a aligné ses dispositions sur le code. L'infraction est punie de l'amende prévue pour les contraventions de 3e classe, doublée en cas de récidive ou dans un espace naturel classé. Dans les faits, la pratique persiste chez certains prestataires : le voyageur peut refuser d'y participer.",
  },
  {
    title: 'Tous les requins sont protégés',
    text: "Les requins ont été inscrits sur la liste des espèces protégées de catégorie B par l'arrêté n° 396 CM du 28 avril 2006, texte ensuite modifié pour couvrir l'ensemble des espèces de la zone économique exclusive : la liste annexée au code mentionne désormais, pour les Elasmobranchii, toutes les espèces de requins. Sont interdits la mutilation, la capture, le transport, la détention, la commercialisation ou l'achat, l'importation et l'exportation de tout ou partie de ces animaux, mâchoires, dents, peau et ailerons compris. La Polynésie française est ainsi, sur ses 5 millions de km2, un sanctuaire de requins.",
  },
  {
    title: 'Tortues marines : protection ancienne et stricte',
    text: "Les cinq espèces de tortues marines connues en Polynésie française sont protégées : tortue verte (catégorie B), tortue imbriquée, caouanne, luth et olivâtre (catégorie A). La protection remonte à 1971, a été renforcée en 1990et figure aujourd'hui dans le code de l'environnement. Sont interdits la destruction, la mutilation, la perturbation intentionnelle, la capture, le transport, la détention, l'utilisation, la commercialisation ou l'achat, l'importation et l'exportation de tout ou partie de l'animal, carapace, écailles et chair comprises, ainsi que le ramassage des oeufs et la taxidermie.",
  },
  {
    title: 'Sanctions',
    text: "Porter atteinte à une espèce protégée de catégorie A ou B est un délit puni de 2 ans d'emprisonnement et de 17 800 000 F CFP d'amende, ou de l'une de ces deux peines (art. LP. 2300-2 du code de l'environnement), avec 4 ans et 35 600 000 F CFP en cas de récidive et une amende doublée dans un espace naturel classé. Le non-respect des prescriptions d'approche pour l'observation, comme le nourrissage de la faune sauvage, relève d'une contravention de 3e classe (art. LP. 2300-3). Des peines complémentaires sont prévues, dont la confiscation des engins et des moyens de transport, bateau compris. Les prestataires encourent en plus le retrait de leur autorisation.",
  },
  {
    title: "Images d'espèces protégées",
    text: "Le code encadre aussi les prises de vue et de son : pour les espèces protégées, la prise de vue figure parmi les actes soumis à autorisationet l'article LP. 2213-2 interdit de céder ou d'utiliser, y compris sur des supports numériques, des images obtenues sans l'autorisation requise ou en violation des conditions d'approche. En pratique, l'enjeu porte sur l'usage professionnel et commercial des images de baleines, de dauphins et d'autres espèces protégées, pour lequel la mention de l'autorisation est obligatoire. En cas de doute sur un projet de tournage ou de publication, il faut interroger la direction de l'environnement.",
  },
  {
    title: "À qui s'adresser",
    text: "La direction de l'environnement de la Polynésie française (DIREN) instruit les autorisations d'approche des mammifères marins et publie les règles applicables ; les demandes des prestataires passent par le téléservice Paraoa. La direction des ressources marines gère la réglementation de la pêche, dont les tailles minimales et les rahui. Avant une sortie en mer, la question utile à poser au prestataire est simple : êtes-vous titulaire de l'autorisation d'approche pour ce navire cette saison ?",
  },
];
