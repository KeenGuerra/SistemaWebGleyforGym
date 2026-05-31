import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-admin.html',
  styleUrl: './perfil-admin.css',
})
export class PerfilAdmin implements OnInit {
  private usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder);

  // Signals para mensajes
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly pwdErrorMessage = signal<string>('');
  readonly pwdSuccessMessage = signal<string>('');

  // Formulario de perfil
  profileForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]]
  });

  // Formulario de contraseña
  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    // Cargar datos actuales
    const admin = this.usuarioService.getUsuarioActual();
    if (admin) {
      this.profileForm.patchValue({
        nombre: admin.nombre,
        apellido: admin.apellido,
        email: admin.email,
        telefono: admin.telefono
      });
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');
    if (newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const admin = this.usuarioService.getUsuarioActual();
    const val = this.profileForm.value;

    this.usuarioService.actualizarUsuario({
      ...admin,
      ...val
    });

    this.errorMessage.set('');
    this.successMessage.set('Perfil actualizado exitosamente.');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    // Como es mock, simplemente simulamos éxito
    this.pwdErrorMessage.set('');
    this.pwdSuccessMessage.set('Contraseña modificada exitosamente.');
    this.passwordForm.reset();
    setTimeout(() => this.pwdSuccessMessage.set(''), 3000);
  }
}
