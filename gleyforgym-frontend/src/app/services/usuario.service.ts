import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private _usuarioActual = signal<Usuario>({
    id: 1,
    nombre: 'Carlos',
    apellido: 'Ramírez',
    email: 'carlos.ramirez@gleyforgym.com',
    telefono: '809-555-1234',
    rol: 'entrenador',
    activo: true,
    fechaRegistro: '2024-01-15',
  });

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

  simularRol(rol: 'entrenador' | 'cliente'): void {
    if (rol === 'entrenador') {
      this._usuarioActual.set({
        id: 1,
        nombre: 'Carlos',
        apellido: 'Ramírez',
        email: 'carlos.ramirez@gleyforgym.com',
        telefono: '809-555-1234',
        rol: 'entrenador',
        activo: true,
        fechaRegistro: '2024-01-15',
      });
    } else {
      this._usuarioActual.set({
        id: 5,
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@email.com',
        telefono: '809-555-5678',
        rol: 'cliente',
        activo: true,
        fechaRegistro: '2024-03-10',
      });
    }
  }
}
