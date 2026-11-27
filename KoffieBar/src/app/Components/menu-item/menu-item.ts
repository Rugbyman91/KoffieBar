
import { Component, Input, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuOptions, ExtraOption, KoffieGrootte, Categorie } from '../../menu-options';
import { Winkelmandje } from '../../services/winkelmandje';

@Component({
  selector: 'app-menu-item',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.css',
})

export class MenuItem {
  @Input({ required: true }) item!: MenuOptions;
  @Input() coffeeSizes: KoffieGrootte[] = [];
  @Input() espressoSizes: KoffieGrootte[] = [];
  @Input() extras: ExtraOption[] = [];

  private readonly mandje = inject(Winkelmandje);

  aantal = 1;
  dialoogOpen = false;
  gekozenGrootte: KoffieGrootte | null = null;
  gekozenExtras: number[] = [];

  get isKoffie(): boolean {
    return this.item.categorie === Categorie.Koffie;
  }

  get beschikbareGroottes(): KoffieGrootte[] {
    return this.item.isEspresso
      ? this.espressoSizes
      : this.coffeeSizes;
  }

  prijsVoorGrootte(grootte: KoffieGrootte): number {
    return this.item.price * grootte.factor;
  }

  openDialoog(): void {
    this.gekozenGrootte = this.beschikbareGroottes[0] ?? null;
    this.gekozenExtras = [];
    this.dialoogOpen = true;
  }

  bevestigKoffie(): void {
    if (!this.gekozenGrootte) {
      return;
    }

    const extras = this.extras.filter(extra =>
      this.gekozenExtras.includes(extra.id)
    );

    this.mandje.voegKoffieToe(
      this.item,
      this.gekozenGrootte,
      extras
    );

    this.dialoogOpen = false;
  }

  voegToe(): void {
    this.mandje.voegGebakToe(this.item, this.aantal);
    this.aantal = 1;
  }
}