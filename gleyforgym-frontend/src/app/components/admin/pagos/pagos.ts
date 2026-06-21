import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { SignalFormDirective } from '../../../directives/signal-form.directive';
import { PagoService } from '../../../services/pago.service';
import { ClienteService } from '../../../services/cliente.service';
import { MembresiaService } from '../../../services/membresia.service';
import { Pago, MetodoPago, EstadoPago } from '../../../models/pago';
import { Paginacion } from '../../compartido/paginacion/paginacion';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, SignalFormDirective, Paginacion],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  private pagoService = inject(PagoService);
  private clienteService = inject(ClienteService);
  private membresiaService = inject(MembresiaService);

  ngOnInit(): void {
    this.pagoService.cargarPagos();
    this.clienteService.cargarClientes();
    this.membresiaService.cargarMembresias();
  }

  // Filtros
  readonly selectedFilter = signal<'todos' | 'PAGADO' | 'PENDIENTE'>('todos');
  readonly searchQuery = signal<string>('');

  // Paginación
  readonly paginaActual = signal<number>(1);
  readonly itemsPorPagina = 10;

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
    metodo: 'TARJETA' as MetodoPago,
    estado: 'PAGADO' as EstadoPago
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

  // Lista paginada
  readonly paginatedPagos = computed(() => {
    const list = this.pagosDecorados();
    const page = this.paginaActual();
    const start = (page - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    return list.slice(start, end);
  });

  setFilter(filter: 'todos' | 'PAGADO' | 'PENDIENTE'): void {
    this.selectedFilter.set(filter);
    this.paginaActual.set(1);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.paginaActual.set(1);
  }

  openAddModal(): void {
    this.pagoModel.set({
      clienteId: 0,
      monto: 0,
      concepto: 'Membresía Mensual Premium',
      metodo: 'TARJETA',
      estado: 'PAGADO'
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

  async savePago(): Promise<void> {
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

    try {
      await this.pagoService.agregarPago({
        clienteId: this.pagoForm.clienteId().value(),
        monto: this.pagoForm.monto().value(),
        fecha: new Date().toISOString().split('T')[0],
        concepto: this.pagoForm.concepto().value(),
        metodo: this.pagoForm.metodo().value(),
        estado: this.pagoForm.estado().value()
      });
      this.cargando.set(false);
      this.closeModal();
    } catch (err: any) {
      this.cargando.set(false);
      let errorMsg = 'Error al registrar el pago. Inténtelo de nuevo.';
      if (err && err.error) {
        if (typeof err.error.detail === 'string') {
          errorMsg = err.error.detail;
        } else if (Array.isArray(err.error.detail) && err.error.detail.length > 0) {
          const firstErr = err.error.detail[0];
          errorMsg = firstErr.msg || 'Error de validación';
        } else if (err.error.message) {
          errorMsg = err.error.message;
        }
      }
      this.error.set(errorMsg);
    }
  }
}

