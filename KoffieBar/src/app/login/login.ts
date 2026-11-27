import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  wachtwoord = '';
  foutmelding = signal('');

  inloggen(): void {
    this.foutmelding.set('');

    this.auth.login(this.email, this.wachtwoord).subscribe({
      next: (response) => {
        this.auth.bewaarToken(response.token);
        this.router.navigate(['/']);
      },
      error: (fout: HttpErrorResponse) => {
        this.foutmelding.set(
          fout.status === 401
            ? 'Ongeldig e-mailadres of wachtwoord.'
            : 'De server is niet bereikbaar. Probeer het later opnieuw.',
        );
      },
    });
  }
}
