import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PagoService } from '../../../services/pago.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './mis-pagos.html',
  styleUrl: './mis-pagos.css',
})
export class MisPagos {
  private pagoSvc = inject(PagoService);
  private usuarioSvc = inject(UsuarioService);
  private clienteSvc = inject(ClienteService);

  readonly clienteActual = computed(() => {
    const user = this.usuarioSvc.usuarioActual();
    return this.clienteSvc.clientes().find(c => c.email === user.email);
  });

  readonly CLIENTE_ID = computed(() => this.clienteActual()?.id || 0);

  readonly filtroEstado = signal<'todos' | 'PAGADO' | 'PENDIENTE' | 'ANULADO'>('todos');

  readonly pagosFiltrados = computed(() => {
    const id = this.CLIENTE_ID();
    const todos   = this.pagoSvc.obtenerPagos().filter(p => p.clienteId === id);
    const filtro  = this.filtroEstado();
    const lista   = filtro === 'todos' ? todos : todos.filter(p => p.estado === filtro);
    return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  readonly totalPagado = computed(() => {
    const id = this.CLIENTE_ID();
    return this.pagoSvc.obtenerPagos()
      .filter(p => p.clienteId === id && p.estado === 'PAGADO')
      .reduce((sum, p) => sum + p.monto, 0);
  });

  readonly totalPendiente = computed(() => {
    const id = this.CLIENTE_ID();
    return this.pagoSvc.obtenerPagos()
      .filter(p => p.clienteId === id && p.estado === 'PENDIENTE')
      .reduce((sum, p) => sum + p.monto, 0);
  });

  cambiarFiltro(estado: 'todos' | 'PAGADO' | 'PENDIENTE' | 'ANULADO'): void {
    this.filtroEstado.set(estado);
  }

  estadoBadgeClass(estado: string): string {
    return estado === 'PAGADO' ? 'gym-badge-success'
      : estado === 'PENDIENTE' ? 'gym-badge-warning'
      : 'gym-badge-danger';
  }

  metodoBadgeClass(metodo: string): string {
    return metodo === 'TARJETA' ? 'gym-badge-info'
      : metodo === 'TRANSFERENCIA' ? 'gym-badge-orange'
      : 'gym-badge-gray';
  }

  metodIcono(metodo: string): string {
    return metodo === 'TARJETA' ? 'bi-credit-card-fill'
      : metodo === 'TRANSFERENCIA' ? 'bi-bank'
      : 'bi-cash-stack';
  }
}

