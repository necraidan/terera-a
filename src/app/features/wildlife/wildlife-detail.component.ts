import { Component, computed, input } from '@angular/core';
import { MARINE_SPECIES } from '../../shared/data/wildlife.data';
import { RISK_CLASSES, RISK_LABELS } from '../../shared/data/wildlife.models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'ta-wildlife-detail',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header
      width="wide"
      [title]="species()?.nameFr ?? 'Espèce introuvable'"
      backTo="/faune"
      backLabel="Retour à la faune marine"
    />

    <main class="page-wide pb-28">
      @let current = species();

      @if (current) {
        <div class="overflow-hidden rounded-card bg-surface-1 sm:flex sm:max-w-3xl">
          <img
            [src]="current.image"
            [alt]="current.nameFr"
            class="aspect-3/2 w-full object-cover sm:w-1/2 sm:max-w-md lg:w-2/5"
            decoding="async"
          />
          <div class="min-w-0 flex-1 p-4">
            @if (current.nameTy) {
              <p class="font-semibold text-accent">{{ current.nameTy }}</p>
            }
            <p class="text-sm text-ink-2 italic">{{ current.nameSci }}</p>
            <span
              class="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
              [class]="riskClasses[current.risk]"
            >
              {{ riskLabels[current.risk] }}
            </span>
            <p class="mt-2 text-xs text-ink-2">Photo : {{ current.photoCredit }}.</p>
          </div>
        </div>

        <div class="mt-3 gap-x-3 lg:columns-2">
          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">🗓️ Quand</h2>
            <p class="mt-1 text-sm leading-relaxed">{{ current.season }}</p>
          </section>

          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">📍 Où et comment</h2>
            <p class="mt-1 text-sm leading-relaxed">{{ current.where }}</p>
            <p class="mt-3 text-sm">
              <span class="text-ink-2">Taille :</span>
              {{ current.sizeTypical }}
            </p>
          </section>

          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">⚠️ Le risque, honnêtement</h2>
            <p class="mt-1 text-sm leading-relaxed">{{ current.riskNote }}</p>
          </section>

          <section class="mb-3 rounded-card bg-surface-1 p-4 break-inside-avoid">
            <h2 class="font-semibold">✅ Règles d’approche</h2>
            <ul class="mt-2 grid gap-2">
              @for (rule of current.rules; track $index) {
                <li class="flex gap-2 text-sm leading-relaxed">
                  <span class="text-accent" aria-hidden="true">•</span>
                  <span>{{ rule }}</span>
                </li>
              }
            </ul>
          </section>

          <section class="mb-3 rounded-card bg-surface-2 p-4 break-inside-avoid">
            <h2 class="font-semibold">⚖️ Protection</h2>
            <p class="mt-1 text-sm leading-relaxed">{{ current.protection }}</p>
          </section>
        </div>
      } @else {
        <p class="text-ink-2">Cette espèce n’existe pas dans le guide.</p>
      }
    </main>
  `,
})
export class WildlifeDetailComponent {
  /** Alimenté par le paramètre de route grâce à `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly riskLabels = RISK_LABELS;
  protected readonly riskClasses = RISK_CLASSES;

  protected readonly species = computed(() =>
    MARINE_SPECIES.find((species) => species.id === this.id()),
  );
}
