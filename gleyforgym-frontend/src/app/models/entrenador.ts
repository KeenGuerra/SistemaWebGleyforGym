import { Usuario } from './usuario';

export interface Entrenador extends Usuario {
  especialidad: string;
  experiencia: number;
  clientesAsignados: number[];
  certificaciones?: string[];
}
