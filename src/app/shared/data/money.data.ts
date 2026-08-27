import { Banknote, Coin, ImageCredit } from './money.models';

/**
 * Les espèces en franc pacifique : quatre billets, six pièces, et rien d'autre.
 *
 * Billets de la gamme 2014, mise en circulation le 20 janvier 2014. Pièces de la
 * gamme 2021, mise en circulation le 1er septembre 2021. Les anciennes séries
 * n'ont plus cours légal (billets depuis le 30 septembre 2014, pièces depuis le
 * 1er décembre 2022) mais restent échangeables aux guichets de l'IEOM.
 *
 * Les diamètres et dimensions servent à dessiner les aperçus à l'échelle : c'est
 * la taille relative, pas la valeur, qui pose problème dans la main.
 */

export const BANKNOTES: readonly Banknote[] = [
  {
    id: 'billet-500',
    value: 500,
    theme: 'Flore et végétation',
    colorName: 'Vert',
    colorHex: '#5a9e52',
    accentHex: '#e0c67a',
    recto: 'Tapa de Wallis, feuilles de kava et fleur d’oiseau de paradis.',
    verso: 'Frangipanier et gardénia de Tahiti (fleur de tiaré), sur un siapo de Futuna.',
    security:
      'Filigrane à la pirogue à voile et chiffre 500 en transparence. Bande brillante à droite du recto : elle passe du jaune au gris quand on incline le billet.',
    widthMm: 120,
    heightMm: 66,
    buys: 'Un café ou une boisson fraîche, un casse-croûte, un trajet de truck. La coupure de tous les jours.',
    recognition: 'Le plus petit billet, et le seul vert de la gamme.',
    imageRecto: 'images/money/note-500-recto.webp',
    imageVerso: 'images/money/note-500-verso.webp',
  },
  {
    id: 'billet-1000',
    value: 1000,
    theme: 'Faune',
    colorName: 'Beige orangé',
    colorHex: '#d98e4a',
    accentHex: '#8c6239',
    recto: 'Tapa de Wallis, une raie manta et une tortue marine.',
    verso: 'Perruche cornue, cagou et gygis blanches, sur un siapo de Futuna.',
    security:
      'Filigrane à la pirogue et chiffre 1000 en transparence. Même bande brillante que le 500, à droite du recto.',
    widthMm: 126,
    heightMm: 66,
    buys: 'La moitié d’un plat en roulotte, un petit déjeuner, une boisson et un en-cas.',
    recognition:
      'Même hauteur que le 500 et seulement 6 mm de plus en longueur : c’est la couleur qui les sépare, pas la taille.',
    imageRecto: 'images/money/note-1000-recto.webp',
    imageVerso: 'images/money/note-1000-verso.webp',
  },
  {
    id: 'billet-5000',
    value: 5000,
    theme: 'Faune aquatique',
    colorName: 'Bleu',
    colorHex: '#2e6da4',
    accentHex: '#3fa9a0',
    recto: 'Tapa de Wallis, un nautile, un poisson-cocher et du corail.',
    verso: 'Corail, huître perlière et napoléon, sur un siapo de Futuna.',
    security:
      'Filigrane à la pirogue à balancier et impression 5000. Bande métallisée au recto portant le sigle CFP répété, motif dynamique à bande jaune au verso.',
    widthMm: 132,
    heightMm: 73,
    buys: 'Un vrai repas au restaurant pour deux, une sortie en lagon à la demi-journée.',
    recognition:
      'Première des hautes coupures : 73 mm de haut, nettement plus haut que les 500 et 1 000. Bleu franc.',
    imageRecto: 'images/money/note-5000-recto.webp',
    imageVerso: 'images/money/note-5000-verso.webp',
  },
  {
    id: 'billet-10000',
    value: 10000,
    theme: 'Architecture',
    colorName: 'Rouge',
    colorHex: '#b33a3a',
    accentHex: '#d98a5a',
    recto: 'Tapa de Wallis, pagaies, un fare au toit de pandanus et des cocotiers.',
    verso:
      'Cases rondes, centre culturel Jean-Marie Tjibaou en Nouvelle-Calédonie, pilon de pierre, sur un siapo de Futuna.',
    security:
      'Filigrane à la pirogue à balancier et impression 10000. Bande métallisée au recto, motif dynamique à bande jaune au verso.',
    widthMm: 138,
    heightMm: 73,
    buys: 'Une nuit en pension de famille, un vol interinsulaire court, une journée de location de voiture.',
    recognition:
      'Le plus grand billet et le seul rouge. C’est ce que délivrent les distributeurs : cassez-le en supermarché dès l’arrivée.',
    imageRecto: 'images/money/note-10000-recto.webp',
    imageVerso: 'images/money/note-10000-verso.webp',
  },
];

