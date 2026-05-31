import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../services/asistencia.service';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css',
})
export class Asistencia {
  private asistenciaService = inject(AsistenciaService);
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);

  // Filtros
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);

  // Formulario reactivo
  asistenciaForm: FormGroup = this.fb.group({
    clienteId: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    horaEntrada: ['', [Validators.required]],
    horaSalida: ['']
  });

  // Lista de clientes
  readonly clientes = this.clienteService.clientes;

  // Lista decorada
  readonly asistenciasDecoradas = computed(() => {
    const list = this.asistenciaService.asistencias();
    const query = this.searchQuery().toLowerCase().trim();

    const decoradas = list.map(a => {
      const cliente = this.clienteService.getClientePorId(a.clienteId);
      return {
        ...a,
        nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Desconocido'
      };
    });

    // Ordenar por fecha y hora de entrada de forma descendente
    const sorted = decoradas.sort((a, b) => {
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
    const fecha = hoy.toISOString().split('T')[0];
    const horaEntrada = hoy.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"

    this.asistenciaForm.reset({
      clienteId: '',
      fecha,
      horaEntrada,
      horaSalida: ''
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveAsistencia(): void {
    if (this.asistenciaForm.invalid) {
      this.asistenciaForm.markAllAsTouched();
      return;
    }

    const val = this.asistenciaForm.value;
    const clId = Number(val.clienteId);
    const cliente = this.clienteService.getClientePorId(clId);

    // Calcular duración si hay salida
    let duracion = 0;
    if (val.horaEntrada && val.horaSalida) {
      const [h1, m1] = val.horaEntrada.split(':').map(Number);
      const [h2, m2] = val.horaSalida.split(':').map(Number);
      const minEntrada = h1 * 60 + m1;
      const minSalida = h2 * 60 + m2;
      duracion = Math.max(0, minSalida - minEntrada);
    }

    this.asistenciaService.registrarAsistencia({
      clienteId: clId,
      entrenadorId: cliente ? cliente.entrenadorId : 1,
      fecha: val.fecha,
      horaEntrada: val.horaEntrada,
      horaSalida: val.horaSalida || undefined,
      duracionMinutos: duracion || undefined
    });

    this.closeModal();
  }
}
