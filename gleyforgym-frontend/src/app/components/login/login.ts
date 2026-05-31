import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    const usuario = this.usuarioService.loginSimulado(email, password);

    if (usuario) {
      this.errorMessage = '';
      this.redirigirUsuario(usuario.rol);
    } else {
      this.errorMessage = 'Correo o contraseña incorrectos.';
    }
  }

  quickLogin(rol: 'admin' | 'entrenador' | 'cliente'): void {
    let email = '';
    let pass = '';

    if (rol === 'admin') {
      email = 'admin@gleyforgym.com';
      pass = 'admin123';
    } else if (rol === 'entrenador') {
      email = 'carlos.ramirez@gleyforgym.com';
      pass = 'entrenador123';
    } else if (rol === 'cliente') {
      email = 'maria.gonzalez@email.com';
      pass = 'cliente123';
    }

    this.loginForm.patchValue({ email, password: pass });
    const usuario = this.usuarioService.loginSimulado(email, pass);
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
