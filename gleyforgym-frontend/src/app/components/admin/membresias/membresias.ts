import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
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

  // Signals de Carga y Error
  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Modelo del Formulario
  public renewModel = signal({
    clienteId: 0,
    tipo: 'Mensual Premium',
    precio: 2500,
    meses: 1
  });
  public renewForm = form(this.renewModel);

  // Estados Touched
  public tipoTouched = signal(false);
  public precioTouched = signal(false);
  public mesesTouched = signal(false);

  // Validaciones
  public tipoErrores = computed(() => {
    const valor = this.renewForm.tipo().value().trim();
    if (!valor) return 'El tipo de membresía es obligatorio.';
    return null;
  });

  public precioErrores = computed(() => {
    const valor = this.renewForm.precio().value();
    if (valor === null || valor === undefined) return 'El precio es obligatorio.';
    if (valor <= 0) return 'El precio debe ser un valor positivo.';
    return null;
  });

  public mesesErrores = computed(() => {
    const valor = this.renewForm.meses().value();
    if (valor === null || valor === undefined) return 'Los meses son obligatorios.';
    if (valor <= 0) return 'La cantidad de meses debe ser mayor a cero.';
    return null;
  });

  public formularioValido = computed(() => {
    return !this.tipoErrores() && !this.precioErrores() && !this.mesesErrores();
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
    this.renewModel.set({
      clienteId: membresia.clienteId,
      tipo: membresia.tipo,
      precio: membresia.precio,
      meses: 1
    });

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

    this.renewModel.update(m => ({
      ...m,
      tipo: plan,
      precio: pVal,
      meses: mVal
    }));
  }

  saveRenewal(): void {
    this.tipoTouched.set(true);
    this.precioTouched.set(true);
    this.mesesTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    const m = this.selectedMembresia();

    if (m) {
      this.cargando.set(true);
      this.error.set(null);
      // Renovar en servicio
      this.membresiaService.renovarMembresia(m.clienteId, this.renewForm.tipo().value(), this.renewForm.precio().value(), this.renewForm.meses().value());

      // Registrar pago
      this.pagoService.agregarPago({
        clienteId: m.clienteId,
        monto: this.renewForm.precio().value(),
        fecha: new Date().toISOString().split('T')[0],
        concepto: `Renovación de Membresía ${this.renewForm.tipo().value()}`,
        metodo: 'tarjeta',
        estado: 'pagado'
      });
      this.cargando.set(false);
    }

    this.closeRenewModal();
  }
}

