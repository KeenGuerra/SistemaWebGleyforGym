import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/cliente';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/clientes'; // Configuración base para FastAPI


  private _clientes = signal<Cliente[]>([
    {
      id: 5, nombre: 'María', apellido: 'González', email: 'maria.gonzalez@email.com',
      telefono: '809-555-5678', rol: 'cliente', activo: true,
      fechaRegistro: '2024-03-10', membresiaId: 1, entrenadorId: 1,
      objetivo: 'Pérdida de peso', peso: 68, altura: 165
    },
    {
      id: 6, nombre: 'José', apellido: 'Martínez', email: 'jose.martinez@email.com',
      telefono: '809-555-9012', rol: 'cliente', activo: true,
      fechaRegistro: '2024-02-20', membresiaId: 2, entrenadorId: 1,
      objetivo: 'Ganancia muscular', peso: 78, altura: 178
    },
    {
      id: 7, nombre: 'Ana', apellido: 'López', email: 'ana.lopez@email.com',
      telefono: '809-555-3456', rol: 'cliente', activo: true,
      fechaRegistro: '2024-04-05', membresiaId: 3, entrenadorId: 1,
      objetivo: 'Tonificación', peso: 62, altura: 162
    },
    {
      id: 8, nombre: 'Pedro', apellido: 'Sánchez', email: 'pedro.sanchez@email.com',
      telefono: '809-555-7890', rol: 'cliente', activo: false,
      fechaRegistro: '2024-01-30', membresiaId: 4, entrenadorId: 1,
      objetivo: 'Resistencia', peso: 85, altura: 180
    },
    {
      id: 9, nombre: 'Laura', apellido: 'Díaz', email: 'laura.diaz@email.com',
      telefono: '809-555-2345', rol: 'cliente', activo: true,
      fechaRegistro: '2024-05-12', membresiaId: 5, entrenadorId: 1,
      objetivo: 'Flexibilidad', peso: 55, altura: 158
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
