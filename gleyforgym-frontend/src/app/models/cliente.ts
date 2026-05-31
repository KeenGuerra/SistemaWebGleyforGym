import { Usuario } from './usuario';

export interface Cliente extends Usuario {
  membresiaId: number;
  entrenadorId: number;
  objetivo: string;
  peso?: number;
  altura?: number;
}
