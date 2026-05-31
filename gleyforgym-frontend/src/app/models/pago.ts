export type EstadoPago = 'pagado' | 'pendiente' | 'cancelado';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Pago {
  id: number;
  clienteId: number;
  monto: number;
  fecha: string;
  concepto: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  comprobante?: string;
}
