import { Component, computed, signal } from '@angular/core';
import { CoastlineDetail, OVERVIEW_RINGS, loadCoastlineDetail } from '../../shared/data/coastlines';
import {
  Bounds,
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
import {
  ARCHIPELAGOS,
  ISLANDS,
  REFERENCE_ISLAND,
  SCALE_NOTES,
  SEA_LINKS,
} from '../../shared/data/islands.data';
import { Island } from '../../shared/data/islands.models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

/** Dimensions du viewBox de la carte. Cf. scripts/build-coastlines.js. */
const MAP_WIDTH = 320;
const MAP_HEIGHT = 380;
const MAP_PADDING = 18;

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
  readonly labelX: number;
}

/** Distance minimale, en unités du viewBox, entre deux libellés affichés. */
const LABEL_SPACING = 24;

@Component({
  selector: 'ta-islands',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header width="wide" title="Carte et distances" />

    <main class="page-wide pb-28">
      <section class="rounded-card bg-surface-1 p-3">
        <svg
          [attr.viewBox]="'0 0 ' + mapWidth + ' ' + mapHeight"
          class="w-full"
          role="img"
          [attr.aria-label]="mapLabel"
        >
          <!--
            Fond de carte. À cette échelle la plupart des îles font moins d'un
            pixel : le remplissage sans contour donne le contexte, un tracé
            fermerait des formes illisibles.
          -->
          @if (landPath()) {
            <path [attr.d]="landPath()" fill="var(--color-ink-2)" fill-opacity="0.3" />
          }

          <!-- Repère de l'échelle. -->
          <line
            [attr.x1]="scaleBar().x1"
            [attr.y1]="scaleBar().y"
            [attr.x2]="scaleBar().x2"
            [attr.y2]="scaleBar().y"
            stroke="currentColor"
            stroke-width="1.5"
            class="text-ink-2"
          />
          <text
            [attr.x]="scaleBar().x1"
            [attr.y]="scaleBar().y - 5"
            class="fill-current text-ink-2"
            style="font-size: 9px"
          >
            {{ scaleBar().label }}
          </text>

          @for (point of plotted(); track point.island.id) {
            <circle
              [attr.cx]="point.x"
              [attr.cy]="point.y"
              [attr.r]="point.island.id === selected().id ? 6 : 3.5"
              [attr.fill]="point.color"
              [attr.stroke]="point.island.id === selected().id ? 'currentColor' : 'none'"
              stroke-width="1.5"
              class="text-ink-1"
            />
            @if (point.labelled) {
              <text
                [attr.x]="point.labelX"
                [attr.y]="point.y + 3"
                [attr.text-anchor]="point.labelAnchor"
                class="fill-current"
                [class]="point.island.id === selected().id ? 'text-ink-1' : 'text-ink-2'"
                [style.font-size.px]="point.island.id === selected().id ? 10 : 8"
                [style.font-weight]="point.island.id === selected().id ? 700 : 400"
              >
                {{ point.island.name }}
              </text>
            }
          }
        </svg>

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
            pas chargé, et pour une île qui n'y figure pas : l'encart disparaît,
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

  protected readonly mapWidth = MAP_WIDTH;
  protected readonly mapHeight = MAP_HEIGHT;
  protected readonly insetSize = INSET_SIZE;

  protected readonly selected = signal<Island>(REFERENCE_ISLAND);

  /** Contours détaillés, chargés à la première sélection. Cf. `loadDetail`. */
  private readonly detail = signal<CoastlineDetail | null>(null);
  private detailRequested = false;

  private readonly bounds = computed(() => boundsOf(ISLANDS, 1.5));

  /**
   * Fond de carte, projeté sur la même emprise et le même viewBox que les
   * points : les cercles restent exactement là où ils étaient.
   */
  protected readonly landPath = computed(() =>
    svgPathFromRings(OVERVIEW_RINGS, this.bounds(), MAP_WIDTH, MAP_HEIGHT, MAP_PADDING),
  );

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

    const points = ISLANDS.map((island) => {
      const { x, y } = projectToSvg(island, bounds, MAP_WIDTH, MAP_HEIGHT, MAP_PADDING);
      return { island, x, y, color: colorOf.get(island.archipelagoId) ?? 'currentColor' };
    });

    // La Société et les Tuamotu du nord sont trop resserrés pour tout étiqueter :
    // on place par priorité, en sautant ce qui tomberait sur un voisin déjà écrit.
    const priority = [...points].sort((a, b) => {
      if (a.island.id === selectedId) return -1;
      if (b.island.id === selectedId) return 1;
      return b.island.areaKm2 - a.island.areaKm2;
    });

    const placed: { x: number; y: number }[] = [];
    const labelled = new Set<string>();
    for (const point of priority) {
      const clashes = placed.some(
        (other) => Math.hypot(other.x - point.x, other.y - point.y) < LABEL_SPACING,
      );
      if (!clashes) {
        placed.push({ x: point.x, y: point.y });
        labelled.add(point.island.id);
      }
    }

    return points.map((point) => {
      const toLeft = point.x > MAP_WIDTH * 0.72;
      return {
        ...point,
        labelled: labelled.has(point.island.id),
        labelAnchor: toLeft ? ('end' as const) : ('start' as const),
        labelX: toLeft ? point.x - 7 : point.x + 7,
      };
    });
  });

  /** Sans échelle, la carte laisse croire que tout est à portée de pirogue. */
  protected readonly scaleBar = computed(() =>
    this.scaleBarFor(this.bounds(), MAP_WIDTH, MAP_HEIGHT, MAP_PADDING, MAP_HEIGHT - 6),
  );

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

  /**
   * Le détail ne sert qu'à l'encart : on ne le charge qu'à la première
   * sélection, pour ne pas alourdir l'arrivée sur la carte. Le chunk est un JS
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
