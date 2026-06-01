import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EntrenadorService } from '../../../services/entrenador.service';
import { MembresiaService } from '../../../services/membresia.service';
import { Cliente, ClienteDecorado } from '../../../models/cliente';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  private clienteService = inject(ClienteService);
  private usuarioService = inject(UsuarioService);
  private entrenadorService = inject(EntrenadorService);
  private membresiaService = inject(MembresiaService);

  // Filtros
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);
  readonly showDetailsModal = signal<boolean>(false);
  readonly editingCliente = signal<Cliente | null>(null);
  readonly viewingCliente = signal<ClienteDecorado | null>(null);

  // Writable Signals de Formulario
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly activo = signal(true);
  readonly objetivo = signal('Tonificación');
  readonly peso = signal(70);
  readonly altura = signal(170);
  readonly entrenadorId = signal(1);
  readonly membresiaId = signal(1);

  // Estados Touched
  readonly nombreTouched = signal(false);
  readonly apellidoTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);
  readonly objetivoTouched = signal(false);
  readonly pesoTouched = signal(false);
  readonly alturaTouched = signal(false);
  readonly entrenadorIdTouched = signal(false);
  readonly membresiaIdTouched = signal(false);

  // Validaciones
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly apellidoInvalid = computed(() => this.apellido().trim() === '');
  readonly emailInvalid = computed(() => this.email().trim() === '');
  readonly emailFormatInvalid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email().trim() !== '' && !emailRegex.test(this.email());
  });
  readonly telefonoInvalid = computed(() => this.telefono().trim() === '');
  readonly objetivoInvalid = computed(() => this.objetivo().trim() === '');
  readonly pesoInvalid = computed(() => this.peso() < 30 || this.peso() > 250);
  readonly alturaInvalid = computed(() => this.altura() < 100 || this.altura() > 250);
  readonly entrenadorIdInvalid = computed(() => this.entrenadorId() <= 0);
  readonly membresiaIdInvalid = computed(() => this.membresiaId() <= 0);

  readonly formInvalid = computed(() => {
    return (
      this.nombreInvalid() ||
      this.apellidoInvalid() ||
      this.emailInvalid() ||
      this.emailFormatInvalid() ||
      this.telefonoInvalid() ||
      this.objetivoInvalid() ||
      this.pesoInvalid() ||
      this.alturaInvalid() ||
      this.entrenadorIdInvalid() ||
      this.membresiaIdInvalid()
    );
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
    
    // Resetear form
    this.nombre.set('');
    this.apellido.set('');
    this.email.set('');
    this.telefono.set('');
    this.activo.set(true);
    this.objetivo.set('Tonificación');
    this.peso.set(70);
    this.altura.set(170);
    this.entrenadorId.set(1);
    this.membresiaId.set(1);

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);
    this.objetivoTouched.set(false);
    this.pesoTouched.set(false);
    this.alturaTouched.set(false);
    this.entrenadorIdTouched.set(false);
    this.membresiaIdTouched.set(false);

    this.showModal.set(true);
  }

  openEditModal(cliente: Cliente): void {
    this.editingCliente.set(cliente);
    
    // Cargar datos
    this.nombre.set(cliente.nombre);
    this.apellido.set(cliente.apellido);
    this.email.set(cliente.email);
    this.telefono.set(cliente.telefono);
    this.activo.set(cliente.activo);
    this.objetivo.set(cliente.objetivo || 'Tonificación');
    this.peso.set(cliente.peso || 70);
    this.altura.set(cliente.altura || 170);
    this.entrenadorId.set(cliente.entrenadorId || 1);
    this.membresiaId.set(cliente.membresiaId || 1);

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);
    this.objetivoTouched.set(false);
    this.pesoTouched.set(false);
    this.alturaTouched.set(false);
    this.entrenadorIdTouched.set(false);
    this.membresiaIdTouched.set(false);

    this.showModal.set(true);
  }

  openDetailsModal(cliente: Cliente): void {
    const trainer = this.entrenadorService.getEntrenadorPorId(cliente.entrenadorId);
    const membership = this.membresiaService.getMembresiaDeCliente(cliente.id);

    const fullDetails: ClienteDecorado = {
      ...cliente,
      nombreEntrenador: trainer ? `${trainer.nombre} ${trainer.apellido}` : 'Sin asignar',
      membresiaTipo: membership ? membership.tipo : 'Sin membresía',
      membresiaEstado: membership ? membership.estado : 'vencida',
      membresiaInicio: membership ? membership.fechaInicio : 'N/A',
      membresiaFin: membership ? membership.fechaFin : 'N/A',
      membresiaPrecio: membership ? membership.precio : 0
    };

    this.viewingCliente.set(fullDetails);
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
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);
    this.objetivoTouched.set(true);
    this.pesoTouched.set(true);
    this.alturaTouched.set(true);
    this.entrenadorIdTouched.set(true);
    this.membresiaIdTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const formVal = {
      nombre: this.nombre(),
      apellido: this.apellido(),
      email: this.email(),
      telefono: this.telefono(),
      activo: this.activo(),
      objetivo: this.objetivo(),
      peso: this.peso(),
      altura: this.altura(),
      entrenadorId: this.entrenadorId(),
      membresiaId: this.membresiaId()
    };
    
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

