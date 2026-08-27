import { Injectable, signal } from '@angular/core';
import { readStored, writeStored } from '../shared/data/storage';
import { APP_VERSION } from './version';

const STORAGE_KEY = 'lastSeenVersion';

/**
 * Dernière version dont l'utilisateur a lu les nouveautés. Sert à une pastille
 * discrète, jamais à une fenêtre modale au lancement.
 */
@Injectable({ providedIn: 'root' })
export class WhatsNewService {
  readonly lastSeenVersion = signal<string | null>(readStored(STORAGE_KEY));

  readonly hasUnseenChanges = signal(false);

  constructor() {
    const stored = this.lastSeenVersion();
    if (stored === null) {
      // Première installation : rien de nouveau à annoncer, on prend date.
      this.markSeen();
      return;
    }
    this.hasUnseenChanges.set(stored !== APP_VERSION);
  }

  markSeen(): void {
    this.lastSeenVersion.set(APP_VERSION);
    this.hasUnseenChanges.set(false);
    writeStored(STORAGE_KEY, APP_VERSION);
  }
}
