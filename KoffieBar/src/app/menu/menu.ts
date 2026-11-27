import { Component, inject, OnInit, signal } from '@angular/core';
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
  private viewportScroller = inject(ViewportScroller);

  readonly menu = signal<MenuData | null>(null);
  readonly foutmelding = signal('');

  ngOnInit(): void {
    this.menuService.getMenu().subscribe({
      next: (data) => {
        this.menu.set(data);

        const fragment = window.location.hash.substring(1);

        if (fragment) {
          setTimeout(() => {
            this.viewportScroller.scrollToAnchor(fragment);
          });
        }
      },
      error: (error) => {
        console.error('Menu ophalen mislukt:', error);
        this.foutmelding.set('Het menu kon niet worden opgehaald.');
      },
    });
  }
}
