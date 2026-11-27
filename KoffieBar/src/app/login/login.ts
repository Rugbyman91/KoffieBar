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
  bezig = signal(false);

  inloggen(): void {
    if (this.bezig()) {
      return;
    }

    this.foutmelding.set('');
    this.bezig.set(true);

    this.auth.login(this.email, this.wachtwoord).subscribe({
      next: (response) => {
        this.auth.bewaarToken(response.token);
        this.router.navigate(['/']);
      },
      error: (fout: HttpErrorResponse) => {
        this.foutmelding.set(this.naarMelding(fout));
        this.bezig.set(false);
      },
    });
  }

  private naarMelding(fout: HttpErrorResponse): string {
    if (fout.status === 401) {
      return 'Ongeldig e-mailadres of wachtwoord.';
    }
    if (fout.status === 0) {
      return 'De server is niet bereikbaar.';
    }
    return `Er ging iets mis (status ${fout.status}).`;
  }
}
