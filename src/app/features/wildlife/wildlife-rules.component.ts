import { Component } from '@angular/core';
import { MARINE_REGULATIONS } from '../../shared/data/wildlife.data';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'ta-wildlife-rules',
  imports: [PageHeaderComponent],
  template: `
    <ta-page-header
      title="Ce que dit la loi"
      backTo="/faune"
      backLabel="Retour à la faune marine"
    />

    <main class="page-prose pb-28">
      <p class="rounded-card bg-surface-2 p-3 text-sm leading-relaxed">
        Ces règles viennent du code de l’environnement de la Polynésie française. Les atteintes aux
        espèces protégées sont des délits, pas des incivilités.
      </p>

      @for (regulation of regulations; track regulation.title) {
        <section class="mt-3 rounded-card bg-surface-1 p-4">
          <h2 class="font-semibold">{{ regulation.title }}</h2>
          <p class="mt-1 text-sm leading-relaxed">{{ regulation.text }}</p>
        </section>
      }

      <p class="mt-6 text-sm text-ink-2">
        En cas de doute sur une sortie ou un prestataire, la Direction de l’environnement et la
        Direction des ressources marines sont les interlocuteurs compétents.
      </p>
    </main>
  `,
})
export class WildlifeRulesComponent {
  protected readonly regulations = MARINE_REGULATIONS;
}
