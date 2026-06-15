import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Rutina } from '../models/rutina';

@Injectable({ providedIn: 'root' })
export class RutinaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/rutinas';

  private _rutinas = signal<Rutina[]>([]);

  readonly rutinas = this._rutinas.asReadonly();

  readonly rutinasActivas = computed(() =>
    this._rutinas().filter(r => r.activa)
  );

  private mapToRutina(r: any): Rutina {
    return {
      id: r.id,
      clienteId: r.cliente_id,
      entrenadorId: r.entrenador_id,
      diasSemana: Array.from(new Set(r.ejercicios ? r.ejercicios.map((re: any) => re.dia_semana) : ['Lunes'])),
      nivel: r.nivel,
      objetivo: r.objetivo ? r.objetivo.nombre : 'General',
      descripcion: r.descripcion || '',
      fechaCreacion: r.fecha_creacion,
      activa: r.activa,
      nombre: r.nombre,
      ejercicios: r.ejercicios ? r.ejercicios.map((re: any) => ({
        nombre: re.ejercicio?.nombre || 'Ejercicio',
        series: re.series,
        repeticiones: re.repeticiones,
        descanso: `${re.descanso_segundos} seg`,
        notas: re.notas || ''
      })) : []
    };
  }

  async cargarRutinas(): Promise<Rutina[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = resp.map(r => this.mapToRutina(r));
      this._rutinas.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar rutinas:', err);
      return [];
    }
  }

  obtenerRutinas(): Rutina[] {
    return this._rutinas();
  }

  getRutinasDeCliente(clienteId: number): Rutina[] {
    return this._rutinas().filter(r => r.clienteId === clienteId && r.activa);
  }

  getRutinasPorEntrenador(entrenadorId: number): Rutina[] {
    return this._rutinas().filter(r => r.entrenadorId === entrenadorId);
  }

  async agregarRutina(rutina: Omit<Rutina, 'id'>): Promise<void> {
    let catalog: any[] = [];
    try {
      catalog = await firstValueFrom(this.http.get<any[]>('http://localhost:8000/api/rutinas/ejercicios'));
    } catch (e) {
      console.error('No se pudo cargar el catálogo de ejercicios:', e);
    }

    const ejerciciosPayload: any[] = [];
    for (let i = 0; i < rutina.ejercicios.length; i++) {
      const ej = rutina.ejercicios[i];
      let match = catalog.find(x => x.nombre.toLowerCase().trim() === ej.nombre.toLowerCase().trim());
      
      if (!match) {
        try {
          match = await firstValueFrom(this.http.post<any>('http://localhost:8000/api/rutinas/ejercicios', {
            nombre: ej.nombre,
            descripcion: 'Ejercicio autogenerado',
            grupo_muscular_id: 1, // General
            nivel: 'principiante',
            video_url: '',
            activo: true
          }));
          catalog.push(match);
        } catch (err) {
          match = { id: 1 };
        }
      }

      const descansoSegundos = parseInt(ej.descanso.replace(/\D/g, '')) || 60;
      
      ejerciciosPayload.push({
        series: ej.series,
        repeticiones: ej.repeticiones,
        descanso_segundos: descansoSegundos,
        dia_semana: rutina.diasSemana && rutina.diasSemana.length > 0 ? rutina.diasSemana[0] : 'Lunes',
        orden: i + 1,
        notas: ej.notas || '',
        ejercicio_id: match.id
      });
    }

    const payload = {
      nombre: rutina.nombre,
      nivel: rutina.nivel || 'principiante',
      descripcion: rutina.descripcion || '',
      objetivo_id: 3, // Tonificación
      cliente_id: rutina.clienteId,
      ejercicios: ejerciciosPayload
    };

    const response = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}?entrenador_id=${rutina.entrenadorId || 1}`, payload)
    );
    const nuevaR = this.mapToRutina(response);
    this._rutinas.update(lista => [...lista, nuevaR]);
  }

  async actualizarRutina(id: number, datos: Partial<Rutina>): Promise<void> {
    const payload = {
      nombre: datos.nombre,
      nivel: datos.nivel,
      descripcion: datos.descripcion,
      activa: datos.activa
    };
    const response = await firstValueFrom(
      this.http.put<any>(`${this.apiUrl}/${id}`, payload)
    );
    const actR = this.mapToRutina(response);
    this._rutinas.update(lista =>
      lista.map(r => r.id === id ? actR : r)
    );
  }

  async desactivarRutina(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<any>(`${this.apiUrl}/${id}`));
    this._rutinas.update(lista =>
      lista.map(r => r.id === id ? { ...r, activa: false } : r)
    );
  }
}
