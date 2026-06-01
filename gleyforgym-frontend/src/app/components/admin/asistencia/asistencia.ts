import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../services/asistencia.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css',
})
export class Asistencia {
  private asistenciaService = inject(AsistenciaService);
  private clienteService = inject(ClienteService);

  // Filtros
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);

  // Writable Signals de Formulario
  readonly clienteId = signal<number>(0);
  readonly fecha = signal('');
  readonly horaEntrada = signal('');
  readonly horaSalida = signal('');

  // Estados Touched
  readonly clienteIdTouched = signal(false);
  readonly fechaTouched = signal(false);
  readonly horaEntradaTouched = signal(false);

  // Validaciones
  readonly clienteIdInvalid = computed(() => this.clienteId() <= 0);
  readonly fechaInvalid = computed(() => this.fecha().trim() === '');
  readonly horaEntradaInvalid = computed(() => this.horaEntrada().trim() === '');

  readonly formInvalid = computed(() => {
    return this.clienteIdInvalid() || this.fechaInvalid() || this.horaEntradaInvalid();
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

    this.clienteId.set(0);
    this.fecha.set(fVal);
    this.horaEntrada.set(hEVal);
    this.horaSalida.set('');

    this.clienteIdTouched.set(false);
    this.fechaTouched.set(false);
    this.horaEntradaTouched.set(false);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveAsistencia(): void {
    this.clienteIdTouched.set(true);
    this.fechaTouched.set(true);
    this.horaEntradaTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const clId = this.clienteId();
    const cliente = this.clienteService.getClientePorId(clId);

    const horaEntradaVal = this.horaEntrada();
    const horaSalidaVal = this.horaSalida();

    // Calcular duración si hay salida
    let duracion = 0;
    if (horaEntradaVal && horaSalidaVal) {
      const [h1, m1] = horaEntradaVal.split(':').map(Number);
      const [h2, m2] = horaSalidaVal.split(':').map(Number);
      const minEntrada = h1 * 60 + m1;
      const minSalida = h2 * 60 + m2;
      duracion = Math.max(0, minSalida - minEntrada);
    }

    this.asistenciaService.registrarAsistencia({
      clienteId: clId,
      entrenadorId: cliente ? cliente.entrenadorId : 1,
      fecha: this.fecha(),
      horaEntrada: horaEntradaVal,
      horaSalida: horaSalidaVal || undefined,
      duracionMinutos: duracion || undefined
    });

    this.closeModal();
  }
}

