import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MembresiaService } from '../../../services/membresia.service';
import { PagoService } from '../../../services/pago.service';

@Component({
  selector: 'app-mi-membresia',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './mi-membresia.html',
  styleUrl: './mi-membresia.css',
})
export class MiMembresia {
  private membresiaSvc = inject(MembresiaService);
  private pagoSvc      = inject(PagoService);

  private readonly CLIENTE_ID = 5;

  readonly membresia = computed(() =>
    this.membresiaSvc.getMembresiaDeCliente(this.CLIENTE_ID)
  );

  readonly diasRestantes = computed(() => {
    const m = this.membresia();
    return m ? this.membresiaSvc.calcularDiasRestantes(m.fechaFin) : 0;
  });

  readonly porcentajeUsado = computed(() => {
    const m = this.membresia();
    if (!m) return 0;
    const inicio = new Date(m.fechaInicio).getTime();
    const fin    = new Date(m.fechaFin).getTime();
    const hoy    = new Date().getTime();
    const total  = fin - inicio;
    const usado  = hoy - inicio;
    return Math.min(100, Math.max(0, Math.round((usado / total) * 100)));
  });

  readonly historialMembresias = computed(() =>
    this.membresiaSvc.membresias().filter(m => m.clienteId === this.CLIENTE_ID)
  );

  estadoBadgeClass(estado: string): string {
    return estado === 'activa' ? 'gym-badge-success'
      : estado === 'vencida' ? 'gym-badge-danger'
      : estado === 'pendiente' ? 'gym-badge-warning'
      : 'gym-badge-gray';
  }
}
