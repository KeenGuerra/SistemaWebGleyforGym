import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Cliente } from '../models/cliente';
import { API_ENDPOINTS } from './api.config';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = API_ENDPOINTS.clientes;

  private _clientes = signal<Cliente[]>([]);

  readonly clientes = this._clientes.asReadonly();

  readonly clientesActivos = computed(() =>
    this._clientes().filter(c => c.activo)
  );

  private mapToCliente(c: any): Cliente {
    return {
      id: c.id,
      nombre: c.usuario.nombre,
      apellido: c.usuario.apellido,
      dni: c.usuario.dni,
      email: c.usuario.correo,
      telefono: c.usuario.telefono,
      rol: c.usuario.rol,
      activo: c.usuario.activo && c.activo,
      fechaRegistro: c.usuario.fecha_registro,
      avatar: c.usuario.avatar,
      membresiaId: c.membresia_id || 1,
      entrenadorId: c.entrenador_id || 1,
      objetivoId: c.objetivo_id || 3,
      objetivo: c.objetivo || 'Definición',
      peso: c.peso ? +c.peso : undefined,
      altura: c.altura ? +c.altura : undefined,
      fechaNacimiento: c.fecha_nacimiento,
      sexo: c.sexo,
      direccion: c.direccion,
      restriccionesMedicas: c.restricciones_medicas
    };
  }

  async cargarClientes(): Promise<Cliente[]> {
    try {
      const resp = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = resp.map(c => this.mapToCliente(c));
      this._clientes.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      return [];
    }
  }

  obtenerClientes(): Cliente[] {
    return this._clientes();
  }

  getClientePorId(id: number): Cliente | undefined {
    return this._clientes().find(c => c.id === id);
  }

  getClientesPorEntrenador(entrenadorId: number): Cliente[] {
    return this._clientes().filter(c => c.entrenadorId === entrenadorId);
  }

  async registrarCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    const payload = {
      objetivo_id: cliente.objetivoId || 3,
      peso: cliente.peso || 70,
      altura: cliente.altura || 1.70,
      fecha_nacimiento: cliente.fechaNacimiento || new Date().toISOString().split('T')[0],
      sexo: cliente.sexo || 'Femenino',
      direccion: cliente.direccion || '',
      restricciones_medicas: cliente.restriccionesMedicas || 'Ninguna',
      activo: true,
      usuario: {
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        dni: cliente.dni || '',
        correo: cliente.email,
        telefono: cliente.telefono,
        rol: 'CLIENTE',
        activo: true,
        password: (cliente as any).password || 'gleyfor1234'
      }
    };
    const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
    let nuevoC = this.mapToCliente(response);

    if (cliente.entrenadorId || cliente.membresiaId) {
      const updatePayload = {
        entrenador_id: cliente.entrenadorId || undefined,
        membresia_id: cliente.membresiaId || undefined
      };
      try {
        const updatedResponse = await firstValueFrom(
          this.http.put<any>(`${this.apiUrl}${nuevoC.id}`, updatePayload)
        );
        nuevoC = this.mapToCliente(updatedResponse);
      } catch (err) {
        console.error('Error al asignar membresía/entrenador tras creación:', err);
      }
    }

    this._clientes.update(lista => [...lista, nuevoC]);
    return nuevoC;
  }

  async actualizarCliente(cliente: Cliente): Promise<void> {
    const payload = {
      objetivo_id: cliente.objetivoId,
      peso: cliente.peso,
      altura: cliente.altura,
      fecha_nacimiento: cliente.fechaNacimiento,
      sexo: cliente.sexo,
      direccion: cliente.direccion,
      restricciones_medicas: cliente.restriccionesMedicas,
      entrenador_id: cliente.entrenadorId,
      membresia_id: cliente.membresiaId,
      activo: cliente.activo,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      dni: cliente.dni,
      correo: cliente.email,
      telefono: cliente.telefono
    };
    const response = await firstValueFrom(
      this.http.put<any>(`${this.apiUrl}${cliente.id}`, payload)
    );
    const actC = this.mapToCliente(response);
    this._clientes.update(lista =>
      lista.map(c => c.id === actC.id ? actC : c)
    );
  }

  async eliminarCliente(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<any>(`${this.apiUrl}${id}`));
    this._clientes.update(lista =>
      lista.map(c => c.id === id ? { ...c, activo: false } : c)
    );
  }
}
