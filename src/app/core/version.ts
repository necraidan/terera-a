import { version } from '../../../package.json';

/**
 * Version de l'application, unique source de vérité.
 *
 * Lue depuis package.json à la compilation (`resolveJsonModule`) : esbuild ne
 * conserve que le champ utilisé, pas tout le manifeste. Elle est affichée dans
 * les Réglages, comparée à la première entrée du changelog (test de cohérence)
 * et à la dernière version vue par l'utilisateur (pastille « quoi de neuf »).
 */
export const APP_VERSION: string = version;
