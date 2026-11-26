
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';

import { Winkelmandje } from '../services/winkelmandje';
import {
  BestellingService,
  BestellingAanvraag,
  BestellingResponse
} from '../services/bestelling';
import { Bestelregel } from '../models/bestelregel';

@Component({
  selector: 'app-mandje',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './mandje.html',
  styleUrl: './mandje.css',
})
export class Mandje {
  readonly mandje = inject(Winkelmandje);
  private readonly bestellingService = inject(BestellingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bezigMetBestellen = signal(false);
  readonly melding = signal<string | null>(null);
  readonly foutmelding = signal<string | null>(null);
  readonly prijsOverzicht = signal<BestellingResponse | null>(null);
  readonly prijsFoutmelding = signal<string | null>(null);

  constructor() {
    toObservable(this.mandje.bestelregels)
      .pipe(
        debounceTime(200),
        switchMap(regels => {
          if (regels.length === 0) {
            this.prijsFoutmelding.set(null);
            return of(null);
          }

          this.prijsFoutmelding.set(null);

          return this.bestellingService
            .berekenBestelling(this.maakAanvraag(regels))
            .pipe(
              catchError(error => {
                console.error('Prijsberekening mislukt:', error);
                this.prijsFoutmelding.set(
                  'De prijzen konden niet worden berekend.'
                );
                return of(null);
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(overzicht => {
      this.prijsOverzicht.set(overzicht);
    });
  }

  get bevatKoffie(): boolean {
  return this.mandje.bestelregels().some(
    regel => regel.type === 'koffie'
  );
}

get bevatGebak(): boolean {
  return this.mandje.bestelregels().some(
    regel => regel.type !== 'koffie'
  );
}

  private maakAanvraag(regels: Bestelregel[]): BestellingAanvraag {
    return {
      bestelregels: regels.map(regel => ({
        productId: regel.product.id,
        aantal: regel.aantal,
        grootteCode: regel.type === 'koffie'
          ? regel.grootte.code
          : null,
        extraIds: regel.type === 'koffie'
          ? regel.extras.map(extra => extra.id)
          : []
      }))
    };
  }

  plaatsBestelling(): void {
    if (
      this.mandje.bestelregels().length === 0 ||
      this.bezigMetBestellen()
    ) {
      return;
    }

    this.melding.set(null);
    this.foutmelding.set(null);
    this.bezigMetBestellen.set(true);

    this.bestellingService
      .plaatsBestelling(this.maakAanvraag(this.mandje.bestelregels()))
      .subscribe({
        next: () => {
          this.melding.set('Je bestelling is succesvol geplaatst.');
          this.mandje.leegmaken();
          this.bezigMetBestellen.set(false);
        },
        error: error => {
          console.error('Bestelling plaatsen mislukt:', error);
          this.foutmelding.set(
            'Bestelling mislukt. Probeer het opnieuw.'
          );
          this.bezigMetBestellen.set(false);
        }
      });
  }
}
