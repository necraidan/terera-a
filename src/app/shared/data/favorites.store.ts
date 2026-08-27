import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'tereraa:lexicon:favorites';

/**
 * Mots du lexique mis de côté par l'utilisateur.
 *
 * Persisté dans `localStorage`, avec tous les accès gardés : en navigation
 * privée Safari l'écriture lève, et la fonctionnalité doit alors se dégrader
 * silencieusement plutôt que casser l'écran.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  readonly #ids = signal<ReadonlySet<string>>(read());

  readonly ids = this.#ids.asReadonly();
  readonly count = computed(() => this.#ids().size);

  has(id: string): boolean {
    return this.#ids().has(id);
  }

  toggle(id: string): void {
    const next = new Set(this.#ids());
    if (!next.delete(id)) {
      next.add(id);
    }
    this.#ids.set(next);
    write(next);
  }
}

function read(): ReadonlySet<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return new Set();
    }
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function write(ids: ReadonlySet<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Stockage indisponible : les favoris ne survivront pas à la session.
  }
}
