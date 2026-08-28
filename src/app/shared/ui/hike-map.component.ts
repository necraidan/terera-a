import { Component, computed, input } from '@angular/core';
import { Bounds, boundsOf, haversineKm, projectToSvg } from '../data/geo';
import {
  BaseMapLineKind,
  COVERAGE_LABELS,
  HikeBaseMap,
  HikeWaypoint,
  TRACK_CREDIT,
  TrackCoverage,
  TrackPoint,
} from '../data/hikes.models';

const MAP_WIDTH = 320;
const MAP_PADDING = 24;

/** Un sentier de crête est long et étroit, un fond de vallée presque carré. */
const MIN_HEIGHT = 170;
const MAX_HEIGHT = 380;

const RAD = Math.PI / 180;

/** Longueurs d'échelle admissibles, en kilomètres. */
const SCALE_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10];

/** Encart de localisation : côté et marge, en unités du viewBox. */
const LOCATOR_SIZE = 74;
const LOCATOR_MARGIN = 8;
const LOCATOR_PADDING = 5;

/** Un sommet trop près d'un point remarquable verrait son libellé se superposer. */
const PEAK_CLEARANCE = 22;

interface Marker {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly anchor: 'start' | 'end';
  readonly labelX: number;
}

interface DrawnLine {
  readonly kind: BaseMapLineKind;
  readonly points: string;
}

interface DrawnPeak {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly anchor: 'start' | 'end';
  readonly labelX: number;
}

/** Ordre de dessin : du fond vers le premier plan, l'eau dessous, le sentier dessus. */
const LINE_ORDER: readonly BaseMapLineKind[] = ['coast', 'river', 'road', 'path'];

/**
 * Plan d'une randonnée : un fond de carte vectoriel, le tracé du sentier, ses
 * points remarquables, une échelle et un encart de localisation sur l'île.
 *
 * Le fond est vectoriel et non raster, et c'est le cœur du compromis. Des
 * tuiles d'image coûteraient des centaines de kilo-octets par sentier, à
 * précharger pour un usage hors ligne, et laisseraient croire à un GPS. Une
 * poignée de polylignes triées, côte, eau, rivières, routes, sentiers voisins
 * et sommets nommés, tient en quelques kilo-octets et répond à la seule
 * question qu'on se pose au départ : où suis-je, et dans quelle direction.
 */
