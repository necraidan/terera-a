/**
 * Accès à `localStorage` qui n'échouent jamais : Safari lève en navigation
 * privée, et rien de ce qu'on y conserve n'est critique.
 */

const PREFIX = 'tereraa:';

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Stockage refusé : la préférence ne survivra pas à la session, sans plus.
  }
}
