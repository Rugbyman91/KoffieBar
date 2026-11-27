import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BestellingService } from '../services/bestelling';

interface Bestelregel {
  productNaam: string;
  aantal: number;
  grootteCode: string | null;
  extras: string[];
  eenheidsprijs: number;
  aantalMetKorting: number;
  subtotaal: number;
}

interface Bestelling {
  id: number;
  besteldOp: string;
  status: 'Geplaatst' | 'Geannuleerd';
  totaal: number;
  bestelregels: Bestelregel[];
}

@Component({
  selector: 'app-klantenportaal',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './klantenportaal.html',
  styleUrl: './klantenportaal.css',
})
export class Klantenportaal implements OnInit {
  private bestellingService = inject(BestellingService);

  readonly bestellingen = signal<Bestelling[]>([]);
  readonly foutmelding = signal('');
  readonly annuleerFoutmelding = signal('');
  readonly laden = signal(true);

  kanAnnuleren(bestelling: Bestelling): boolean {
    const besteldOp = new Date(bestelling.besteldOp).getTime();
    const dertigMinuten = 30 * 60 * 1000;

    return bestelling.status === 'Geplaatst' && Date.now() - besteldOp < dertigMinuten;
  }

  annuleerBestelling(bestelling: Bestelling): void {
    if (!confirm(`Ben je zeker dat je bestelling #${bestelling.id} wilt annuleren?`)) {
      return;
    }

    this.annuleerFoutmelding.set('');

    this.bestellingService.annuleerBestelling(bestelling.id).subscribe({
      next: () => {
        this.bestellingen.update((bestellingen) =>
          bestellingen.map((item) =>
            item.id === bestelling.id ? { ...item, status: 'Geannuleerd' } : item,
          ),
        );
      },
      error: (error) => {
        console.error('Annuleren mislukt:', error);
        this.annuleerFoutmelding.set(
          error.status === 400
            ? 'Deze bestelling kan niet meer geannuleerd worden.'
            : 'Er ging iets mis bij het annuleren van je bestelling.',
        );
      },
    });
  }

  ngOnInit(): void {
    this.bestellingService.mijnBestellingen().subscribe({
      next: (bestellingen) => {
        this.bestellingen.set(bestellingen);
        this.laden.set(false);
      },
      error: (error) => {
        console.error('Bestellingen ophalen mislukt:', error);

        this.foutmelding.set(
          error.status === 401
            ? 'Je sessie is verlopen. Log opnieuw in.'
            : 'Je bestellingen konden niet worden opgehaald.',
        );

        this.laden.set(false);
      },
    });
  }
}
