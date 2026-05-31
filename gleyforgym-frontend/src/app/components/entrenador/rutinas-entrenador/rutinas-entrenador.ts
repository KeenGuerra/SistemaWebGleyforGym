import { Component, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { RutinaService } from '../../../services/rutina.service';
import { ClienteService } from '../../../services/cliente.service';
import { Rutina } from '../../../models/rutina';

@Component({
  selector: 'app-rutinas-entrenador',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './rutinas-entrenador.html',
  styleUrl: './rutinas-entrenador.css',
})
export class RutinasEntrenador {
  private rutinaSvc = inject(RutinaService);
  private clienteSvc = inject(ClienteService);
  private fb = inject(FormBuilder);

  readonly rutinas = computed(() => this.rutinaSvc.obtenerRutinas().filter(r => r.entrenadorId === 1));
  readonly clientes = computed(() => this.clienteSvc.obtenerClientes().filter(c => c.entrenadorId === 1));

  readonly rutinaExpandida = signal<number | null>(null);
  readonly mostrarFormulario = signal(false);
  readonly mensajeExito = signal('');

  readonly diasDisponibles = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  readonly diasSeleccionados = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    nombre:     ['', [Validators.required, Validators.minLength(3)]],
    clienteId:  [0, [Validators.required, Validators.min(1)]],
    nivel:      ['principiante', Validators.required],
    objetivo:   ['', Validators.required],
    descripcion:[''],
  });

  get nombreInvalido(): boolean {
    const ctrl = this.form.get('nombre');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

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
    this.form.reset({ nivel: 'principiante' });
    this.mensajeExito.set('');
  }

  guardar(): void {
    if (this.form.invalid || this.diasSeleccionados().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.rutinaSvc.agregarRutina({
      nombre:       v.nombre,
      clienteId:    v.clienteId,
      entrenadorId: 1,
      diasSemana:   this.diasSeleccionados(),
      nivel:        v.nivel as 'principiante' | 'intermedio' | 'avanzado',
      objetivo:     v.objetivo,
      descripcion:  v.descripcion,
      ejercicios:   [],
      fechaCreacion: new Date().toISOString().split('T')[0],
      activa:       true,
    });
    this.mensajeExito.set('Rutina creada exitosamente');
    this.mostrarFormulario.set(false);
    this.form.reset({ nivel: 'principiante' });
    this.diasSeleccionados.set([]);
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }

  desactivar(id: number): void {
    this.rutinaSvc.desactivarRutina(id);
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

  hasError(campo: string, error: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }
}
