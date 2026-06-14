import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/api/usuarios';

  private _usuarios = signal<Usuario[]>([
    {
      id: 1, nombre: 'Carlos', apellido: 'Ramírez', dni: '222222222222', email: 'carlos.ramirez@gleyforgym.com',
      telefono: '809-555-1234', rol: 'ENTRENADOR', activo: true, fechaRegistro: '2024-01-15'
    },
    {
      id: 2, nombre: 'Sofía', apellido: 'Castro', dni: '333333333333', email: 'sofia.castro@gleyforgym.com',
      telefono: '809-555-4567', rol: 'ENTRENADOR', activo: true, fechaRegistro: '2024-02-01'
    },
    {
      id: 5, nombre: 'María', apellido: 'González', dni: '444444444444', email: 'maria.gonzalez@email.com',
      telefono: '809-555-5678', rol: 'CLIENTE', activo: true, fechaRegistro: '2024-03-10'
    },
    {
      id: 6, nombre: 'José', apellido: 'Martínez', dni: '555555555555', email: 'jose.martinez@email.com',
      telefono: '809-555-9012', rol: 'CLIENTE', activo: true, fechaRegistro: '2024-02-20'
    },
    {
      id: 7, nombre: 'Ana', apellido: 'López', dni: '666666666666', email: 'ana.lopez@email.com',
      telefono: '809-555-3456', rol: 'CLIENTE', activo: true, fechaRegistro: '2024-04-05'
    },
    {
      id: 8, nombre: 'Pedro', apellido: 'Sánchez', dni: '888888888888', email: 'pedro.sanchez@email.com',
      telefono: '809-555-7890', rol: 'CLIENTE', activo: false, fechaRegistro: '2024-01-30'
    },
    {
      id: 9, nombre: 'Laura', apellido: 'Díaz', dni: '777777777777', email: 'laura.diaz@email.com',
      telefono: '809-555-2345', rol: 'CLIENTE', activo: true, fechaRegistro: '2024-05-12'
    },
    {
      id: 10, nombre: 'Abraham', apellido: 'Gómez', dni: '111111111111', email: 'admin@gleyforgym.com',
      telefono: '809-555-0000', rol: 'ADMINISTRADOR', activo: true, fechaRegistro: '2024-01-01'
    }
  ]);

  private _usuarioActual = signal<Usuario>({
    id: 10,
    nombre: 'Abraham',
    apellido: 'Gómez',
    dni: '111111111111',
    email: 'admin@gleyforgym.com',
    telefono: '809-555-0000',
    rol: 'ADMINISTRADOR',
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
    const u = this._usuarios().find(user => user.email === email);
    if (u && contrasenia) {
      this._usuarioActual.set(u);
      return u;
    }
    return null;
  }

  simularRol(rol: 'ADMINISTRADOR' | 'ENTRENADOR' | 'CLIENTE'): void {
    const u = this._usuarios().find(user => user.rol === rol);
    if (u) {
      this._usuarioActual.set(u);
    }
  }
}
