import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRACTICAL_SHEETS } from '../../shared/data/practical.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'ta-practical',
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <ta-page-header width="wide" title="Infos pratiques" />

    <main class="page-wide pb-28">
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (sheet of sheets; track sheet.id) {
          <li>
            <a
              [routerLink]="['/infos', sheet.id]"
              class="flex items-center gap-3 rounded-card bg-surface-1 p-4 active:bg-surface-2"
            >
              <span class="text-2xl" aria-hidden="true">{{ sheet.icon }}</span>
              <span class="min-w-0 flex-1">
                <span class="block font-semibold">{{ sheet.title }}</span>
                <span class="block text-sm text-ink-2">{{ sheet.summary }}</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                class="size-5 shrink-0 text-ink-2"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </li>
        }
      </ul>
    </main>
  `,
})
export class PracticalComponent {
  protected readonly sheets = PRACTICAL_SHEETS;
}
