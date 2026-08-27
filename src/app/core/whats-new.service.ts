import { Injectable, signal } from '@angular/core';
import { APP_VERSION } from './version';

const STORAGE_KEY = 'tereraa:lastSeenVersion';

/**
 * Suit la dernière version dont l'utilisateur a lu les nouveautés.
 *
 * Sert uniquement à afficher une pastille discrète : pas de fenêtre modale au
 * lancement. Si le stockage est indisponible (navigation privée) ou purgé par
 * iOS, la pastille réapparaît une fois — conséquence bénigne, jamais bloquante.
 */
@Injectable({ providedIn: 'root' })
export class WhatsNewService {
  /** Version dont les nouveautés ont déjà été consultées, si connue. */
  readonly lastSeenVersion = signal<string | null>(read());

  /** L'utilisateur n'a pas encore lu les nouveautés de la version installée. */
  readonly hasUnseenChanges = signal(false);

  constructor() {
    const stored = this.lastSeenVersion();
    if (stored === null) {
      // Première installation : rien de « nouveau » à annoncer, on prend juste
      // date pour que la prochaine mise à jour soit, elle, signalée.
      this.markSeen();
      return;
    }
    this.hasUnseenChanges.set(stored !== APP_VERSION);
  }

  /** Appelé quand la page Nouveautés est affichée. */
  markSeen(): void {
    this.lastSeenVersion.set(APP_VERSION);
    this.hasUnseenChanges.set(false);
    write(APP_VERSION);
  }
}

function read(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function write(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Stockage refusé : on se passe de la pastille, ce n'est pas critique.
  }
}
