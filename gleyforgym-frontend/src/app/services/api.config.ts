import { environment } from '../environments/environment';

// La URL base de la API se inyecta en tiempo de compilación desde:
//   - src/environments/environment.ts      → desarrollo local (localhost:8000)
//   - src/environments/environment.prod.ts → producción en Render
export const API_BASE_URL: string = environment.apiBaseUrl;

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

