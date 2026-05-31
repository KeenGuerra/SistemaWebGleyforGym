import { Injectable, signal, computed } from '@angular/core';
import { Asistencia } from '../models/asistencia';

const hoy = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const hace = (dias: number) => {
  const d = new Date(hoy);
  d.setDate(d.getDate() - dias);
  return fmt(d);
};

@Injectable({ providedIn: 'root' })
export class AsistenciaService {

  private _asistencias = signal<Asistencia[]>([
    { id: 1,  clienteId: 5, entrenadorId: 1, fecha: hace(0),  horaEntrada: '07:00', horaSalida: '08:30', duracionMinutos: 90  },
    { id: 2,  clienteId: 5, entrenadorId: 1, fecha: hace(2),  horaEntrada: '07:10', horaSalida: '08:20', duracionMinutos: 70  },
    { id: 3,  clienteId: 5, entrenadorId: 1, fecha: hace(4),  horaEntrada: '06:55', horaSalida: '08:25', duracionMinutos: 90  },
    { id: 4,  clienteId: 5, entrenadorId: 1, fecha: hace(7),  horaEntrada: '07:00', horaSalida: '08:30', duracionMinutos: 90  },
    { id: 5,  clienteId: 5, entrenadorId: 1, fecha: hace(9),  horaEntrada: '07:15', horaSalida: '08:15', duracionMinutos: 60  },
    { id: 6,  clienteId: 6, entrenadorId: 1, fecha: hace(0),  horaEntrada: '09:00', horaSalida: '10:30', duracionMinutos: 90  },
    { id: 7,  clienteId: 6, entrenadorId: 1, fecha: hace(1),  horaEntrada: '09:05', horaSalida: '10:05', duracionMinutos: 60  },
    { id: 8,  clienteId: 7, entrenadorId: 1, fecha: hace(0),  horaEntrada: '08:00', horaSalida: '09:00', duracionMinutos: 60  },
    { id: 9,  clienteId: 7, entrenadorId: 1, fecha: hace(3),  horaEntrada: '08:05', horaSalida: '09:15', duracionMinutos: 70  },
    { id: 10, clienteId: 9, entrenadorId: 1, fecha: hace(0),  horaEntrada: '10:00', horaSalida: '11:00', duracionMinutos: 60  },
  ]);

  readonly asistencias = this._asistencias.asReadonly();

  obtenerAsistencias(): Asistencia[] {
    return this._asistencias();
  }

  readonly asistenciasHoy = computed(() => {
    const hoyStr = fmt(new Date());
    return this._asistencias().filter(a => a.fecha === hoyStr);
  });

  getAsistenciasDeCliente(clienteId: number): Asistencia[] {
    return this._asistencias().filter(a => a.clienteId === clienteId);
  }

  getAsistenciasPorEntrenador(entrenadorId: number): Asistencia[] {
    return this._asistencias().filter(a => a.entrenadorId === entrenadorId);
  }

  registrarAsistencia(asistencia: Omit<Asistencia, 'id'>): void {
    const nuevoId = Math.max(...this._asistencias().map(a => a.id)) + 1;
    this._asistencias.update(lista => [...lista, { ...asistencia, id: nuevoId }]);
  }

  getDiasAsistidosMes(clienteId: number): number {
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return this._asistencias().filter(a =>
      a.clienteId === clienteId && new Date(a.fecha) >= inicioMes
    ).length;
  }
}
