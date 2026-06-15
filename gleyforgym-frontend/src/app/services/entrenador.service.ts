import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Entrenador } from '../models/entrenador';

@Injectable({ providedIn: 'root' })
export class EntrenadorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/entrenadores/';

  private _entrenadores = signal<Entrenador[]>([]);

  readonly entrenadores = this._entrenadores.asReadonly();

  readonly entrenadoresActivos = computed(() =>
    this._entrenadores().filter(e => e.activo)
  );

  private mapToEntrenador(e: any): Entrenador {
    return {
      id: e.id,
      nombre: e.usuario.nombre,
      apellido: e.usuario.apellido,
      dni: e.usuario.dni,
      email: e.usuario.correo,
      telefono: e.usuario.telefono,
      rol: e.usuario.rol,
      activo: e.usuario.activo && e.activo,
      fechaRegistro: e.usuario.fecha_registro,
      avatar: e.usuario.avatar,
      experiencia: e.experiencia_anios,
      especialidades: e.especialidades ? e.especialidades.map((sp: any) => sp.nombre) : [],
      especialidadIds: e.especialidades ? e.especialidades.map((sp: any) => sp.id) : [],
      especialidad: e.especialidades && e.especialidades.length > 0 ? e.especialidades[0].nombre : 'General',
      clientesAsignados: [],
      certificaciones: [],
      usuarioId: e.usuario.id  // Necesario para localizar al entrenador logueado
    } as any;
  }

  async cargarEntrenadores(): Promise<Entrenador[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = resp.map(e => this.mapToEntrenador(e));
      this._entrenadores.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar entrenadores:', err);
      return [];
    }
  }

  getEntrenadorActual(): Entrenador | undefined {
    return this._entrenadores().length > 0 ? this._entrenadores()[0] : undefined;
  }

  getEntrenadorPorId(id: number): Entrenador | undefined {
    return this._entrenadores().find(e => e.id === id);
  }

  // Busca el entrenador por el ID de usuario (para el usuario logueado)
  getEntrenadorPorUsuarioId(usuarioId: number): Entrenador | undefined {
    return this._entrenadores().find(e => (e as any).usuarioId === usuarioId);
  }

  async actualizarEntrenador(entrenador: Partial<Entrenador> & { id: number }): Promise<void> {
    const payload = {
      experiencia_anios: entrenador.experiencia,
      nombre: entrenador.nombre,
      apellido: entrenador.apellido,
      dni: entrenador.dni,
      correo: entrenador.email,
      telefono: entrenador.telefono,
      activo: entrenador.activo
    };
    const response = await firstValueFrom(
      this.http.put<any>(`${this.apiUrl}${entrenador.id}`, payload)
    );
    const actE = this.mapToEntrenador(response);
    this._entrenadores.update(lista =>
      lista.map(e => e.id === actE.id ? actE : e)
    );
  }
}
