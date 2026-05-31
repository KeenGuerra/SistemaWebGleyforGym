export interface Progreso {
  id: number;
  clienteId: number;
  fecha: string;
  peso: number;
  altura: number;
  imc: number;
  porcentajeGrasa?: number;
  porcentajeMuscular?: number;
  notas?: string;
}
