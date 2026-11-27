import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './services/auth';
import { Winkelmandje } from './services/winkelmandje';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected auth = inject(AuthService);
  private router = inject(Router);
  protected mandje = inject(Winkelmandje);

  uitloggen(): void {
    this.auth.uitloggen();
    this.mandje.leegmaken();
    this.router.navigate(['/login']);
  }
}