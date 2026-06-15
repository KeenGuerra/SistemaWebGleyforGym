import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas públicas — se pre-renderizan para SEO
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  // Rutas autenticadas — solo en el browser (necesitan localStorage para el token JWT)
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'entrenador/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'cliente/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  // Resto — client-side por defecto para seguridad
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
