import { Component, computed, signal } from '@angular/core';
import {
  bearingLabel,
  boundsOf,
  formatKm,
  haversineKm,
  initialBearing,
  projectToSvg,
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

/** Dimensions du viewBox de la carte. */
const MAP_WIDTH = 320;
const MAP_HEIGHT = 380;
const MAP_PADDING = 18;

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
          aria-label="Carte schématique des îles de Polynésie française, positionnées selon leurs coordonnées réelles"
        >
          <!-- Repère de l'échelle : un segment de 500 km. -->
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
            500 km
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

  protected readonly selected = signal<Island>(REFERENCE_ISLAND);

  private readonly bounds = computed(() => boundsOf(ISLANDS, 1.5));

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
  protected readonly scaleBar = computed(() => {
    const bounds = this.bounds();
    const midLat = (bounds.minLat + bounds.maxLat) / 2;

    // Largeur en pixels d'un segment de 500 km à la latitude médiane.
    const west = { lat: midLat, lon: bounds.minLon };
    const kmPerDegreeLon = haversineKm(west, { lat: midLat, lon: bounds.minLon + 1 });
    const degrees = 500 / kmPerDegreeLon;

    const a = projectToSvg(west, bounds, MAP_WIDTH, MAP_HEIGHT, MAP_PADDING);
    const b = projectToSvg(
      { lat: midLat, lon: bounds.minLon + degrees },
      bounds,
      MAP_WIDTH,
      MAP_HEIGHT,
      MAP_PADDING,
    );

    return { x1: a.x, x2: b.x, y: MAP_HEIGHT - 6 };
  });

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
  }
}
