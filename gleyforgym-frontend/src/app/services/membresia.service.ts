import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Membresia } from '../models/membresia';

@Injectable({ providedIn: 'root' })
export class MembresiaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/membresias';


  private _membresias = signal<Membresia[]>([
    { id: 1, clienteId: 5, tipo: 'Mensual Premium', precio: 2500, fechaInicio: '2025-05-01', fechaFin: '2025-05-31', estado: 'ACTIVA', diasRestantes: 0 },
    { id: 2, clienteId: 6, tipo: 'Trimestral', precio: 6500, fechaInicio: '2025-04-01', fechaFin: '2025-06-30', estado: 'ACTIVA', diasRestantes: 30 },
    { id: 3, clienteId: 7, tipo: 'Mensual Básica', precio: 1800, fechaInicio: '2025-05-01', fechaFin: '2025-05-31', estado: 'ACTIVA', diasRestantes: 0 },
    { id: 4, clienteId: 8, tipo: 'Mensual Premium', precio: 2500, fechaInicio: '2025-03-01', fechaFin: '2025-03-31', estado: 'VENCIDA', diasRestantes: 0 },
    { id: 5, clienteId: 9, tipo: 'Anual', precio: 24000, fechaInicio: '2025-01-01', fechaFin: '2025-12-31', estado: 'ACTIVA', diasRestantes: 214 },
  ]);

  readonly membresias = this._membresias.asReadonly();

  obtenerMembresias(): Membresia[] {
    return this._membresias();
  }

  readonly membresiaActiva = computed(() =>
    this._membresias().find(m => m.clienteId === 5 && m.estado === 'ACTIVA')
  );

  getMembresiaDeCliente(clienteId: number): Membresia | undefined {
    return this._membresias().find(m => m.clienteId === clienteId);
  }

  getMembresiaActiva(clienteId: number): Membresia | undefined {
    return this._membresias().find(m => m.clienteId === clienteId && m.estado === 'ACTIVA');
  }

  calcularDiasRestantes(fechaFin: string): number {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  registrarMembresia(membresia: Omit<Membresia, 'id'>): Membresia {
    const nuevoId = Math.max(...this._membresias().map(m => m.id), 0) + 1;
    const nuevaM: Membresia = { ...membresia, id: nuevoId };
    this._membresias.update(lista => [...lista, nuevaM]);
    return nuevaM;
  }

  renovarMembresia(clienteId: number, tipo: string, precio: number, meses: number): void {
    const hoy = new Date();
    const fin = new Date();
    fin.setMonth(hoy.getMonth() + meses);
    const fechaInicioStr = hoy.toISOString().split('T')[0];
    const fechaFinStr = fin.toISOString().split('T')[0];

    this._membresias.update(lista => {
      const index = lista.findIndex(m => m.clienteId === clienteId);
      if (index > -1) {
        return lista.map((m, idx) => idx === index ? {
          ...m,
          tipo,
          precio,
          fechaInicio: fechaInicioStr,
          fechaFin: fechaFinStr,
          estado: 'ACTIVA'
        } : m);
      } else {
        const nuevoId = Math.max(...lista.map(m => m.id), 0) + 1;
        return [...lista, {
          id: nuevoId,
          clienteId,
          tipo,
          precio,
          fechaInicio: fechaInicioStr,
          fechaFin: fechaFinStr,
          estado: 'ACTIVA'
        }];
      }
    });
  }
}
