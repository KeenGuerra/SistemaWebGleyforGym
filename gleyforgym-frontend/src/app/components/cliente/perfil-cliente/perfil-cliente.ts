import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  // Writable Signals para almacenar valores temporales del formulario
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly objetivo = signal('');
  readonly peso = signal(0);
  readonly altura = signal(0);

  // Estados Touched para validaciones visuales
  readonly nombreTouched = signal(false);
  readonly apellidoTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);
  readonly objetivoTouched = signal(false);
  readonly pesoTouched = signal(false);
  readonly alturaTouched = signal(false);

  // Computed validation signals
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly apellidoInvalid = computed(() => this.apellido().trim() === '');
  readonly emailInvalid = computed(() => this.email().trim() === '');
  readonly emailFormatInvalid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email().trim() !== '' && !emailRegex.test(this.email());
  });
  readonly telefonoInvalid = computed(() => this.telefono().trim().length < 7);
  readonly objetivoInvalid = computed(() => this.objetivo().trim() === '');
  readonly pesoInvalid = computed(() => this.peso() < 20 || this.peso() > 300);
  readonly alturaInvalid = computed(() => this.altura() < 100 || this.altura() > 250);

  readonly formInvalid = computed(() => {
    return (
      this.nombreInvalid() ||
      this.apellidoInvalid() ||
      this.emailInvalid() ||
      this.emailFormatInvalid() ||
      this.telefonoInvalid() ||
      this.objetivoInvalid() ||
      this.pesoInvalid() ||
      this.alturaInvalid()
    );
  });

  activarEdicion(): void {
    // Cargar valores actuales en los signals de edición
    this.nombre.set(this.cliente.nombre);
    this.apellido.set(this.cliente.apellido);
    this.email.set(this.cliente.email);
    this.telefono.set(this.cliente.telefono);
    this.objetivo.set(this.cliente.objetivo);
    this.peso.set(this.cliente.peso ?? 0);
    this.altura.set(this.cliente.altura ?? 0);

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

    if (this.formInvalid()) {
      return;
    }

    const v = {
      nombre: this.nombre(),
      apellido: this.apellido(),
      email: this.email(),
      telefono: this.telefono(),
      objetivo: this.objetivo(),
      peso: this.peso(),
      altura: this.altura(),
    };

    this.clienteSvc.actualizarCliente({ ...this.cliente, ...v });
    this.modoEdicion.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 3000);
  }

  readonly imc = computed(() => {
    // Si estamos editando usamos los valores del signal; si no, los del cliente estático
    const p = this.modoEdicion() ? this.peso() : (this.cliente.peso ?? 0);
    const a = this.modoEdicion() ? this.altura() : (this.cliente.altura ?? 1);
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

