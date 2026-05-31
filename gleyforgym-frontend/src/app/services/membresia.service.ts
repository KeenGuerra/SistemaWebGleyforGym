import { Injectable, signal, computed } from '@angular/core';
import { Membresia } from '../models/membresia';

@Injectable({ providedIn: 'root' })
export class MembresiaService {

  private _membresias = signal<Membresia[]>([
    { id: 1, clienteId: 5, tipo: 'Mensual Premium', precio: 2500, fechaInicio: '2025-05-01', fechaFin: '2025-05-31', estado: 'activa', diasRestantes: 0 },
    { id: 2, clienteId: 6, tipo: 'Trimestral', precio: 6500, fechaInicio: '2025-04-01', fechaFin: '2025-06-30', estado: 'activa', diasRestantes: 30 },
    { id: 3, clienteId: 7, tipo: 'Mensual Básica', precio: 1800, fechaInicio: '2025-05-01', fechaFin: '2025-05-31', estado: 'activa', diasRestantes: 0 },
    { id: 4, clienteId: 8, tipo: 'Mensual Premium', precio: 2500, fechaInicio: '2025-03-01', fechaFin: '2025-03-31', estado: 'vencida', diasRestantes: 0 },
    { id: 5, clienteId: 9, tipo: 'Anual', precio: 24000, fechaInicio: '2025-01-01', fechaFin: '2025-12-31', estado: 'activa', diasRestantes: 214 },
  ]);

  readonly membresias = this._membresias.asReadonly();

  readonly membresiaActiva = computed(() =>
    this._membresias().find(m => m.clienteId === 5 && m.estado === 'activa')
  );

  getMembresiaDeCliente(clienteId: number): Membresia | undefined {
    return this._membresias().find(m => m.clienteId === clienteId);
  }

  getMembresiaActiva(clienteId: number): Membresia | undefined {
    return this._membresias().find(m => m.clienteId === clienteId && m.estado === 'activa');
  }

  calcularDiasRestantes(fechaFin: string): number {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
