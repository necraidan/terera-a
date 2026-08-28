import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoastlineDetail, OVERVIEW_RINGS, loadCoastlineDetail } from '../../shared/data/coastlines';
import {
  Bounds,
  GeoPoint,
  Ring,
  bearingLabel,
  boundsOf,
  boundsOfRings,
  fitBoundsToAspect,
  formatKm,
  haversineKm,
  initialBearing,
  projectToSvg,
  svgPathFromRings,
} from '../../shared/data/geo';
import { HIKES } from '../../shared/data/hikes.data';
import {
  ARCHIPELAGOS,
  ISLANDS,
  REFERENCE_ISLAND,
  SCALE_NOTES,
  SEA_LINKS,
} from '../../shared/data/islands.data';
import { Island } from '../../shared/data/islands.models';
import { TOWNS } from '../../shared/data/towns.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Dimensions du viewBox de la carte. Cf. scripts/build-coastlines.js. */
const MAP_WIDTH = 320;
const MAP_HEIGHT = 380;
const MAP_PADDING = 18;

/** Facteur de zoom maximal de la carte d'ensemble (x1 = tout l'archipel). */
const MAX_ZOOM = 80;
/** À partir de ce zoom, les contours détaillés remplacent la vue simplifiée. */
const DETAIL_ZOOM = 3;
/** Un peu avant, on lance leur chargement pour qu'ils soient prêts. */
const PRELOAD_ZOOM = 1.8;
/** Zoom à partir duquel chaque rang de localité apparaît (index = rang). */
const TOWN_ZOOM: Readonly<Record<1 | 2 | 3, number>> = { 1: 9, 2: 16, 3: 28 };
/** Pas de la grille de coordonnées, en degrés. */
const GRATICULE_STEP = 5;
/** En deçà de ce déplacement (px écran), un pointeur relâché vaut un clic. */
const CLICK_SLOP_PX = 6;

/** Fenêtre visible de la carte, en unités du viewBox. */
interface View {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Centre de la boîte englobante d'un contour. */
const centreOfRings = (rings: readonly Ring[]): GeoPoint => {
  const b = boundsOfRings(rings);
  return { lat: (b.minLat + b.maxLat) / 2, lon: (b.minLon + b.maxLon) / 2 };
};

const FULL_VIEW: View = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };

/**
 * Encart de l'île sélectionnée : le dessin occupe la partie haute, la barre
 * d'échelle la bande du bas.
 */
const INSET_SIZE = 160;
const INSET_MAP_HEIGHT = 132;
const INSET_PADDING = 8;
const INSET_MARGIN_RATIO = 0.15;

/**
 * Longueurs rondes admises pour une barre d'échelle. La carte d'ensemble couvre
 * deux mille kilomètres, l'encart quelques dizaines : la même barre doit rester
 * lisible dans les deux cas.
 */
const SCALE_STEPS_KM = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

interface Plotted {
  readonly island: Island;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  /** Faux quand le libellé chevaucherait un voisin déjà placé. */
  readonly labelled: boolean;
  /** Libellé rabattu à gauche du point près du bord droit. */
  readonly labelAnchor: 'start' | 'end';
  /** Décalage du libellé par rapport au point, en px écran (divisé par le zoom). */
  readonly labelOffset: number;
}

/** Largeur moyenne d'un caractère, en fraction de la taille de police. */
const CHAR_WIDTH_RATIO = 0.58;
/** Marge autour de chaque libellé, en pixels écran. */
const LABEL_GAP_PX = 3;