export const COINS: readonly Coin[] = [
  {
    id: 'piece-5',
    value: 5,
    theme: 'Flore',
    alloy: 'Acier inoxydable',
    toneName: 'Argentée',
    toneHex: '#c9ccd1',
    diameterMm: 21,
    shape: 'Ronde',
    motifSide:
      'Fleurs de tiaré et de frangipanier au centre, pins colonnaires et feuilles de taro sur la couronne.',
    valueSide:
      'Cercles concentriques et lignes ondulées évoquant le lagon, valeur faciale, mentions Institut d’émission d’outre-mer, RF et millésime.',
    buys: 'Presque rien seule : elle sert à faire l’appoint. C’est la plus petite valeur en circulation.',
    recognition: 'La plus petite pièce de la gamme, argentée.',
    imageMotif: 'images/money/coin-5-motif.webp',
    imageValeur: 'images/money/coin-5-valeur.webp',
  },
  {
    id: 'piece-10',
    value: 10,
    theme: 'Pirogue et faune marine',
    alloy: 'Cupronickel',
    toneName: 'Argentée',
    toneHex: '#c9ccd1',
    diameterMm: 23,
    shape: 'Ronde, tranche cannelée',
    motifSide:
      'Une pirogue au centre, entourée de gygis blanches, de raies, d’huîtres et de perles.',
    valueSide:
      'Cercles concentriques et lignes ondulées, valeur faciale, mentions de l’émetteur et millésime.',
    buys: 'Un appoint. Il en faut une poignée pour une baguette.',
    recognition: 'Argentée, entre le 5 F et le 20 F par la taille.',
    imageMotif: 'images/money/coin-10-motif.webp',
    imageValeur: 'images/money/coin-10-valeur.webp',
  },
  {
    id: 'piece-20',
    value: 20,
    theme: 'Poissons et corail',
    alloy: 'Cupronickel',
    toneName: 'Argentée',
    toneHex: '#c9ccd1',
    diameterMm: 26,
    shape: 'Ronde, tranche segmentée',
    motifSide:
      'Des poissons de récif au centre, dont un napoléon et un poisson-cocher, entourés de corail ; tortues et petits poissons sur la couronne.',
    valueSide:
      'Cercles concentriques et lignes ondulées, valeur faciale, mentions de l’émetteur et millésime.',
    buys: 'Un appoint. Trois pièces font à peu près une baguette, dont le prix est réglementé.',
    recognition:
      'La plus grande des pièces argentées. Elle est plus large que le 50 F doré tout en valant moins.',
    imageMotif: 'images/money/coin-20-motif.webp',
    imageValeur: 'images/money/coin-20-valeur.webp',
  },
  {
    id: 'piece-50',
    value: 50,
    theme: 'Oiseaux',
    alloy: 'Bronze d’aluminium et de nickel',
    toneName: 'Dorée',
    toneHex: '#c9a227',
    diameterMm: 24,
    shape: 'Ronde',
    motifSide:
      'Un cagou au centre ; perruches cornues, fruit de l’arbre à pain, fougère et niaouli sur la couronne.',
    valueSide:
      'Cercles concentriques et lignes ondulées, valeur faciale, mentions de l’émetteur et millésime.',
    buys: 'Un appoint utile : à peu près une baguette, ou l’arrondi d’un achat.',
    recognition:
      'La plus petite des pièces dorées. Piège classique avec le 100 F, doré aussi mais plus grand.',
    imageMotif: 'images/money/coin-50-motif.webp',
    imageValeur: 'images/money/coin-50-valeur.webp',
  },
  {
    id: 'piece-100',
    value: 100,
    theme: 'Habitat',
    alloy: 'Bronze d’aluminium et de nickel',
    toneName: 'Dorée',
    toneHex: '#c9a227',
    diameterMm: 27,
    shape: 'Ronde, tranche cannelée',
    motifSide:
      'Un fare au centre ; cases rondes, fale, casse-tête, pilons, tapa et flèches faîtières sur la couronne.',
    valueSide:
      'Cercles concentriques et lignes ondulées, valeur faciale, mentions de l’émetteur et millésime.',
    buys: 'Une bouteille d’eau, un fruit au marché, un café à emporter.',
    recognition:
      'La plus grande pièce de la gamme, dorée. Voisine du 20 F argenté par la taille : la couleur tranche.',
    imageMotif: 'images/money/coin-100-motif.webp',
    imageValeur: 'images/money/coin-100-valeur.webp',
  },
  {
    id: 'piece-200',
    value: 200,
    theme: 'Culture',
    alloy: 'Bimétallique : centre en bronze d’aluminium et de nickel, couronne en cupronickel',
    toneName: 'Bicolore, centre doré et couronne argentée',
    toneHex: '#c9a227',
    secondaryToneHex: '#c9ccd1',
    diameterMm: 25,
    shape: 'Ronde à bord festonné, tranche segmentée',
    motifSide:
      'Trois flèches faîtières, un tō’ere et un ukulélé au centre ; tapa de Wallis, tiki et chambranles de porte sur la couronne.',
    valueSide:
      'Couronne à cercles concentriques et lignes ondulées, anneau intérieur portant la valeur faciale, les mentions de l’émetteur et le millésime.',
    buys: 'Un pain, une boisson fraîche, un petit trajet en truck. La plus grosse pièce en valeur, apparue en 2021.',
    recognition:
      'La seule bicolore et la seule au bord festonné : on la reconnaît au doigt, sans regarder.',
    imageMotif: 'images/money/coin-200-motif.webp',
    imageValeur: 'images/money/coin-200-valeur.webp',
  },
];

