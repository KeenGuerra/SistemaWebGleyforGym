import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-admin.html',
  styleUrl: './perfil-admin.css',
})
export class PerfilAdmin implements OnInit {
  private usuarioService = inject(UsuarioService);

  // Signals para mensajes
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly pwdErrorMessage = signal<string>('');
  readonly pwdSuccessMessage = signal<string>('');

  // Writable Signals - Formulario Perfil
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly email = signal('');
  readonly telefono = signal('');

  // Writable Signals - Formulario Contraseña
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmNewPassword = signal('');

  // Estados Touched - Perfil
  readonly nombreTouched = signal(false);
  readonly apellidoTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);

  // Estados Touched - Contraseña
  readonly currentPasswordTouched = signal(false);
  readonly newPasswordTouched = signal(false);
  readonly confirmNewPasswordTouched = signal(false);

  // Validaciones reactivas - Perfil
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly apellidoInvalid = computed(() => this.apellido().trim() === '');
  readonly emailInvalid = computed(() => this.email().trim() === '');
  readonly emailFormatInvalid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email().trim() !== '' && !emailRegex.test(this.email());
  });
  readonly telefonoInvalid = computed(() => this.telefono().trim() === '');

  readonly profileFormInvalid = computed(() => {
    return (
      this.nombreInvalid() ||
      this.apellidoInvalid() ||
      this.emailInvalid() ||
      this.emailFormatInvalid() ||
      this.telefonoInvalid()
    );
  });

  // Validaciones reactivas - Contraseña
  readonly currentPasswordInvalid = computed(() => this.currentPassword().trim() === '');
  readonly newPasswordInvalid = computed(() => this.newPassword().trim() === '');
  readonly newPasswordTooShort = computed(() => this.newPassword() !== '' && this.newPassword().length < 6);
  readonly confirmNewPasswordInvalid = computed(() => this.confirmNewPassword().trim() === '');
  readonly passwordMismatch = computed(() => {
    return this.newPassword() !== '' && this.confirmNewPassword() !== '' && this.newPassword() !== this.confirmNewPassword();
  });

  readonly passwordFormTouched = computed(() => {
    return this.currentPasswordTouched() || this.newPasswordTouched() || this.confirmNewPasswordTouched();
  });

  readonly passwordFormInvalid = computed(() => {
    return (
      this.currentPasswordInvalid() ||
      this.newPasswordInvalid() ||
      this.newPasswordTooShort() ||
      this.confirmNewPasswordInvalid() ||
      this.passwordMismatch()
    );
  });

  ngOnInit(): void {
    // Cargar datos actuales
    const admin = this.usuarioService.getUsuarioActual();
    if (admin) {
      this.nombre.set(admin.nombre);
      this.apellido.set(admin.apellido);
      this.email.set(admin.email);
      this.telefono.set(admin.telefono);
    }
  }

  onSubmitProfile(): void {
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);

    if (this.profileFormInvalid()) {
      return;
    }

    const admin = this.usuarioService.getUsuarioActual();
    this.usuarioService.actualizarUsuario({
      ...admin,
      nombre: this.nombre(),
      apellido: this.apellido(),
      email: this.email(),
      telefono: this.telefono()
    });

    this.errorMessage.set('');
    this.successMessage.set('Perfil actualizado exitosamente.');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onSubmitPassword(): void {
    this.currentPasswordTouched.set(true);
    this.newPasswordTouched.set(true);
    this.confirmNewPasswordTouched.set(true);

    if (this.passwordFormInvalid()) {
      return;
    }

    // Como es mock, simplemente simulamos éxito
    this.pwdErrorMessage.set('');
    this.pwdSuccessMessage.set('Contraseña modificada exitosamente.');
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmNewPassword.set('');

    this.currentPasswordTouched.set(false);
    this.newPasswordTouched.set(false);
    this.confirmNewPasswordTouched.set(false);

    setTimeout(() => this.pwdSuccessMessage.set(''), 3000);
  }
}
