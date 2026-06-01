import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntrenadorService } from '../../../services/entrenador.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-entrenador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil-entrenador.html',
  styleUrl: './perfil-entrenador.css',
})
export class PerfilEntrenador {
  private entrenadorSvc = inject(EntrenadorService);
  private usuarioSvc    = inject(UsuarioService);

  readonly entrenador   = this.entrenadorSvc.getEntrenadorActual();
  readonly iniciales    = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;
  readonly modoEdicion  = signal(false);
  readonly guardado     = signal(false);

  // Writable Signals
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly especialidad = signal('');
  readonly experiencia = signal(0);

  // Estados Touched
  readonly nombreTouched = signal(false);
  readonly apellidoTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);
  readonly especialidadTouched = signal(false);
  readonly experienciaTouched = signal(false);

  // Validaciones
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly nombreMinLength = computed(() => this.nombre().trim() !== '' && this.nombre().trim().length < 2);
  readonly apellidoInvalid = computed(() => this.apellido().trim() === '');
  readonly emailInvalid = computed(() => this.email().trim() === '');
  readonly emailFormatInvalid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email().trim() !== '' && !emailRegex.test(this.email());
  });
  readonly telefonoInvalid = computed(() => this.telefono().trim().length < 7);
  readonly experienciaInvalid = computed(() => this.experiencia() < 0 || this.experiencia() > 50);
  readonly especialidadInvalid = computed(() => this.especialidad().trim() === '');

  readonly formInvalid = computed(() => {
    return (
      this.nombreInvalid() ||
      this.nombreMinLength() ||
      this.apellidoInvalid() ||
      this.emailInvalid() ||
      this.emailFormatInvalid() ||
      this.telefonoInvalid() ||
      this.experienciaInvalid() ||
      this.especialidadInvalid()
    );
  });

  activarEdicion(): void {
    // Cargar datos actuales
    this.nombre.set(this.entrenador.nombre);
    this.apellido.set(this.entrenador.apellido);
    this.email.set(this.entrenador.email);
    this.telefono.set(this.entrenador.telefono);
    this.especialidad.set(this.entrenador.especialidad);
    this.experiencia.set(this.entrenador.experiencia);

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);
    this.especialidadTouched.set(false);
    this.experienciaTouched.set(false);

    this.modoEdicion.set(true);
    this.guardado.set(false);
  }

  cancelar(): void {
    this.modoEdicion.set(false);
  }

  guardar(): void {
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);
    this.especialidadTouched.set(true);
    this.experienciaTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const v = {
      nombre: this.nombre(),
      apellido: this.apellido(),
      email: this.email(),
      telefono: this.telefono(),
      especialidad: this.especialidad(),
      experiencia: this.experiencia(),
    };

    this.entrenadorSvc.actualizarEntrenador({ id: this.entrenador.id, ...v });
    this.modoEdicion.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 3000);
  }
}

