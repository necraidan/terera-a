import { Component, computed, input } from '@angular/core';
import { PRACTICAL_SHEETS } from '../../shared/data/practical.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'ta-practical-detail',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header width="wide" [title]="sheet()?.title ?? 'Fiche introuvable'" backTo="/infos" />

    <main class="page-wide">
      @let current = sheet();

      @if (current) {
        <p class="mb-4 max-w-prose text-ink-2">{{ current.summary }}</p>

        <div class="gap-x-8 lg:columns-2">
          @for (section of current.sections; track $index) {
            @switch (section.kind) {
              @case ('paragraph') {
                <p class="mb-4 leading-relaxed break-inside-avoid">{{ section.text }}</p>
              }
              @case ('facts') {
                <dl class="mb-4 overflow-hidden rounded-card bg-surface-1 break-inside-avoid">
                  @for (item of section.items; track item.label) {
                    <div
                      class="flex items-baseline justify-between gap-3 border-b border-surface-2 p-3 last:border-b-0"
                    >
                      <dt class="text-sm text-ink-2">{{ item.label }}</dt>
                      <dd class="text-right font-semibold">
                        @if (item.href) {
                          <a [href]="item.href" class="text-accent underline underline-offset-2">
                            {{ item.value }}
                          </a>
                        } @else {
                          {{ item.value }}
                        }
                      </dd>
                    </div>
                  }
                </dl>
              }
              @case ('list') {
                <ul class="mb-4 grid gap-2 break-inside-avoid">
                  @for (item of section.items; track $index) {
                    <li class="flex gap-2 leading-relaxed">
                      <span class="text-accent" aria-hidden="true">•</span>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              }
            }
          }
        </div>
      } @else {
        <p class="text-ink-2">Cette fiche n’existe pas. Revenez à la liste des infos pratiques.</p>
      }
    </main>
  `,
})
export class PracticalDetailComponent {
  /** Alimenté par le paramètre de route grâce à `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly sheet = computed(() =>
    PRACTICAL_SHEETS.find((sheet) => sheet.id === this.id()),
  );
}
