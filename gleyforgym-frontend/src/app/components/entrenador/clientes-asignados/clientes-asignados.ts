import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { MembresiaService } from '../../../services/membresia.service';
import { Cliente } from '../../../models/cliente';
import { Paginacion } from '../../compartido/paginacion/paginacion';
import { UsuarioService } from '../../../services/usuario.service';
import { EntrenadorService } from '../../../services/entrenador.service';

@Component({
  selector: 'app-clientes-asignados',
  standalone: true,
  imports: [RouterLink, Paginacion],
  templateUrl: './clientes-asignados.html',
  styleUrl: './clientes-asignados.css',
})
export class ClientesAsignados {
  private clienteSvc   = inject(ClienteService);
  private membresiaSvc = inject(MembresiaService);
  private usuarioSvc    = inject(UsuarioService);
  private entrenadorSvc = inject(EntrenadorService);

  private readonly entrenadorIdActual = computed(() => {
    const usuarioId = this.usuarioSvc.usuarioActual().id;
    const ent = this.entrenadorSvc.getEntrenadorPorUsuarioId(usuarioId);
    return ent?.id ?? 0;
  });

  readonly textoBusqueda = signal('');
  readonly filtroEstado  = signal<'todos' | 'activo' | 'inactivo'>('todos');

  // Paginación
  readonly paginaActual = signal<number>(1);
  readonly itemsPorPagina = 10;

  readonly clientes = computed(() => {
    const eid = this.entrenadorIdActual();
    const lista  = this.clienteSvc.obtenerClientes().filter(c => c.entrenadorId === eid);
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

  // Lista paginada
  readonly paginatedClientes = computed(() => {
    const list = this.clientes();
    const page = this.paginaActual();
    const start = (page - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    return list.slice(start, end);
  });

  readonly totalActivos   = computed(() => {
    const eid = this.entrenadorIdActual();
    return this.clienteSvc.getClientesPorEntrenador(eid).filter(c => c.activo).length;
  });
  readonly totalInactivos = computed(() => {
    const eid = this.entrenadorIdActual();
    return this.clienteSvc.getClientesPorEntrenador(eid).filter(c => !c.activo).length;
  });

  buscar(evento: Event): void {
    this.textoBusqueda.set((evento.target as HTMLInputElement).value);
    this.paginaActual.set(1);
  }

  cambiarFiltro(estado: 'todos' | 'activo' | 'inactivo'): void {
    this.filtroEstado.set(estado);
    this.paginaActual.set(1);
  }

  iniciales(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getMembresiaEstado(clienteId: number): string {
    const m = this.membresiaSvc.getMembresiaDeCliente(clienteId);
    return m ? m.estado : 'sin membresía';
  }
}
