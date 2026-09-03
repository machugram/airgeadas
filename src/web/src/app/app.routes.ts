import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home').then((m) => m.HomePage) },
  { path: 'pay', loadComponent: () => import('./pages/pay').then((m) => m.PayPage) },
  {
    path: 'checklist',
    loadComponent: () => import('./pages/checklist').then((m) => m.ChecklistPage),
  },
  { path: 'guides', loadComponent: () => import('./pages/guides').then((m) => m.GuidesPage) },
  {
    path: 'guides/:slug',
    loadComponent: () => import('./pages/guide-detail').then((m) => m.GuideDetailPage),
  },
  { path: '**', redirectTo: '' },
];
