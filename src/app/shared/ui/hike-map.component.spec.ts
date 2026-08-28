import { ComponentFixture, TestBed } from '@angular/core/testing';
import { haversineKm } from '../data/geo';
import { HIKE_BASEMAPS, ISLAND_OUTLINES } from '../data/hikes.basemap';
import { HIKES } from '../data/hikes.data';
import { TrackPoint } from '../data/hikes.models';
import { HIKE_TRACKS } from '../data/hikes.tracks';
import { HikeMapComponent } from './hike-map.component';

interface Rendered {
  readonly width: number;
  readonly height: number;
  readonly points: readonly { readonly x: number; readonly y: number }[];
  readonly element: HTMLElement;
}

async function render(id: string): Promise<Rendered> {
  const hike = HIKES.find((entry) => entry.id === id);
  if (!hike?.trackCoverage) {
    throw new Error(`randonnée ${id} sans tracé`);
  }

  const fixture: ComponentFixture<HikeMapComponent> = TestBed.createComponent(HikeMapComponent);
  fixture.componentRef.setInput('track', HIKE_TRACKS[id]);
  fixture.componentRef.setInput('waypoints', hike.waypoints ?? []);
  fixture.componentRef.setInput('coverage', hike.trackCoverage);
  fixture.componentRef.setInput('name', hike.name);
  fixture.componentRef.setInput('basemap', HIKE_BASEMAPS[id]);
  fixture.componentRef.setInput('outline', ISLAND_OUTLINES[hike.islandId]);
  await fixture.whenStable();

  const element = fixture.nativeElement as HTMLElement;
  const svg = element.querySelector('svg');
  // Le décor est fait de polylignes lui aussi : viser le sentier explicitement.
  const polyline = element.querySelector('polyline[data-role="track"]');
  if (!svg || !polyline) {
    throw new Error('plan non rendu');
  }

  const [, , width, height] = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number);
  const points = (polyline.getAttribute('points') ?? '')
    .trim()
    .split(' ')
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    });

  return { width, height, points, element };
}

