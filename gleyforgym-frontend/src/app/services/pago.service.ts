import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pago } from '../models/pago';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/pagos';

  private _pagos = signal<Pago[]>([
    { id: 1, clienteId: 5, monto: 2500, fecha: '2025-05-01', concepto: 'Membresía Mensual Premium', metodo: 'TARJETA', estado: 'PAGADO' },
    { id: 2, clienteId: 5, monto: 2500, fecha: '2025-04-01', concepto: 'Membresía Mensual Premium', metodo: 'EFECTIVO', estado: 'PAGADO' },
    { id: 3, clienteId: 5, monto: 2500, fecha: '2025-03-01', concepto: 'Membresía Mensual Premium', metodo: 'TRANSFERENCIA', estado: 'PAGADO' },
    { id: 4, clienteId: 5, monto: 500, fecha: '2025-05-10', concepto: 'Sesión personal extra', metodo: 'EFECTIVO', estado: 'PENDIENTE' },
    { id: 5, clienteId: 5, monto: 2500, fecha: '2025-06-01', concepto: 'Membresía Mensual Premium', metodo: 'TARJETA', estado: 'PENDIENTE' },
    { id: 6, clienteId: 6, monto: 6500, fecha: '2025-04-01', concepto: 'Membresía Trimestral', metodo: 'TARJETA', estado: 'PAGADO' },
    { id: 7, clienteId: 7, monto: 1800, fecha: '2025-05-01', concepto: 'Membresía Mensual Básica', metodo: 'EFECTIVO', estado: 'PAGADO' },
  ]);

  readonly pagos = this._pagos.asReadonly();

  obtenerPagos(): Pago[] {
    return this._pagos();
  }

  readonly pagosDelCliente = computed(() =>
    this._pagos().filter(p => p.clienteId === 5)
  );

  getPagosDeCliente(clienteId: number): Pago[] {
    return this._pagos().filter(p => p.clienteId === clienteId);
  }

  getPagosPendientes(clienteId: number): Pago[] {
    return this._pagos().filter(p => p.clienteId === clienteId && p.estado === 'PENDIENTE');
  }

  agregarPago(pago: Omit<Pago, 'id'>): void {
    const nuevoId = Math.max(...this._pagos().map(p => p.id)) + 1;
    this._pagos.update(lista => [...lista, { ...pago, id: nuevoId }]);
  }
}
