import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { SignalFormDirective } from '../../../directives/signal-form.directive';
import { ClienteService } from '../../../services/cliente.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, SignalFormDirective],
  templateUrl: './perfil-cliente.html',
  styleUrl: './perfil-cliente.css',
})
export class PerfilCliente {
  private clienteSvc  = inject(ClienteService);
  private usuarioSvc  = inject(UsuarioService);

  readonly clienteActual = computed(() => {
    const user = this.usuarioSvc.usuarioActual();
    return this.clienteSvc.clientes().find(c => c.email === user.email);
  });

  readonly CLIENTE_ID = computed(() => this.clienteActual()?.id || 0);
  readonly cliente    = computed(() => this.clienteActual());
  readonly iniciales  = this.usuarioSvc.iniciales;
  readonly modoEdicion = signal(false);
  readonly guardado   = signal(false);

  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Signals para Contraseña
  public pwdCargando = signal(false);
  public pwdError = signal<string | null>(null);
  public pwdSuccessMessage = signal<string>('');

  // Modelo del Formulario
  public clientModel = signal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    objetivo: '',
    peso: 0,
    altura: 0
  });
  public clientForm = form(this.clientModel);

  // Estados Touched para validaciones visuales
  public nombreTouched = signal(false);
  public apellidoTouched = signal(false);
  public emailTouched = signal(false);
  public telefonoTouched = signal(false);
  public objetivoTouched = signal(false);
  public pesoTouched = signal(false);
  public alturaTouched = signal(false);

  // Modelo del Formulario de Contraseña
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

  // Computed validation signals
  public nombreErrores = computed(() => {
    const valor = this.clientForm.nombre().value().trim();
    if (!valor) return 'El nombre es obligatorio.';
    return null;
  });

  public apellidoErrores = computed(() => {
    const valor = this.clientForm.apellido().value().trim();
    if (!valor) return 'El apellido es obligatorio.';
    return null;
  });

  public emailErrores = computed(() => {
    const valor = this.clientForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null;
  });

  public telefonoErrores = computed(() => {
    const valor = this.clientForm.telefono().value().trim();
    if (!valor) return 'El teléfono es obligatorio.';
    const numRegex = /^\d+$/;
    if (!numRegex.test(valor)) return 'El teléfono debe contener solo números.';
    if (valor.length < 7 || valor.length > 15) return 'El teléfono debe tener una longitud válida (7 a 15 dígitos).';
    return null;
  });

  public objetivoErrores = computed(() => {
    const valor = this.clientForm.objetivo().value().trim();
    if (!valor) return 'El objetivo es obligatorio.';
    return null;
  });

  public pesoErrores = computed(() => {
    const valor = this.clientForm.peso().value();
    if (valor === null || valor === undefined) return 'El peso es obligatorio.';
    if (valor <= 0) return 'El peso debe ser positivo.';
    if (valor < 20 || valor > 300) return 'El peso debe estar entre 20 y 300 kg.';
    return null;
  });

  public alturaErrores = computed(() => {
    const valor = this.clientForm.altura().value();
    if (valor === null || valor === undefined) return 'La altura es obligatoria.';
    if (valor <= 0) return 'La altura debe ser positiva.';
    if (valor < 0.5 || valor > 2.5) return 'La altura debe estar entre 0.50 y 2.50 metros.';
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.emailErrores() &&
      !this.telefonoErrores() &&
      !this.objetivoErrores() &&
      !this.pesoErrores() &&
      !this.alturaErrores()
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
    const cli = this.cliente();
    if (!cli) return;

    // Cargar valores actuales en los signals de edición
    this.clientModel.set({
      nombre: cli.nombre,
      apellido: cli.apellido,
      email: cli.email,
      telefono: cli.telefono,
      objetivo: cli.objetivo ?? '',
      peso: cli.peso ?? 0,
      altura: cli.altura ?? 0
    });

    // Resetear estados touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);
    this.objetivoTouched.set(false);
    this.pesoTouched.set(false);
    this.alturaTouched.set(false);

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
    this.objetivoTouched.set(true);
    this.pesoTouched.set(true);
    this.alturaTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    const cli = this.cliente();
    if (!cli) return;

    this.cargando.set(true);
    this.error.set(null);

    const v = {
      nombre: this.clientForm.nombre().value(),
      apellido: this.clientForm.apellido().value(),
      email: this.clientForm.email().value(),
      telefono: this.clientForm.telefono().value(),
      objetivo: this.clientForm.objetivo().value(),
      peso: this.clientForm.peso().value(),
      altura: this.clientForm.altura().value(),
    };

    try {
      await this.clienteSvc.actualizarCliente({ ...cli, ...v });
      this.modoEdicion.set(false);
      this.guardado.set(true);
      setTimeout(() => this.guardado.set(false), 3000);
    } catch (err: any) {
      console.error('Error al actualizar cliente:', err);
      this.error.set(err.message || 'Error al actualizar el perfil.');
    } finally {
      this.cargando.set(false);
    }
  }

  readonly imc = computed(() => {
    const cli = this.cliente();
    // Altura en metros. Si editando, usar form; si no, valor estático del cliente
    const p = this.modoEdicion() ? this.clientForm.peso().value() : (cli?.peso ?? 0);
    const a = this.modoEdicion() ? this.clientForm.altura().value() : (cli?.altura ?? 1);
    return a > 0 ? +(p / (a ** 2)).toFixed(1) : 0;
  });

  readonly categoriaImc = computed(() => {
    const v = this.imc();
    if (v < 18.5) return 'Bajo peso';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Sobrepeso';
    return 'Obesidad';
  });

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