@Component({
  selector: 'ta-hike-map',
  template: `
    @let box = geometry();

    <svg
      [attr.viewBox]="'0 0 ' + box.width + ' ' + box.height"
      class="w-full"
      role="img"
      [attr.aria-label]="description()"
    >
      <!-- Le fond, du plus étendu au plus fin. L'eau en aplat très pâle : sur
           une île, c'est le repère qui se lit sans y penser. -->
      @for (polygon of waterAreas(); track $index) {
        <polygon
          [attr.points]="polygon"
          fill="currentColor"
          fill-opacity="0.14"
          stroke="currentColor"
          stroke-opacity="0.3"
          stroke-width="0.8"
          class="text-accent"
        />
      }

      @for (line of baseLines(); track $index) {
        <polyline
          [attr.points]="line.points"
          fill="none"
          stroke="currentColor"
          [attr.stroke-width]="lineStyles[line.kind].width"
          [attr.stroke-opacity]="lineStyles[line.kind].opacity"
          [attr.stroke-dasharray]="lineStyles[line.kind].dash"
          stroke-linecap="round"
          stroke-linejoin="round"
          [class]="lineStyles[line.kind].color"
        />
      }

      @for (peak of peaks(); track peak.label) {
        <path
          [attr.transform]="'translate(' + peak.x + ', ' + peak.y + ')'"
          d="M0 -3.5 L3 2 L-3 2 Z"
          fill="currentColor"
          fill-opacity="0.5"
          class="text-ink-2"
        />
        <text
          [attr.x]="peak.labelX"
          [attr.y]="peak.y + 2.5"
          [attr.text-anchor]="peak.anchor"
          class="fill-current text-ink-2"
          style="font-size: 8px"
        >
          {{ peak.label }}
        </text>
      }

      <!-- Le tracé, dessiné en deux passes : un liseré clair dessous pour le
           détacher du fond sur les deux thèmes, la ligne d'accent dessus.
           L'attribut data-role distingue le sentier des lignes du décor, qui
           sont des polylignes comme lui. -->
      <polyline
        data-role="track-casing"
        [attr.points]="polyline()"
        fill="none"
        stroke="var(--color-surface-1)"
        [attr.stroke-width]="5.5"
        stroke-opacity="0.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <polyline
        data-role="track"
        [attr.points]="polyline()"
        fill="none"
        stroke="currentColor"
        [attr.stroke-width]="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.stroke-dasharray]="coverage() === 'partiel' ? '7 4' : null"
        class="text-accent"
      />

      @for (marker of markers(); track marker.label) {
        <circle
          [attr.cx]="marker.x"
          [attr.cy]="marker.y"
          r="4.5"
          fill="currentColor"
          stroke="var(--color-surface-1)"
          stroke-width="2"
          class="text-ink-1"
        />
        <text
          [attr.x]="marker.labelX"
          [attr.y]="marker.y + 3.5"
          [attr.text-anchor]="marker.anchor"
          class="fill-current text-ink-1"
          style="font-size: 10px; font-weight: 600"
        >
          {{ marker.label }}
        </text>
      }

      <!-- Échelle : sans elle, un plan sans fond de carte ne dit rien de la
           distance réelle, et deux sentiers très différents se ressemblent. -->
      <line
        [attr.x1]="scale().x1"
        [attr.y1]="scale().y"
        [attr.x2]="scale().x2"
        [attr.y2]="scale().y"
        stroke="currentColor"
        stroke-width="1.5"
        class="text-ink-2"
      />
      <text
        [attr.x]="scale().x1"
        [attr.y]="scale().y - 5"
        class="fill-current text-ink-2"
        style="font-size: 9px"
      >
        {{ scale().label }}
      </text>

      <!-- Rose des vents réduite au nord : la projection est équirectangulaire,
           le nord est donc toujours vers le haut du cadre. -->
      <g [attr.transform]="'translate(' + compassX() + ', 18)'" class="text-ink-2">
        <path
          d="M0 12 L0 -8 M0 -8 L-4 -3 M0 -8 L4 -3"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
        <text
          x="0"
          y="22"
          text-anchor="middle"
          class="fill-current"
          style="font-size: 8px; font-weight: 600"
        >
          N
        </text>
      </g>

      <!-- Encart de localisation : à cette échelle, le plan ne dit pas où l'on
           se trouve sur l'île. La silhouette et un point y répondent. -->
      @let inset = locator();
      @if (inset) {
        <g [attr.transform]="'translate(' + inset.x + ', ' + inset.y + ')'">
          <rect
            [attr.width]="inset.size"
            [attr.height]="inset.size"
            rx="4"
            fill="var(--color-surface-1)"
            stroke="currentColor"
            stroke-opacity="0.25"
            stroke-width="0.8"
            class="text-ink-2"
          />
          @for (ring of inset.rings; track $index) {
            <polygon
              [attr.points]="ring"
              fill="currentColor"
              fill-opacity="0.22"
              stroke="currentColor"
              stroke-opacity="0.6"
              stroke-width="0.7"
              class="text-ink-2"
            />
          }
          <circle
            [attr.cx]="inset.dotX"
            [attr.cy]="inset.dotY"
            r="3"
            fill="currentColor"
            stroke="var(--color-surface-1)"
            stroke-width="1.2"
            class="text-accent"
          />
        </g>
      }
    </svg>

    <p class="mt-1 text-xs text-ink-2">
      {{ coverageLabels[coverage()] }}. Schéma d’orientation, pas un outil de navigation : le
      sentier n’est pas balisé sur le terrain.
    </p>
    <p class="text-xs text-ink-2">{{ credit }}.</p>
  `,
})
export class HikeMapComponent {
  readonly track = input.required<readonly TrackPoint[]>();
  readonly waypoints = input<readonly HikeWaypoint[]>([]);
  readonly coverage = input.required<TrackCoverage>();
  /** Nom de la randonnée, pour l'alternative textuelle du plan. */
  readonly name = input.required<string>();
  /** Décor : côte, eau, rivières, routes, sentiers voisins, sommets nommés. */
  readonly basemap = input<HikeBaseMap>();
  /** Silhouette de l'île, pour l'encart de localisation. */
  readonly outline = input<readonly (readonly TrackPoint[])[]>();

