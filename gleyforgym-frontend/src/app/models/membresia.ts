export type EstadoMembresia = 'activa' | 'vencida' | 'pendiente' | 'suspendida';

export interface Membresia {
  id: number;
  clienteId: number;
  tipo: string;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoMembresia;
  diasRestantes?: number;
}
