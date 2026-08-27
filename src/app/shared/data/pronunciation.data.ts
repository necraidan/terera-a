import { PronunciationRule } from './pronunciation.models';

/**
 * Comment se prononce le tahitien, et pourquoi les graphies officielles
 * trompent l'oeil d'un francophone.
 */
export const PRONUNCIATION_RULES: readonly PronunciationRule[] = [
  {
    title: 'Chaque voyelle se prononce, une par une',
    text: "Le tahitien n'a pas de diphtongue. Deux voyelles côte à côte se disent l'une après l'autre : ai se dit a-i, au se dit a-ou, ou se dit o-ou, ei se dit é-i. C'est pourquoi Maupiti fait ma-ou-pi-ti et Tikehau ti-ké-ha-ou. Règle pratique : comptez les voyelles, vous avez le nombre de syllabes (Papeete 4, Teahupo'o 5, Taputapuātea 7).",
  },
  {
    title: 'Valeur des cinq voyelles',
    text: "a se dit comme dans patte, e se dit toujours é, i se dit i, o se dit o fermé, u se dit ou. Il n'y a jamais le u français de lune, ni de voyelle nasale : dans Rangiroa, Punaauia ou Manihi, les groupes an, in et on ne se nasalisent pas, la voyelle et la consonne se détachent.",
  },
  {
    title: "L'eta, le coup de glotte",
    text: "L'apostrophe (l'eta) n'est pas un ornement : c'est une consonne. Elle note un bref arrêt dans la gorge, celui que l'on fait entre les deux moitiés de oh-oh. Elle peut changer le sens d'un mot. Entre deux voyelles identiques, elle empêche la fusion : Taha'a fait ta-ha-a et non un a étiré, Fa'a'ā fait fa-a-a.",
  },
  {
    title: 'Le macron (tārava), voyelle longue',
    text: "La barre placée sur une voyelle (ā, ē, ī, ō, ū) s'appelle tārava. Elle indique une voyelle tenue environ deux fois plus longtemps, et c'est elle qui attire l'accent du mot. Cette longueur est distinctive : elle peut à elle seule séparer deux mots différents. Exemples dans les noms de lieux : Pīra'e (i initial long), 'Āru'e (a initial long), Ra'iātea, Ōtemanu.",
  },
  {
    title: 'Les consonnes du tahitien',
    text: "Le noyau consonantique du tahitien compte huit consonnes : f, h, m, n, p, r, t, v, auxquelles s'ajoute l'eta. Depuis juin 2024, l'Académie tahitienne (Fare Vāna'a) a intégré le k au pi'āpā, l'alphabet comptant désormais quatorze lettres. Il n'y a en revanche ni b, ni c, ni d, ni g, ni j, ni l, ni s, ni z dans le lexique d'origine tahitienne. Le r est un r battu, léger, proche du r espagnol, jamais raclé au fond de la gorge. Le h est soufflé et s'entend toujours.",
  },
  {
    title: 'Les consonnes étrangères trahissent une francisation',
    text: "Quand un nom contient un b, c'est en général une transcription européenne ancienne : Bora Bora se dit Pora Pora en tahitien, Tubuai s'écrit Tupua'i. En revanche le k de Fakarava, Nuku Hiva ou Rikitea est bien réel : il appartient au paumotu, au marquisien et au mangarévien, qui sont d'autres langues du pays.",
  },
  {
    title: 'Accent tonique léger, syllabes égales',
    text: "Il n'y a pas d'accent final appuyé comme en français. L'accent suit la voyelle longue quand il y en a une, sinon il tombe légèrement sur l'avant-dernière syllabe. Le plus important pour être compris : garder toutes les syllabes de durée à peu près égale, sans en avaler aucune. Une syllabe est toujours une voyelle seule ou une consonne suivie d'une voyelle : jamais deux consonnes de suite, jamais de syllabe fermée.",
  },
  {
    title: 'Les autres langues polynésiennes du pays',
    text: "Le tahitien n'est pas la seule langue de Polynésie française. Le paumotu (Tuamotu) conserve le k et le groupe ng que le tahitien a remplacés par un coup de glotte : Rangiroa en paumotu correspond à Ra'iroa en tahitien, Fakarava et Kaukura gardent leur k. Le marquisien garde aussi le k (Nuku Hiva, Ua Huka), le mangarévien garde le ng (Mangareva, forme tahitienne Ma'areva). Le ng est un son unique, celui de l'anglais sing, avec un g dur : jamais ni, jamais j.",
  },
  {
    title: 'Les graphies officielles simplifient',
    text: "Cartes, état civil et panneaux écrivent le plus souvent sans eta ni macron : Faaa, Papeete, Punaauia, Raiatea, Tubuai, Pirae. Ces graphies ne changent rien à la prononciation : lisez-les comme si les coups de glotte et les voyelles longues étaient notés. C'est la première cause d'erreur pour un visiteur.",
  },
  {
    title: "Deux systèmes d'écriture coexistent",
    text: "La graphie de l'Académie tahitienne (Fare Vāna'a, créée en 1972) note systématiquement le coup de glotte par une apostrophe et la voyelle longue par un macron. La graphie dite Raapoto, répandue dans l'enseignement et à l'Église protestante mā'ohi, note certains coups de glotte autrement (accent grave) et en omet d'autres, notamment entre voyelles identiques. Les deux décrivent la même langue parlée : Fa'a'ā et Faaa se prononcent pareil.",
  },
];