/** Rectangle d'un libellé, en unités du viewBox. */
interface LabelBox {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

const overlaps = (a: LabelBox, b: LabelBox): boolean =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

type Anchor = 'start' | 'middle' | 'end';

/** Position d'un libellé par rapport à son point, en pixels écran. */
interface Placement {
  readonly dx: number;
  readonly dy: number;
  readonly anchor: Anchor;
}

/** Emplacements essayés dans l'ordre pour une localité : droite, gauche, dessus, dessous. */
const TOWN_PLACEMENTS: readonly Placement[] = [
  { dx: 4, dy: 2.5, anchor: 'start' },
  { dx: -4, dy: 2.5, anchor: 'end' },
  { dx: 0, dy: -5, anchor: 'middle' },
  { dx: 0, dy: 10, anchor: 'middle' },
];

/**
 * Boîte d'un texte posé à (x, y) décalé de `placement`, dont `dy` est la ligne
 * de base. Les tailles sont données en pixels écran et ramenées au zoom, comme
 * le texte lui-même.
 */
const labelBox = (
  x: number,
  y: number,
  text: string,
  fontPx: number,
  placement: Placement,
  zoom: number,
): LabelBox => {
  const width = (text.length * fontPx * CHAR_WIDTH_RATIO + LABEL_GAP_PX) / zoom;
  const height = (fontPx + LABEL_GAP_PX) / zoom;
  const start = x + placement.dx / zoom;
  const left =
    placement.anchor === 'start'
      ? start
      : placement.anchor === 'end'
        ? start - width
        : start - width / 2;
  // La ligne de base est à peu près au bas des lettres, sans les jambages.
  const bottom = y + placement.dy / zoom + LABEL_GAP_PX / 2 / zoom;
  return { left, right: left + width, top: bottom - height, bottom };
};

@Component({
  selector: 'ta-islands',
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <ta-page-header width="wide" title="Carte et distances" />

    <main class="page-wide">
      <section class="rounded-card bg-surface-1 p-3">
        <div class="relative">
          <svg
            #map
            [attr.viewBox]="viewBox()"
            class="w-full touch-none select-none"
            [class.cursor-grab]="!dragging()"
            [class.cursor-grabbing]="dragging()"
            role="img"
            [attr.aria-label]="mapLabel"
            (pointerdown)="onPointerDown($event)"
            (pointermove)="onPointerMove($event)"
            (pointerup)="onPointerUp($event)"
            (pointercancel)="onPointerUp($event)"
            (wheel)="onWheel($event)"
            (dblclick)="onDoubleClick($event)"
          >
            <!-- Grille de coordonnées : l'océan est vide, autant dire où l'on est. -->
            <g stroke="var(--color-ink-2)" stroke-opacity="0.18" [attr.stroke-width]="0.6 / zoom()">
              @for (line of graticule().lines; track line.key) {
                <line
                  [attr.x1]="line.x1"
                  [attr.y1]="line.y1"
                  [attr.x2]="line.x2"
                  [attr.y2]="line.y2"
                />
              }
            </g>
            @for (label of graticule().labels; track label.key) {
              <text
                [attr.x]="label.x"
                [attr.y]="label.y"
                [attr.text-anchor]="label.anchor"
                class="fill-current text-ink-2"
                opacity="0.55"
                [style.font-size.px]="7 / zoom()"
              >
                {{ label.text }}
              </text>
            }

            <!--
              Fond de carte. À l'échelle de l'archipel, la plupart des îles font
              moins d'un pixel : le remplissage sans contour donne le contexte. Dès
              qu'on zoome, le contour détaillé prend le relais.
            -->
            @if (landPath(); as land) {
              <path
                [attr.d]="land"
                fill="var(--color-ink-2)"
                [attr.fill-opacity]="detailed() ? 0.45 : 0.3"
                [attr.stroke]="detailed() ? 'var(--color-ink-2)' : 'none'"
                [attr.stroke-width]="0.8 / zoom()"
                stroke-linejoin="round"
              />
            }

            <!-- Localités, par rang, dès que le zoom leur laisse la place. -->
            @for (town of towns(); track town.key) {
              <circle
                [attr.cx]="town.x"
                [attr.cy]="town.y"
                [attr.r]="(town.rank === 1 ? 2 : 1.5) / zoom()"
                fill="var(--color-surface-1)"
                stroke="currentColor"
                [attr.stroke-width]="1 / zoom()"
                class="text-ink-1"
              />
              @if (town.placement; as at) {
                <text
                  [attr.x]="town.x + at.dx / zoom()"
                  [attr.y]="town.y + at.dy / zoom()"
                  [attr.text-anchor]="at.anchor"
                  class="fill-current text-ink-1"
                  stroke="var(--color-surface-1)"
                  [attr.stroke-width]="2 / zoom()"
                  stroke-linejoin="round"
                  paint-order="stroke"
                  [style.font-size.px]="(town.rank === 1 ? 8 : 7) / zoom()"
                  [style.font-weight]="town.rank === 1 ? 600 : 400"
                  style="pointer-events: none"
                >
                  {{ town.name }}
                </text>
              }
            }

            <!-- Repère de l'échelle, recalculé à chaque zoom. -->
            <line
              [attr.x1]="scaleBar().x1"
              [attr.y1]="scaleBar().y"
              [attr.x2]="scaleBar().x2"
              [attr.y2]="scaleBar().y"
              stroke="currentColor"
              [attr.stroke-width]="1.5 / zoom()"
              class="text-ink-2"
            />
            <text
              [attr.x]="scaleBar().x1"
              [attr.y]="scaleBar().y - 5 / zoom()"
              class="fill-current text-ink-2"
              [style.font-size.px]="9 / zoom()"
            >
              {{ scaleBar().label }}
            </text>

            @for (point of plotted(); track point.island.id) {
              <circle
                [attr.cx]="point.x"
                [attr.cy]="point.y"
                [attr.r]="(point.island.id === selected().id ? 6 : 3.5) / zoom()"
                [attr.fill]="point.color"
                [attr.stroke]="point.island.id === selected().id ? 'currentColor' : 'none'"
                [attr.stroke-width]="1.5 / zoom()"
                class="cursor-pointer text-ink-1"
                [attr.aria-label]="point.island.name"
                (click)="onPointClick(point.island)"
              />
              @if (point.labelled) {
                <text
                  [attr.x]="point.x + point.labelOffset / zoom()"
                  [attr.y]="point.y + 3 / zoom()"
                  [attr.text-anchor]="point.labelAnchor"
                  class="fill-current"
                  [class]="point.island.id === selected().id ? 'text-ink-1' : 'text-ink-2'"
                  stroke="var(--color-surface-1)"
                  [attr.stroke-width]="2 / zoom()"
                  stroke-linejoin="round"
                  paint-order="stroke"
                  [style.font-size.px]="(point.island.id === selected().id ? 10 : 8) / zoom()"
                  [style.font-weight]="point.island.id === selected().id ? 700 : 400"
                  style="pointer-events: none"
                >
                  {{ point.island.name }}
                </text>
              }
            }
          </svg>

          <div class="absolute top-2 right-2 flex flex-col gap-1">
            <button
              type="button"
              class="size-9 rounded-lg bg-surface-2 text-lg font-semibold text-ink-1 shadow"
              aria-label="Zoomer"
              [disabled]="zoom() >= maxZoom"
              (click)="zoomBy(2)"
            >
              +
            </button>
            <button
              type="button"
              class="size-9 rounded-lg bg-surface-2 text-lg font-semibold text-ink-1 shadow"
              aria-label="Dézoomer"
              [disabled]="zoom() <= 1"
              (click)="zoomBy(0.5)"
            >
              −
            </button>
            @if (zoom() > 1) {
              <button
                type="button"
                class="size-9 rounded-lg bg-surface-2 text-sm text-ink-1 shadow"
                aria-label="Revenir à la vue d’ensemble"
                (click)="resetView()"
              >
                ⤢
              </button>
            }
          </div>
        </div>
        <p class="mt-1 text-xs text-ink-2">
          Pincez ou molette pour zoomer, glissez pour déplacer, touchez une île pour la choisir.
        </p>

        <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          @for (archipelago of archipelagos; track archipelago.id) {
            <li class="flex items-center gap-1.5 text-xs text-ink-2">
              <span
                class="size-2.5 rounded-full"
                [style.background]="'var(' + archipelago.colorVar + ')'"
                aria-hidden="true"
              ></span>
              {{ archipelago.shortName }}
            </li>
          }
        </ul>
      </section>

      <label class="mt-4 block text-sm font-medium text-ink-2" for="island">
        Distance depuis Papeete
      </label>
      <select
        id="island"
        class="mt-1 w-full rounded-lg bg-surface-1 px-3 py-3 text-lg outline-none"
        [value]="selected().id"
        (change)="onSelect($event)"
      >
        @for (group of grouped(); track group.id) {
          <optgroup [label]="group.name">
            @for (item of group.islands; track item.id) {
              <option [value]="item.id">{{ item.name }}</option>
            }
          </optgroup>
        }
      </select>

      <section class="mt-3 rounded-card bg-accent p-4 text-accent-ink">
        <div class="flex items-start gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium opacity-80">{{ selected().name }}</p>
            @if (selected().id === reference.id) {
              <p class="mt-1 text-lg font-semibold">C’est le point de départ.</p>
            } @else {
              <p class="text-4xl font-bold tabular-nums">{{ distance() }}</p>
              <p class="mt-1 text-sm opacity-90">
                à vol d’oiseau, vers le {{ direction() }}
                @if (selected().flightMinutesFromPapeete) {
                  · {{ flightLabel() }} de vol
                }
              </p>
            }
          </div>

          <!--
            Contour détaillé de l'île. Absent tant que le jeu de données n'est
            pas chargéet pour une île qui n'y figure pas : l'encart disparaît,
            le reste de la carte ne bouge pas.
          -->
          @if (inset(); as shape) {
            <svg
              [attr.viewBox]="'0 0 ' + insetSize + ' ' + insetSize"
              class="w-24 shrink-0 sm:w-32"
              role="img"
              [attr.aria-label]="'Contour de ' + selected().name + ', échelle ' + shape.label"
            >
              <path [attr.d]="shape.path" fill="currentColor" fill-opacity="0.9" />
              <circle
                [attr.cx]="shape.markerX"
                [attr.cy]="shape.markerY"
                r="5"
                fill="currentColor"
                stroke="var(--color-accent)"
                stroke-width="2.5"
              />
              <line
                [attr.x1]="shape.x1"
                [attr.y1]="shape.y"
                [attr.x2]="shape.x2"
                [attr.y2]="shape.y"
                stroke="currentColor"
                stroke-width="2"
                opacity="0.8"
              />
              <text
                [attr.x]="shape.x1"
                [attr.y]="shape.y - 6"
                fill="currentColor"
                opacity="0.8"
                style="font-size: 13px"
              >
                {{ shape.label }}
              </text>
            </svg>
          }
        </div>

        <dl class="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <div class="flex justify-between gap-2">
            <dt class="opacity-80">Type</dt>
            <dd class="text-right font-semibold">{{ selected().type }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="opacity-80">Superficie</dt>
            <dd class="font-semibold tabular-nums">{{ selected().areaKm2 }} km²</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="opacity-80">Habitants</dt>
            <dd class="font-semibold tabular-nums">{{ population() }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="opacity-80">On y va</dt>
            <dd class="font-semibold">{{ selected().access.join(', ') }}</dd>
          </div>
        </dl>
        @if (hikeCount() > 0) {
          <a
            class="mt-4 inline-block font-semibold underline underline-offset-4"
            routerLink="/randonnees"
            [queryParams]="{ ile: selected().id }"
          >
            {{ hikeLabel() }} sur cette île ›
          </a>
        }
      </section>

      <h2 class="mt-8 mb-2 text-sm font-semibold tracking-wide text-ink-2 uppercase">
        Les cinq archipels
      </h2>
      <div class="grid gap-3 lg:grid-cols-2">
        @for (archipelago of archipelagos; track archipelago.id) {
          <section class="rounded-card bg-surface-1 p-4">
            <div class="flex items-baseline gap-2">
              <span
                class="size-3 shrink-0 rounded-full"
                [style.background]="'var(' + archipelago.colorVar + ')'"
                aria-hidden="true"
              ></span>
              <h3 class="font-semibold">{{ archipelago.name }}</h3>
              <span class="ml-auto text-xs text-ink-2">{{ archipelago.islandCount }} îles</span>
            </div>
            <p class="mt-1 text-sm text-ink-2">{{ archipelago.kind }}</p>
            <p class="mt-2 text-sm leading-relaxed">{{ archipelago.character }}</p>
            <ul class="mt-2 grid gap-1.5">
              @for (highlight of archipelago.highlights; track $index) {
                <li class="flex gap-2 text-sm leading-relaxed">
                  <span class="text-accent" aria-hidden="true">•</span>
                  <span>{{ highlight }}</span>
                </li>
              }
            </ul>
          </section>
        }
      </div>

      <h2 class="mt-8 mb-2 text-sm font-semibold tracking-wide text-ink-2 uppercase">Par la mer</h2>
      <div class="grid gap-3 lg:grid-cols-2">
        @for (link of seaLinks; track link.route) {
          <section class="rounded-card bg-surface-1 p-4">
            <h3 class="font-semibold">⛴️ {{ link.route }}</h3>
            <p class="mt-1 text-sm leading-relaxed">{{ link.note }}</p>
          </section>
        }
      </div>

      <section class="mt-6 rounded-card bg-surface-2 p-4">
        <h2 class="font-semibold">L’échelle, vraiment</h2>
        <ul class="mt-2 grid gap-2">
          @for (note of scaleNotes; track $index) {
            <li class="flex gap-2 text-sm leading-relaxed">
              <span class="text-coral" aria-hidden="true">•</span>
              <span>{{ note }}</span>
            </li>
          }
        </ul>
      </section>
    </main>
  `,
})
export class IslandsComponent {
  protected readonly archipelagos = ARCHIPELAGOS;
  protected readonly seaLinks = SEA_LINKS;
  protected readonly scaleNotes = SCALE_NOTES;
  protected readonly reference = REFERENCE_ISLAND;

  protected readonly insetSize = INSET_SIZE;
  protected readonly maxZoom = MAX_ZOOM;

  private readonly map = viewChild.required<ElementRef<SVGSVGElement>>('map');

  /** Fenêtre visible : zoom et déplacement se font en changeant le viewBox. */
  protected readonly view = signal<View>(FULL_VIEW);
  protected readonly viewBox = computed(() => {
    const { x, y, w, h } = this.view();
    return `${x} ${y} ${w} ${h}`;
  });
  protected readonly zoom = computed(() => MAP_WIDTH / this.view().w);
  protected readonly dragging = signal(false);

  /** Pointeurs actifs sur la carte (un : glisser, deux : pincer). */
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance = 0;
  private pressOrigin: { x: number; y: number } | null = null;
  private moved = false;

  protected readonly selected = signal<Island>(REFERENCE_ISLAND);

  /** Contours détaillés, chargés à la première sélection. Cf. `loadDetail`. */
  private readonly detail = signal<CoastlineDetail | null>(null);
  private detailRequested = false;

  private readonly bounds = computed(() => boundsOf(ISLANDS, 1.5));

  /** Rectangles des noms d'îles affichés, renseignés par `plotted`. */
  private islandLabelBoxes: readonly LabelBox[] = [];

  /**
   * Fond de carte, projeté sur la même emprise et le même viewBox que les
   * points : les cercles restent exactement là où ils étaient.
   */
  private readonly overviewPath = computed(() =>
    svgPathFromRings(OVERVIEW_RINGS, this.bounds(), MAP_WIDTH, MAP_HEIGHT, MAP_PADDING),
  );

  /** Tous les contours détaillés, projetés sur la carte d'ensemble. */
  private readonly detailPath = computed(() => {
    const detail = this.detail();
    if (!detail || detail.size === 0) {
      return '';
    }
    const rings = [...detail.values()].flat();
    // Trois décimales : encore net au zoom maximal (0,001 unité × 80 ≈ 0,1 px).
    return svgPathFromRings(rings, this.bounds(), MAP_WIDTH, MAP_HEIGHT, MAP_PADDING, 3);
  });

  /** Vrai quand le zoom justifie le détail et qu'il est disponible. */
  protected readonly detailed = computed(
    () => this.zoom() >= DETAIL_ZOOM && this.detailPath() !== '',
  );

  protected readonly landPath = computed(() =>
    this.detailed() ? this.detailPath() : this.overviewPath(),
  );

  /** Méridiens et parallèles tous les 5°, étiquetés sur les bords. */
  protected readonly graticule = computed(() => {
    const bounds = this.bounds();
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const labels: { key: string; x: number; y: number; anchor: 'start' | 'end'; text: string }[] =
      [];
    const project = (lat: number, lon: number) =>
      projectToSvg({ lat, lon }, bounds, MAP_WIDTH, MAP_HEIGHT, MAP_PADDING);

    const firstLat = Math.ceil(bounds.minLat / GRATICULE_STEP) * GRATICULE_STEP;
    for (let lat = firstLat; lat <= bounds.maxLat; lat += GRATICULE_STEP) {
      const a = project(lat, bounds.minLon);
      const b = project(lat, bounds.maxLon);
      lines.push({ key: `lat${lat}`, x1: 0, y1: a.y, x2: MAP_WIDTH, y2: b.y });
      labels.push({ key: `lat${lat}`, x: 2, y: a.y - 1.5, anchor: 'start', text: `${-lat}° S` });
    }
    const firstLon = Math.ceil(bounds.minLon / GRATICULE_STEP) * GRATICULE_STEP;
    for (let lon = firstLon; lon <= bounds.maxLon; lon += GRATICULE_STEP) {
      const a = project(bounds.maxLat, lon);
      lines.push({ key: `lon${lon}`, x1: a.x, y1: 0, x2: a.x, y2: MAP_HEIGHT });
      labels.push({ key: `lon${lon}`, x: a.x + 1.5, y: 7, anchor: 'start', text: `${-lon}° O` });
    }

    return { lines, labels };
  });

  /**
   * Ne promet les contours que s'ils sont là : le jeu de données peut être vide
   * tant que le script d'extraction n'a pas tourné.
   */
  protected readonly mapLabel =
    OVERVIEW_RINGS.length > 0
      ? 'Carte des îles de Polynésie française : traits de côte réels d’OpenStreetMap, îles positionnées selon leurs coordonnées réelles'
      : 'Carte schématique des îles de Polynésie française, positionnées selon leurs coordonnées réelles';

  protected readonly plotted = computed<readonly Plotted[]>(() => {
    const bounds = this.bounds();
    const colorOf = new Map(ARCHIPELAGOS.map((a) => [a.id, `var(${a.colorVar})`]));
    const selectedId = this.selected().id;
    // En zoomant, les voisins s'écartent à l'écran : leurs noms retrouvent la place.
    const zoom = this.zoom();

    // Les coordonnées d'une île visent sa localité de référence : au zoom, on
    // recentre le point sur son contour pour ne pas le confondre avec le village.
    const detail = this.detailed() ? this.detail() : null;
    const points = ISLANDS.map((island) => {
      const rings = detail?.get(island.id);
      const anchor = rings && rings.length > 0 ? centreOfRings(rings) : island;
      const { x, y } = projectToSvg(anchor, bounds, MAP_WIDTH, MAP_HEIGHT, MAP_PADDING);
      return { island, x, y, color: colorOf.get(island.archipelagoId) ?? 'currentColor' };
    });

    // La Société et les Tuamotu du nord sont trop resserrés pour tout étiqueter :
    // on place par priorité, en sautant ce qui tomberait sur un voisin déjà écrit.
    const priority = [...points].sort((a, b) => {
      if (a.island.id === selectedId) return -1;
      if (b.island.id === selectedId) return 1;
      return b.island.areaKm2 - a.island.areaKm2;
    });

    const placed: LabelBox[] = [];
    const labelled = new Set<string>();
    const offsetOf = (point: { x: number }) => (point.x > MAP_WIDTH * 0.72 ? -7 : 7);
    for (const point of priority) {
      const font = point.island.id === selectedId ? 10 : 8;
      const offset = offsetOf(point);
      const placement: Placement = { dx: offset, dy: 3, anchor: offset < 0 ? 'end' : 'start' };
      const box = labelBox(point.x, point.y, point.island.name, font, placement, zoom);
      if (!placed.some((other) => overlaps(other, box))) {
        placed.push(box);
        labelled.add(point.island.id);
      }
    }
    this.islandLabelBoxes = placed;

    return points.map((point) => {
      const offset = offsetOf(point);
      return {
        ...point,
        labelled: labelled.has(point.island.id),
        labelAnchor: offset < 0 ? ('end' as const) : ('start' as const),
        labelOffset: offset,
      };
    });
  });

  /**
   * Localités visibles au zoom courant, projetées comme le reste. Même
   * anti-chevauchement que les îles, les chefs-lieux d'abord.
   */
  protected readonly towns = computed(() => {
    const zoom = this.zoom();
    const bounds = this.bounds();
    // Les noms d'îles sont posés avant : les localités s'écartent d'eux aussi.
    this.plotted();

    const visible = TOWNS.filter((town) => zoom >= TOWN_ZOOM[town.rank])
      .map((town) => ({
        key: `${town.islandId}/${town.name}`,
        name: town.name,
        rank: town.rank,
        ...projectToSvg(town, bounds, MAP_WIDTH, MAP_HEIGHT, MAP_PADDING),
      }))
      .sort((a, b) => a.rank - b.rank);

    const placed: LabelBox[] = [...this.islandLabelBoxes];
    // Les points eux-mêmes sont réservés, pour qu'aucun nom ne recouvre un village.
    for (const town of visible) {
      const r = 3 / zoom;
      placed.push({ left: town.x - r, right: town.x + r, top: town.y - r, bottom: town.y + r });
    }
    return visible.map((town) => {
      const font = town.rank === 1 ? 8 : 7;
      for (const placement of TOWN_PLACEMENTS) {
        const box = labelBox(town.x, town.y, town.name, font, placement, zoom);
        if (!placed.some((other) => overlaps(other, box))) {
          placed.push(box);
          return { ...town, placement };
        }
      }
      return { ...town, placement: null };
    });
  });

  /** Sans échelle, la carte laisse croire que tout est à portée de pirogue. */
  protected readonly scaleBar = computed(() => {
    const bounds = this.bounds();
    const view = this.view();
    const zoom = this.zoom();

    // Kilomètres par unité de viewBox, constants sur la carte (équirectangulaire).
    const midLat = (bounds.minLat + bounds.maxLat) / 2;
    const kmPerDegreeLon = haversineKm(
      { lat: midLat, lon: bounds.minLon },
      { lat: midLat, lon: bounds.minLon + 1 },
    );
    const lonScale = Math.cos((midLat * Math.PI) / 180);
    const unitsPerDegreeLon =
      ((MAP_WIDTH - 2 * MAP_PADDING) * lonScale) / ((bounds.maxLon - bounds.minLon) * lonScale);
    const kmPerUnit = kmPerDegreeLon / unitsPerDegreeLon;

    const target = (view.w / 3) * kmPerUnit;
    const km = SCALE_STEPS_KM.filter((step) => step <= target).pop() ?? SCALE_STEPS_KM[0];
    const x1 = view.x + MAP_PADDING / zoom;

    return { x1, x2: x1 + km / kmPerUnit, y: view.y + view.h - 6 / zoom, label: formatKm(km) };
  });

  /**
   * Contour de l'île sélectionnée, recadré sur lui même : l'encart change
   * d'échelle d'une île à l'autre, d'où sa propre barre de repère.
   */
  protected readonly inset = computed(() => {
    const island = this.selected();
    const rings = this.detail()?.get(island.id);
    if (!rings || rings.length === 0) {
      return null;
    }

    const inner = {
      width: INSET_SIZE - 2 * INSET_PADDING,
      height: INSET_MAP_HEIGHT - 2 * INSET_PADDING,
    };
    const bounds = fitBoundsToAspect(
      boundsOfRings(rings, INSET_MARGIN_RATIO),
      inner.width / inner.height,
    );

    const marker = projectToSvg(island, bounds, INSET_SIZE, INSET_MAP_HEIGHT, INSET_PADDING);
    const scale = this.scaleBarFor(
      bounds,
      INSET_SIZE,
      INSET_MAP_HEIGHT,
      INSET_PADDING,
      INSET_SIZE - 8,
    );

    return {
      path: svgPathFromRings(rings, bounds, INSET_SIZE, INSET_MAP_HEIGHT, INSET_PADDING),
      markerX: marker.x,
      markerY: marker.y,
      ...scale,
    };
  });

  /**
   * Barre d'échelle : la plus grande longueur ronde tenant dans le tiers de la
   * largeur utile, mesurée par haversine à la latitude médiane. Paramétrée
   * plutôt que dupliquée, parce que la carte et l'encart ne couvrent pas le
   * même ordre de grandeur.
   */
  private scaleBarFor(
    bounds: Bounds,
    width: number,
    height: number,
    padding: number,
    baselineY: number,
  ): { x1: number; x2: number; y: number; label: string } {
    const midLat = (bounds.minLat + bounds.maxLat) / 2;
    const west = { lat: midLat, lon: bounds.minLon };

    const kmPerDegreeLon = haversineKm(west, { lat: midLat, lon: bounds.minLon + 1 });
    const target = ((bounds.maxLon - bounds.minLon) * kmPerDegreeLon) / 3;
    const km = SCALE_STEPS_KM.filter((step) => step <= target).pop() ?? SCALE_STEPS_KM[0];

    const a = projectToSvg(west, bounds, width, height, padding);
    const b = projectToSvg(
      { lat: midLat, lon: bounds.minLon + km / kmPerDegreeLon },
      bounds,
      width,
      height,
      padding,
    );

    return { x1: a.x, x2: b.x, y: baselineY, label: formatKm(km) };
  }

  protected readonly grouped = computed(() =>
    ARCHIPELAGOS.map((archipelago) => ({
      id: archipelago.id,
      name: archipelago.name,
      islands: ISLANDS.filter((island) => island.archipelagoId === archipelago.id),
    })).filter((group) => group.islands.length > 0),
  );

  protected readonly distance = computed(() =>
    formatKm(haversineKm(REFERENCE_ISLAND, this.selected())),
  );

  protected readonly direction = computed(() =>
    bearingLabel(initialBearing(REFERENCE_ISLAND, this.selected())),
  );

  protected readonly population = computed(() =>
    new Intl.NumberFormat('fr-FR').format(this.selected().population),
  );

  /** Dérivé de HIKES : aucune île ne déclare ses randonnées de son côté. */
  protected readonly hikeCount = computed(
    () => HIKES.filter((hike) => hike.islandId === this.selected().id).length,
  );

  protected readonly hikeLabel = computed(() => {
    const count = this.hikeCount();
    return count === 1 ? '1 randonnée' : `${count} randonnées`;
  });

  protected readonly flightLabel = computed(() => {
    const minutes = this.selected().flightMinutesFromPapeete ?? 0;
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const rest = minutes % 60;
    return rest === 0
      ? `${Math.floor(minutes / 60)} h`
      : `${Math.floor(minutes / 60)} h ${String(rest).padStart(2, '0')}`;
  });

  protected onSelect(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const found = ISLANDS.find((island) => island.id === id);
    if (found) {
      this.selected.set(found);
    }
    this.loadDetail();
  }

  protected onPointClick(island: Island): void {
    if (this.moved) {
      return;
    }
    this.selected.set(island);
    this.loadDetail();
  }

  protected zoomBy(factor: number): void {
    const { x, y, w, h } = this.view();
    this.zoomAt(factor, x + w / 2, y + h / 2);
  }

  protected resetView(): void {
    this.view.set(FULL_VIEW);
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.002);
    const point = this.toMapUnits(event.clientX, event.clientY);
    this.zoomAt(factor, point.x, point.y);
  }

  protected onDoubleClick(event: MouseEvent): void {
    const point = this.toMapUnits(event.clientX, event.clientY);
    this.zoomAt(2, point.x, point.y);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.map().nativeElement.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size === 1) {
      this.pressOrigin = { x: event.clientX, y: event.clientY };
      this.moved = false;
    } else if (this.pointers.size === 2) {
      this.pinchDistance = this.pinchSpan();
    }
    this.dragging.set(true);
  }

  protected onPointerMove(event: PointerEvent): void {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) {
      return;
    }
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (
      this.pressOrigin &&
      Math.hypot(event.clientX - this.pressOrigin.x, event.clientY - this.pressOrigin.y) >
        CLICK_SLOP_PX
    ) {
      this.moved = true;
    }

    if (this.pointers.size === 1) {
      const scale = this.unitsPerPixel();
      this.panBy((previous.x - event.clientX) * scale, (previous.y - event.clientY) * scale);
    } else if (this.pointers.size === 2) {
      const span = this.pinchSpan();
      if (this.pinchDistance > 0 && span > 0) {
        const [a, b] = [...this.pointers.values()];
        const centre = this.toMapUnits((a.x + b.x) / 2, (a.y + b.y) / 2);
        this.zoomAt(span / this.pinchDistance, centre.x, centre.y);
      }
      this.pinchDistance = span;
      this.moved = true;
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size === 0) {
      this.dragging.set(false);
      this.pressOrigin = null;
    } else if (this.pointers.size === 1) {
      // Fin du pincement : le doigt restant repart d'un glisser propre.
      this.pinchDistance = 0;
    }
  }

  private pinchSpan(): number {
    const [a, b] = [...this.pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  /** Unités de viewBox par pixel écran. Le SVG garde le ratio du viewBox. */
  private unitsPerPixel(): number {
    const rect = this.map().nativeElement.getBoundingClientRect();
    return rect.width > 0 ? this.view().w / rect.width : 1;
  }

  private toMapUnits(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.map().nativeElement.getBoundingClientRect();
    const view = this.view();
    return {
      x: view.x + ((clientX - rect.left) / rect.width) * view.w,
      y: view.y + ((clientY - rect.top) / rect.height) * view.h,
    };
  }

  private panBy(dx: number, dy: number): void {
    const view = this.view();
    this.view.set(this.clamp({ ...view, x: view.x + dx, y: view.y + dy }));
  }

  /** Zoome d'un facteur en gardant le point (cx, cy) fixe à l'écran. */
  private zoomAt(factor: number, cx: number, cy: number): void {
    const view = this.view();
    const w = Math.min(MAP_WIDTH, Math.max(MAP_WIDTH / MAX_ZOOM, view.w / factor));
    const real = view.w / w;
    const h = view.h / real;
    this.view.set(this.clamp({ x: cx - (cx - view.x) / real, y: cy - (cy - view.y) / real, w, h }));

    if (MAP_WIDTH / w >= PRELOAD_ZOOM) {
      this.loadDetail();
    }
  }

  /** La fenêtre ne sort jamais de la carte. */
  private clamp(view: View): View {
    return {
      ...view,
      x: Math.min(Math.max(view.x, 0), MAP_WIDTH - view.w),
      y: Math.min(Math.max(view.y, 0), MAP_HEIGHT - view.h),
    };
  }

  /**
   * Le détail sert à l’encart et au fond de carte zoomé : on ne le charge qu’à la
   * première
   * sélection ou au premier zoom, pour ne pas alourdir l’arrivée. Le chunk est un JS
   * de la même origine, donc déjà précaché — inutile d'annoncer une attente.
   *
   * Un échec laisse simplement l'encart absent : le reste de la page n'en
   * dépend pas.
   */
  private loadDetail(): void {
    if (this.detailRequested) {
      return;
    }
    this.detailRequested = true;

    loadCoastlineDetail().then(
      (detail) => this.detail.set(detail),
      () => this.detail.set(new Map()),
    );
  }
}
