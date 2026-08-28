import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HikeDetailComponent } from './hike-detail.component';

async function setup(id: string): Promise<ComponentFixture<HikeDetailComponent>> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(HikeDetailComponent);
  fixture.componentRef.setInput('id', id);
  await fixture.whenStable();
  return fixture;
}

const text = (fixture: ComponentFixture<HikeDetailComponent>): string =>
  (fixture.nativeElement as HTMLElement).textContent ?? '';

describe('HikeDetailComponent', () => {
  it('affiche les chiffres, l’île et la provenance des données', async () => {
    const fixture = await setup('mont-aorai');
    const rendered = text(fixture);
    expect(rendered).toContain('Mont Aorai');
    expect(rendered).toContain('Tahiti, Société');
    expect(rendered).toContain('18 km');
    expect(rendered).toContain('9 h');
    expect(rendered).toContain('1 500 m');
    expect(rendered).toContain('tahiti-rando.fr');
    expect(rendered).toContain('Vérifié le');
  });

  it('place les avertissements avant le reste de la fiche', async () => {
    // L'ordre compte : la vue avant le danger serait pire que pas de fiche.
    const fixture = await setup('mont-rotui');
    const rendered = text(fixture);
    const warning = rendered.indexOf('À savoir avant de s’engager');
    const highlights = rendered.indexOf('À voir');
    expect(warning).toBeGreaterThan(-1);
    expect(warning).toBeLessThan(highlights);
  });

  it('dessine le plan du sentier quand il existe', async () => {
    const fixture = await setup('mont-aorai');
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('ta-hike-map svg')).not.toBeNull();
    expect(text(fixture)).toContain('OpenStreetMap');
  });

  it('dit qu’il n’y a pas de tracé plutôt que d’en inventer un', async () => {
    // Te Pari n'est pas cartographié : une ligne approximative sur une côte
    // sans échappatoire serait la pire des approximations.
    const fixture = await setup('te-pari');
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('ta-hike-map')).toBeNull();
    expect(text(fixture)).toContain('Aucun tracé disponible');
  });

  it('dit « non publié » plutôt que zéro pour un chiffre manquant', async () => {
    const fixture = await setup('te-pari');
    expect(text(fixture)).toContain('non publié');
  });

  it('signale une randonnée inconnue', async () => {
    const fixture = await setup('sentier-imaginaire');
    expect(text(fixture)).toContain('n’existe pas');
  });
});
