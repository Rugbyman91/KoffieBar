
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { MenuItem } from '../Components/menu-item/menu-item';
import { MenuData } from '../menu-options';
import { Winkelmandje } from '../services/winkelmandje';
import { MenuService } from '../services/menu';

@Component({
  selector: 'app-menu',
  imports: [MenuItem],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  private mandje = inject(Winkelmandje);
  private menuService = inject(MenuService);
  private cdr = inject(ChangeDetectorRef);
  private viewportScroller = inject(ViewportScroller);

  menu: MenuData | null = null;
  foutmelding = '';

  ngOnInit(): void {
    this.menuService.getMenu().subscribe({
      next: (data) => {
        this.menu = data;
        this.cdr.detectChanges();

        const fragment = window.location.hash.substring(1);

        if (fragment) {
          setTimeout(() => {
            this.viewportScroller.scrollToAnchor(fragment);
          });
        }
      },
      error: (error) => {
        console.error('Menu ophalen mislukt:', error);
        this.foutmelding = 'Het menu kon niet worden opgehaald.';
      }
    });
  }
}
