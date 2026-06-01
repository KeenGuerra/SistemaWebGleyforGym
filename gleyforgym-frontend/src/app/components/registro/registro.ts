import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private usuarioService = inject(UsuarioService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  // Valores de los campos como Signals de escritura (Writable Signals)
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');

  // Estados "tocado" para manejar cuándo mostrar los errores en la UI
  readonly nombreTouched = signal(false);
  readonly apellidoTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);
  readonly passwordTouched = signal(false);
  readonly confirmPasswordTouched = signal(false);

  // Validaciones reactivas derivadas como Signals Calculados (Computed Signals)
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly apellidoInvalid = computed(() => this.apellido().trim() === '');
  
  readonly emailInvalid = computed(() => this.email().trim() === '');
  readonly emailFormatInvalid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email().trim() !== '' && !emailRegex.test(this.email());
  });

  readonly telefonoInvalid = computed(() => this.telefono().trim() === '');
  readonly passwordInvalid = computed(() => this.password() === '');
  readonly passwordTooShort = computed(() => this.password() !== '' && this.password().length < 6);
  readonly confirmPasswordInvalid = computed(() => this.confirmPassword() === '');
  
  // Validación cruzada para confirmar contraseñas
  readonly passwordMismatch = computed(() => {
    return this.password() !== '' && this.confirmPassword() !== '' && this.password() !== this.confirmPassword();
  });

  // Estado general de invalidez del formulario
  readonly formInvalid = computed(() => {
    return (
      this.nombreInvalid() ||
      this.apellidoInvalid() ||
      this.emailInvalid() ||
      this.emailFormatInvalid() ||
      this.telefonoInvalid() ||
      this.passwordInvalid() ||
      this.passwordTooShort() ||
      this.confirmPasswordInvalid() ||
      this.passwordMismatch()
    );
  });

  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    // Al intentar enviar, marcamos todos los campos como "tocados" para mostrar validaciones
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);
    this.passwordTouched.set(true);
    this.confirmPasswordTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const emailVal = this.email();
    const existe = this.usuarioService.obtenerUsuarios().some(u => u.email === emailVal);
    if (existe) {
      this.errorMessage = 'El correo electrónico ya está registrado.';
      return;
    }

    const nuevoUsuario = this.usuarioService.registrarUsuario({
      nombre: this.nombre(),
      apellido: this.apellido(),
      email: emailVal,
      telefono: this.telefono(),
      rol: 'cliente',
      activo: true
    });

    this.clienteService.registrarCliente({
      ...nuevoUsuario,
      membresiaId: 1,
      entrenadorId: 1,
      objetivo: 'General',
      peso: 70,
      altura: 170
    });

    this.errorMessage = '';
    this.successMessage = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}

