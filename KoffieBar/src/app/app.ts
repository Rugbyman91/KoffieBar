import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './services/auth';
import { Winkelmandje } from './services/winkelmandje';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected auth = inject(AuthService);
  private router = inject(Router);
  protected mandje = inject(Winkelmandje);

  readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.sluitMenu());
  }

  wisselMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  sluitMenu(): void {
    this.menuOpen.set(false);
  }

  uitloggen(): void {
    this.sluitMenu();
    this.auth.uitloggen();
    this.mandje.leegmaken();
    this.router.navigate(['/login']);
  }
}
