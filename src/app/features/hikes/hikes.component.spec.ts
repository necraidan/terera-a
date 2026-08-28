import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HIKES } from '../../shared/data/hikes.data';
import { matchesDuration } from '../../shared/data/hikes.models';
import { HikesComponent } from './hikes.component';

const text = (fixture: ComponentFixture<HikesComponent>): string =>
  (fixture.nativeElement as HTMLElement).textContent ?? '';

const cards = (fixture: ComponentFixture<HikesComponent>): readonly string[] =>
  [...(fixture.nativeElement as HTMLElement).querySelectorAll('a[href^="/randonnees/"]')].map(
    (node) => (node.textContent ?? '').trim(),
  );

const button = (fixture: ComponentFixture<HikesComponent>, label: string): HTMLButtonElement => {
  const found = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
    (node) => (node.textContent ?? '').trim() === label,
  );
  if (!found) {
    throw new Error(`bouton « ${label} » introuvable`);
  }
  return found as HTMLButtonElement;
};

const select = (fixture: ComponentFixture<HikesComponent>, id: string): HTMLSelectElement => {
  const found = (fixture.nativeElement as HTMLElement).querySelector(`select#${id}`);
  if (!(found instanceof HTMLSelectElement)) {
    throw new Error(`select « ${id} » introuvable`);
  }
  return found;
};

/**
 * Choisit une option d'un des quatre selects de filtre, par son libellé visible
 * ou par sa valeur : les îles affichent un compteur dans leur libellé, qui
 * changerait à chaque randonnée ajoutée.
 */
async function pick(
  fixture: ComponentFixture<HikesComponent>,
  selectId: string,
  labelOrValue: string,
): Promise<void> {
  const target = select(fixture, selectId);
  const option = [...target.options].find(
    (node) => node.value === labelOrValue || node.textContent?.trim() === labelOrValue,
  );
  if (!option) {
    throw new Error(`option « ${labelOrValue} » introuvable dans « ${selectId} »`);
  }
  target.value = option.value;
  target.dispatchEvent(new Event('change'));
  await fixture.whenStable();
}

/** `island` simule l'arrivée depuis la carte, par le paramètre de requête. */
async function setup(island?: string): Promise<ComponentFixture<HikesComponent>> {
  // Remise à zéro explicite : certains tests ouvrent l'écran deux fois, pour
  // vérifier ce qui survit d'une visite à l'autre.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(HikesComponent);
  if (island !== undefined) {
    fixture.componentRef.setInput('ile', island);
  }
  await fixture.whenStable();
  return fixture;
}

describe('HikesComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('liste toutes les randonnées, groupées par île', async () => {
    const fixture = await setup();
    expect(cards(fixture).length).toBe(HIKES.length);
    expect(text(fixture)).toContain('Tahiti');
    expect(text(fixture)).toContain('Moorea');
  });

  it('annonce le nombre de randonnées visibles', async () => {
    const fixture = await setup();
    expect(text(fixture)).toContain(`${HIKES.length} randonnées`);
  });

  it('combine les filtres en et logique', async () => {
    const fixture = await setup();

    await pick(fixture, 'hike-difficulty', 'Très difficile');
    const hard = cards(fixture);
    expect(hard.length).toBe(HIKES.filter((hike) => hike.difficulty === 'tres-difficile').length);
    expect(hard.join(' ')).toContain('Aorai');

    await pick(fixture, 'hike-length', 'Moins de 5 km');
    // Aucune randonnée très difficile de ce lot ne fait moins de cinq kilomètres.
    expect(cards(fixture).length).toBe(0);
    expect(text(fixture)).toContain('Aucune randonnée ne correspond');
  });

  it('réinitialise tous les filtres d’un coup', async () => {
    const fixture = await setup();
    await pick(fixture, 'hike-difficulty', 'Facile');
    await pick(fixture, 'hike-duration', 'Moins de 3 h');
    expect(cards(fixture).length).toBeLessThan(HIKES.length);

    button(fixture, 'Réinitialiser').click();
    await fixture.whenStable();
    expect(cards(fixture).length).toBe(HIKES.length);
    // Les selects natifs doivent revenir sur « Toutes », pas seulement les signaux.
    for (const id of ['hike-island', 'hike-difficulty', 'hike-length', 'hike-duration']) {
      expect(select(fixture, id).value).toBe('');
    }
  });

  it('revient sur « Toutes » depuis le select lui-même', async () => {
    const fixture = await setup();
    await pick(fixture, 'hike-duration', 'Plus de 5 h');
    expect(cards(fixture).length).toBe(
      HIKES.filter((hike) => matchesDuration(hike, 'grande-journee')).length,
    );

    await pick(fixture, 'hike-duration', 'Toutes');
    expect(cards(fixture).length).toBe(HIKES.length);
  });

  it('filtre sur l’île passée en paramètre de requête', async () => {
    const fixture = await setup('moorea');

    const expected = HIKES.filter((hike) => hike.islandId === 'moorea').length;
    expect(cards(fixture).length).toBe(expected);
    expect(text(fixture)).not.toContain('Aorai');
    // Le select doit refléter l'île imposée, sinon la liste paraît filtrée sans raison.
    expect(select(fixture, 'hike-island').value).toBe('moorea');
  });

  it('retient l’île choisie d’une visite à l’autre', async () => {
    // C'est le seul filtre persisté : on reste plusieurs jours sur la même île.
    const first = await setup();
    await pick(first, 'hike-island', 'moorea');

    const second = await setup();
    expect(cards(second).length).toBe(HIKES.filter((hike) => hike.islandId === 'moorea').length);
    expect(select(second, 'hike-island').value).toBe('moorea');
  });

  it('remonte les randonnées mises de côté en tête', async () => {
    const fixture = await setup();
    const star = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (node) => (node.getAttribute('aria-label') ?? '').startsWith('Ajouter aux favoris'),
    );
    (star as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(text(fixture)).toContain('Mises de côté');
    expect(cards(fixture).length).toBe(HIKES.length);
  });

  it('rappelle les règles générales avant de partir', async () => {
    const fixture = await setup();
    expect(text(fixture)).toContain('Avant de partir');
  });
});
