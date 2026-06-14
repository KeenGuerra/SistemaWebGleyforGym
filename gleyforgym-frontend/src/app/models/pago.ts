export type EstadoPago = 'PAGADO' | 'PENDIENTE' | 'ANULADO' | 'pagado' | 'pendiente' | 'cancelado';
export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'efectivo' | 'tarjeta' | 'transferencia';

export interface Pago {
  id: number;
  clienteId: number;
  clienteMembresiaId?: number;
  monto: number;
  fecha: string; // fecha_pago en DB
  concepto: string; // observacion en DB
  observacion?: string;
  metodo: MetodoPago; // metodo_pago en DB
  estado: EstadoPago;
  comprobante?: string;
}
