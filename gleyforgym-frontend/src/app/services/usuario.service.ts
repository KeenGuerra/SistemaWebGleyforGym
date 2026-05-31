import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private _usuarios = signal<Usuario[]>([
    {
      id: 1, nombre: 'Carlos', apellido: 'Ramírez', email: 'carlos.ramirez@gleyforgym.com',
      telefono: '809-555-1234', rol: 'entrenador', activo: true, fechaRegistro: '2024-01-15'
    },
    {
      id: 2, nombre: 'Sofía', apellido: 'Castro', email: 'sofia.castro@gleyforgym.com',
      telefono: '809-555-4567', rol: 'entrenador', activo: true, fechaRegistro: '2024-02-01'
    },
    {
      id: 5, nombre: 'María', apellido: 'González', email: 'maria.gonzalez@email.com',
      telefono: '809-555-5678', rol: 'cliente', activo: true, fechaRegistro: '2024-03-10'
    },
    {
      id: 6, nombre: 'José', apellido: 'Martínez', email: 'jose.martinez@email.com',
      telefono: '809-555-9012', rol: 'cliente', activo: true, fechaRegistro: '2024-02-20'
    },
    {
      id: 7, nombre: 'Ana', apellido: 'López', email: 'ana.lopez@email.com',
      telefono: '809-555-3456', rol: 'cliente', activo: true, fechaRegistro: '2024-04-05'
    },
    {
      id: 8, nombre: 'Pedro', apellido: 'Sánchez', email: 'pedro.sanchez@email.com',
      telefono: '809-555-7890', rol: 'cliente', activo: false, fechaRegistro: '2024-01-30'
    },
    {
      id: 9, nombre: 'Laura', apellido: 'Díaz', email: 'laura.diaz@email.com',
      telefono: '809-555-2345', rol: 'cliente', activo: true, fechaRegistro: '2024-05-12'
    },
    {
      id: 10, nombre: 'Abraham', apellido: 'Gómez', email: 'admin@gleyforgym.com',
      telefono: '809-555-0000', rol: 'admin', activo: true, fechaRegistro: '2024-01-01'
    }
  ]);

  private _usuarioActual = signal<Usuario>({
    id: 10,
    nombre: 'Abraham',
    apellido: 'Gómez',
    email: 'admin@gleyforgym.com',
    telefono: '809-555-0000',
    rol: 'admin',
    activo: true,
    fechaRegistro: '2024-01-01',
  });

  readonly usuarios = this._usuarios.asReadonly();
  readonly usuarioActual = this._usuarioActual.asReadonly();

  readonly nombreCompleto = computed(() =>
    `${this._usuarioActual().nombre} ${this._usuarioActual().apellido}`
  );

  readonly iniciales = computed(() => {
    const u = this._usuarioActual();
    return `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
  });

  getUsuarioActual(): Usuario {
    return this._usuarioActual();
  }

  obtenerUsuarios(): Usuario[] {
    return this._usuarios();
  }

  registrarUsuario(usuario: Omit<Usuario, 'id' | 'fechaRegistro'>): Usuario {
    const nuevoId = Math.max(...this._usuarios().map(u => u.id)) + 1;
    const nuevoUsuario: Usuario = { ...usuario, id: nuevoId, fechaRegistro: new Date().toISOString().split('T')[0] };
    this._usuarios.update(lista => [...lista, nuevoUsuario]);
    return nuevoUsuario;
  }

  actualizarUsuario(usuario: Usuario): void {
    this._usuarios.update(lista =>
      lista.map(u => u.id === usuario.id ? { ...u, ...usuario } : u)
    );
    if (this._usuarioActual().id === usuario.id) {
      this._usuarioActual.set(usuario);
    }
  }

  eliminarUsuario(id: number): void {
    this._usuarios.update(lista =>
      lista.map(u => u.id === id ? { ...u, activo: false } : u)
    );
  }

  loginSimulado(email: string, contrasenia: string): Usuario | null {
    // Buscar en la lista de usuarios
    const u = this._usuarios().find(user => user.email === email);
    if (u && contrasenia) {
      // Simular login exitoso
      this._usuarioActual.set(u);
      return u;
    }
    return null;
  }

  simularRol(rol: 'admin' | 'entrenador' | 'cliente'): void {
    const u = this._usuarios().find(user => user.rol === rol);
    if (u) {
      this._usuarioActual.set(u);
    }
  }
}
