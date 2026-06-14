import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { MembresiaService } from '../../../services/membresia.service';
import { PagoService } from '../../../services/pago.service';
import { AsistenciaService } from '../../../services/asistencia.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdmin {
  private clienteService = inject(ClienteService);
  private membresiaService = inject(MembresiaService);
  private pagoService = inject(PagoService);
  private asistenciaService = inject(AsistenciaService);

  readonly totalClientes = computed(() => this.clienteService.clientes().length);
  readonly totalActivos = computed(() => this.clienteService.clientesActivos().length);

  readonly membresiasActivas = computed(() =>
    this.membresiaService.membresias().filter(m => m.estado === 'ACTIVA').length
  );

  readonly ingresosMensuales = computed(() => {
    const pagos = this.pagoService.pagos();
    const hoy = new Date();
    const esteMes = hoy.toISOString().substring(0, 7); // "YYYY-MM"
    return pagos
      .filter(p => p.fecha.startsWith(esteMes) && p.estado === 'PAGADO')
      .reduce((sum, p) => sum + p.monto, 0);
  });

  readonly asistenciaHoy = computed(() => this.asistenciaService.asistenciasHoy().length);

  readonly ultimosPagos = computed(() => {
    return this.pagoService.pagos()
      .map(p => {
        const cliente = this.clienteService.clientes().find(c => c.id === p.clienteId);
        return {
          ...p,
          nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Desconocido'
        };
      })
      .slice(-4)
      .reverse();
  });

  readonly ultimasAsistencias = computed(() => {
    return this.asistenciaService.asistencias()
      .map(a => {
        const cliente = this.clienteService.clientes().find(c => c.id === a.clienteId);
        return {
          ...a,
          nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Desconocido'
        };
      })
      .slice(-4)
      .reverse();
  });
}
