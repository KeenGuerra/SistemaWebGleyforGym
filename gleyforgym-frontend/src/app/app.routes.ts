import { Routes } from '@angular/router';

export const routes: Routes = [
  // ── Pantallas Generales ─────────────────────────────
  {
    path: '',
    title: 'GleyforGym — Gimnasio y Fitness',
    loadComponent: () =>
      import('./components/inicio/inicio').then(
        m => m.Inicio
      ),
  },
  {
    path: 'login',
    title: 'Iniciar Sesión — GleyforGym',
    loadComponent: () =>
      import('./components/login/login').then(
        m => m.Login
      ),
  },
  {
    path: 'registro',
    title: 'Registrarse — GleyforGym',
    loadComponent: () =>
      import('./components/registro/registro').then(
        m => m.Registro
      ),
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

  // ── Rol Administrador ───────────────────────────────
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin-layout/admin-layout').then(
        m => m.AdminLayout
      ),
    children: [
      {
        path: '',
        redirectTo: 'panel',
        pathMatch: 'full',
      },
      {
        path: 'panel',
        title: 'Panel Principal — Administrador',
        loadComponent: () =>
          import('./components/admin/panel-admin/panel-admin').then(
            m => m.PanelAdmin
          ),
      },
      {
        path: 'usuarios',
        title: 'Gestión de Usuarios — Administrador',
        loadComponent: () =>
          import('./components/admin/usuarios/usuarios').then(
            m => m.Usuarios
          ),
      },
      {
        path: 'clientes',
        title: 'Gestión de Clientes — Administrador',
        loadComponent: () =>
          import('./components/admin/clientes/clientes').then(
            m => m.Clientes
          ),
      },
      {
        path: 'membresias',
        title: 'Gestión de Membresías — Administrador',
        loadComponent: () =>
          import('./components/admin/membresias/membresias').then(
            m => m.Membresias
          ),
      },
      {
        path: 'pagos',
        title: 'Gestión de Pagos — Administrador',
        loadComponent: () =>
          import('./components/admin/pagos/pagos').then(
            m => m.Pagos
          ),
      },
      {
        path: 'asistencia',
        title: 'Gestión de Asistencia — Administrador',
        loadComponent: () =>
          import('./components/admin/asistencia/asistencia').then(
            m => m.Asistencia
          ),
      },
      {
        path: 'rutinas',
        title: 'Gestión de Rutinas — Administrador',
        loadComponent: () =>
          import('./components/admin/rutinas/rutinas').then(
            m => m.Rutinas
          ),
      },
      {
        path: 'perfil',
        title: 'Mi Perfil — Administrador',
        loadComponent: () =>
          import('./components/admin/perfil-admin/perfil-admin').then(
            m => m.PerfilAdmin
          ),
      },
      {
        path: 'configuracion',
        title: 'Configuración — Administrador',
        loadComponent: () =>
          import('./components/admin/perfil-admin/perfil-admin').then(
            m => m.PerfilAdmin
          ),
      },
    ],
  },

  // Ruta comodín
  {
    path: '**',
    redirectTo: '',
  },
];
