import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Tuile de la grille d'accueil : emoji, nom de l'outil, courte accroche. */
@Component({
  selector: 'ta-tool-card',
  imports: [RouterLink],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <a
      [routerLink]="route()"
      class="flex h-full flex-col gap-1 rounded-card bg-surface-1 p-4 shadow-sm transition-transform active:scale-[0.97]"
    >
      <span class="text-3xl leading-none" aria-hidden="true">{{ icon() }}</span>
      <span class="mt-1 font-semibold">{{ label() }}</span>
      <span class="text-sm text-ink-2">{{ hint() }}</span>
    </a>
  `,
})
export class ToolCardComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly hint = input.required<string>();
  readonly route = input.required<string>();
}
