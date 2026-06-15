import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MembresiaService } from '../../../services/membresia.service';
import { PagoService } from '../../../services/pago.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ClienteService } from '../../../services/cliente.service';

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
  private usuarioSvc   = inject(UsuarioService);
  private clienteSvc   = inject(ClienteService);

  readonly clienteActual = computed(() => {
    const user = this.usuarioSvc.usuarioActual();
    return this.clienteSvc.clientes().find(c => c.email === user.email);
  });

  readonly CLIENTE_ID = computed(() => this.clienteActual()?.id || 0);

  readonly membresia = computed(() =>
    this.membresiaSvc.getMembresiaDeCliente(this.CLIENTE_ID())
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
    this.membresiaSvc.membresias().filter(m => m.clienteId === this.CLIENTE_ID())
  );

  estadoBadgeClass(estado: string): string {
    return estado === 'ACTIVA' ? 'gym-badge-success'
      : estado === 'VENCIDA' ? 'gym-badge-danger'
      : estado === 'CANCELADA' ? 'gym-badge-warning'
      : 'gym-badge-gray';
  }
}
