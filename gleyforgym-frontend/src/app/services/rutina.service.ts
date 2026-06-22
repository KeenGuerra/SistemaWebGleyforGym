import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Rutina } from '../models/rutina';
import { API_ENDPOINTS } from './api.config';

@Injectable({ providedIn: 'root' })
export class RutinaService {
  private http = inject(HttpClient);
  private apiUrl = API_ENDPOINTS.rutinas;
  private objetivosUrl = API_ENDPOINTS.objetivos;

  private _rutinas = signal<Rutina[]>([]);
  private _objetivos = signal<{ id: number; nombre: string }[]>([]);

  readonly rutinas = this._rutinas.asReadonly();
  readonly objetivos = this._objetivos.asReadonly();

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

  // Carga objetivos con caché — no vuelve a pedir si ya están en memoria
  async cargarObjetivos(): Promise<void> {
    if (this._objetivos().length > 0) return;
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.objetivosUrl));
      this._objetivos.set(resp.map(o => ({ id: o.id, nombre: o.nombre })));
    } catch (err) {
      console.error('Error al cargar objetivos:', err);
    }
  }

  // Resuelve el ID de un objetivo por nombre (insensible a mayúsculas)
  private resolverObjetivoId(nombreObjetivo: string): number {
    const lista = this._objetivos();
    if (lista.length === 0) return 1;
    const match = lista.find(o =>
      o.nombre.toLowerCase().trim() === nombreObjetivo.toLowerCase().trim()
    );
    return match ? match.id : (lista[0]?.id ?? 1);
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
    // 1. Resolver objetivo_id dinámicamente desde la BD
    await this.cargarObjetivos();
    const objetivoId = this.resolverObjetivoId(rutina.objetivo);

    // 2. Preparar ejercicios
    const ejerciciosPayload: any[] = [];
    for (let i = 0; i < rutina.ejercicios.length; i++) {
      const ej = rutina.ejercicios[i];
      const descansoSegundos = parseInt(ej.descanso.replace(/\D/g, '')) || 60;
      
      // Mapear de forma inteligente al catálogo de la base de datos (IDs 1 al 4)
      let ejId = 1; // Por defecto: Sentadilla Libre
      const nombreLower = ej.nombre.toLowerCase();
      if (nombreLower.includes('sentadilla')) {
        ejId = 1; // Sentadilla Libre
      } else if (nombreLower.includes('press') || nombreLower.includes('flexión') || nombreLower.includes('flexion')) {
        ejId = 2; // Press de Banca
      } else if (nombreLower.includes('muerto') || nombreLower.includes('remo')) {
        ejId = 3; // Peso Muerto
      } else if (nombreLower.includes('biceps') || nombreLower.includes('bíceps') || nombreLower.includes('plancha') || nombreLower.includes('dominada') || nombreLower.includes('rueda')) {
        ejId = 4; // Curl de Bíceps
      } else {
        // Rotación de fallbacks si no hay coincidencia
        ejId = (i % 4) + 1;
      }

      ejerciciosPayload.push({
        series: ej.series,
        repeticiones: String(ej.repeticiones),
        descanso_segundos: descansoSegundos,
        dia_semana: rutina.diasSemana?.length > 0 ? rutina.diasSemana[0] : 'Lunes',
        orden: i + 1,
        notas: ej.notas || '',
        ejercicio_id: ejId
      });
    }

    const payload = {
      nombre: rutina.nombre,
      nivel: rutina.nivel || 'principiante',
      descripcion: rutina.descripcion || '',
      objetivo_id: objetivoId,
      cliente_id: rutina.clienteId,
      ejercicios: ejerciciosPayload
    };

    // entrenador_id solo se envía como query param cuando el rol es ADMINISTRADOR
    // si es ENTRENADOR, el backend lo resuelve desde el token JWT
    const entrenadorParam = rutina.entrenadorId && rutina.entrenadorId > 0
      ? `?entrenador_id=${rutina.entrenadorId}`
      : '';

    const response = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}${entrenadorParam}`, payload)
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
      this.http.put<any>(`${this.apiUrl}${id}`, payload)
    );
    const actR = this.mapToRutina(response);
    this._rutinas.update(lista =>
      lista.map(r => r.id === id ? actR : r)
    );
  }

  async desactivarRutina(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<any>(`${this.apiUrl}${id}`));
    this._rutinas.update(lista =>
      lista.map(r => r.id === id ? { ...r, activa: false } : r)
    );
  }
}
