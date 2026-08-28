import { HIKES } from './hikes.data';
import { LEXICON } from './lexicon.data';
import { CATEGORY_LABELS, CATEGORY_ORDER } from './lexicon.models';
import { PRACTICAL_SHEETS } from './practical.data';
import { MARINE_SPECIES } from './wildlife.data';

describe('LEXICON', () => {
  it('utilise des identifiants uniques', () => {
    // Deux entrées partageant un id rendraient les favoris incohérents : cocher
    // l'une allumerait l'étoile de l'autre.
    const ids = LEXICON.map((entry) => entry.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates).toEqual([]);
  });

  it('renseigne tous les champs de chaque entrée', () => {
    for (const entry of LEXICON) {
      expect(entry.fr.trim(), entry.id).not.toBe('');
      expect(entry.ty.trim(), entry.id).not.toBe('');
      expect(entry.pron.trim(), entry.id).not.toBe('');
    }
  });

  it('n’utilise que des catégories affichables', () => {
    // Une catégorie absente de CATEGORY_ORDER serait filtrée à l'affichage :
    // l'entrée existerait sans jamais apparaître à l'écran.
    for (const entry of LEXICON) {
      expect(CATEGORY_ORDER, entry.id).toContain(entry.category);
    }
  });

  it('remplit chaque catégorie annoncée', () => {
    for (const category of CATEGORY_ORDER) {
      const count = LEXICON.filter((entry) => entry.category === category).length;
      expect(count, `${CATEGORY_LABELS[category]} est vide`).toBeGreaterThan(0);
    }
  });
});

describe('PRACTICAL_SHEETS', () => {
  it('utilise des identifiants uniques', () => {
    // Les id servent de segment d'URL (/infos/:id) : un doublon rendrait une
    // fiche inaccessible.
    const ids = PRACTICAL_SHEETS.map((sheet) => sheet.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('n’utilise que des identifiants sûrs en URL', () => {
    for (const sheet of PRACTICAL_SHEETS) {
      expect(sheet.id, sheet.title).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('donne à chaque fiche un titre, une accroche et du contenu', () => {
    for (const sheet of PRACTICAL_SHEETS) {
      expect(sheet.title.trim(), sheet.id).not.toBe('');
      expect(sheet.summary.trim(), sheet.id).not.toBe('');
      expect(sheet.sections.length, sheet.id).toBeGreaterThan(0);
    }
  });

  it('ne laisse aucune section vide', () => {
    for (const sheet of PRACTICAL_SHEETS) {
      for (const section of sheet.sections) {
        switch (section.kind) {
          case 'paragraph':
            expect(section.text.trim(), sheet.id).not.toBe('');
            break;
          case 'facts':
            expect(section.items.length, sheet.id).toBeGreaterThan(0);
            break;
          case 'list':
            expect(section.items.length, sheet.id).toBeGreaterThan(0);
            break;
        }
      }
    }
  });

  it('n’utilise que des liens tel: dans les fiches', () => {
    // Un lien http ne fonctionnerait pas hors ligne, ce qui est précisément le
    // moment où l'on consulte la fiche Urgences.
    for (const sheet of PRACTICAL_SHEETS) {
      for (const section of sheet.sections) {
        if (section.kind !== 'facts') {
          continue;
        }
        for (const item of section.items) {
          if (item.href !== undefined) {
            expect(item.href, `${sheet.id} / ${item.label}`).toMatch(/^tel:/);
          }
        }
      }
    }
  });
});

describe('HIKES', () => {
  it('nomme sa photo d’après son identifiant, avec auteur et licence', () => {
    for (const hike of HIKES) {
      if (hike.image === undefined) {
        expect(hike.photoCredit).toBeUndefined();
        continue;
      }
      expect(hike.image).toBe(`images/hikes/${hike.id}.webp`);
      expect(hike.photoCredit).toMatch(/, (CC[ 0]|Domaine public|image fournie)/);
    }
  });
});

describe('MARINE_SPECIES', () => {
  it('nomme sa photo d’après son identifiant', () => {
    for (const species of MARINE_SPECIES) {
      expect(species.image).toBe(`images/wildlife/${species.id}.webp`);
    }
  });

  it('crédite chaque photo par un auteur et une licence', () => {
    for (const species of MARINE_SPECIES) {
      expect(species.photoCredit).toMatch(/, (CC |Domaine public|image fournie)/);
    }
  });
});
