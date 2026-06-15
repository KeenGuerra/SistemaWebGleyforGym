import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Progreso } from '../models/progreso';

@Injectable({ providedIn: 'root' })
export class ProgresoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/progresos/';

  private _progresos = signal<Progreso[]>([]);

  readonly progresos = this._progresos.asReadonly();

  private mapToProgreso(p: any): Progreso {
    return {
      id: p.id,
      clienteId: p.cliente_id,
      fecha: p.fecha,
      peso: +p.peso,
      altura: +p.altura,
      imc: +p.imc,
      porcentajeGrasa: p.porcentaje_grasa ? +p.porcentaje_grasa : undefined,
      porcentajeMuscular: p.porcentaje_muscular ? +p.porcentaje_muscular : undefined,
      notas: p.notas
    };
  }

  async cargarProgresos(): Promise<Progreso[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = resp.map(p => this.mapToProgreso(p));
      this._progresos.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar progresos:', err);
      return [];
    }
  }

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

  async registrarProgreso(progreso: Omit<Progreso, 'id'>): Promise<void> {
    const payload = {
      cliente_id: progreso.clienteId,
      fecha: progreso.fecha || new Date().toISOString().split('T')[0],
      peso: progreso.peso,
      altura: progreso.altura,
      porcentaje_grasa: progreso.porcentajeGrasa || null,
      porcentaje_muscular: progreso.porcentajeMuscular || null,
      notas: progreso.notas || ''
    };
    const response = await firstValueFrom(
      this.http.post<any>(this.apiUrl, payload)
    );
    const nuevoP = this.mapToProgreso(response);
    this._progresos.update(lista => [...lista, nuevoP]);
  }
}
