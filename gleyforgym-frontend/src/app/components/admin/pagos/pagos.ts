import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // Writable Signals de Formulario
  readonly clienteId = signal<number>(0);
  readonly monto = signal<number>(0);
  readonly concepto = signal('Cuota Mensual');
  readonly metodo = signal<MetodoPago>('tarjeta');
  readonly estado = signal<EstadoPago>('pagado');

  // Estados Touched
  readonly clienteIdTouched = signal(false);
  readonly montoTouched = signal(false);
  readonly conceptoTouched = signal(false);
  readonly metodoTouched = signal(false);
  readonly estadoTouched = signal(false);

  // Validaciones
  readonly clienteIdInvalid = computed(() => this.clienteId() <= 0);
  readonly montoInvalid = computed(() => this.monto() <= 0);
  readonly conceptoInvalid = computed(() => this.concepto().trim() === '');
  readonly metodoInvalid = computed(() => this.metodo().trim() === '');
  readonly estadoInvalid = computed(() => this.estado().trim() === '');

  readonly formInvalid = computed(() => {
    return (
      this.clienteIdInvalid() ||
      this.montoInvalid() ||
      this.conceptoInvalid() ||
      this.metodoInvalid() ||
      this.estadoInvalid()
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
    this.clienteId.set(0);
    this.monto.set(0);
    this.concepto.set('Membresía Mensual Premium');
    this.metodo.set('tarjeta');
    this.estado.set('pagado');

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

    if (this.formInvalid()) {
      return;
    }

    this.pagoService.agregarPago({
      clienteId: this.clienteId(),
      monto: this.monto(),
      fecha: new Date().toISOString().split('T')[0],
      concepto: this.concepto(),
      metodo: this.metodo(),
      estado: this.estado()
    });

    this.closeModal();
  }
}

