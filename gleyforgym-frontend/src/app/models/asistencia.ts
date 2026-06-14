export interface Asistencia {
  id: number;
  clienteId: number;
  entrenadorId?: number;
  fecha: string;
  horaEntrada: string;
  horaSalida?: string;
  duracionMinutos?: number;
  estado?: 'ASISTIO' | 'TARDE' | 'FALTA' | string;
  observaciones?: string;
}
