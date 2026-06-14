import { Injectable, signal, computed } from '@angular/core';
import { Progreso } from '../models/progreso';

@Injectable({ providedIn: 'root' })
export class ProgresoService {

  private _progresos = signal<Progreso[]>([
    { id: 1, clienteId: 5, fecha: '2025-03-01', peso: 72.5, altura: 1.65, imc: 26.6, porcentajeGrasa: 28, porcentajeMuscular: 32, notas: 'Inicio de programa' },
    { id: 2, clienteId: 5, fecha: '2025-03-15', peso: 71.8, altura: 1.65, imc: 26.4, porcentajeGrasa: 27.5, porcentajeMuscular: 32.5, notas: 'Progreso positivo' },
    { id: 3, clienteId: 5, fecha: '2025-04-01', peso: 70.9, altura: 1.65, imc: 26.1, porcentajeGrasa: 26.8, porcentajeMuscular: 33.1, notas: 'Excelente adherencia' },
    { id: 4, clienteId: 5, fecha: '2025-04-15', peso: 70.1, altura: 1.65, imc: 25.8, porcentajeGrasa: 26.2, porcentajeMuscular: 33.8 },
    { id: 5, clienteId: 5, fecha: '2025-05-01', peso: 69.4, altura: 1.65, imc: 25.5, porcentajeGrasa: 25.8, porcentajeMuscular: 34.2, notas: 'Meta alcanzada al 70%' },
    { id: 6, clienteId: 6, fecha: '2025-03-01', peso: 75.0, altura: 1.78, imc: 23.7, porcentajeGrasa: 18, porcentajeMuscular: 42 },
    { id: 7, clienteId: 6, fecha: '2025-04-01', peso: 76.5, altura: 1.78, imc: 24.1, porcentajeGrasa: 17.5, porcentajeMuscular: 43.5, notas: 'Ganancia de masa limpia' },
    { id: 8, clienteId: 7, fecha: '2025-04-10', peso: 63.0, altura: 1.62, imc: 24.0, porcentajeGrasa: 26, porcentajeMuscular: 34 },
    { id: 9, clienteId: 7, fecha: '2025-05-10', peso: 62.2, altura: 1.62, imc: 23.7, porcentajeGrasa: 25.2, porcentajeMuscular: 34.8, notas: 'Mejora en postura' },
  ]);

  readonly progresos = this._progresos.asReadonly();

  obtenerProgreso(): Progreso[] {
    return this._progresos();
  }

  getProgresosDeCliente(clienteId: number): Progreso[] {
    return this._progresos()
      .filter(p => p.clienteId === clienteId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  getUltimoProgreso(clienteId: number): Progreso | undefined {
    const lista = this.getProgresosDeCliente(clienteId);
    return lista.length > 0 ? lista[0] : undefined;
  }

  registrarProgreso(progreso: Omit<Progreso, 'id'>): void {
    const nuevoId = Math.max(...this._progresos().map(p => p.id)) + 1;
    // La altura ya se envía en metros, por lo que no dividimos entre 100
    const imc = +(progreso.peso / (progreso.altura ** 2)).toFixed(1);
    this._progresos.update(lista => [...lista, { ...progreso, id: nuevoId, imc }]);
  }
}
