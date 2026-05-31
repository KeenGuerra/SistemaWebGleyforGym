export interface Asistencia {
  id: number;
  clienteId: number;
  entrenadorId?: number;
  fecha: string;
  horaEntrada: string;
  horaSalida?: string;
  duracionMinutos?: number;
  observaciones?: string;
}
