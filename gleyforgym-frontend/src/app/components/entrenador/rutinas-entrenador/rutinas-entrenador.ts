import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RutinaService } from '../../../services/rutina.service';
import { ClienteService } from '../../../services/cliente.service';
import { Rutina } from '../../../models/rutina';

@Component({
  selector: 'app-rutinas-entrenador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rutinas-entrenador.html',
  styleUrl: './rutinas-entrenador.css',
})
export class RutinasEntrenador {
  private rutinaSvc = inject(RutinaService);
  private clienteSvc = inject(ClienteService);

  readonly rutinas = computed(() => this.rutinaSvc.obtenerRutinas().filter(r => r.entrenadorId === 1));
  readonly clientes = computed(() => this.clienteSvc.obtenerClientes().filter(c => c.entrenadorId === 1));

  readonly rutinaExpandida = signal<number | null>(null);
  readonly mostrarFormulario = signal(false);
  readonly mensajeExito = signal('');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly diasDisponibles = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  readonly diasSeleccionados = signal<string[]>([]);

  // Writable Signals de Formulario
  readonly nombre = signal('');
  readonly clienteId = signal<number>(0);
  readonly nivel = signal('principiante');
  readonly objetivo = signal('');
  readonly descripcion = signal('');

  // Estados Touched
  readonly nombreTouched = signal(false);
  readonly clienteIdTouched = signal(false);
  readonly objetivoTouched = signal(false);

  // Validaciones
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly nombreMinLength = computed(() => this.nombre().trim() !== '' && this.nombre().trim().length < 3);
  readonly clienteIdInvalid = computed(() => this.clienteId() <= 0);
  readonly objetivoInvalid = computed(() => this.objetivo().trim() === '');

  readonly formInvalid = computed(() => {
    return this.nombreInvalid() || this.nombreMinLength() || this.clienteIdInvalid() || this.objetivoInvalid();
  });

  toggleExpandir(id: number): void {
    this.rutinaExpandida.update(v => v === id ? null : id);
  }

  estaExpandida(id: number): boolean {
    return this.rutinaExpandida() === id;
  }

  toggleDia(dia: string): void {
    this.diasSeleccionados.update(dias =>
      dias.includes(dia) ? dias.filter(d => d !== dia) : [...dias, dia]
    );
  }

  diaSeleccionado(dia: string): boolean {
    return this.diasSeleccionados().includes(dia);
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    this.diasSeleccionados.set([]);
    this.error.set(null);
    
    // Resetear form
    this.nombre.set('');
    this.clienteId.set(0);
    this.nivel.set('principiante');
    this.objetivo.set('');
    this.descripcion.set('');

    // Resetear touched
    this.nombreTouched.set(false);
    this.clienteIdTouched.set(false);
    this.objetivoTouched.set(false);
    this.mensajeExito.set('');
  }

  async guardar(): Promise<void> {
    this.nombreTouched.set(true);
    this.clienteIdTouched.set(true);
    this.objetivoTouched.set(true);

    if (this.formInvalid() || this.diasSeleccionados().length === 0) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      await this.rutinaSvc.agregarRutina({
        nombre:       this.nombre(),
        clienteId:    this.clienteId(),
        entrenadorId: 1,
        diasSemana:   this.diasSeleccionados(),
        nivel:        this.nivel() as 'principiante' | 'intermedio' | 'avanzado',
        objetivo:     this.objetivo(),
        descripcion:  this.descripcion(),
        ejercicios:   [],
        fechaCreacion: new Date().toISOString().split('T')[0],
        activa:       true,
      });
      
      this.cargando.set(false);
      this.mensajeExito.set('Rutina creada exitosamente');
      this.mostrarFormulario.set(false);
      setTimeout(() => this.mensajeExito.set(''), 3000);
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

  async desactivar(id: number): Promise<void> {
    if (confirm('¿Deseas dar de baja esta rutina del plan de entrenamiento del socio?')) {
      try {
        await this.rutinaSvc.desactivarRutina(id);
      } catch (err) {
        console.error('Error al desactivar rutina:', err);
      }
    }
  }

  getNombreCliente(clienteId: number): string {
    const c = this.clienteSvc.getClientePorId(clienteId);
    return c ? `${c.nombre} ${c.apellido}` : 'Desconocido';
  }

  nivelBadgeClass(nivel: string): string {
    return nivel === 'principiante' ? 'gym-badge-success'
      : nivel === 'intermedio' ? 'gym-badge-warning'
      : 'gym-badge-danger';
  }
}

