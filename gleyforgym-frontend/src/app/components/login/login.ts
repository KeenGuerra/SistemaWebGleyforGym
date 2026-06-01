import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  // Inputs del formulario como Signals
  readonly email = signal('');
  readonly password = signal('');

  // Estados touched
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);

  // Validaciones reactivas derivadas (Computed)
  readonly emailInvalid = computed(() => this.email().trim() === '');
  readonly emailFormatInvalid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email().trim() !== '' && !emailRegex.test(this.email());
  });
  readonly passwordInvalid = computed(() => this.password() === '');

  readonly formInvalid = computed(() => this.emailInvalid() || this.emailFormatInvalid() || this.passwordInvalid());

  errorMessage = '';

  onSubmit(): void {
    this.emailTouched.set(true);
    this.passwordTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const usuario = this.usuarioService.loginSimulado(this.email(), this.password());

    if (usuario) {
      this.errorMessage = '';
      this.redirigirUsuario(usuario.rol);
    } else {
      this.errorMessage = 'Correo o contraseña incorrectos.';
    }
  }

  quickLogin(rol: 'admin' | 'entrenador' | 'cliente'): void {
    let emailVal = '';
    let passVal = '';

    if (rol === 'admin') {
      emailVal = 'admin@gleyforgym.com';
      passVal = 'admin123';
    } else if (rol === 'entrenador') {
      emailVal = 'carlos.ramirez@gleyforgym.com';
      passVal = 'entrenador123';
    } else if (rol === 'cliente') {
      emailVal = 'maria.gonzalez@email.com';
      passVal = 'cliente123';
    }

    this.email.set(emailVal);
    this.password.set(passVal);
    this.emailTouched.set(true);
    this.passwordTouched.set(true);

    const usuario = this.usuarioService.loginSimulado(emailVal, passVal);
    if (usuario) {
      this.errorMessage = '';
      this.redirigirUsuario(usuario.rol);
    }
  }

  private redirigirUsuario(rol: string): void {
    if (rol === 'admin') {
      this.router.navigate(['/admin/panel']);
    } else if (rol === 'entrenador') {
      this.router.navigate(['/entrenador/panel']);
    } else if (rol === 'cliente') {
      this.router.navigate(['/cliente/panel']);
    }
  }
}

