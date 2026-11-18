import { Injectable, computed, signal } from '@angular/core';
import { Bestelregel, GebakBestelregel, KoffieBestelregel } from '../models/bestelregel';
import { MenuOptions, ExtraOption, KoffieGrootte } from '../menu-options';

@Injectable({
  providedIn: 'root'
})
export class Winkelmandje {
  private readonly regels = signal<Bestelregel[]>([]);

  readonly bestelregels = this.regels.asReadonly();

  readonly aantalStuks = computed(() =>
    this.regels().reduce((som, regel) => som + regel.aantal, 0)
  );

  readonly melding = signal<string | null>(null);
  private meldingTimer?: ReturnType<typeof setTimeout>;

  voegGebakToe(product: MenuOptions, aantal: number): void {
    if (aantal <= 0 || !Number.isInteger(aantal)) {
      return;
    }

    this.regels.update(regels => {
      const bestaande = regels.find(
        regel => regel.type === 'gebak' && regel.product.id === product.id
      );

      if (bestaande) {
        return regels.map(regel =>
          regel === bestaande
            ? { ...bestaande, aantal: bestaande.aantal + aantal } as GebakBestelregel
            : regel
        );
      }

      return [...regels, {
        type: 'gebak',
        product,
        aantal
      }];
    });

    this.toonMelding(`${aantal} × ${product.name} toegevoegd aan je winkelmand`);
  }

  voegKoffieToe(
    product: MenuOptions,
    grootte: KoffieGrootte,
    extras: ExtraOption[]
  ): void {
    this.regels.update(regels => {
      const bestaande = regels.find(
        (regel): regel is KoffieBestelregel =>
          regel.type === 'koffie' &&
          regel.product.id === product.id &&
          regel.grootte.code === grootte.code &&
          this.dezelfdeExtras(regel.extras, extras)
      );

      if (bestaande) {
        return regels.map(regel =>
          regel === bestaande
            ? { ...bestaande, aantal: bestaande.aantal + 1 }
            : regel
        );
      }

      return [...regels, {
        type: 'koffie',
        product,
        grootte,
        extras: [...extras],
        aantal: 1
      }];
    });

    this.toonMelding(`${product.name} (${grootte.label}) toegevoegd aan je winkelmand`);
  }

  verwijderRegel(index: number): void {
    this.regels.update(regels => regels.filter((_, i) => i !== index));
  }

  leegmaken(): void {
    this.regels.set([]);
  }

  private toonMelding(tekst: string): void {
    this.melding.set(tekst);
    clearTimeout(this.meldingTimer);
    this.meldingTimer = setTimeout(() => this.melding.set(null), 3000);
  }

  private dezelfdeExtras(a: ExtraOption[], b: ExtraOption[]): boolean {
    const idsA = a.map(extra => extra.id).sort((x, y) => x - y);
    const idsB = b.map(extra => extra.id).sort((x, y) => x - y);

    return idsA.length === idsB.length &&
      idsA.every((id, index) => id === idsB[index]);
  }
}