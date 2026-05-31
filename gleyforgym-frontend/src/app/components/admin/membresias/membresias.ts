import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MembresiaService } from '../../../services/membresia.service';
import { ClienteService } from '../../../services/cliente.service';
import { PagoService } from '../../../services/pago.service';
import { Membresia } from '../../../models/membresia';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './membresias.html',
  styleUrl: './membresias.css',
})
export class Membresias {
  private membresiaService = inject(MembresiaService);
  private clienteService = inject(ClienteService);
  private pagoService = inject(PagoService);
  private fb = inject(FormBuilder);

  // Filtros
  readonly selectedFilter = signal<'todas' | 'activas' | 'vencidas'>('todas');

  // Modales
  readonly showRenewModal = signal<boolean>(false);
  readonly selectedMembresia = signal<Membresia | null>(null);

  // Formulario reactivo
  renewForm: FormGroup = this.fb.group({
    clienteId: [{ value: '', disabled: true }, [Validators.required]],
    tipo: ['Mensual Premium', [Validators.required]],
    precio: [2500, [Validators.required, Validators.min(0)]],
    meses: [1, [Validators.required, Validators.min(1)]]
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
    this.renewForm.patchValue({
      clienteId: membresia.clienteId,
      tipo: membresia.tipo,
      precio: membresia.precio,
      meses: 1
    });
    this.showRenewModal.set(true);
  }

  closeRenewModal(): void {
    this.showRenewModal.set(false);
    this.selectedMembresia.set(null);
  }

  onPlanChange(event: Event): void {
    const plan = (event.target as HTMLSelectElement).value;
    let precio = 2500;
    let meses = 1;

    if (plan === 'Mensual Premium') {
      precio = 2500;
      meses = 1;
    } else if (plan === 'Trimestral') {
      precio = 6500;
      meses = 3;
    } else if (plan === 'Mensual Básica') {
      precio = 1800;
      meses = 1;
    } else if (plan === 'Anual') {
      precio = 24000;
      meses = 12;
    }

    this.renewForm.patchValue({ precio, meses });
  }

  saveRenewal(): void {
    if (this.renewForm.invalid) {
      this.renewForm.markAllAsTouched();
      return;
    }

    const { tipo, precio, meses } = this.renewForm.value;
    const m = this.selectedMembresia();

    if (m) {
      // Renovar en servicio
      this.membresiaService.renovarMembresia(m.clienteId, tipo, precio, meses);

      // Registrar pago
      this.pagoService.agregarPago({
        clienteId: m.clienteId,
        monto: precio,
        fecha: new Date().toISOString().split('T')[0],
        concepto: `Renovación de Membresía ${tipo}`,
        metodo: 'tarjeta',
        estado: 'pagado'
      });
    }

    this.closeRenewModal();
  }
}
