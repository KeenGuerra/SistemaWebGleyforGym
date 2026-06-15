import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/usuarios';

  private _usuarios = signal<Usuario[]>([]);
  private _usuarioActual = signal<Usuario | null>(null);

  readonly usuarios = this._usuarios.asReadonly();
  
  readonly usuarioActual = computed(() => {
    const u = this._usuarioActual();
    if (u) return u;
    // Fallback seguro si no hay sesión
    return {
      id: 0, nombre: 'Invitado', apellido: '', dni: '', email: '',
      telefono: '', rol: 'CLIENTE' as const, activo: false, fechaRegistro: ''
    };
  });

  readonly nombreCompleto = computed(() => {
    const u = this.usuarioActual();
    return `${u.nombre} ${u.apellido}`.trim();
  });

  readonly iniciales = computed(() => {
    const u = this.usuarioActual();
    if (!u.nombre) return 'US';
    return `${u.nombre.charAt(0)}${u.apellido?.charAt(0) || ''}`.toUpperCase();
  });

  constructor() {
    this.checkSession();
  }

  private mapToUsuario(u: any): Usuario {
    return {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      dni: u.dni,
      email: u.correo,
      telefono: u.telefono,
      rol: u.rol,
      activo: u.activo,
      fechaRegistro: u.fecha_registro,
      avatar: u.avatar
    };
  }

  async checkSession(): Promise<Usuario | null> {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const u = await firstValueFrom(this.http.get<any>('http://localhost:8000/api/auth/me'));
      const mapped = this.mapToUsuario(u);
      this._usuarioActual.set(mapped);
      return mapped;
    } catch (err) {
      localStorage.removeItem('access_token');
      this._usuarioActual.set(null);
      return null;
    }
  }

  async login(correo: string, contrasenia: string): Promise<Usuario | null> {
    const resp = await firstValueFrom(
      this.http.post<any>('http://localhost:8000/api/auth/login', { correo, password: contrasenia })
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', resp.access_token);
    }
    const user = await this.checkSession();
    return user;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    this._usuarioActual.set(null);
    this._usuarios.set([]);
  }

  getUsuarioActual(): Usuario {
    return this.usuarioActual();
  }

  obtenerUsuarios(): Usuario[] {
    return this._usuarios();
  }

  async cargarUsuarios(): Promise<Usuario[]> {
    try {
      const users = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      const mapped = users.map(u => this.mapToUsuario(u));
      this._usuarios.set(mapped);
      return mapped;
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      return [];
    }
  }

  async registrarUsuario(usuario: Omit<Usuario, 'id' | 'fechaRegistro'>): Promise<Usuario> {
    const payload = {
      ...usuario,
      correo: usuario.email,
      password: (usuario as any).password || 'gleyfor1234' // Contraseña temporal por defecto
    };
    const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
    const nuevoU = this.mapToUsuario(response);
    this._usuarios.update(lista => [...lista, nuevoU]);
    return nuevoU;
  }

  async registrarPublico(usuario: any): Promise<Usuario> {
    const randomDni = usuario.dni || Math.floor(10000000 + Math.random() * 90000000).toString();
    const response = await firstValueFrom(
      this.http.post<any>('http://localhost:8000/api/auth/register', {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.email,
        telefono: usuario.telefono,
        password: usuario.password,
        dni: randomDni,
        rol: 'CLIENTE',
        activo: true
      })
    );
    return this.mapToUsuario(response);
  }

  async actualizarUsuario(usuario: Usuario): Promise<void> {
    const payload = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      dni: usuario.dni,
      correo: usuario.email,
      telefono: usuario.telefono,
      rol: usuario.rol,
      activo: usuario.activo,
      password: (usuario as any).password || undefined
    };
    const response = await firstValueFrom(
      this.http.put<any>(`${this.apiUrl}/${usuario.id}`, payload)
    );
    const actU = this.mapToUsuario(response);
    this._usuarios.update(lista =>
      lista.map(u => u.id === actU.id ? actU : u)
    );
    if (this._usuarioActual()?.id === actU.id) {
      this._usuarioActual.set(actU);
    }
  }

  async eliminarUsuario(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<any>(`${this.apiUrl}/${id}`));
    this._usuarios.update(lista =>
      lista.map(u => u.id === id ? { ...u, activo: false } : u)
    );
  }
}
