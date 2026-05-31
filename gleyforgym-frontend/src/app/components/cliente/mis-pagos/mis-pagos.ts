import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { PagoService } from '../../../services/pago.service';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './mis-pagos.html',
  styleUrl: './mis-pagos.css',
})
export class MisPagos {
  private pagoSvc = inject(PagoService);

  private readonly CLIENTE_ID = 5;

  readonly filtroEstado = signal<'todos' | 'pagado' | 'pendiente' | 'cancelado'>('todos');

  readonly pagosFiltrados = computed(() => {
    const todos   = this.pagoSvc.obtenerPagos().filter(p => p.clienteId === this.CLIENTE_ID);
    const filtro  = this.filtroEstado();
    const lista   = filtro === 'todos' ? todos : todos.filter(p => p.estado === filtro);
    return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  readonly totalPagado = computed(() =>
    this.pagoSvc.obtenerPagos()
      .filter(p => p.clienteId === this.CLIENTE_ID && p.estado === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0)
  );

  readonly totalPendiente = computed(() =>
    this.pagoSvc.obtenerPagos()
      .filter(p => p.clienteId === this.CLIENTE_ID && p.estado === 'pendiente')
      .reduce((sum, p) => sum + p.monto, 0)
  );

  cambiarFiltro(estado: 'todos' | 'pagado' | 'pendiente' | 'cancelado'): void {
    this.filtroEstado.set(estado);
  }

  estadoBadgeClass(estado: string): string {
    return estado === 'pagado' ? 'gym-badge-success'
      : estado === 'pendiente' ? 'gym-badge-warning'
      : 'gym-badge-danger';
  }

  metodoBadgeClass(metodo: string): string {
    return metodo === 'tarjeta' ? 'gym-badge-info'
      : metodo === 'transferencia' ? 'gym-badge-orange'
      : 'gym-badge-gray';
  }

  metodIcono(metodo: string): string {
    return metodo === 'tarjeta' ? 'bi-credit-card-fill'
      : metodo === 'transferencia' ? 'bi-bank'
      : 'bi-cash-stack';
  }
}
