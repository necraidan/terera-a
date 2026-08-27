import { LinkCategory } from './links.models';

/**
 * Liens utiles, verifies un a un : chaque URL a ete testee et renvoie bien la
 * page attendue. Ce sont les seules donnees de l'application qui exigent du
 * reseau, l'ecran le dit explicitement.
 *
 * Ne retenir que des sites institutionnels ou perennes : un lien mort dans un
 * ecran de voyage est pire qu'un lien absent.
 */
export const LINK_CATEGORIES: readonly LinkCategory[] = [
  {
    id: 'officiel-institutionnel',
    title: 'Officiel et institutionnel',
    icon: '🏛️',
    links: [
      {
        title: 'Tahiti Tourisme',
        url: 'https://www.tahititourisme.fr/',
        purpose:
          'Site officiel de l’office du tourisme (Tahiti et ses îles) : destinations, archipels, hébergements et activités. À consulter avant le départ pour construire l’itinéraire.',
        essential: true,
      },
      {
        title: 'Préparer son voyage (Tahiti Tourisme)',
        url: 'https://www.tahititourisme.fr/preparer-son-voyage/',
        purpose:
          'Rubrique pratique de l’office du tourisme : formalités, transports interinsulaires, santé, saisons. À lire avant le départ, puis à garder comme référence sur place.',
        essential: true,
      },
      {
        title: 'Haut-commissariat de la République',
        url: 'https://www.polynesie-francaise.gouv.fr/',
        purpose:
          'Services de l’État en Polynesie française : sécurité, démarches, espace maritime et aérien. Utile avant le départ et en cas de problème administratif sur place.',
        essential: true,
      },
      {
        title: 'Gouvernement de la Polynésie française',
        url: 'https://gouvernement.pf/fr/',
        purpose:
          'Portail du gouvernement local : communiqués, décisions du conseil des ministres, actualité réglementaire. À consulter sur place si une règle locale change.',
        essential: false,
      },
      {
        title: 'Service public de la Polynésie française (net.pf)',
        url: 'https://www.service-public.pf/',
        purpose:
          'Annuaire et portail de toutes les administrations polynésiennes (santé, douane, environnement, affaires maritimes). Le point d’entrée à garder sous la main sur place.',
        essential: true,
      },
      {
        title: 'Assemblée de la Polynésie française',
        url: 'https://www.assemblee.pf/',
        purpose:
          'Institution législative du Pays : textes et séances. Intérêt surtout documentaire, à consulter avant le départ pour comprendre le statut du territoire.',
        essential: false,
      },
    ],
  },
  {
    id: 'transport-aérien',
    title: 'Transport aérien',
    icon: '✈️',
    links: [
      {
        title: 'Air Tahiti (vols intérieurs)',
        url: 'https://www.airtahiti.com/',
        purpose:
          'Unique compagnie régulière des vols entre les îles : horaires, réservations, passes interinsulaires. Indispensable avant le départ pour caler les sauts d’île en îleet sur place pour les modifications.',
        essential: true,
      },
      {
        title: 'Air Tahiti Nui (international)',
        url: 'https://www.airtahitinui.com/',
        purpose:
          'Compagnie internationale polynésienne (Paris, Los Angeles, Tokyo, Auckland) : réservation, bagages, enregistrement. À utiliser avant le départ et pour le vol retour.',
        essential: true,
      },
      {
        title: 'Aéroport international de Tahiti Faa’a',
        url: 'https://tahiti-aeroports.com/',
        purpose:
          'Site de l’aéroport de Papeete : arrivées et départs du jour, acces, parkings, formalités, services. Très utile le jour du vol, a l’arrivée comme au départ.',
        essential: true,
      },
    ],
  },
  {
    id: 'transport-maritime',
    title: 'Transport maritime',
    icon: '⛴️',
    links: [
      {
        title: 'Navettes Moorea (DPAM)',
        url: 'https://www.service-public.pf/dpam/navettes-moorea/',
        purpose:
          'Page officielle des affaires maritimes recensant les navettes Tahiti Moorea et leurs opérateurs. La référence neutre à vérifier avant de se rendre au quai de Papeete.',
        essential: true,
      },
      {
        title: 'Terevau',
        url: 'https://www.terevau.pf/',
        purpose:
          'Opérateur de navettes rapides Tahiti Moorea, avec aussi des liaisons vers les Îles Sous-le-Vent : horaires et billets. À consulter la veille ou le matin de la traversée.',
        essential: true,
      },
      {
        title: 'Aremiti',
        url: 'https://www.aremitiexpress.com/',
        purpose:
          'Second opérateur des navettes Tahiti Moorea (passagers et véhicules) : horaires et réservation véhicule. À vérifier sur place, surtout si vous embarquez une voiture.',
        essential: true,
      },
      {
        title: 'Aranui (cargo mixte Marquises)',
        url: 'https://www.aranui.com/',
        purpose:
          'Navire cargo et passagers desservant les Tuamotu et les Marquises : itinéraires et calendrier des croisières. À regarder très en amont du départ, les places partent longtemps a l’avance.',
        essential: false,
      },
      {
        title: 'Direction polynésienne des affaires maritimes (DPAM)',
        url: 'https://www.service-public.pf/dpam/',
        purpose:
          'Autorité maritime locale : sécurité de la navigation, desserte interinsulaire, réglementation. À consulter avant le départ si vous prevoyez beaucoup de bateau.',
        essential: false,
      },
    ],
  },
  {
    id: 'météo-et-mer',
    title: 'Météo et mer',
    icon: '🌦️',
    links: [
      {
        title: 'Météo France Polynésie française',
        url: 'https://meteo.pf/fr',
        purpose:
          'Service météorologique officiel du territoire : prévisions par archipel et par île. À ouvrir chaque matin sur place.',
        essential: true,
      },
      {
        title: 'Vigilance météo',
        url: 'https://meteo.pf/fr/vigilance',
        purpose:
          'Carte de vigilance officielle (fortes pluies, vents violents, houle, orages). À vérifier avant toute sortie en mer, en randonnee ou en 4x4.',
        essential: true,
      },
      {
        title: 'Alerte cyclonique',
        url: 'https://meteo.pf/fr/cyclone/alerte-cyclonique',
        purpose:
          'Niveaux d’alerte cyclonique et consignes de comportement. À consulter immediatement en cas de menace, surtout de novembre a avril (saison cyclonique).',
        essential: true,
      },
      {
        title: 'Météo marine et bulletins (BMS)',
        url: 'https://meteo.pf/fr/marine',
        purpose:
          'Bulletins marine, état de la mer et houle pour les lagons et le large. Indispensable avant une traversée, une plongée ou une sortie pêche.',
        essential: true,
      },
      {
        title: 'Suivi cyclonique',
        url: 'https://meteo.pf/fr/cyclone',
        purpose:
          'Trajectoires et suivi des systèmes dépressionnaires du Pacifique Sud. À suivre sur place pendant la saison chaude.',
        essential: false,
      },
      {
        title: 'Marées officielles (SHOM)',
        url: 'https://maree.shom.fr/',
        purpose:
          'Prédictions de marées du service hydrographique de la Marine, y compris pour Papeete. Utile sur place, même si le marnage polynésien reste très faible.',
        essential: false,
      },
      {
        title: 'Prévisions de houle et surf',
        url: 'https://fr.surf-forecast.com/countries/French-Polynesia/breaks',
        purpose:
          'Prévisions de houle spot par spot en Polynésie française. Complément pratique sur place pour le surf, jamais un substitut aux bulletins officiels.',
        essential: false,
      },
      {
        title: 'Windy',
        url: 'https://www.windy.com/',
        purpose:
          'Visualisation cartographique du vent, de la houle et des précipitations. Pratique sur place pour se représenter une situation, en appui de Météo France Polynésie.',
        essential: false,
      },
    ],
  },
  {
    id: 'santé-sécurité',
    title: 'Santé et sécurité',
    icon: '🚑',
    links: [
      {
        title: 'JRCC Tahiti (secours en mer et aériens)',
        url: 'https://www.jrcc.pf/',
        purpose:
          'Centre de coordination des secours aéromaritimes, actif 24 heures sur 24 sur tout le Pacifique Sud français. À connaître avant le départ, à appeler en urgence en mer.',
        essential: true,
      },
      {
        title: 'Coordonnées du JRCC (État)',
        url: 'https://www.polynesie-francaise.gouv.fr/Services-de-l-Etat/Espace-maritime-et-aerien/JRCC-Tahiti',
        purpose:
          'Fiche officielle de l’État sur le JRCC, avec ses missions et ses moyens de contact. À lire avant le départ et à noter hors ligne.',
        essential: false,
      },
      {
        title: 'Centre hospitalier de la Polynésie française',
        url: 'https://www.chpf.pf/',
        purpose:
          'Hôpital de référence du territoire, a Pirae pres de Papeete : services, urgences, acces. À repérer avant le départ, à utiliser en cas de problème médical sérieux.',
        essential: true,
      },
      {
        title: 'Direction de la santé',
        url: 'https://www.service-public.pf/dsp/',
        purpose:
          'Autorité sanitaire locale : vaccinations, arboviroses (dengue, zika), ciguatera, alertes en cours. À consulter avant le départ et si une épidémie est signalee.',
        essential: true,
      },
      {
        title: 'Conseils aux voyageurs (France Diplomatie)',
        url: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs',
        purpose:
          'Portail du ministere des Affaires etrangeres, avec le dispositif d’alerte Fil d’Ariane. À parcourir avant le départ, notamment si vous poursuivez vers d’autres pays du Pacifique.',
        essential: false,
      },
      {
        title: 'Caisse de prévoyance sociale (CPS)',
        url: 'https://www.cps.pf/',
        purpose:
          'Organisme de sécurité sociale polynésien : la couverture metropolitaine ne s’applique pas automatiquement ici. À vérifier avant le départ, avec votre assurance voyage.',
        essential: false,
      },
    ],
  },
  {
    id: 'pratique',
    title: 'Pratique : formalités, argent, téléphone',
    icon: '🧾',
    links: [
      {
        title: 'Visa et formalités d’entrée',
        url: 'https://www.tahititourisme.fr/preparer-son-voyage/visa-formalites-dentree/',
        purpose:
          'Règles d’entrée selon la nationalité, durée de séjour et documents exigés. À vérifier des le début de la préparation du voyage.',
        essential: true,
      },
      {
        title: 'Douane de Polynésie française',
        url: 'https://www.service-public.pf/douane/',
        purpose:
          'Portail officiel des douanes locales : franchises, biens interdits, taxes a l’importation, biosécurité. À lire avant le départ et avant le retour (souvenirs, coraux, plantes).',
        essential: true,
      },
      {
        title: 'Démarches auprès des services de l’État',
        url: 'https://www.polynesie-francaise.gouv.fr/Demarches',
        purpose:
          'Titres, permis, papiers perdus ou volés et autres démarches administratives. À utiliser sur place en cas de perte de documents.',
        essential: false,
      },
      {
        title: 'Vini (téléphonie mobile)',
        url: 'https://www.vini.pf/',
        purpose:
          'Principal opérateur mobile du territoire : cartes prépayées et forfaits touristiques, couverture par île. À regarder juste avant l’arrivée ou des l’aéroport.',
        essential: false,
      },
      {
        title: 'Vodafone Polynésie',
        url: 'https://www.vodafone.pf/',
        purpose:
          'Opérateur mobile alternatif : offres data prépayées et couverture. Utile a l’arrivée pour comparer avant d’acheter une carte SIM locale.',
        essential: false,
      },
      {
        title: 'Banque Socredo',
        url: 'https://www.socredo.pf/',
        purpose:
          'Principale banque du territoire : réseau d’agences et de distributeurs jusque dans certaines îles éloignées. À consulter avant le départ pour planifier les retraits en francs Pacifique.',
        essential: false,
      },
      {
        title: 'Banque de Tahiti',
        url: 'https://www.banque-tahiti.pf/',
        purpose:
          'Autre réseau bancaire local et ses distributeurs. Utile sur place, car de nombreux atolls n’ont aucun distributeur : prevoyez des espèces.',
        essential: false,
      },
    ],
  },
  {
    id: 'nature-culture',
    title: 'Nature et culture',
    icon: '🌺',
    links: [
      {
        title: 'Direction de l’environnement (DIREN)',
        url: 'https://www.service-public.pf/diren/',
        purpose:
          'Service en charge de la biodiversité et des espaces protégés : espèces protégées, réglementation, sites naturels. À consulter avant le départ si vous prevoyez randonnee ou plongée.',
        essential: false,
      },
      {
        title: 'Direction des ressources marines',
        url: 'https://www.ressources-marines.gov.pf/',
        purpose:
          'Réglementation de la pêche, de la plongée et des activités lagonaires, sécurité en mer. À lire avant le départ si vous comptez pecher ou naviguer.',
        essential: false,
      },
      {
        title: 'Aire marine gérée Tainui Atea',
        url: 'https://www.ressources-marines.gov.pf/category/aire-marine-geree-amg/',
        purpose:
          'Documentation officielle sur l’aire marine gérée couvrant toute la zone économique exclusive polynésienne, l’une des plus vastes du monde. À lire avant le départ pour comprendre les règles de protection.',
        essential: false,
      },
      {
        title: 'Musée de Tahiti et des Îles',
        url: 'https://www.museetahiti.pf/',
        purpose:
          'Musée de référence sur la culture ma ohi, a Punaauia : collections, horaires, expositions. À voir sur place, idealement en début de séjour pour donner du sens au reste.',
        essential: true,
      },
      {
        title: 'Heiva i Tahiti',
        url: 'https://www.heiva.org/',
        purpose:
          'Site officiel du grand festival de chants et danses traditionnels, qui se tient en juillet. À consulter avant le départ si votre voyage tombe pendant cette periode.',
        essential: true,
      },
      {
        title: 'Maison de la culture (Te Fare Tauhiti Nui)',
        url: 'https://www.maisondelaculture.pf/',
        purpose:
          'Programmation culturelle de Papeete : spectacles, expositions, ateliers, bibliothèque. À regarder sur place pour trouver un evenement pendant votre séjour.',
        essential: false,
      },
      {
        title: 'Direction de la culture et du patrimoine',
        url: 'https://www.service-public.pf/dcp/',
        purpose:
          'Service en charge des marae, des sites archéologiques et du patrimoine polynésien. À consulter avant de visiter des sites anciens, pour connaître les règles de respect des lieux.',
        essential: false,
      },
      {
        title: 'Taputapuatea (UNESCO)',
        url: 'https://whc.unesco.org/fr/list/1529/',
        purpose:
          'Fiche du patrimoine mondial pour le marae de Taputapuatea a Raiatea, inscrit en 2017. À lire avant la visite pour saisir l’importance du site.',
        essential: false,
      },
    ],
  },
  {
    id: 'info-locale',
    title: 'Information locale et communautés',
    icon: '📰',
    links: [
      {
        title: 'Tahiti Infos',
        url: 'https://www.tahiti-infos.com/',
        purpose:
          'Principal quotidien en ligne du territoire : actualité, grèves, météo, faits divers. À suivre sur place, c’est souvent la source la plus rapide.',
        essential: true,
      },
      {
        title: 'Polynésie la 1ere',
        url: 'https://la1ere.franceinfo.fr/polynesie/',
        purpose:
          'Radio et télévision publiques locales : information continue, alertes, replays. À suivre sur place, notamment en periode d’alerte météo.',
        essential: true,
      },
      {
        title: 'Radio 1 Tahiti',
        url: 'https://www.radio1.pf/',
        purpose:
          'Radio privée locale et son fil d’actualité. Complément utile sur place pour l’info du jour et la vie pratique.',
        essential: false,
      },
      {
        title: 'Guide Routard Polynésie française',
        url: 'https://www.routard.com/fr/guide/oceanie/polynesie-francaise',
        purpose:
          'Guide francophone et son forum de voyageurs : retours d’expérience, itinéraires, formalités. À parcourir avant le départ pour se faire une idee concrete.',
        essential: false,
      },
    ],
  },
];
