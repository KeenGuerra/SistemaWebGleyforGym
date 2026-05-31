import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { MembresiaService } from '../../../services/membresia.service';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-clientes-asignados',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './clientes-asignados.html',
  styleUrl: './clientes-asignados.css',
})
export class ClientesAsignados {
  private clienteSvc   = inject(ClienteService);
  private membresiaSvc = inject(MembresiaService);

  readonly textoBusqueda = signal('');
  readonly filtroEstado  = signal<'todos' | 'activo' | 'inactivo'>('todos');

  readonly clientes = computed(() => {
    const lista  = this.clienteSvc.getClientesPorEntrenador(1);
    const texto  = this.textoBusqueda().toLowerCase();
    const estado = this.filtroEstado();

    return lista.filter(c => {
      const coincideTexto = !texto || `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(texto);
      const coincideEstado = estado === 'todos' ||
        (estado === 'activo' && c.activo) ||
        (estado === 'inactivo' && !c.activo);
      return coincideTexto && coincideEstado;
    });
  });

  readonly totalActivos   = computed(() => this.clienteSvc.getClientesPorEntrenador(1).filter(c => c.activo).length);
  readonly totalInactivos = computed(() => this.clienteSvc.getClientesPorEntrenador(1).filter(c => !c.activo).length);

  buscar(evento: Event): void {
    this.textoBusqueda.set((evento.target as HTMLInputElement).value);
  }

  cambiarFiltro(estado: 'todos' | 'activo' | 'inactivo'): void {
    this.filtroEstado.set(estado);
  }

  iniciales(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getMembresiaEstado(clienteId: number): string {
    const m = this.membresiaSvc.getMembresiaDeCliente(clienteId);
    return m ? m.estado : 'sin membresía';
  }
}
