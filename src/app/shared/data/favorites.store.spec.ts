import { TestBed } from '@angular/core/testing';
import { FavoritesStore } from './favorites.store';

describe('FavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('démarre vide', () => {
    const store = TestBed.inject(FavoritesStore);
    expect(store.count()).toBe(0);
    expect(store.has('mauruuru')).toBe(false);
  });

  it('ajoute puis retire un favori', () => {
    const store = TestBed.inject(FavoritesStore);

    store.toggle('mauruuru');
    expect(store.has('mauruuru')).toBe(true);
    expect(store.count()).toBe(1);

    store.toggle('mauruuru');
    expect(store.has('mauruuru')).toBe(false);
    expect(store.count()).toBe(0);
  });

  it('relit les favoris persistés à l’instanciation suivante', () => {
    TestBed.inject(FavoritesStore).toggle('ia-ora-na');

    TestBed.resetTestingModule();
    expect(TestBed.inject(FavoritesStore).has('ia-ora-na')).toBe(true);
  });

  it('ignore un contenu stocké illisible', () => {
    localStorage.setItem('tereraa:lexicon:favorites', 'pas du json');
    expect(TestBed.inject(FavoritesStore).count()).toBe(0);
  });

  it('ignore les entrées non textuelles', () => {
    localStorage.setItem('tereraa:lexicon:favorites', JSON.stringify(['ok', 42, null]));
    const store = TestBed.inject(FavoritesStore);
    expect(store.count()).toBe(1);
    expect(store.has('ok')).toBe(true);
  });
});
