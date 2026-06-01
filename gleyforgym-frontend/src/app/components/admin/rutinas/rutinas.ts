import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RutinaService } from '../../../services/rutina.service';
import { ClienteService } from '../../../services/cliente.service';
import { Ejercicio, NivelRutina } from '../../../models/rutina';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.css',
})
export class Rutinas {
  private rutinaService = inject(RutinaService);
  private clienteService = inject(ClienteService);

  // Filtros
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);

  // Writable Signals de Formulario
  readonly clienteId = signal<number>(0);
  readonly nombre = signal('');
  readonly nivel = signal<NivelRutina>('intermedio');
  readonly objetivo = signal('Tonificación');
  readonly descripcion = signal('');

  // Estados Touched
  readonly clienteIdTouched = signal(false);
  readonly nombreTouched = signal(false);
  readonly descripcionTouched = signal(false);

  // Validaciones reactivas
  readonly clienteIdInvalid = computed(() => this.clienteId() <= 0);
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly descripcionInvalid = computed(() => this.descripcion().trim() === '');

  readonly formInvalid = computed(() => {
    return this.clienteIdInvalid() || this.nombreInvalid() || this.descripcionInvalid();
  });

  // Lista de clientes
  readonly clientes = this.clienteService.clientes;

  // Lista de rutinas decoradas
  readonly rutinasDecoradas = computed(() => {
    const list = this.rutinaService.rutinas();
    const query = this.searchQuery().toLowerCase().trim();

    const decoradas = list.map(r => {
      const cliente = this.clienteService.getClientePorId(r.clienteId);
      return {
        ...r,
        nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente Desconocido'
      };
    });

    return decoradas.filter(r =>
      r.nombreCliente.toLowerCase().includes(query) ||
      r.nombre.toLowerCase().includes(query) ||
      r.objetivo.toLowerCase().includes(query)
    );
  });

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  openAddModal(): void {
    this.clienteId.set(0);
    this.nombre.set('');
    this.nivel.set('intermedio');
    this.objetivo.set('Tonificación');
    this.descripcion.set('');

    this.clienteIdTouched.set(false);
    this.nombreTouched.set(false);
    this.descripcionTouched.set(false);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveRutina(): void {
    this.clienteIdTouched.set(true);
    this.nombreTouched.set(true);
    this.descripcionTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const nivelVal = this.nivel();

    // Auto-completar ejercicios según nivel para simular realismo premium
    let ejerciciosSimulados: Ejercicio[] = [];
    if (nivelVal === 'principiante') {
      ejerciciosSimulados = [
        { nombre: 'Sentadillas libres', series: 3, repeticiones: '12', descanso: '60s' },
        { nombre: 'Flexiones inclinadas', series: 3, repeticiones: '10', descanso: '60s' },
        { nombre: 'Plancha estática', series: 3, repeticiones: '30s', descanso: '45s' }
      ];
    } else if (nivelVal === 'intermedio') {
      ejerciciosSimulados = [
        { nombre: 'Sentadilla con barra goblet', series: 4, repeticiones: '10', descanso: '90s' },
        { nombre: 'Press de banca plano', series: 4, repeticiones: '10', descanso: '90s' },
        { nombre: 'Remo con mancuernas', series: 4, repeticiones: '10', descanso: '90s' },
        { nombre: 'Plancha con toques de hombro', series: 3, repeticiones: '15', descanso: '60s' }
      ];
    } else {
      ejerciciosSimulados = [
        { nombre: 'Sentadilla trasera con barra', series: 4, repeticiones: '6-8 (pesado)', descanso: '120s' },
        { nombre: 'Press militar con barra', series: 4, repeticiones: '8', descanso: '90s' },
        { nombre: 'Peso muerto rumano', series: 4, repeticiones: '8', descanso: '90s' },
        { nombre: 'Dominadas con lastre', series: 4, repeticiones: 'Máximas', descanso: '90s' },
        { nombre: 'Rueda abdominal', series: 3, repeticiones: '12', descanso: '60s' }
      ];
    }

    this.rutinaService.agregarRutina({
      clienteId: Number(this.clienteId()),
      entrenadorId: 1, // Por defecto asignada por admin (entrenador 1)
      nombre: this.nombre(),
      diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
      nivel: nivelVal,
      objetivo: this.objetivo(),
      descripcion: this.descripcion(),
      fechaCreacion: new Date().toISOString().split('T')[0],
      activa: true,
      ejercicios: ejerciciosSimulados
    });

    this.closeModal();
  }

  desactivarRutina(id: number): void {
    if (confirm('¿Deseas dar de baja esta rutina del plan de entrenamiento del socio?')) {
      this.rutinaService.desactivarRutina(id);
    }
  }
}
