import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { SignalFormDirective } from '../../../directives/signal-form.directive';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, SignalFormDirective],
  templateUrl: './perfil-admin.html',
  styleUrl: './perfil-admin.css',
})
export class PerfilAdmin implements OnInit {
  private usuarioService = inject(UsuarioService);

  // Signals para carga y errores
  public cargando = signal(false);
  public error = signal<string | null>(null);
  public successMessage = signal<string>('');

  public pwdCargando = signal(false);
  public pwdError = signal<string | null>(null);
  public pwdSuccessMessage = signal<string>('');

  // Modelos del Formulario
  public profileModel = signal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });
  public profileForm = form(this.profileModel);

  public passwordModel = signal({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  public passwordForm = form(this.passwordModel);

  // Estados Touched - Perfil
  public nombreTouched = signal(false);
  public apellidoTouched = signal(false);
  public emailTouched = signal(false);
  public telefonoTouched = signal(false);

  // Estados Touched - Contraseña
  public currentPasswordTouched = signal(false);
  public newPasswordTouched = signal(false);
  public confirmNewPasswordTouched = signal(false);

  // Validaciones reactivas - Perfil
  public nombreErrores = computed(() => {
    const valor = this.profileForm.nombre().value().trim();
    if (!valor) return 'El nombre es obligatorio.';
    return null;
  });

  public apellidoErrores = computed(() => {
    const valor = this.profileForm.apellido().value().trim();
    if (!valor) return 'El apellido es obligatorio.';
    return null;
  });

  public emailErrores = computed(() => {
    const valor = this.profileForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null;
  });

  public telefonoErrores = computed(() => {
    const valor = this.profileForm.telefono().value().trim();
    if (!valor) return 'El teléfono es obligatorio.';
    const numRegex = /^\d+$/;
    if (!numRegex.test(valor)) return 'El teléfono debe contener solo números.';
    if (valor.length < 7 || valor.length > 15) return 'El teléfono debe tener una longitud válida (7 a 15 dígitos).';
    return null;
  });

  public profileFormValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.emailErrores() &&
      !this.telefonoErrores()
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

  ngOnInit(): void {
    // Cargar datos actuales
    const admin = this.usuarioService.getUsuarioActual();
    if (admin) {
      this.profileModel.set({
        nombre: admin.nombre,
        apellido: admin.apellido,
        email: admin.email,
        telefono: admin.telefono
      });
    }
  }

  onSubmitProfile(): void {
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);

    if (!this.profileFormValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const admin = this.usuarioService.getUsuarioActual();
    this.usuarioService.actualizarUsuario({
      ...admin,
      nombre: this.profileForm.nombre().value(),
      apellido: this.profileForm.apellido().value(),
      email: this.profileForm.email().value(),
      telefono: this.profileForm.telefono().value()
    });

    this.cargando.set(false);
    this.error.set(null);
    this.successMessage.set('Perfil actualizado exitosamente.');
    setTimeout(() => this.successMessage.set(''), 3000);
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
      await this.usuarioService.cambiarPassword(
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
