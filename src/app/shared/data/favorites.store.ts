import { Injectable, computed, signal } from '@angular/core';
import { readStored, writeStored } from './storage';

/**
 * Ensemble d'identifiants mis de côté par l'utilisateur, persisté localement.
 *
 * Le lexique et les liens utiles ont le même besoin, avec des clés de stockage
 * distinctes : la logique vit donc ici une seule fois.
 */
export class FavoritesSet {
  readonly #ids = signal<ReadonlySet<string>>(new Set());

  readonly ids = this.#ids.asReadonly();
  readonly count = computed(() => this.#ids().size);

  constructor(private readonly storageKey: string) {
    this.#ids.set(read(storageKey));
  }

  has(id: string): boolean {
    return this.#ids().has(id);
  }

  toggle(id: string): void {
    const next = new Set(this.#ids());
    if (!next.delete(id)) {
      next.add(id);
    }
    this.#ids.set(next);
    writeStored(this.storageKey, JSON.stringify([...next]));
  }
}

/** Mots du lexique mis de côté. */
@Injectable({ providedIn: 'root' })
export class FavoritesStore extends FavoritesSet {
  constructor() {
    super('lexicon:favorites');
  }
}

/** Liens utiles mis de côté, remontés en tête de la page Liens. */
@Injectable({ providedIn: 'root' })
export class LinkFavoritesStore extends FavoritesSet {
  constructor() {
    super('links:favorites');
  }
}

/** Randonnées mises de côté, remontées en tête de la liste. */
@Injectable({ providedIn: 'root' })
export class HikeFavoritesStore extends FavoritesSet {
  constructor() {
    super('hikes:favorites');
  }
}

function read(key: string): ReadonlySet<string> {
  const raw = readStored(key);
  if (raw === null) {
    return new Set();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}
