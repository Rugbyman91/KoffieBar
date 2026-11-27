import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuData } from '../menu-options';
import { API_BASE_URL } from '../api-config';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/menu`;

  getMenu(): Observable<MenuData> {
    return this.http.get<MenuData>(this.apiUrl);
  }
}