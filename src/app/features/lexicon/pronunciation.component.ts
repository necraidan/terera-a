import { Component } from '@angular/core';
import { PRONUNCIATION_RULES } from '../../shared/data/pronunciation.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'ta-pronunciation',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header
      width="prose"
      title="Prononcer le tahitien"
      backTo="/lexique"
      backLabel="Retour au lexique"
    />

    <main class="page-prose pb-28">
      <p class="rounded-card bg-surface-2 p-3 text-sm leading-relaxed">
        Dix règles suffisent à prononcer correctement la plupart des noms que vous allez lire sur
        les panneaux, les billets d’avion et les cartes.
      </p>

      @for (rule of rules; track rule.title) {
        <section class="mt-3 rounded-card bg-surface-1 p-4">
          <h2 class="font-semibold">{{ rule.title }}</h2>
          <p class="mt-1 text-sm leading-relaxed">{{ rule.text }}</p>
        </section>
      }
    </main>
  `,
})
export class PronunciationComponent {
  protected readonly rules = PRONUNCIATION_RULES;
}
