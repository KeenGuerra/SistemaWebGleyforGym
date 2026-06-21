import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { SignalFormDirective } from '../../../directives/signal-form.directive';
import { ClienteService } from '../../../services/cliente.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EntrenadorService } from '../../../services/entrenador.service';
import { MembresiaService } from '../../../services/membresia.service';
import { Cliente, ClienteDecorado } from '../../../models/cliente';
import { Paginacion } from '../../compartido/paginacion/paginacion';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, SignalFormDirective, Paginacion],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  private clienteService = inject(ClienteService);
  private usuarioService = inject(UsuarioService);
  private entrenadorService = inject(EntrenadorService);
  private membresiaService = inject(MembresiaService);

  ngOnInit(): void {
    this.clienteService.cargarClientes();
    this.entrenadorService.cargarEntrenadores();
    this.membresiaService.cargarMembresias();
    this.membresiaService.cargarPlanes();
  }

  // Filtros
  readonly searchQuery = signal<string>('');

  // Paginación
  readonly paginaActual = signal<number>(1);
  readonly itemsPorPagina = 10;

  // Modales
  readonly showModal = signal<boolean>(false);
  readonly showDetailsModal = signal<boolean>(false);
  readonly editingCliente = signal<Cliente | null>(null);
  readonly viewingCliente = signal<ClienteDecorado | null>(null);

  // Signals de Carga y Error
  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Modelo del Formulario
  public clientModel = signal({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    activo: true,
    objetivo: 'Tonificación',
    peso: 70,
    altura: 1.70,
    entrenadorId: 1,
    membresiaId: 1
  });
  public clientForm = form(this.clientModel);

  // Estados Touched
  public nombreTouched = signal(false);
  public apellidoTouched = signal(false);
  public dniTouched = signal(false);
  public emailTouched = signal(false);
  public telefonoTouched = signal(false);
  public objetivoTouched = signal(false);
  public pesoTouched = signal(false);
  public alturaTouched = signal(false);
  public entrenadorIdTouched = signal(false);
  public membresiaIdTouched = signal(false);

  // Validaciones
  public nombreErrores = computed(() => {
    const valor = this.clientForm.nombre().value().trim();
    if (!valor) return 'El nombre es obligatorio.';
    return null;
  });

  public apellidoErrores = computed(() => {
    const valor = this.clientForm.apellido().value().trim();
    if (!valor) return 'El apellido es obligatorio.';
    return null;
  });

  public emailErrores = computed(() => {
    const valor = this.clientForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null;
  });

  public telefonoErrores = computed(() => {
    const valor = this.clientForm.telefono().value().trim();
    if (!valor) return 'El teléfono es obligatorio.';
    const numRegex = /^\d+$/;
    if (!numRegex.test(valor)) return 'El teléfono debe contener solo números.';
    if (valor.length < 7 || valor.length > 15) return 'El teléfono debe tener una longitud válida (7 a 15 dígitos).';
    return null;
  });

  public objetivoErrores = computed(() => {
    const valor = this.clientForm.objetivo().value().trim();
    if (!valor) return 'El objetivo es obligatorio.';
    return null;
  });

  public pesoErrores = computed(() => {
    const valor = this.clientForm.peso().value();
    if (valor === null || valor === undefined) return 'El peso es obligatorio.';
    if (valor <= 0) return 'El peso debe ser positivo.';
    if (valor < 30 || valor > 250) return 'El peso debe estar entre 30 y 250 kg.';
    return null;
  });

  public dniErrores = computed(() => {
    const valor = this.clientForm.dni().value().trim();
    if (!valor) return 'El DNI/Cédula es obligatorio.';
    return null;
  });

  public alturaErrores = computed(() => {
    const valor = this.clientForm.altura().value();
    if (valor === null || valor === undefined) return 'La altura es obligatoria.';
    if (valor <= 0) return 'La altura debe ser positiva.';
    if (valor < 0.5 || valor > 2.5) return 'La altura debe estar entre 0.50 y 2.50 metros.';
    return null;
  });

  public entrenadorIdErrores = computed(() => {
    const valor = this.clientForm.entrenadorId().value();
    if (valor === null || valor === undefined || valor <= 0) return 'Debes seleccionar un entrenador.';
    return null;
  });

  public membresiaIdErrores = computed(() => {
    const valor = this.clientForm.membresiaId().value();
    if (valor === null || valor === undefined || valor <= 0) return 'Debes seleccionar una membresía.';
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.dniErrores() &&
      !this.emailErrores() &&
      !this.telefonoErrores() &&
      !this.objetivoErrores() &&
      !this.pesoErrores() &&
      !this.alturaErrores() &&
      !this.entrenadorIdErrores() &&
      !this.membresiaIdErrores()
    );
  });

  // Lista de Entrenadores Activos para el select
  readonly entrenadores = this.entrenadorService.entrenadores;

  // Lista de Planes de Membresía desde la BD
  readonly planesMembresia = this.membresiaService.planes;

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
        membresiaEstado: membership ? membership.estado : 'VENCIDA',
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

  // Lista paginada
  readonly paginatedClientes = computed(() => {
    const list = this.clientesDecorados();
    const page = this.paginaActual();
    const start = (page - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    return list.slice(start, end);
  });

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.paginaActual.set(1);
  }

  openAddModal(): void {
    this.editingCliente.set(null);

    // Usar el primer plan disponible en la BD como valor por defecto
    const primerPlan = this.planesMembresia()[0];

    // Resetear form
    this.clientModel.set({
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      activo: true,
      objetivo: 'Tonificación',
      peso: 70,
      altura: 1.70,
      entrenadorId: 1,
      membresiaId: primerPlan ? primerPlan.id : 1
    });

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.dniTouched.set(false);
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
    this.clientModel.set({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      dni: cliente.dni,
      email: cliente.email,
      telefono: cliente.telefono,
      activo: cliente.activo,
      objetivo: cliente.objetivo || 'Tonificación',
      peso: cliente.peso || 70,
      altura: cliente.altura || 1.70,
      entrenadorId: cliente.entrenadorId || 1,
      membresiaId: cliente.membresiaId || 1
    });

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.dniTouched.set(false);
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
      membresiaEstado: membership ? membership.estado : 'VENCIDA',
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

  async saveCliente(): Promise<void> {
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.dniTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);
    this.objetivoTouched.set(true);
    this.pesoTouched.set(true);
    this.alturaTouched.set(true);
    this.entrenadorIdTouched.set(true);
    this.membresiaIdTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const formVal = {
      nombre: this.clientForm.nombre().value(),
      apellido: this.clientForm.apellido().value(),
      dni: this.clientForm.dni().value(),
      email: this.clientForm.email().value(),
      telefono: this.clientForm.telefono().value(),
      activo: this.clientForm.activo().value(),
      objetivo: this.clientForm.objetivo().value(),
      peso: this.clientForm.peso().value(),
      altura: this.clientForm.altura().value(),
      entrenadorId: this.clientForm.entrenadorId().value(),
      membresiaId: this.clientForm.membresiaId().value()
    };
    
    const editing = this.editingCliente();

    try {
      if (editing) {
        const actCliente: Cliente = {
          ...editing,
          ...formVal
        };
        await this.clienteService.actualizarCliente(actCliente);
      } else {
        await this.clienteService.registrarCliente({
          nombre: formVal.nombre,
          apellido: formVal.apellido,
          dni: formVal.dni,
          email: formVal.email,
          telefono: formVal.telefono,
          activo: formVal.activo,
          objetivo: formVal.objetivo,
          peso: formVal.peso,
          altura: formVal.altura,
          entrenadorId: formVal.entrenadorId,
          membresiaId: formVal.membresiaId,
          objetivoId: 3, // default
          rol: 'CLIENTE',
          fechaRegistro: new Date().toISOString().split('T')[0]
        });
      }
      this.cargando.set(false);
      this.closeModal();
    } catch (err: any) {
      this.cargando.set(false);
      let errorMsg = 'Error al guardar el cliente. Inténtelo de nuevo.';
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

  async eliminarCliente(id: number): Promise<void> {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente? Se desactivará su cuenta.')) {
      try {
        await this.clienteService.eliminarCliente(id);
      } catch (err) {
        console.error('Error al eliminar cliente:', err);
      }
    }
  }
}

