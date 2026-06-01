import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembresiaService } from '../../../services/membresia.service';
import { ClienteService } from '../../../services/cliente.service';
import { PagoService } from '../../../services/pago.service';
import { Membresia } from '../../../models/membresia';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './membresias.html',
  styleUrl: './membresias.css',
})
export class Membresias {
  private membresiaService = inject(MembresiaService);
  private clienteService = inject(ClienteService);
  private pagoService = inject(PagoService);

  // Filtros
  readonly selectedFilter = signal<'todas' | 'activas' | 'vencidas'>('todas');

  // Modales
  readonly showRenewModal = signal<boolean>(false);
  readonly selectedMembresia = signal<Membresia | null>(null);

  // Writable Signals de Formulario
  readonly clienteId = signal<number>(0);
  readonly tipo = signal('Mensual Premium');
  readonly precio = signal(2500);
  readonly meses = signal(1);

  // Estados Touched
  readonly tipoTouched = signal(false);
  readonly precioTouched = signal(false);
  readonly mesesTouched = signal(false);

  // Validaciones
  readonly tipoInvalid = computed(() => this.tipo().trim() === '');
  readonly precioInvalid = computed(() => this.precio() < 0);
  readonly mesesInvalid = computed(() => this.meses() < 1);

  readonly formInvalid = computed(() => {
    return this.tipoInvalid() || this.precioInvalid() || this.mesesInvalid();
  });

  // Lista decorada con nombres
  readonly membresiasDecoradas = computed(() => {
    const list = this.membresiaService.membresias();
    const filter = this.selectedFilter();

    const decoradas = list.map(m => {
      const cliente = this.clienteService.getClientePorId(m.clienteId);
      const diasRestantes = this.membresiaService.calcularDiasRestantes(m.fechaFin);
      return {
        ...m,
        nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Inactivo/Eliminado',
        diasRestantesCalculados: diasRestantes,
        estaVencida: diasRestantes === 0 || m.estado === 'vencida'
      };
    });

    return decoradas.filter(m => {
      if (filter === 'activas') return !m.estaVencida;
      if (filter === 'vencidas') return m.estaVencida;
      return true;
    });
  });

  setFilter(filter: 'todas' | 'activas' | 'vencidas'): void {
    this.selectedFilter.set(filter);
  }

  openRenewModal(membresia: Membresia): void {
    this.selectedMembresia.set(membresia);
    this.clienteId.set(membresia.clienteId);
    this.tipo.set(membresia.tipo);
    this.precio.set(membresia.precio);
    this.meses.set(1);

    this.tipoTouched.set(false);
    this.precioTouched.set(false);
    this.mesesTouched.set(false);

    this.showRenewModal.set(true);
  }

  closeRenewModal(): void {
    this.showRenewModal.set(false);
    this.selectedMembresia.set(null);
  }

  onPlanChange(event: Event): void {
    const plan = (event.target as HTMLSelectElement).value;
    this.tipo.set(plan);
    let pVal = 2500;
    let mVal = 1;

    if (plan === 'Mensual Premium') {
      pVal = 2500;
      mVal = 1;
    } else if (plan === 'Trimestral') {
      pVal = 6500;
      mVal = 3;
    } else if (plan === 'Mensual Básica') {
      pVal = 1800;
      mVal = 1;
    } else if (plan === 'Anual') {
      pVal = 24000;
      mVal = 12;
    }

    this.precio.set(pVal);
    this.meses.set(mVal);
  }

  saveRenewal(): void {
    this.tipoTouched.set(true);
    this.precioTouched.set(true);
    this.mesesTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const m = this.selectedMembresia();

    if (m) {
      // Renovar en servicio
      this.membresiaService.renovarMembresia(m.clienteId, this.tipo(), this.precio(), this.meses());

      // Registrar pago
      this.pagoService.agregarPago({
        clienteId: m.clienteId,
        monto: this.precio(),
        fecha: new Date().toISOString().split('T')[0],
        concepto: `Renovación de Membresía ${this.tipo()}`,
        metodo: 'tarjeta',
        estado: 'pagado'
      });
    }

    this.closeRenewModal();
  }
}

