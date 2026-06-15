import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { AsistenciaService } from '../../../services/asistencia.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css',
})
export class Asistencia implements OnInit {
  private asistenciaService = inject(AsistenciaService);
  private clienteService = inject(ClienteService);

  ngOnInit(): void {
    this.asistenciaService.cargarAsistencias();
    this.clienteService.cargarClientes();
  }

  // Filtros
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);

  // Signals de Carga y Error
  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Modelo del Formulario
  public asistenciaModel = signal({
    clienteId: 0,
    fecha: '',
    horaEntrada: '',
    horaSalida: ''
  });
  public asistenciaForm = form(this.asistenciaModel);

  // Estados Touched
  public clienteIdTouched = signal(false);
  public fechaTouched = signal(false);
  public horaEntradaTouched = signal(false);
  public horaSalidaTouched = signal(false);

  // Validaciones
  public clienteIdErrores = computed(() => {
    const valor = this.asistenciaForm.clienteId().value();
    if (valor === null || valor === undefined || valor <= 0) return 'Debes seleccionar un cliente.';
    return null;
  });

  public fechaErrores = computed(() => {
    const valor = this.asistenciaForm.fecha().value().trim();
    if (!valor) return 'La fecha es obligatoria.';
    return null;
  });

  public horaEntradaErrores = computed(() => {
    const valor = this.asistenciaForm.horaEntrada().value().trim();
    if (!valor) return 'La hora de entrada es obligatoria.';
    return null;
  });

  public duracionMinutos = computed(() => {
    const entrada = this.asistenciaForm.horaEntrada().value();
    const salida = this.asistenciaForm.horaSalida().value();
    if (!entrada || !salida) return null;
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    const minEntrada = h1 * 60 + m1;
    const minSalida = h2 * 60 + m2;
    return minSalida - minEntrada;
  });

  public duracionErrores = computed(() => {
    const dur = this.duracionMinutos();
    if (dur !== null && dur <= 0) {
      return 'La hora de salida debe ser posterior a la de entrada (Duración positiva).';
    }
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.clienteIdErrores() &&
      !this.fechaErrores() &&
      !this.horaEntradaErrores() &&
      !this.duracionErrores()
    );
  });

  // Lista de clientes
  readonly clientes = this.clienteService.clientes;

  // Lista decorada
  readonly asistenciasDecoradas = computed(() => {
    const list = this.asistenciaService.asistencias();
    const query = this.searchQuery().toLowerCase().trim();

    const decorados = list.map(a => {
      const cliente = this.clienteService.getClientePorId(a.clienteId);
      return {
        ...a,
        nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Desconocido'
      };
    });

    // Ordenar por fecha y hora de entrada de forma descendente
    const sorted = decorados.sort((a, b) => {
      if (a.fecha !== b.fecha) {
        return b.fecha.localeCompare(a.fecha);
      }
      return b.horaEntrada.localeCompare(a.horaEntrada);
    });

    return sorted.filter(a =>
      a.nombreCliente.toLowerCase().includes(query) ||
      a.fecha.includes(query)
    );
  });

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  openAddModal(): void {
    const hoy = new Date();
    const fVal = hoy.toISOString().split('T')[0];
    const hEVal = hoy.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

    this.asistenciaModel.set({
      clienteId: 0,
      fecha: fVal,
      horaEntrada: hEVal,
      horaSalida: ''
    });

    this.clienteIdTouched.set(false);
    this.fechaTouched.set(false);
    this.horaEntradaTouched.set(false);
    this.horaSalidaTouched.set(false);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async saveAsistencia(): Promise<void> {
    this.clienteIdTouched.set(true);
    this.fechaTouched.set(true);
    this.horaEntradaTouched.set(true);
    this.horaSalidaTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const clId = this.asistenciaForm.clienteId().value();
    const cliente = this.clienteService.getClientePorId(clId);

    const horaEntradaVal = this.asistenciaForm.horaEntrada().value();
    const horaSalidaVal = this.asistenciaForm.horaSalida().value();

    const duracion = this.duracionMinutos();

    try {
      await this.asistenciaService.registrarAsistencia({
        clienteId: clId,
        entrenadorId: cliente ? cliente.entrenadorId : 1,
        fecha: this.asistenciaForm.fecha().value(),
        horaEntrada: horaEntradaVal,
        horaSalida: horaSalidaVal || undefined,
        duracionMinutos: duracion || undefined
      });
      this.cargando.set(false);
      this.closeModal();
    } catch (err: any) {
      this.cargando.set(false);
      let errorMsg = 'Error al registrar la asistencia. Inténtelo de nuevo.';
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

