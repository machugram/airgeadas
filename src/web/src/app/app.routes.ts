import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Overview · Clearplan',
    loadComponent: () => import('./pages/home').then((m) => m.HomePage),
  },
  {
    path: 'income',
    title: 'Income · Clearplan',
    loadComponent: () => import('./pages/flow').then((m) => m.FlowPage),
  },
  {
    path: 'spending',
    title: 'Spending · Clearplan',
    loadComponent: () => import('./pages/flow').then((m) => m.FlowPage),
  },
  {
    path: 'tools/take-home',
    title: 'Ireland take-home · Clearplan',
    loadComponent: () => import('./pages/pay').then((m) => m.PayPage),
  },
  { path: 'pay', redirectTo: 'tools/take-home', pathMatch: 'full' },
  {
    path: 'checklist',
    title: 'Arrival checklist · Clearplan',
    loadComponent: () => import('./pages/checklist').then((m) => m.ChecklistPage),
  },
  {
    path: 'guides',
    title: 'Guides · Clearplan',
    loadComponent: () => import('./pages/guides').then((m) => m.GuidesPage),
  },
  {
    path: 'guides/:slug',
    loadComponent: () => import('./pages/guide-detail').then((m) => m.GuideDetailPage),
  },
  { path: '**', redirectTo: '' },
];
