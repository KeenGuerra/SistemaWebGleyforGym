import { Injectable, signal, computed } from '@angular/core';
import { Entrenador } from '../models/entrenador';

@Injectable({ providedIn: 'root' })
export class EntrenadorService {

  private _entrenadores = signal<Entrenador[]>([
    {
      id: 1, nombre: 'Carlos', apellido: 'Ramírez',
      email: 'carlos.ramirez@gleyforgym.com', telefono: '809-555-1234',
      rol: 'entrenador', activo: true, fechaRegistro: '2024-01-15',
      especialidad: 'Musculación y Fuerza', experiencia: 8,
      clientesAsignados: [5, 6, 7, 8, 9],
      certificaciones: ['NSCA-CSCS', 'CrossFit Level 2']
    },
    {
      id: 2, nombre: 'Sofía', apellido: 'Castro',
      email: 'sofia.castro@gleyforgym.com', telefono: '809-555-4567',
      rol: 'entrenador', activo: true, fechaRegistro: '2024-02-01',
      especialidad: 'Yoga y Flexibilidad', experiencia: 5,
      clientesAsignados: [10, 11, 12],
      certificaciones: ['RYT-200', 'TRX']
    },
  ]);

  readonly entrenadores = this._entrenadores.asReadonly();

  readonly entrenadoresActivos = computed(() =>
    this._entrenadores().filter(e => e.activo)
  );

  getEntrenadorActual(): Entrenador {
    return this._entrenadores()[0];
  }

  getEntrenadorPorId(id: number): Entrenador | undefined {
    return this._entrenadores().find(e => e.id === id);
  }

  actualizarEntrenador(entrenador: Partial<Entrenador> & { id: number }): void {
    this._entrenadores.update(lista =>
      lista.map(e => e.id === entrenador.id ? { ...e, ...entrenador } : e)
    );
  }
}
