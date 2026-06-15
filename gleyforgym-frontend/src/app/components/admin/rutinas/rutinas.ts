import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
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
export class Rutinas implements OnInit {
  private rutinaService = inject(RutinaService);
  private clienteService = inject(ClienteService);

  ngOnInit(): void {
    this.rutinaService.cargarRutinas();
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
  public rutinaModel = signal({
    clienteId: 0,
    nombre: '',
    nivel: 'intermedio' as NivelRutina,
    objetivo: 'Tonificación',
    descripcion: ''
  });
  public rutinaForm = form(this.rutinaModel);

  // Estados Touched
  public clienteIdTouched = signal(false);
  public nombreTouched = signal(false);
  public descripcionTouched = signal(false);

  // Validaciones reactivas
  public clienteIdErrores = computed(() => {
    const valor = this.rutinaForm.clienteId().value();
    if (valor === null || valor === undefined || valor <= 0) return 'Debes seleccionar un cliente.';
    return null;
  });

  public nombreErrores = computed(() => {
    const valor = this.rutinaForm.nombre().value().trim();
    if (!valor) return 'El nombre de la rutina es obligatorio.';
    return null;
  });

  public descripcionErrores = computed(() => {
    const valor = this.rutinaForm.descripcion().value().trim();
    if (!valor) return 'La descripción es obligatoria.';
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.clienteIdErrores() &&
      !this.nombreErrores() &&
      !this.descripcionErrores()
    );
  });

  // Lista de clientes
  readonly clientes = this.clienteService.clientes;

  // Lista de rutinas decoradas
  readonly rutinasDecoradas = computed(() => {
    const list = this.rutinaService.rutinas().filter(r => r.activa);
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
    this.rutinaModel.set({
      clienteId: 0,
      nombre: '',
      nivel: 'intermedio',
      objetivo: 'Tonificación',
      descripcion: ''
    });

    this.clienteIdTouched.set(false);
    this.nombreTouched.set(false);
    this.descripcionTouched.set(false);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async saveRutina(): Promise<void> {
    this.clienteIdTouched.set(true);
    this.nombreTouched.set(true);
    this.descripcionTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const nivelVal = this.rutinaForm.nivel().value();

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

    try {
      await this.rutinaService.agregarRutina({
        clienteId: Number(this.rutinaForm.clienteId().value()),
        entrenadorId: 1, // Por defecto asignada por admin (entrenador 1)
        nombre: this.rutinaForm.nombre().value(),
        diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
        nivel: nivelVal,
        objetivo: this.rutinaForm.objetivo().value(),
        descripcion: this.rutinaForm.descripcion().value(),
        fechaCreacion: new Date().toISOString().split('T')[0],
        activa: true,
        ejercicios: ejerciciosSimulados
      });
      this.cargando.set(false);
      this.closeModal();
    } catch (err: any) {
      this.cargando.set(false);
      let errorMsg = 'Error al registrar la rutina. Inténtelo de nuevo.';
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

  async desactivarRutina(id: number): Promise<void> {
    if (confirm('¿Deseas dar de baja esta rutina del plan de entrenamiento del socio?')) {
      try {
        await this.rutinaService.desactivarRutina(id);
      } catch (err) {
        console.error('Error al desactivar rutina:', err);
      }
    }
  }
}
