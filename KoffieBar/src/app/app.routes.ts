import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Menu } from './menu/menu';
import { Mandje } from './mandje/mandje';
import { Klantenportaal } from './klantenportaal/klantenportaal';
import { Login } from './login/login';
import { authGuard } from './guards/auth-guard';
import { Registreer } from './registreer/registreer';

const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home Page',
    canActivate: [authGuard],
  },
  {
    path: 'menu',
    component: Menu,
    title: 'Ons menu',
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: Login,
    title: 'Inloggen',
  },
  {
    path: 'klanten',
    component: Klantenportaal,
    title: 'Klantenportaal',
    canActivate: [authGuard],
  },
  {
    path: 'winkelmandje',
    component: Mandje,
    title: 'winkelmand',
    canActivate: [authGuard],
  },
  {
    path: 'registreer',
    component: Registreer,
    title: 'Registreren',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default routes;
