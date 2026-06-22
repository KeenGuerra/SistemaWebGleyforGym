import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RutinaService } from '../../../services/rutina.service';
import { ClienteService } from '../../../services/cliente.service';
import { EntrenadorService } from '../../../services/entrenador.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Paginacion } from '../../compartido/paginacion/paginacion';

@Component({
  selector: 'app-rutinas-entrenador',
  standalone: true,
  imports: [FormsModule, CommonModule, Paginacion],
  templateUrl: './rutinas-entrenador.html',
  styleUrl: './rutinas-entrenador.css',
})
export class RutinasEntrenador implements OnInit {
  private rutinaSvc = inject(RutinaService);
  private clienteSvc = inject(ClienteService);
  private entrenadorSvc = inject(EntrenadorService);
  private usuarioSvc = inject(UsuarioService);

  // Paginación
  readonly paginaActual = signal<number>(1);
  readonly itemsPorPagina = 6;

  ngOnInit(): void {
    this.entrenadorSvc.cargarEntrenadores();
    this.rutinaSvc.cargarRutinas();
    this.clienteSvc.cargarClientes();
  }

  // ID real del entrenador logueado (resuelto dinámicamente desde el token)
  private readonly entrenadorIdActual = computed(() => {
    const usuarioId = this.usuarioSvc.usuarioActual().id;
    const ent = this.entrenadorSvc.getEntrenadorPorUsuarioId(usuarioId);
    return ent?.id ?? 0;
  });

  // ✅ Usa signals reactivos → actualización automática al crear/eliminar
  readonly rutinas = computed(() => {
    const eid = this.entrenadorIdActual();
    const todas = this.rutinaSvc.rutinas();
    return eid > 0 ? todas.filter(r => r.entrenadorId === eid) : todas;
  });

  // Lista paginada
  readonly paginatedRutinas = computed(() => {
    const list = this.rutinas();
    const page = this.paginaActual();
    const start = (page - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    return list.slice(start, end);
  });

  readonly clientes = computed(() => {
    const eid = this.entrenadorIdActual();
    const todos = this.clienteSvc.clientes();
    return eid > 0 ? todos.filter(c => c.entrenadorId === eid) : todos;
  });

  readonly rutinaExpandida = signal<number | null>(null);
  readonly mostrarFormulario = signal(false);
  readonly mensajeExito = signal('');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly diasDisponibles = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  readonly diasSeleccionados = signal<string[]>([]);

  // Signals de formulario (usados con (ngModelChange) para que computed() los detecte)
  readonly nombreSig = signal('');
  readonly clienteIdSig = signal(0);
  readonly nivelSig = signal('principiante');
  readonly objetivoSig = signal('');
  readonly descripcionSig = signal('');

  // Propiedades planas que ngModel usa como intermediarias
  get nombreVal() { return this.nombreSig(); }
  set nombreVal(v: string) { this.nombreSig.set(v); }

  get clienteIdVal() { return this.clienteIdSig(); }
  set clienteIdVal(v: number) { this.clienteIdSig.set(+v); }

  get nivelVal() { return this.nivelSig(); }
  set nivelVal(v: string) { this.nivelSig.set(v); }

  get objetivoVal() { return this.objetivoSig(); }
  set objetivoVal(v: string) { this.objetivoSig.set(v); }

  get descripcionVal() { return this.descripcionSig(); }
  set descripcionVal(v: string) { this.descripcionSig.set(v); }

  // Estados Touched
  readonly nombreTouched = signal(false);
  readonly clienteIdTouched = signal(false);
  readonly objetivoTouched = signal(false);

  // Validaciones reactivas (computed detecta cambios en los signals)
  readonly nombreInvalid = computed(() => this.nombreSig().trim() === '');
  readonly nombreMinLength = computed(() => this.nombreSig().trim() !== '' && this.nombreSig().trim().length < 3);
  readonly clienteIdInvalid = computed(() => this.clienteIdSig() <= 0);
  readonly objetivoInvalid = computed(() => this.objetivoSig().trim() === '');

  readonly formInvalid = computed(() =>
    this.nombreInvalid() || this.nombreMinLength() || this.clienteIdInvalid() || this.objetivoInvalid()
  );

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

    // Resetear signals del formulario
    this.nombreSig.set('');
    this.clienteIdSig.set(0);
    this.nivelSig.set('principiante');
    this.objetivoSig.set('');
    this.descripcionSig.set('');

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

    const entId = this.entrenadorIdActual();

    const nivelVal = this.nivelSig() as 'principiante' | 'intermedio' | 'avanzado';

    // Auto-completar ejercicios según nivel para simular realismo premium
    let ejerciciosSimulados: any[] = [];
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
      await this.rutinaSvc.agregarRutina({
        nombre:        this.nombreSig(),
        clienteId:     this.clienteIdSig(),
        entrenadorId:  entId,
        diasSemana:    this.diasSeleccionados(),
        nivel:         nivelVal,
        objetivo:      this.objetivoSig(),
        descripcion:   this.descripcionSig(),
        ejercicios:    ejerciciosSimulados,
        fechaCreacion: new Date().toISOString().split('T')[0],
        activa:        true,
      });

      this.cargando.set(false);
      this.mensajeExito.set('Rutina creada exitosamente');
      this.mostrarFormulario.set(false);
      this.nombreSig.set('');
      this.clienteIdSig.set(0);
      this.nivelSig.set('principiante');
      this.objetivoSig.set('');
      this.descripcionSig.set('');
      this.diasSeleccionados.set([]);
      setTimeout(() => this.mensajeExito.set(''), 3500);
    } catch (err: any) {
      this.cargando.set(false);
      let errorMsg = 'Error al registrar la rutina. Inténtelo de nuevo.';
      if (err?.error) {
        if (typeof err.error.detail === 'string') {
          errorMsg = err.error.detail;
        } else if (Array.isArray(err.error.detail) && err.error.detail.length > 0) {
          errorMsg = err.error.detail[0].msg || 'Error de validación';
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
        this.mensajeExito.set('Rutina desactivada correctamente.');
        setTimeout(() => this.mensajeExito.set(''), 3000);
      } catch (err: any) {
        const detail = err?.error?.detail;
        this.error.set(typeof detail === 'string' ? detail : 'Error al desactivar la rutina.');
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
