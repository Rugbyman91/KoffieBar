import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-registreer',
  imports: [FormsModule, RouterLink],
  templateUrl: './registreer.html',
  styleUrl: '../login/login.css',
})
export class Registreer {
  private auth = inject(AuthService);
  private router = inject(Router);

  naam = '';
  email = '';
  wachtwoord = signal('');
  foutmeldingen = signal<string[]>([]);

  regels = computed(() => {
    const w = this.wachtwoord();
    return [
      { tekst: 'Minstens 6 tekens', ok: w.length >= 6 },
      { tekst: 'Een hoofdletter', ok: /\p{Lu}/u.test(w) },
      { tekst: 'Een kleine letter', ok: /\p{Ll}/u.test(w) },
      { tekst: 'Een cijfer', ok: /[0-9]/.test(w) },
      { tekst: 'Een speciaal teken', ok: /[^\p{L}0-9]/u.test(w) },
    ];
  });

  allesOk = computed(() => this.regels().every((r) => r.ok));

  registreer(): void {
    this.foutmeldingen.set([]);

    this.auth.registreer(this.naam, this.email, this.wachtwoord()).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (fout: HttpErrorResponse) => this.foutmeldingen.set(this.naarMeldingen(fout)),
    });
  }

  private naarMeldingen(fout: HttpErrorResponse): string[] {
    if (fout.status === 0) {
      return ['De server is niet bereikbaar.'];
    }
    if (Array.isArray(fout.error)) {
      return fout.error;
    }
    if (fout.error?.errors) {
      return Object.values(fout.error.errors).flat() as string[];
    }
    return [`Registreren mislukt (status ${fout.status}).`];
  }
}
