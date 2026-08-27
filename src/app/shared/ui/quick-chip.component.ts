import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Petit bouton pilule : montants rapides du convertisseur, filtres du lexique. */
@Component({
  selector: 'ta-quick-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="min-h-11 rounded-full px-4 text-sm font-medium whitespace-nowrap"
      [class]="
        selected() ? 'bg-accent text-accent-ink' : 'bg-surface-1 text-ink-1 active:bg-surface-2'
      "
      [attr.aria-pressed]="selected()"
      (click)="picked.emit()"
    >
      {{ label() }}
    </button>
  `,
})
export class QuickChipComponent {
  readonly label = input.required<string>();
  readonly selected = input(false);
  readonly picked = output<void>();
}
