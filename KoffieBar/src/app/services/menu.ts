import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuData } from '../menu-options';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5274/api/menu';

  getMenu(): Observable<MenuData> {
    return this.http.get<MenuData>(this.apiUrl);
  }
}