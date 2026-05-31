import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EntrenadorService } from '../../../services/entrenador.service';
import { MembresiaService } from '../../../services/membresia.service';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  private clienteService = inject(ClienteService);
  private usuarioService = inject(UsuarioService);
  private entrenadorService = inject(EntrenadorService);
  private membresiaService = inject(MembresiaService);
  private fb = inject(FormBuilder);

  // Filtros
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);
  readonly showDetailsModal = signal<boolean>(false);
  readonly editingCliente = signal<Cliente | null>(null);
  readonly viewingCliente = signal<any | null>(null);

  // Formulario reactivo
  clienteForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    activo: [true],
    objetivo: ['Tonificación', [Validators.required]],
    peso: [70, [Validators.min(30), Validators.max(250)]],
    altura: [170, [Validators.min(100), Validators.max(250)]],
    entrenadorId: [1, [Validators.required]],
    membresiaId: [1, [Validators.required]]
  });

  // Lista de Entrenadores Activos para el select
  readonly entrenadores = this.entrenadorService.entrenadores;

  // Lista decorada con nombres de entrenador y tipo de membresía
  readonly clientesDecorados = computed(() => {
    const list = this.clienteService.clientes();
    const query = this.searchQuery().toLowerCase().trim();

    const decorados = list.map(c => {
      const trainer = this.entrenadorService.getEntrenadorPorId(c.entrenadorId);
      const membership = this.membresiaService.getMembresiaDeCliente(c.id);

      return {
        ...c,
        nombreEntrenador: trainer ? `${trainer.nombre} ${trainer.apellido}` : 'Sin asignar',
        membresiaTipo: membership ? membership.tipo : 'Sin membresía',
        membresiaEstado: membership ? membership.estado : 'vencida',
        membresiaFin: membership ? membership.fechaFin : 'N/A'
      };
    });

    return decorados.filter(c =>
      c.nombre.toLowerCase().includes(query) ||
      c.apellido.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.telefono.includes(query)
    );
  });

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  openAddModal(): void {
    this.editingCliente.set(null);
    this.clienteForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      activo: true,
      objetivo: 'Tonificación',
      peso: 70,
      altura: 170,
      entrenadorId: 1,
      membresiaId: 1
    });
    this.showModal.set(true);
  }

  openEditModal(cliente: Cliente): void {
    this.editingCliente.set(cliente);
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      activo: cliente.activo,
      objetivo: cliente.objetivo || 'Tonificación',
      peso: cliente.peso || 70,
      altura: cliente.altura || 170,
      entrenadorId: cliente.entrenadorId || 1,
      membresiaId: cliente.membresiaId || 1
    });
    this.showModal.set(true);
  }

  openDetailsModal(cliente: Cliente): void {
    const trainer = this.entrenadorService.getEntrenadorPorId(cliente.entrenadorId);
    const membership = this.membresiaService.getMembresiaDeCliente(cliente.id);

    const fullDetails = {
      ...cliente,
      nombreEntrenador: trainer ? `${trainer.nombre} ${trainer.apellido}` : 'Sin asignar',
      membresiaTipo: membership ? membership.tipo : 'Sin membresía',
      membresiaEstado: membership ? membership.estado : 'vencida',
      membresiaInicio: membership ? membership.fechaInicio : 'N/A',
      membresiaFin: membership ? membership.fechaFin : 'N/A',
      membresiaPrecio: membership ? membership.precio : 0
    };

    this.viewingCliente.set(fullDetails as any);
    this.showDetailsModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCliente.set(null);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.viewingCliente.set(null);
  }

  saveCliente(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const formVal = this.clienteForm.value;
    const editing = this.editingCliente();

    if (editing) {
      const actCliente: Cliente = {
        ...editing,
        ...formVal
      };
      this.clienteService.actualizarCliente(actCliente);
      this.usuarioService.actualizarUsuario({
        id: editing.id,
        nombre: formVal.nombre,
        apellido: formVal.apellido,
        email: formVal.email,
        telefono: formVal.telefono,
        rol: 'cliente',
        activo: formVal.activo,
        fechaRegistro: editing.fechaRegistro
      });
    } else {
      const nuevoUsuario = this.usuarioService.registrarUsuario({
        nombre: formVal.nombre,
        apellido: formVal.apellido,
        email: formVal.email,
        telefono: formVal.telefono,
        rol: 'cliente',
        activo: formVal.activo
      });

      this.clienteService.registrarCliente({
        ...nuevoUsuario,
        objetivo: formVal.objetivo,
        peso: formVal.peso,
        altura: formVal.altura,
        entrenadorId: formVal.entrenadorId,
        membresiaId: formVal.membresiaId
      });

      // Crear membresía inicial
      const hoy = new Date();
      const fin = new Date();
      fin.setMonth(hoy.getMonth() + 1);

      this.membresiaService.registrarMembresia({
        clienteId: nuevoUsuario.id,
        tipo: formVal.membresiaId === 1 ? 'Mensual Premium' : formVal.membresiaId === 2 ? 'Trimestral' : 'Mensual Básica',
        precio: formVal.membresiaId === 1 ? 2500 : formVal.membresiaId === 2 ? 6500 : 1800,
        fechaInicio: hoy.toISOString().split('T')[0],
        fechaFin: fin.toISOString().split('T')[0],
        estado: 'activa'
      });
    }

    this.closeModal();
  }

  eliminarCliente(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente? Se desactivará su cuenta.')) {
      this.clienteService.eliminarCliente(id);
      this.usuarioService.eliminarUsuario(id);
    }
  }
}
