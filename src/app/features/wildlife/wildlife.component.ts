import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MARINE_SPECIES } from '../../shared/data/wildlife.data';
import { MarineRisk, RISK_CLASSES, RISK_LABELS } from '../../shared/data/wildlife.models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { QuickChipComponent } from '../../shared/ui/quick-chip.component';

type Filter = 'tout' | 'saison' | 'prudence';

@Component({
  selector: 'ta-wildlife',
  imports: [RouterLink, PageHeaderComponent, QuickChipComponent],
  template: `
    <ta-page-header width="wide" title="Faune marine" />

    <main class="page-wide pb-28">
      <a
        routerLink="/faune/regles"
        class="flex items-center gap-3 rounded-card bg-surface-2 p-3 active:opacity-80"
      >
        <span class="text-xl" aria-hidden="true">⚖️</span>
        <span class="min-w-0 flex-1 text-sm">
          <span class="block font-semibold">Ce que dit la loi</span>
          <span class="block text-ink-2">
            Sanctuaire des mammifères marins, distances d’approche, nourrissage interdit.
          </span>
        </span>
        <span class="text-ink-2" aria-hidden="true">›</span>
      </a>

      <div class="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <ta-quick-chip
          label="Tout"
          [selected]="filter() === 'tout'"
          (picked)="filter.set('tout')"
        />
        <ta-quick-chip
          label="🗓️ Saisonnier"
          [selected]="filter() === 'saison'"
          (picked)="filter.set('saison')"
        />
        <ta-quick-chip
          label="⚠️ Prudence"
          [selected]="filter() === 'prudence'"
          (picked)="filter.set('prudence')"
        />
      </div>

      @if (visible().length === 0) {
        <p class="mt-8 text-center text-ink-2">Aucune espèce dans cette sélection.</p>
      }

      <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (species of visible(); track species.id) {
          <li>
            <a
              [routerLink]="['/faune', species.id]"
              class="block h-full overflow-hidden rounded-card bg-surface-1 active:bg-surface-2"
            >
              <span class="relative block">
                <img
                  [src]="species.image"
                  [alt]="species.nameFr"
                  class="aspect-3/2 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  class="absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-xs font-semibold"
                  [class]="riskClasses[species.risk]"
                >
                  {{ riskLabels[species.risk] }}
                </span>
              </span>
              <span class="block p-4">
                <span class="block font-semibold">{{ species.nameFr }}</span>
                @if (species.nameTy) {
                  <span class="block text-sm text-accent">{{ species.nameTy }}</span>
                }
                <span class="mt-1 block text-sm text-ink-2 italic">{{ species.nameSci }}</span>
              </span>
            </a>
          </li>
        }
      </ul>

      <p class="mt-8 text-sm text-ink-2">
        Le niveau de risque indiqué est celui couru par l’humain. Dans l’autre sens, presque toutes
        ces espèces sont protégées : ne touchez rien, ne nourrissez rien.
      </p>
    </main>
  `,
})
export class WildlifeComponent {
  protected readonly riskLabels = RISK_LABELS;
  protected readonly riskClasses = RISK_CLASSES;

  protected readonly filter = signal<Filter>('tout');

  protected readonly visible = computed(() => {
    switch (this.filter()) {
      case 'saison':
        // Les espèces réellement saisonnières : celles dont la présence n'est
        // pas annoncée comme continue.
        return MARINE_SPECIES.filter(
          (species) => !/toute l’année|toute l'année/i.test(species.season),
        );
      case 'prudence':
        return MARINE_SPECIES.filter((species) => isCautious(species.risk));
      default:
        return MARINE_SPECIES;
    }
  });
}

function isCautious(risk: MarineRisk): boolean {
  return risk === 'modere' || risk === 'eleve';
}
