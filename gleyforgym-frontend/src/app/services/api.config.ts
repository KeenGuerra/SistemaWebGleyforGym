// En producción (Render), API_BASE_URL se inyecta como variable de entorno del proceso Node SSR.
// En desarrollo local, utiliza el servidor FastAPI en localhost:8000.
declare const process: { env: Record<string, string | undefined> };

export const API_BASE_URL: string =
  (typeof process !== 'undefined' && process.env?.['API_BASE_URL']) ||
  'http://localhost:8000/api';

export const API_ENDPOINTS = {
  asistencias: `${API_BASE_URL}/asistencias/`,
  clientes: `${API_BASE_URL}/clientes/`,
  entrenadores: `${API_BASE_URL}/entrenadores/`,
  membresias: `${API_BASE_URL}/membresias/`,
  pagos: `${API_BASE_URL}/pagos/`,
  progreso: `${API_BASE_URL}/progresos/`,
  rutinas: `${API_BASE_URL}/rutinas/`,
  objetivos: `${API_BASE_URL}/objetivos/`,
  usuarios: `${API_BASE_URL}/usuarios/`,
  auth: {
    me: `${API_BASE_URL}/auth/me`,
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    changePassword: `${API_BASE_URL}/auth/change-password`
  }
};

