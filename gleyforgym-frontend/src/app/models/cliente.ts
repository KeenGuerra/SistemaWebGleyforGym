import { Usuario } from './usuario';

export interface Cliente extends Usuario {
  membresiaId: number;
  entrenadorId: number;
  objetivo: string;
  peso?: number;
  altura?: number;
}

export interface ClienteDecorado extends Cliente {
  nombreEntrenador: string;
  membresiaTipo: string;
  membresiaEstado: string;
  membresiaFin: string;
  membresiaInicio?: string;
  membresiaPrecio?: number;
}

