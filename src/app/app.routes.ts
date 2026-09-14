import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Home', component: Home },
  {
    path: 'lab',
    title: 'Lab',
    loadComponent: () => import('./pages/lab/lab').then((m) => m.Lab),
  },
  {
    path: '**',
    title: 'Not found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
