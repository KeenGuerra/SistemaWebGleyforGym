export type EstadoMembresia = 'ACTIVA' | 'VENCIDA' | 'CANCELADA' | 'activa' | 'vencida' | 'pendiente' | 'suspendida';

export interface Membresia {
  id: number;
  clienteId: number;
  tipo: string; // Nombre de la membresía (Mensual, Trimestral...)
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoMembresia;
  diasRestantes?: number;
  duracionDias?: number; // Para el catálogo de membresía
}
