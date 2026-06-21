import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { form } from '../../utils/signal-form';
import { SignalFormDirective } from '../../directives/signal-form.directive';
import { UsuarioService } from '../../services/usuario.service';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink, SignalFormDirective],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private usuarioService = inject(UsuarioService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  public cargando = signal(false);
  public error = signal<string | null>(null);
  public success = signal<string | null>(null);

  public usuarioModel = signal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  public usuarioForm = form(this.usuarioModel);

  // Estados "tocado" para manejar cuándo mostrar los errores en la UI
  public nombreTouched = signal(false);
  public apellidoTouched = signal(false);
  public emailTouched = signal(false);
  public telefonoTouched = signal(false);
  public passwordTouched = signal(false);
  public confirmPasswordTouched = signal(false);

  // Validaciones reactivas derivadas como Signals Calculados (Computed Signals)
  public nombreErrores = computed(() => {
    const valor = this.usuarioForm.nombre().value().trim();
    if (!valor) return 'El nombre es obligatorio.';
    return null;
  });

  public apellidoErrores = computed(() => {
    const valor = this.usuarioForm.apellido().value().trim();
    if (!valor) return 'El apellido es obligatorio.';
    return null;
  });

  public emailErrores = computed(() => {
    const valor = this.usuarioForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null;
  });

  public telefonoErrores = computed(() => {
    const valor = this.usuarioForm.telefono().value().trim();
    if (!valor) return 'El teléfono es obligatorio.';
    const numRegex = /^\d+$/;
    if (!numRegex.test(valor)) return 'El teléfono debe contener solo números.';
    if (valor.length < 7 || valor.length > 15) return 'El teléfono debe tener una longitud válida (7 a 15 dígitos).';
    return null;
  });

  public passwordErrores = computed(() => {
    const valor = this.usuarioForm.password().value();
    if (!valor) return 'La contraseña es obligatoria.';
    if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    return null;
  });

  public confirmPasswordErrores = computed(() => {
    const valor = this.usuarioForm.confirmPassword().value();
    if (!valor) return 'Confirmar contraseña es obligatorio.';
    if (valor !== this.usuarioForm.password().value()) return 'Las contraseñas no coinciden.';
    return null;
  });

  // Estado general de validez del formulario
  public formularioValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.emailErrores() &&
      !this.telefonoErrores() &&
      !this.passwordErrores() &&
      !this.confirmPasswordErrores()
    );
  });

  async onSubmit(): Promise<void> {
    // Al intentar enviar, marcamos todos los campos como "tocados" para mostrar validaciones
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);
    this.passwordTouched.set(true);
    this.confirmPasswordTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const emailVal = this.usuarioForm.email().value();

    try {
      await this.usuarioService.registrarPublico({
        nombre: this.usuarioForm.nombre().value(),
        apellido: this.usuarioForm.apellido().value(),
        email: emailVal,
        telefono: this.usuarioForm.telefono().value(),
        password: this.usuarioForm.password().value()
      });

      this.cargando.set(false);
      this.error.set(null);
      this.success.set('¡Registro exitoso! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (err: any) {
      this.cargando.set(false);
      let errorMsg = 'Error al registrarse. Inténtelo de nuevo.';
      if (err && err.error) {
        if (typeof err.error.detail === 'string') {
          errorMsg = err.error.detail;
        } else if (Array.isArray(err.error.detail) && err.error.detail.length > 0) {
          const firstErr = err.error.detail[0];
          errorMsg = firstErr.msg || 'Error de validación';
        } else if (err.error.message) {
          errorMsg = err.error.message;
        }
      }
      this.error.set(errorMsg);
    }
  }
}