  protected readonly coverageLabels = COVERAGE_LABELS;
  protected readonly credit = TRACK_CREDIT;

  /**
   * Le décor doit rester du décor : le sentier est la seule ligne saturée et
   * épaisse du plan, tout le reste est en retrait.
   */
  protected readonly lineStyles: Readonly<
    Record<BaseMapLineKind, { width: number; opacity: number; dash: string | null; color: string }>
  > = {
    coast: { width: 1.6, opacity: 0.55, dash: null, color: 'text-accent' },
    river: { width: 1, opacity: 0.45, dash: null, color: 'text-accent' },
    road: { width: 1.8, opacity: 0.45, dash: null, color: 'text-ink-2' },
    path: { width: 1, opacity: 0.35, dash: '2 3', color: 'text-ink-2' },
  };

  private readonly points = computed(() => this.track().map(([lat, lon]) => ({ lat, lon })));

  /**
   * Cadre du plan, ajusté pour que le tracé ne soit pas déformé.
   *
   * Le raisonnement porte sur le cadre intérieur, marges déduites : c'est lui
   * que `projectToSvg` remplit. Caler la forme du sentier sur le viewBox entier
   * étirerait le tracé du rapport des marges, soit dix pour cent ici, ce qui
   * fausserait les directions et l'échelle.
   *
   * La hauteur suit d'abord la forme du sentier, puis le cadre est élargi sur
   * l'axe le plus court pour retomber exactement sur le bon rapport.
   */
  protected readonly geometry = computed<{
    readonly width: number;
    readonly height: number;
    readonly bounds: Bounds;
  }>(() => {
    const raw = boundsOf(this.points());
    const midLat = (raw.minLat + raw.maxLat) / 2;
    const cosLat = Math.cos(midLat * RAD);

    // Marge autour du tracé, pour les libellés et pour ne pas coller aux bords.
    const margin = 0.12;
    const latSpan = Math.max(raw.maxLat - raw.minLat, 0.0005);
    const lonSpan = Math.max(raw.maxLon - raw.minLon, 0.0005);
    let minLat = raw.minLat - latSpan * margin;
    let maxLat = raw.maxLat + latSpan * margin;
    let minLon = raw.minLon - lonSpan * margin;
    let maxLon = raw.maxLon + lonSpan * margin;

    // Unités de projection : la longitude y est déjà corrigée par le cosinus.
    const xSpan = (maxLon - minLon) * cosLat;
    const ySpan = maxLat - minLat;

    const innerWidth = MAP_WIDTH - 2 * MAP_PADDING;
    const innerHeight = Math.min(
      MAX_HEIGHT - 2 * MAP_PADDING,
      Math.max(MIN_HEIGHT - 2 * MAP_PADDING, (innerWidth * ySpan) / xSpan),
    );

    const wantedYSpan = (xSpan * innerHeight) / innerWidth;
    if (wantedYSpan > ySpan) {
      const pad = (wantedYSpan - ySpan) / 2;
      minLat -= pad;
      maxLat += pad;
    } else {
      const wantedXSpan = (ySpan * innerWidth) / innerHeight;
      const pad = (wantedXSpan - xSpan) / cosLat / 2;
      minLon -= pad;
      maxLon += pad;
    }

    return {
      width: MAP_WIDTH,
      height: innerHeight + 2 * MAP_PADDING,
      bounds: { minLat, maxLat, minLon, maxLon },
    };
  });

  private project(point: { lat: number; lon: number }) {
    const { width, height, bounds } = this.geometry();
    return projectToSvg(point, bounds, width, height, MAP_PADDING);
  }

  protected readonly polyline = computed(() => this.path(this.track()));

