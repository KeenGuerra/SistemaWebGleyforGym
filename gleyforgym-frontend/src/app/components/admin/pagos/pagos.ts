import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { PagoService } from '../../../services/pago.service';
import { ClienteService } from '../../../services/cliente.service';
import { Pago, MetodoPago, EstadoPago } from '../../../models/pago';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos {
  private pagoService = inject(PagoService);
  private clienteService = inject(ClienteService);

  // Filtros
  readonly selectedFilter = signal<'todos' | 'pagado' | 'pendiente'>('todos');
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);

  // Signals de Carga y Error
  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Modelo del Formulario
  public pagoModel = signal({
    clienteId: 0,
    monto: 0,
    concepto: 'Cuota Mensual',
    metodo: 'tarjeta' as MetodoPago,
    estado: 'pagado' as EstadoPago
  });
  public pagoForm = form(this.pagoModel);

  // Estados Touched
  public clienteIdTouched = signal(false);
  public montoTouched = signal(false);
  public conceptoTouched = signal(false);
  public metodoTouched = signal(false);
  public estadoTouched = signal(false);

  // Validaciones
  public clienteIdErrores = computed(() => {
    const valor = this.pagoForm.clienteId().value();
    if (valor === null || valor === undefined || valor <= 0) return 'Debes seleccionar un cliente.';
    return null;
  });

  public montoErrores = computed(() => {
    const valor = this.pagoForm.monto().value();
    if (valor === null || valor === undefined) return 'El monto es obligatorio.';
    if (valor <= 0) return 'El monto debe ser un valor positivo.';
    return null;
  });

  public conceptoErrores = computed(() => {
    const valor = this.pagoForm.concepto().value().trim();
    if (!valor) return 'El concepto es obligatorio.';
    return null;
  });

  public metodoErrores = computed(() => {
    const valor = this.pagoForm.metodo().value().trim();
    if (!valor) return 'El método de pago es obligatorio.';
    return null;
  });

  public estadoErrores = computed(() => {
    const valor = this.pagoForm.estado().value().trim();
    if (!valor) return 'El estado de pago es obligatorio.';
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.clienteIdErrores() &&
      !this.montoErrores() &&
      !this.conceptoErrores() &&
      !this.metodoErrores() &&
      !this.estadoErrores()
    );
  });

  // Lista de clientes para el select
  readonly clientes = this.clienteService.clientes;

  // Lista decorada y filtrada
  readonly pagosDecorados = computed(() => {
    const list = this.pagoService.pagos();
    const filter = this.selectedFilter();
    const query = this.searchQuery().toLowerCase().trim();

    const decorados = list.map(p => {
      const cliente = this.clienteService.getClientePorId(p.clienteId);
      return {
        ...p,
        nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Desconocido'
      };
    });

    return decorados.filter(p => {
      const matchFilter = filter === 'todos' || p.estado === filter;
      const matchSearch = p.nombreCliente.toLowerCase().includes(query) || p.concepto.toLowerCase().includes(query);
      return matchFilter && matchSearch;
    });
  });

  setFilter(filter: 'todos' | 'pagado' | 'pendiente'): void {
    this.selectedFilter.set(filter);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  openAddModal(): void {
    this.pagoModel.set({
      clienteId: 0,
      monto: 0,
      concepto: 'Membresía Mensual Premium',
      metodo: 'tarjeta',
      estado: 'pagado'
    });

    this.clienteIdTouched.set(false);
    this.montoTouched.set(false);
    this.conceptoTouched.set(false);
    this.metodoTouched.set(false);
    this.estadoTouched.set(false);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  savePago(): void {
    this.clienteIdTouched.set(true);
    this.montoTouched.set(true);
    this.conceptoTouched.set(true);
    this.metodoTouched.set(true);
    this.estadoTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.pagoService.agregarPago({
      clienteId: this.pagoForm.clienteId().value(),
      monto: this.pagoForm.monto().value(),
      fecha: new Date().toISOString().split('T')[0],
      concepto: this.pagoForm.concepto().value(),
      metodo: this.pagoForm.metodo().value(),
      estado: this.pagoForm.estado().value()
    });

    this.cargando.set(false);
    this.closeModal();
  }
}

