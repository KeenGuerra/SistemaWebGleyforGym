import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/cliente';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/clientes';

  private _clientes = signal<Cliente[]>([
    {
      id: 5, nombre: 'María', apellido: 'González', dni: '444444444444', email: 'maria.gonzalez@email.com',
      telefono: '809-555-5678', rol: 'CLIENTE', activo: true,
      fechaRegistro: '2024-03-10', membresiaId: 1, entrenadorId: 1,
      objetivoId: 2, objetivo: 'Perder peso', peso: 68, altura: 1.65,
      fechaNacimiento: '1999-05-15', sexo: 'Femenino', direccion: 'Calle Principal #123, Santo Domingo', restriccionesMedicas: 'Ninguna'
    },
    {
      id: 6, nombre: 'José', apellido: 'Martínez', dni: '555555555555', email: 'jose.martinez@email.com',
      telefono: '809-555-9012', rol: 'CLIENTE', activo: true,
      fechaRegistro: '2024-02-20', membresiaId: 2, entrenadorId: 1,
      objetivoId: 1, objetivo: 'Ganar masa muscular', peso: 78, altura: 1.78,
      fechaNacimiento: '1995-10-22', sexo: 'Masculino', direccion: 'Calle Secundaria #456, Santo Domingo', restriccionesMedicas: 'Ninguna'
    },
    {
      id: 7, nombre: 'Ana', apellido: 'López', dni: '666666666666', email: 'ana.lopez@email.com',
      telefono: '809-555-3456', rol: 'CLIENTE', activo: true,
      fechaRegistro: '2024-04-05', membresiaId: 3, entrenadorId: 2,
      objetivoId: 3, objetivo: 'Tonificación', peso: 62, altura: 1.60,
      fechaNacimiento: '2001-01-30', sexo: 'Femenino', direccion: 'Av. Winston Churchill #789, Santo Domingo', restriccionesMedicas: 'Ninguna'
    },
    {
      id: 8, nombre: 'Pedro', apellido: 'Sánchez', dni: '888888888888', email: 'pedro.sanchez@email.com',
      telefono: '809-555-7890', rol: 'CLIENTE', activo: false,
      fechaRegistro: '2024-01-30', membresiaId: 4, entrenadorId: 2,
      objetivoId: 4, objetivo: 'Resistencia', peso: 85, altura: 1.80,
      fechaNacimiento: '1990-11-12', sexo: 'Masculino', direccion: 'Calle 5 #55, Santo Domingo', restriccionesMedicas: 'Asma leve'
    },
    {
      id: 9, nombre: 'Laura', apellido: 'Díaz', dni: '777777777777', email: 'laura.diaz@email.com',
      telefono: '809-555-2345', rol: 'CLIENTE', activo: true,
      fechaRegistro: '2024-05-12', membresiaId: 5, entrenadorId: 2,
      objetivoId: 5, objetivo: 'Salud general', peso: 55, altura: 1.68,
      fechaNacimiento: '1997-07-07', sexo: 'Femenino', direccion: 'Calle Lope de Vega #10, Santo Domingo', restriccionesMedicas: 'Ninguna'
    },
  ]);

  readonly clientes = this._clientes.asReadonly();

  obtenerClientes(): Cliente[] {
    return this._clientes();
  }

  readonly clientesActivos = computed(() =>
    this._clientes().filter(c => c.activo)
  );

  getClientePorId(id: number): Cliente | undefined {
    return this._clientes().find(c => c.id === id);
  }

  getClientesPorEntrenador(entrenadorId: number): Cliente[] {
    return this._clientes().filter(c => c.entrenadorId === entrenadorId);
  }

  registrarCliente(cliente: Omit<Cliente, 'id'>): Cliente {
    const nuevoId = Math.max(...this._clientes().map(c => c.id), 0) + 1;
    const nuevoCliente: Cliente = {
      ...cliente,
      id: nuevoId,
      fechaRegistro: new Date().toISOString().split('T')[0],
      activo: true
    };
    this._clientes.update(lista => [...lista, nuevoCliente]);
    return nuevoCliente;
  }

  actualizarCliente(cliente: Cliente): void {
    this._clientes.update(lista =>
      lista.map(c => c.id === cliente.id ? { ...c, ...cliente } : c)
    );
  }

  eliminarCliente(id: number): void {
    this._clientes.update(lista =>
      lista.map(c => c.id === id ? { ...c, activo: false } : c)
    );
  }
}