  private path(points: readonly TrackPoint[]): string {
    return points
      .map(([lat, lon]) => {
        const { x, y } = this.project({ lat, lon });
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  protected readonly waterAreas = computed(() =>
    (this.basemap()?.water ?? []).map((polygon) => this.path(polygon)),
  );

  protected readonly baseLines = computed<readonly DrawnLine[]>(() => {
    const lines = this.basemap()?.lines ?? [];
    // L'ordre de dessin est celui du tableau : la côte au fond, les sentiers
    // voisins juste sous le tracé.
    return LINE_ORDER.flatMap((kind) =>
      lines
        .filter((line) => line.kind === kind)
        .map((line) => ({ kind, points: this.path(line.points) })),
    );
  });

  protected readonly peaks = computed<readonly DrawnPeak[]>(() => {
    const { width, height } = this.geometry();
    const markers = this.markers();

    return (this.basemap()?.peaks ?? [])
      .map((peak) => {
        const { x, y } = this.project(peak);
        const label = peak.ele === undefined ? peak.name : `${peak.name} ${formatEle(peak.ele)}`;
        const toLeft = x > width * 0.55;
        return {
          x,
          y,
          label,
          anchor: toLeft ? ('end' as const) : ('start' as const),
          labelX: toLeft ? x - 6 : x + 6,
        };
      })
      .filter((peak) => {
        // Hors cadre, sous l'encart, ou trop près d'un point remarquable dont
        // le libellé compte davantage : on l'écarte plutôt que d'empiler du
        // texte sur un écran de téléphone.
        const inside =
          peak.x > 4 && peak.x < width - 4 && peak.y > MAP_PADDING / 2 && peak.y < height - 16;
        const clear = markers.every(
          (marker) => Math.hypot(marker.x - peak.x, marker.y - peak.y) > PEAK_CLEARANCE,
        );
        const corner = this.locatorCorner();
        const underLocator =
          this.outline() !== undefined &&
          peak.x > corner.x - 30 &&
          peak.x < corner.x + LOCATOR_SIZE + 4 &&
          peak.y > corner.y - 6 &&
          peak.y < corner.y + LOCATOR_SIZE + 4;
        return inside && clear && !underLocator;
      });
  });

  /**
   * Coin le plus libre pour l'encart. Il est dessiné en dernier, sur un fond
   * opaque : posé au hasard, il masque un libellé de point remarquable, ce qui
   * est exactement ce qu'on ne veut pas d'un repère censé aider.
   */
  private readonly locatorCorner = computed(() => {
    const { width, height } = this.geometry();
    const obstacles = [
      ...this.points().map((point) => this.project(point)),
      ...this.markers().flatMap((marker) => labelBox(marker)),
    ];

    // Les pénalités n'expriment qu'une préférence : l'échelle et la rose des
    // vents s'écartent ensuite du coin retenu, plutôt que de l'interdire.
    const right = width - LOCATOR_SIZE - LOCATOR_MARGIN;
    const bottom = height - LOCATOR_SIZE - LOCATOR_MARGIN;
    const candidates = [
      { x: right, y: bottom, penalty: 0, corner: 'bas-droite' as const },
      { x: LOCATOR_MARGIN, y: LOCATOR_MARGIN, penalty: 2, corner: 'haut-gauche' as const },
      { x: LOCATOR_MARGIN, y: bottom, penalty: 4, corner: 'bas-gauche' as const },
      { x: right, y: LOCATOR_MARGIN, penalty: 6, corner: 'haut-droite' as const },
    ];

    let best = candidates[0];
    let bestScore = -Infinity;
    for (const candidate of candidates) {
      const hits = obstacles.filter(
        (point) =>
          point.x > candidate.x - 4 &&
          point.x < candidate.x + LOCATOR_SIZE + 4 &&
          point.y > candidate.y - 4 &&
          point.y < candidate.y + LOCATOR_SIZE + 4,
      ).length;
      const score = -hits * 10 - candidate.penalty;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  });

  /**
   * Encart de localisation, projeté dans son propre carré : la silhouette de
   * l'île, et un point au milieu du sentier. À l'échelle d'une vallée, le plan
   * ne dit pas de lui même où l'on se trouve sur l'île.
   */
  protected readonly locator = computed(() => {
    const rings = this.outline();
    if (!rings || rings.length === 0) {
      return null;
    }

    const all = rings.flat().map(([lat, lon]) => ({ lat, lon }));
    const bounds = boundsOf(all);
    const midLat = (bounds.minLat + bounds.maxLat) / 2;
    const cosLat = Math.cos(midLat * RAD);

    // Carré à l'échelle de l'île : on garde le plus grand des deux axes pour ne
    // pas déformer la silhouette.
    const xSpan = (bounds.maxLon - bounds.minLon) * cosLat;
    const ySpan = bounds.maxLat - bounds.minLat;
    const span = Math.max(xSpan, ySpan);
    const square: Bounds = {
      minLat: midLat - span / 2,
      maxLat: midLat + span / 2,
      minLon: (bounds.minLon + bounds.maxLon) / 2 - span / cosLat / 2,
      maxLon: (bounds.minLon + bounds.maxLon) / 2 + span / cosLat / 2,
    };

    const place = (point: { lat: number; lon: number }) =>
      projectToSvg(point, square, LOCATOR_SIZE, LOCATOR_SIZE, LOCATOR_PADDING);

    const trackPoints = this.points();
    const middle = trackPoints[Math.floor(trackPoints.length / 2)];
    const dot = place(middle);
    const corner = this.locatorCorner();

    return {
      x: corner.x,
      y: corner.y,
      size: LOCATOR_SIZE,
      rings: rings.map((ring) =>
        ring
          .map(([lat, lon]) => {
            const { x, y } = place({ lat, lon });
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' '),
      ),
      dotX: dot.x,
      dotY: dot.y,
    };
  });

  protected readonly markers = computed<readonly Marker[]>(() => {
    const { width } = this.geometry();
    return this.waypoints().map((waypoint) => {
      const { x, y } = this.project(waypoint);
      const toLeft = x > width * 0.55;
      return {
        x,
        y,
        label: waypoint.label,
        anchor: toLeft ? ('end' as const) : ('start' as const),
        labelX: toLeft ? x - 8 : x + 8,
      };
    });
  });

  protected readonly scale = computed(() => {
    const { width, height, bounds } = this.geometry();
    const midLat = (bounds.minLat + bounds.maxLat) / 2;

    const kmPerDegreeLon = haversineKm(
      { lat: midLat, lon: bounds.minLon },
      { lat: midLat, lon: bounds.minLon + 1 },
    );
    const spanKm = (bounds.maxLon - bounds.minLon) * kmPerDegreeLon;

    // La graduation la plus grande qui tient dans le tiers du cadre.
    const target = spanKm / 3;
    const km = SCALE_STEPS.filter((step) => step <= target).at(-1) ?? SCALE_STEPS[0];

    const start = { lat: midLat, lon: bounds.minLon };
    const end = { lat: midLat, lon: bounds.minLon + km / kmPerDegreeLon };
    const a = projectToSvg(start, bounds, width, height, MAP_PADDING);
    const b = projectToSvg(end, bounds, width, height, MAP_PADDING);
    const barLength = b.x - a.x;

    // L'échelle cède le bas gauche à l'encart quand il s'y installe : deux
    // repères empilés n'en font plus aucun.
    const toRight = this.locatorCorner().corner === 'bas-gauche';
    const x1 = toRight ? width - MAP_PADDING - barLength : a.x;

    return {
      x1,
      x2: x1 + barLength,
      y: height - 8,
      label: km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`,
    };
  });

  /** La rose des vents cède de même le haut droite à l'encart. */
  protected readonly compassX = computed(() => {
    const { width } = this.geometry();
    return this.locatorCorner().corner === 'haut-droite' ? 18 : width - 16;
  });

  protected readonly description = computed(() => {
    const labels = this.waypoints().map((waypoint) => waypoint.label);
    const between = labels.length > 0 ? `, de ${labels[0]} à ${labels.at(-1)}` : '';
    return `Plan du sentier de ${this.name()}${between}`;
  });
}

/** `1 493 m`. Un sommet à quatre chiffres se lit mal sans séparateur. */
function formatEle(metres: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(metres)} m`;
}

/**
 * Échantillonne l'emprise d'un libellé, faute de pouvoir mesurer le texte hors
 * d'un navigateur. Quatre virgule six unités par caractère est une estimation
 * large pour du gras à dix pixels : mieux vaut surestimer et déplacer l'encart
 * pour rien que masquer un nom de sommet.
 */
function labelBox(marker: Marker): readonly { readonly x: number; readonly y: number }[] {
  const span = marker.label.length * 4.6;
  const from = marker.anchor === 'end' ? marker.labelX - span : marker.labelX;
  const samples = [{ x: marker.x, y: marker.y }];
  for (let step = 0; step <= 4; step += 1) {
    samples.push({ x: from + (step / 4) * span, y: marker.y });
  }
  return samples;
}