/** Les confusions qui coûtent vraiment de l'argent ou du temps. */
export const CASH_TRAPS: readonly string[] = [
  'Le diamètre des pièces ne croît pas avec la valeur d’un bout à l’autre de la gamme : il ne croît qu’à l’intérieur de chaque couleur. Une pièce plus grande n’est donc pas forcément une pièce de plus grande valeur.',
  'Le 20 F argenté est plus large que le 50 F doré, alors qu’il vaut deux fois et demie moins. La couleur avant la taille.',
  'Le 20 F et le 100 F ont presque le même diamètre pour un rapport de valeur de un à cinq : seul l’aspect du métal les sépare au coup d’œil.',
  'Le 50 F et le 100 F sont tous deux dorés : il faut lire le chiffre ou les comparer côte à côte.',
  'Le 500 et le 1 000 ont la même hauteur et 6 mm d’écart en longueur : on les distingue au vert et au beige orangé, pas à la taille.',
  'Les pièces de 1 et 2 F n’existent plus. Les totaux sont arrondis au multiple de 5 le plus proche.',
];

/** Repères de prix, pour se faire une intuition de la valeur des coupures. */
export const CASH_BENCHMARKS: readonly { readonly label: string; readonly value: string }[] = [
  { label: 'Une bouteille d’eau', value: 'environ 100 F' },
  { label: 'Une baguette (prix réglementé)', value: 'environ 60 F' },
  { label: 'Un plat en roulotte', value: '1 500 à 2 500 F' },
  { label: 'Un repas au restaurant', value: 'à partir de 3 000 F' },
  { label: 'Une nuit en pension de famille', value: 'autour de 10 000 F' },
];

/** Ce qu'il faut savoir avant de manipuler des espèces sur place. */
export const CASH_NOTES: readonly string[] = [
  'Le franc pacifique est arrimé à l’euro à taux fixe : 1 000 F valent 8,38 € exactement. Pour un ordre de grandeur mental, divisez les francs par 120.',
  'Le franc pacifique a cours légal en Polynésie française, en Nouvelle-Calédonie et à Wallis-et-Futuna. Les motifs des billets et des pièces mêlent donc les trois territoires.',
  'L’euro n’a pas cours légal sur place, même si quelques commerces touristiques l’acceptent.',
  'Prévoyez du liquide : beaucoup de roulottes, de pensions, de marchés et de navettes ne prennent pas la carte.',
  'Un commerçant n’est pas tenu de rendre la monnaie sur une coupure disproportionnée. Gardez de l’appoint.',
];

/** Crédits des photos, reprises de Wikimedia Commons. */
export const MONEY_IMAGE_CREDITS: readonly ImageCredit[] = [
  { author: 'Institut d’émission d’outre-mer', licence: 'domaine public' },
  { author: 'Jonathanischoice', licence: 'CC BY 4.0 et CC0' },
];
