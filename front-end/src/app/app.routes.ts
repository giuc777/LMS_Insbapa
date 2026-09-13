import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'sistema',
    loadComponent: () => import('./pages/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'ajustes',
        loadComponent: () => import('./pages/ajustes/ajustes.component').then(m => m.AjustesComponent)
      },
      // --- Admin ---
      {
        path: 'admin/cursos',
        loadComponent: () => import('./pages/admin/cursos/admin-cursos.component').then(m => m.AdminCursosComponent)
      },
      {
        path: 'admin/estudiantes',
        loadComponent: () => import('./pages/admin/estudiantes/admin-estudiantes.component').then(m => m.AdminEstudiantesComponent)
      },
      {
        path: 'admin/profesores',
        loadComponent: () => import('./pages/admin/profesores/admin-profesores.component').then(m => m.AdminProfesoresComponent)
      },
      {
        path: 'admin/anuncios',
        loadComponent: () => import('./pages/admin/anuncios/admin-anuncios.component').then(m => m.AdminAnunciosComponent)
      },
      {
        path: 'admin/tokens',
        loadComponent: () => import('./pages/admin/tokens/admin-tokens.component').then(m => m.AdminTokensComponent)
      },
      {
        path: 'admin/notas',
        loadComponent: () => import('./pages/admin/notas/admin-notas.component').then(m => m.AdminNotasComponent)
      },
      {
        path: 'admin/mantenimiento',
        loadComponent: () => import('./pages/admin/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent)
      },
      // --- Estudiante ---
      {
        path: 'cursos',
        loadComponent: () => import('./pages/estudiante/cursos/estudiante-cursos.component').then(m => m.EstudianteCursosComponent)
      },
      {
        path: 'tareas',
        loadComponent: () => import('./pages/estudiante/tareas/estudiante-tareas.component').then(m => m.EstudianteTareasComponent)
      },
      {
        path: 'examenes',
        loadComponent: () => import('./pages/estudiante/examenes/estudiante-examenes.component').then(m => m.EstudianteExamenesComponent)
      },
      {
        path: 'notas',
        loadComponent: () => import('./pages/estudiante/notas/estudiante-notas.component').then(m => m.EstudianteNotasComponent)
      },
      {
        path: 'anuncios',
        loadComponent: () => import('./pages/estudiante/anuncios/estudiante-anuncios.component').then(m => m.EstudianteAnunciosComponent)
      },
      // --- Profesor ---
      {
        path: 'clases',
        loadComponent: () => import('./pages/profesor/clases/profesor-clases.component').then(m => m.ProfesorClasesComponent)
      },
      {
        path: 'profesor/tareas',
        loadComponent: () => import('./pages/profesor/tareas/profesor-tareas.component').then(m => m.ProfesorTareasComponent)
      },
      {
        path: 'profesor/notas',
        loadComponent: () => import('./pages/profesor/notas/profesor-notas.component').then(m => m.ProfesorNotasComponent)
      },
      {
        path: 'profesor/examenes',
        loadComponent: () => import('./pages/profesor/examenes/profesor-examenes.component').then(m => m.ProfesorExamenesComponent)
      },
      {
        path: 'profesor/materiales',
        loadComponent: () => import('./pages/profesor/materiales/profesor-materiales.component').then(m => m.ProfesorMaterialesComponent)
      },
      {
        path: 'profesor/anuncios',
        loadComponent: () => import('./pages/profesor/anuncios/profesor-anuncios.component').then(m => m.ProfesorAnunciosComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
