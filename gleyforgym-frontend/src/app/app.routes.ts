import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirigir raíz al panel del entrenador (para desarrollo)
  {
    path: '',
    redirectTo: 'entrenador/panel',
    pathMatch: 'full',
  },

  // ── Rol Entrenador ──────────────────────────────────
  {
    path: 'entrenador',
    loadComponent: () =>
      import('./components/entrenador/entrenador-layout/entrenador-layout').then(
        m => m.EntrenadorLayout
      ),
    children: [
      {
        path: '',
        redirectTo: 'panel',
        pathMatch: 'full',
      },
      {
        path: 'panel',
        title: 'Panel Principal — Entrenador',
        loadComponent: () =>
          import('./components/entrenador/panel-entrenador/panel-entrenador').then(
            m => m.PanelEntrenador
          ),
      },
      {
        path: 'clientes',
        title: 'Clientes Asignados — Entrenador',
        loadComponent: () =>
          import('./components/entrenador/clientes-asignados/clientes-asignados').then(
            m => m.ClientesAsignados
          ),
      },
      {
        path: 'clientes/:id/progreso',
        title: 'Progreso del Cliente — Entrenador',
        loadComponent: () =>
          import('./components/entrenador/progreso-cliente/progreso-cliente').then(
            m => m.ProgresoCliente
          ),
      },
      {
        path: 'asistencia',
        title: 'Asistencia — Entrenador',
        loadComponent: () =>
          import('./components/entrenador/asistencia-entrenador/asistencia-entrenador').then(
            m => m.AsistenciaEntrenador
          ),
      },
      {
        path: 'rutinas',
        title: 'Rutinas — Entrenador',
        loadComponent: () =>
          import('./components/entrenador/rutinas-entrenador/rutinas-entrenador').then(
            m => m.RutinasEntrenador
          ),
      },
      {
        path: 'perfil',
        title: 'Mi Perfil — Entrenador',
        loadComponent: () =>
          import('./components/entrenador/perfil-entrenador/perfil-entrenador').then(
            m => m.PerfilEntrenador
          ),
      },
      {
        path: 'configuracion',
        title: 'Configuración — Entrenador',
        loadComponent: () =>
          import('./components/entrenador/perfil-entrenador/perfil-entrenador').then(
            m => m.PerfilEntrenador
          ),
      },
    ],
  },

  // ── Rol Cliente ─────────────────────────────────────
  {
    path: 'cliente',
    loadComponent: () =>
      import('./components/cliente/cliente-layout/cliente-layout').then(
        m => m.ClienteLayout
      ),
    children: [
      {
        path: '',
        redirectTo: 'panel',
        pathMatch: 'full',
      },
      {
        path: 'panel',
        title: 'Panel Principal — Cliente',
        loadComponent: () =>
          import('./components/cliente/panel-cliente/panel-cliente').then(
            m => m.PanelCliente
          ),
      },
      {
        path: 'perfil',
        title: 'Mi Perfil — Cliente',
        loadComponent: () =>
          import('./components/cliente/perfil-cliente/perfil-cliente').then(
            m => m.PerfilCliente
          ),
      },
      {
        path: 'membresia',
        title: 'Mi Membresía — Cliente',
        loadComponent: () =>
          import('./components/cliente/mi-membresia/mi-membresia').then(
            m => m.MiMembresia
          ),
      },
      {
        path: 'pagos',
        title: 'Mis Pagos — Cliente',
        loadComponent: () =>
          import('./components/cliente/mis-pagos/mis-pagos').then(
            m => m.MisPagos
          ),
      },
      {
        path: 'asistencia',
        title: 'Mi Asistencia — Cliente',
        loadComponent: () =>
          import('./components/cliente/mi-asistencia/mi-asistencia').then(
            m => m.MiAsistencia
          ),
      },
      {
        path: 'rutinas',
        title: 'Mis Rutinas — Cliente',
        loadComponent: () =>
          import('./components/cliente/mis-rutinas/mis-rutinas').then(
            m => m.MisRutinas
          ),
      },
      {
        path: 'configuracion',
        title: 'Configuración — Cliente',
        loadComponent: () =>
          import('./components/cliente/perfil-cliente/perfil-cliente').then(
            m => m.PerfilCliente
          ),
      },
    ],
  },

  // Ruta comodín
  {
    path: '**',
    redirectTo: 'entrenador/panel',
  },
];
