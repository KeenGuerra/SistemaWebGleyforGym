import { Usuario } from './usuario';

export interface Cliente extends Usuario {
  membresiaId: number;
  entrenadorId: number;
  objetivoId: number;
  objetivo?: string; // Mantener como string para compatibilidad de vistas
  peso?: number;
  altura?: number;
  fechaNacimiento?: string;
  sexo?: string;
  direccion?: string;
  restriccionesMedicas?: string;
}

export interface ClienteDecorado extends Cliente {
  nombreEntrenador: string;
  membresiaTipo: string;
  membresiaEstado: string;
  membresiaFin: string;
  membresiaInicio?: string;
  membresiaPrecio?: number;
}
