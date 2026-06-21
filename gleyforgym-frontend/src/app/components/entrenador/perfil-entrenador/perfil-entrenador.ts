import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { SignalFormDirective } from '../../../directives/signal-form.directive';
import { EntrenadorService } from '../../../services/entrenador.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-entrenador',
  standalone: true,
  imports: [CommonModule, FormsModule, SignalFormDirective],
  templateUrl: './perfil-entrenador.html',
  styleUrl: './perfil-entrenador.css',
})
export class PerfilEntrenador {
  private entrenadorSvc = inject(EntrenadorService);
  private usuarioSvc    = inject(UsuarioService);

  readonly entrenadorActual = computed(() => {
    const user = this.usuarioSvc.usuarioActual();
    return this.entrenadorSvc.entrenadores().find(e => e.email === user.email);
  });

  readonly entrenador   = computed(() => this.entrenadorActual());
  readonly iniciales    = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;
  readonly modoEdicion  = signal(false);
  readonly guardado     = signal(false);

  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Signals para Contraseña
  public pwdCargando = signal(false);
  public pwdError = signal<string | null>(null);
  public pwdSuccessMessage = signal<string>('');

  // Modelo del Formulario
  public trainerModel = signal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
    experiencia: 0
  });
  public trainerForm = form(this.trainerModel);

  // Estados Touched
  public nombreTouched = signal(false);
  public apellidoTouched = signal(false);
  public emailTouched = signal(false);
  public telefonoTouched = signal(false);
  public especialidadTouched = signal(false);
  public experienciaTouched = signal(false);

  // Modelo de Contraseña
  public passwordModel = signal({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  public passwordForm = form(this.passwordModel);

  // Estados Touched - Contraseña
  public currentPasswordTouched = signal(false);
  public newPasswordTouched = signal(false);
  public confirmNewPasswordTouched = signal(false);

  // Validaciones
  public nombreErrores = computed(() => {
    const valor = this.trainerForm.nombre().value().trim();
    if (!valor) return 'El nombre es obligatorio.';
    if (valor.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    return null;
  });

  public apellidoErrores = computed(() => {
    const valor = this.trainerForm.apellido().value().trim();
    if (!valor) return 'El apellido es obligatorio.';
    return null;
  });

  public emailErrores = computed(() => {
    const valor = this.trainerForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null;
  });

  public telefonoErrores = computed(() => {
    const valor = this.trainerForm.telefono().value().trim();
    if (!valor) return 'El teléfono es obligatorio.';
    const numRegex = /^\d+$/;
    if (!numRegex.test(valor)) return 'El teléfono debe contener solo números.';
    if (valor.length < 7 || valor.length > 15) return 'El teléfono debe tener una longitud válida (7 a 15 dígitos).';
    return null;
  });

  public especialidadErrores = computed(() => {
    const valor = this.trainerForm.especialidad().value().trim();
    if (!valor) return 'La especialidad es obligatoria.';
    return null;
  });

  public experienciaErrores = computed(() => {
    const valor = this.trainerForm.experiencia().value();
    if (valor === null || valor === undefined) return 'La experiencia es obligatoria.';
    if (valor < 0) return 'La experiencia debe ser un valor positivo.';
    if (valor > 50) return 'La experiencia no puede ser mayor a 50 años.';
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.emailErrores() &&
      !this.telefonoErrores() &&
      !this.especialidadErrores() &&
      !this.experienciaErrores()
    );
  });

  // Validaciones reactivas - Contraseña
  public currentPasswordErrores = computed(() => {
    const valor = this.passwordForm.currentPassword().value();
    if (!valor) return 'La contraseña actual es obligatoria.';
    return null;
  });

  public newPasswordErrores = computed(() => {
    const valor = this.passwordForm.newPassword().value();
    if (!valor) return 'La nueva contraseña es obligatoria.';
    if (valor.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
    return null;
  });

  public confirmNewPasswordErrores = computed(() => {
    const valor = this.passwordForm.confirmNewPassword().value();
    if (!valor) return 'Confirmar contraseña es obligatorio.';
    if (valor !== this.passwordForm.newPassword().value()) return 'Las contraseñas no coinciden.';
    return null;
  });

  public passwordFormValido = computed(() => {
    return (
      !this.currentPasswordErrores() &&
      !this.newPasswordErrores() &&
      !this.confirmNewPasswordErrores()
    );
  });

  activarEdicion(): void {
    const ent = this.entrenador();
    if (!ent) return;

    // Cargar datos actuales
    this.trainerModel.set({
      nombre: ent.nombre,
      apellido: ent.apellido,
      email: ent.email,
      telefono: ent.telefono,
      especialidad: ent.especialidad,
      experiencia: ent.experiencia
    });

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

  async guardar(): Promise<void> {
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);
    this.especialidadTouched.set(true);
    this.experienciaTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    const ent = this.entrenador();
    if (!ent) return;

    this.cargando.set(true);
    this.error.set(null);

    const v = {
      nombre: this.trainerForm.nombre().value(),
      apellido: this.trainerForm.apellido().value(),
      email: this.trainerForm.email().value(),
      telefono: this.trainerForm.telefono().value(),
      especialidad: this.trainerForm.especialidad().value(),
      experiencia: this.trainerForm.experiencia().value(),
    };

    try {
      await this.entrenadorSvc.actualizarEntrenador({ id: ent.id, ...v });
      this.modoEdicion.set(false);
      this.guardado.set(true);
      setTimeout(() => this.guardado.set(false), 3000);
    } catch (err: any) {
      console.error('Error al actualizar entrenador:', err);
      this.error.set(err.message || 'Error al actualizar el perfil.');
    } finally {
      this.cargando.set(false);
    }
  }

  async onSubmitPassword(): Promise<void> {
    this.currentPasswordTouched.set(true);
    this.newPasswordTouched.set(true);
    this.confirmNewPasswordTouched.set(true);

    if (!this.passwordFormValido()) {
      return;
    }

    this.pwdCargando.set(true);
    this.pwdError.set(null);

    try {
      await this.usuarioSvc.cambiarPassword(
        this.passwordForm.currentPassword().value(),
        this.passwordForm.newPassword().value()
      );
      this.pwdSuccessMessage.set('Contraseña modificada exitosamente.');
      
      this.passwordModel.set({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

      this.currentPasswordTouched.set(false);
      this.newPasswordTouched.set(false);
      this.confirmNewPasswordTouched.set(false);

      setTimeout(() => this.pwdSuccessMessage.set(''), 3000);
    } catch (err: any) {
      let errorMsg = 'Error al cambiar la contraseña. Inténtelo de nuevo.';
      if (err && err.error) {
        if (typeof err.error.detail === 'string') {
          errorMsg = err.error.detail;
        } else if (err.error.message) {
          errorMsg = err.error.message;
        }
      }
      this.pwdError.set(errorMsg);
    } finally {
      this.pwdCargando.set(false);
    }
  }
}


