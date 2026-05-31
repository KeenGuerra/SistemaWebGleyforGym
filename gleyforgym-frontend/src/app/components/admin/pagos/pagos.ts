import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PagoService } from '../../../services/pago.service';
import { ClienteService } from '../../../services/cliente.service';
import { Pago } from '../../../models/pago';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos {
  private pagoService = inject(PagoService);
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);

  // Filtros
  readonly selectedFilter = signal<'todos' | 'pagado' | 'pendiente'>('todos');
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);

  // Formulario reactivo
  pagoForm: FormGroup = this.fb.group({
    clienteId: ['', [Validators.required]],
    monto: ['', [Validators.required, Validators.min(1)]],
    concepto: ['Cuota Mensual', [Validators.required]],
    metodo: ['tarjeta', [Validators.required]],
    estado: ['pagado', [Validators.required]]
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
    this.pagoForm.reset({
      clienteId: '',
      monto: '',
      concepto: 'Membresía Mensual Premium',
      metodo: 'tarjeta',
      estado: 'pagado'
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  savePago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const val = this.pagoForm.value;
    this.pagoService.agregarPago({
      clienteId: Number(val.clienteId),
      monto: Number(val.monto),
      fecha: new Date().toISOString().split('T')[0],
      concepto: val.concepto,
      metodo: val.metodo,
      estado: val.estado
    });

    this.closeModal();
  }
}
