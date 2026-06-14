import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { ClienteService } from '../../../services/cliente.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil-cliente.html',
  styleUrl: './perfil-cliente.css',
})
export class PerfilCliente {
  private clienteSvc  = inject(ClienteService);
  private usuarioSvc  = inject(UsuarioService);

  private readonly CLIENTE_ID = 5;
  readonly cliente    = this.clienteSvc.getClientePorId(this.CLIENTE_ID)!;
  readonly iniciales  = this.usuarioSvc.iniciales;
  readonly modoEdicion = signal(false);
  readonly guardado   = signal(false);

  public cargando = signal(false);
  public error = signal<string | null>(null);

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
    if (valor < 100 || valor > 250) return 'La altura debe estar entre 100 y 250 cm.';
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

  activarEdicion(): void {
    // Cargar valores actuales en los signals de edición
    this.clientModel.set({
      nombre: this.cliente.nombre,
      apellido: this.cliente.apellido,
      email: this.cliente.email,
      telefono: this.cliente.telefono,
      objetivo: this.cliente.objetivo,
      peso: this.cliente.peso ?? 0,
      altura: this.cliente.altura ?? 0
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

  guardar(): void {
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

    this.clienteSvc.actualizarCliente({ ...this.cliente, ...v });
    this.cargando.set(false);
    this.modoEdicion.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 3000);
  }

  readonly imc = computed(() => {
    // Si estamos editando usamos los valores del signal; si no, los del cliente estático
    const p = this.modoEdicion() ? this.clientForm.peso().value() : (this.cliente.peso ?? 0);
    const a = this.modoEdicion() ? this.clientForm.altura().value() : (this.cliente.altura ?? 1);
    return a > 0 ? +(p / ((a / 100) ** 2)).toFixed(1) : 0;
  });

  readonly categoriaImc = computed(() => {
    const v = this.imc();
    if (v < 18.5) return 'Bajo peso';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Sobrepeso';
    return 'Obesidad';
  });
}

