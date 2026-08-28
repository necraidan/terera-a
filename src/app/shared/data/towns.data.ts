import { GeoPoint } from './geo';

/**
 * Localités affichées sur la carte quand on zoome. Le rang pilote le zoom
 * d'apparition : 1 pour le chef-lieu de l'île, 2 pour les villages notables,
 * 3 pour le reste. Coordonnées arrondies au centième de degré (~1 km), ce qui
 * suffit pour placer un point sur une île de quelques dizaines de kilomètres.
 */
export interface Town extends GeoPoint {
  readonly name: string;
  readonly islandId: string;
  readonly rank: 1 | 2 | 3;
}

const t = (name: string, islandId: string, rank: 1 | 2 | 3, lat: number, lon: number): Town => ({
  name,
  islandId,
  rank,
  lat,
  lon,
});

export const TOWNS: readonly Town[] = [
  // Tahiti
  t('Papeete', 'tahiti', 1, -17.537, -149.566),
  t('Taravao', 'tahiti', 1, -17.726, -149.313),
  t('Faa’a', 'tahiti', 2, -17.553, -149.6),
  t('Punaauia', 'tahiti', 2, -17.593, -149.606),
  t('Papara', 'tahiti', 2, -17.761, -149.504),
  t('Mahina', 'tahiti', 2, -17.506, -149.487),
  t('Teahupo’o', 'tahiti', 2, -17.847, -149.268),
  t('Tautira', 'tahiti', 2, -17.748, -149.161),
  t('Pirae', 'tahiti', 3, -17.537, -149.542),
  t('Arue', 'tahiti', 3, -17.53, -149.518),
  t('Paea', 'tahiti', 3, -17.689, -149.585),
  t('Mataiea', 'tahiti', 3, -17.773, -149.412),
  t('Papenoo', 'tahiti', 3, -17.53, -149.43),
  t('Tiarei', 'tahiti', 3, -17.541, -149.373),
  t('Hitia’a', 'tahiti', 3, -17.6, -149.305),
  t('Vairao', 'tahiti', 3, -17.822, -149.292),
  // Moorea
  t('Paopao', 'moorea', 1, -17.509, -149.82),
  t('Vaiare', 'moorea', 2, -17.521, -149.783),
  t('Papetoai', 'moorea', 2, -17.495, -149.872),
  t('Haapiti', 'moorea', 2, -17.559, -149.87),
  t('Afareaitu', 'moorea', 2, -17.552, -149.793),
  t('Maharepa', 'moorea', 3, -17.485, -149.799),
  t('Temae', 'moorea', 3, -17.49, -149.771),
  // Huahine
  t('Fare', 'huahine', 1, -16.715, -151.034),
  t('Maeva', 'huahine', 2, -16.7, -150.987),
  t('Fitii', 'huahine', 3, -16.737, -151.031),
  t('Parea', 'huahine', 3, -16.808, -150.98),
  // Raiatea
  t('Uturoa', 'raiatea', 1, -16.73, -151.444),
  t('Avera', 'raiatea', 2, -16.785, -151.415),
  t('Opoa', 'raiatea', 2, -16.837, -151.369),
  t('Tevaitoa', 'raiatea', 2, -16.79, -151.489),
  t('Fetuna', 'raiatea', 3, -16.901, -151.434),
  // Tahaa
  t('Patio', 'tahaa', 1, -16.583, -151.496),
  t('Haamene', 'tahaa', 2, -16.636, -151.491),
  t('Tapuamu', 'tahaa', 2, -16.619, -151.545),
  // Bora Bora
  t('Vaitape', 'bora-bora', 1, -16.507, -151.751),
  t('Faanui', 'bora-bora', 2, -16.485, -151.742),
  t('Anau', 'bora-bora', 2, -16.506, -151.724),
  t('Matira', 'bora-bora', 2, -16.55, -151.73),
  // Maupiti
  t('Vaiea', 'maupiti', 1, -16.45, -152.249),
  // Tuamotu
  t('Avatoru', 'rangiroa', 1, -14.942, -147.706),
  t('Tiputa', 'rangiroa', 2, -14.977, -147.626),
  t('Tuherahera', 'tikehau', 1, -15.114, -148.245),
  t('Rotoava', 'fakarava', 1, -16.056, -145.619),
  t('Tetamanu', 'fakarava', 2, -16.5, -145.47),
  t('Turipaoa', 'manihi', 1, -14.4, -146.03),
  // Marquises
  t('Taiohae', 'nuku-hiva', 1, -8.909, -140.103),
  t('Taipivai', 'nuku-hiva', 2, -8.874, -140.058),
  t('Hatiheu', 'nuku-hiva', 2, -8.829, -140.084),
  t('Atuona', 'hiva-oa', 1, -9.804, -139.043),
  t('Puamau', 'hiva-oa', 2, -9.764, -138.885),
  t('Hakahau', 'ua-pou', 1, -9.366, -140.051),
  t('Hakahetau', 'ua-pou', 2, -9.361, -140.103),
  // Australes
  t('Moerai', 'rurutu', 1, -22.451, -151.342),
  t('Avera', 'rurutu', 2, -22.479, -151.351),
  t('Hauti', 'rurutu', 3, -22.487, -151.325),
  t('Mataura', 'tubuai', 1, -23.346, -149.486),
  t('Taahuaia', 'tubuai', 2, -23.347, -149.453),
  t('Rairua', 'raivavae', 1, -23.87, -147.689),
  t('Ahurei', 'rapa', 1, -27.619, -144.333),
  // Gambier
  t('Rikitea', 'mangareva', 1, -23.123, -134.968),
];
