import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pago } from '../models/pago';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/pagos'; // Configuración base para FastAPI


  private _pagos = signal<Pago[]>([
    { id: 1, clienteId: 5, monto: 2500, fecha: '2025-05-01', concepto: 'Membresía Mensual Premium', metodo: 'tarjeta', estado: 'pagado' },
    { id: 2, clienteId: 5, monto: 2500, fecha: '2025-04-01', concepto: 'Membresía Mensual Premium', metodo: 'efectivo', estado: 'pagado' },
    { id: 3, clienteId: 5, monto: 2500, fecha: '2025-03-01', concepto: 'Membresía Mensual Premium', metodo: 'transferencia', estado: 'pagado' },
    { id: 4, clienteId: 5, monto: 500, fecha: '2025-05-10', concepto: 'Sesión personal extra', metodo: 'efectivo', estado: 'pendiente' },
    { id: 5, clienteId: 5, monto: 2500, fecha: '2025-06-01', concepto: 'Membresía Mensual Premium', metodo: 'tarjeta', estado: 'pendiente' },
    { id: 6, clienteId: 6, monto: 6500, fecha: '2025-04-01', concepto: 'Membresía Trimestral', metodo: 'tarjeta', estado: 'pagado' },
    { id: 7, clienteId: 7, monto: 1800, fecha: '2025-05-01', concepto: 'Membresía Mensual Básica', metodo: 'efectivo', estado: 'pagado' },
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
    return this._pagos().filter(p => p.clienteId === clienteId && p.estado === 'pendiente');
  }

  agregarPago(pago: Omit<Pago, 'id'>): void {
    const nuevoId = Math.max(...this._pagos().map(p => p.id)) + 1;
    this._pagos.update(lista => [...lista, { ...pago, id: nuevoId }]);
  }
}
