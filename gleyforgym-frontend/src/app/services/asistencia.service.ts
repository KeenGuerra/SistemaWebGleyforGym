import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Asistencia } from '../models/asistencia';

const hoy = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/asistencias';

  private _asistencias = signal<Asistencia[]>([]);

  readonly asistencias = this._asistencias.asReadonly();

  readonly asistenciasHoy = computed(() => {
    const hoyStr = fmt(new Date());
    return this._asistencias().filter(a => a.fecha === hoyStr);
  });

  private mapToAsistencia(a: any): Asistencia {
    return {
      id: a.id,
      clienteId: a.cliente_id,
      entrenadorId: a.entrenador_id,
      fecha: a.fecha,
      horaEntrada: a.hora_entrada?.substring(0, 5) || '08:00',
      horaSalida: a.hora_salida?.substring(0, 5) || null,
      duracionMinutos: a.duracion_minutos || 0,
      estado: a.estado
    };
  }

  async cargarAsistencias(): Promise<Asistencia[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = resp.map(a => this.mapToAsistencia(a));
      this._asistencias.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar asistencias:', err);
      return [];
    }
  }

  obtenerAsistencias(): Asistencia[] {
    return this._asistencias();
  }

  getAsistenciasDeCliente(clienteId: number): Asistencia[] {
    return this._asistencias().filter(a => a.clienteId === clienteId);
  }

  getAsistenciasPorEntrenador(entrenadorId: number): Asistencia[] {
    return this._asistencias().filter(a => a.entrenadorId === entrenadorId);
  }

  async registrarAsistencia(asistencia: Omit<Asistencia, 'id'>): Promise<void> {
    const payload = {
      cliente_id: asistencia.clienteId,
      entrenador_id: asistencia.entrenadorId || null,
      fecha: asistencia.fecha || fmt(new Date()),
      hora_entrada: asistencia.horaEntrada || new Date().toLocaleTimeString('es-ES', { hour12: false }).substring(0, 5)
    };
    
    let response = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/entrada`, payload));

    if (asistencia.horaSalida) {
      response = await firstValueFrom(
        this.http.put<any>(`${this.apiUrl}/${response.id}/salida`, {
          hora_salida: asistencia.horaSalida
        })
      );
    }

    const nuevaA = this.mapToAsistencia(response);
    this._asistencias.update(lista => [...lista.filter(a => a.id !== nuevaA.id), nuevaA]);
  }

  getDiasAsistidosMes(clienteId: number): number {
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return this._asistencias().filter(a =>
      a.clienteId === clienteId && new Date(a.fecha) >= inicioMes
    ).length;
  }
}