/** Échelle du rendu sur chaque axe, en pixels par kilomètre. */
function scales(track: readonly TrackPoint[], rendered: Rendered) {
  const lats = track.map(([lat]) => lat);
  const lons = track.map(([, lon]) => lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const midLat = (minLat + maxLat) / 2;

  const north = rendered.points[lats.indexOf(maxLat)];
  const south = rendered.points[lats.indexOf(minLat)];
  const west = rendered.points[lons.indexOf(minLon)];
  const east = rendered.points[lons.indexOf(maxLon)];

  const latKm = haversineKm({ lat: minLat, lon: midLat }, { lat: maxLat, lon: midLat });
  const lonKm = haversineKm({ lat: midLat, lon: minLon }, { lat: midLat, lon: maxLon });

  return {
    vertical: Math.abs(south.y - north.y) / latKm,
    horizontal: Math.abs(east.x - west.x) / lonKm,
  };
}

describe('HikeMapComponent', () => {
  it('dessine un point du plan par point du tracé', async () => {
    const rendered = await render('mont-aorai');
    expect(rendered.points.length).toBe(HIKE_TRACKS['mont-aorai'].length);
  });

  it('garde tout le tracé dans le cadre', async () => {
    // Un point hors du viewBox serait simplement invisible, sans erreur : c'est
    // le genre de bogue qu'on ne voit pas passer.
    for (const id of Object.keys(HIKE_TRACKS)) {
      const rendered = await render(id);
      for (const point of rendered.points) {
        expect(point.x, id).toBeGreaterThanOrEqual(0);
        expect(point.x, id).toBeLessThanOrEqual(rendered.width);
        expect(point.y, id).toBeGreaterThanOrEqual(0);
        expect(point.y, id).toBeLessThanOrEqual(rendered.height);
      }
    }
  });

  it('ne déforme pas le tracé', async () => {
    // Le cadre est élargi sur l'axe le plus court pour retomber sur le rapport
    // du viewBox : sans cela, un sentier de crête serait étiré et son plan
    // mentirait sur les directions, donc sur l'échelle elle même.
    for (const id of Object.keys(HIKE_TRACKS)) {
      const rendered = await render(id);
      const { vertical, horizontal } = scales(HIKE_TRACKS[id], rendered);
      const ratio = horizontal / vertical;
      expect(ratio, `${id} : ${ratio.toFixed(3)} entre les deux axes`).toBeGreaterThan(0.97);
      expect(ratio, `${id} : ${ratio.toFixed(3)} entre les deux axes`).toBeLessThan(1.03);
    }
  });

  it('occupe le cadre plutôt que de s’y perdre', async () => {
    // Un tracé dessiné dans un coin serait illisible sur un écran de téléphone.
    for (const id of Object.keys(HIKE_TRACKS)) {
      const rendered = await render(id);
      const xs = rendered.points.map((point) => point.x);
      const ys = rendered.points.map((point) => point.y);
      const spanX = (Math.max(...xs) - Math.min(...xs)) / rendered.width;
      const spanY = (Math.max(...ys) - Math.min(...ys)) / rendered.height;
      expect(Math.max(spanX, spanY), id).toBeGreaterThan(0.6);
    }
  });

  it('affiche une échelle et les points remarquables', async () => {
    const rendered = await render('mont-rotui');
    const texts = [...rendered.element.querySelectorAll('text')].map((node) =>
      (node.textContent ?? '').trim(),
    );
    expect(texts).toContain('Sommet, 899 m');
    expect(texts.some((text) => /^\d+ (m|km)$/.test(text))).toBe(true);
    // Enfants directs du svg : le point de l'encart de localisation vit dans un
    // groupe, il ne doit pas être compté avec les points remarquables.
    expect(rendered.element.querySelectorAll('svg > circle').length).toBe(2);
  });

  it('signale un tracé partiel par un trait discontinu', async () => {
    const partial = await render('mont-rotui');
    const complete = await render('mont-aorai');
    const dashOf = (rendered: Rendered) =>
      rendered.element
        .querySelector('polyline[data-role="track"]')
        ?.hasAttribute('stroke-dasharray') ?? false;
    expect(dashOf(partial)).toBe(true);
    expect(dashOf(complete)).toBe(false);
  });

  it('dessine le décor derrière le sentier', async () => {
    // Une ligne seule sur du blanc ne dit pas où l'on est : le fond doit être
    // là, et sous le tracé, jamais par dessus.
    const rendered = await render('mont-rotui');
    const nodes = [...rendered.element.querySelectorAll('svg > *')];
    const firstTrack = nodes.findIndex((node) => node.getAttribute('data-role') === 'track-casing');
    const decor = nodes.filter(
      (node, index) => index < firstTrack && ['polyline', 'polygon'].includes(node.tagName),
    );
    expect(firstTrack).toBeGreaterThan(0);
    expect(decor.length).toBeGreaterThan(3);
  });

  it('situe le sentier sur la silhouette de l’île', async () => {
    for (const id of Object.keys(HIKE_TRACKS)) {
      const rendered = await render(id);
      const inset = rendered.element.querySelector('svg > g:last-of-type');
      const outline = inset?.querySelector('polygon');
      const dot = inset?.querySelector('circle');
      expect(outline, `${id} : contour d’île manquant`).not.toBeNull();
      expect(dot, `${id} : repère de position manquant`).not.toBeNull();

      // Le point doit tomber dans l'encart, sinon il désigne l'océan.
      const cx = Number(dot?.getAttribute('cx'));
      const cy = Number(dot?.getAttribute('cy'));
      const size = Number(inset?.querySelector('rect')?.getAttribute('width'));
      expect(cx, id).toBeGreaterThan(0);
      expect(cx, id).toBeLessThan(size);
      expect(cy, id).toBeGreaterThan(0);
      expect(cy, id).toBeLessThan(size);
    }
  });

  it('décrit le plan pour un lecteur d’écran', async () => {
    const rendered = await render('mont-aorai');
    const label = rendered.element.querySelector('svg')?.getAttribute('aria-label') ?? '';
    expect(label).toContain('Mont Aorai');
    expect(label).toContain('Sommet, 2 066 m');
  });
});
