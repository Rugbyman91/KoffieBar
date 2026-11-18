
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BestelregelAanvraag {
  productId: number;
  aantal: number;
  grootteCode: string | null;
  extraIds: number[];
}

export interface BestellingAanvraag {
  bestelregels: BestelregelAanvraag[];
}

export interface BestelregelResponse {
  productId: number;
  productNaam: string;
  aantal: number;
  grootteCode: string | null;
  extras: string[];
  eenheidsprijs: number;
  aantalMetKorting: number;
  subtotaal: number;
}

export interface BestellingResponse {
  id: number;
  besteldOp: string;
  status: BestellingStatus;
  oorspronkelijkePrijs: number;
  korting: number;
  subTotaal: number;
  afronding: number;
  totaal: number;
  bestelregels: BestelregelResponse[];
}

export type BestellingStatus = 'Geplaatst' | 'Geannuleerd';

@Injectable({
  providedIn: 'root'
})
export class BestellingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5274/api/bestellingen';

  berekenBestelling(
    aanvraag: BestellingAanvraag
  ): Observable<BestellingResponse> {
    return this.http.post<BestellingResponse>(
      `${this.apiUrl}/berekening`,
      aanvraag
    );
  }

  plaatsBestelling(
    aanvraag: BestellingAanvraag
  ): Observable<BestellingResponse> {
    return this.http.post<BestellingResponse>(
      this.apiUrl,
      aanvraag
    );
  }

  mijnBestellingen(): Observable<BestellingResponse[]> {
    return this.http.get<BestellingResponse[]>(this.apiUrl);
  }

  annuleerBestelling(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/annuleren`,
      {}
    );
  }
}
