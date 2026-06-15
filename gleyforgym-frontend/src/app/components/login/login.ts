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

  public cargando = signal(false);
  public error = signal<string | null>(null);

  public loginModel = signal({
    correo: '',
    password: ''
  });

  // Estados tocados
  public correoTocado = signal(false);
  public passwordTocado = signal(false);

  // Validaciones reactivas derivadas (Computed)
  public correoError = computed(() => {
    const valor = this.loginModel().correo.trim();
    if (!valor) {
      return 'El correo electrónico es obligatorio.';
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(valor)) {
      return 'Ingrese un correo electrónico válido.';
    }
    return null;
  });

  public passwordError = computed(() => {
    const valor = this.loginModel().password;
    if (!valor) {
      return 'La contraseña es obligatoria.';
    }
    if (valor.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    return null;
  });

  public formularioValido = computed(() => {
    return !this.correoError() && !this.passwordError();
  });

  async onSubmit(): Promise<void> {
    this.correoTocado.set(true);
    this.passwordTocado.set(true);

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const usuario = await this.usuarioService.login(
        this.loginModel().correo,
        this.loginModel().password
      );

      this.cargando.set(false);
      if (usuario) {
        this.error.set(null);
        this.redirigirUsuario(usuario.rol);
      } else {
        this.error.set('Correo o contraseña incorrectos.');
      }
    } catch (err: any) {
      this.cargando.set(false);
      this.error.set(err.error?.detail || 'Correo o contraseña incorrectos.');
    }
  }

  private redirigirUsuario(rol: string): void {
    const upperRol = rol.toUpperCase();
    if (upperRol === 'ADMINISTRADOR' || upperRol === 'ADMIN') {
      this.router.navigate(['/admin/panel']);
    } else if (upperRol === 'ENTRENADOR') {
      this.router.navigate(['/entrenador/panel']);
    } else if (upperRol === 'CLIENTE') {
      this.router.navigate(['/cliente/panel']);
    }
  }
}
