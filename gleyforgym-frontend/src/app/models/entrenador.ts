import { Usuario } from './usuario';

export interface Entrenador extends Usuario {
  especialidades?: string[]; // Para visualización en la interfaz
  especialidadIds?: number[]; // Para la persistencia y edición
  especialidad: string; // Mantener para compatibilidad en tablas/vistas simples
  experiencia: number; // Años de experiencia (mapeado a experiencia_anios)
  clientesAsignados: number[];
  certificaciones?: string[];
}
