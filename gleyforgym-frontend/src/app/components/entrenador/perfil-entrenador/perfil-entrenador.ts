import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
import { EntrenadorService } from '../../../services/entrenador.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-entrenador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil-entrenador.html',
  styleUrl: './perfil-entrenador.css',
})
export class PerfilEntrenador {
  private entrenadorSvc = inject(EntrenadorService);
  private usuarioSvc    = inject(UsuarioService);

  readonly entrenador   = this.entrenadorSvc.getEntrenadorActual();
  readonly iniciales    = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;
  readonly modoEdicion  = signal(false);
  readonly guardado     = signal(false);

  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Modelo del Formulario
  public trainerModel = signal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
    experiencia: 0
  });
  public trainerForm = form(this.trainerModel);

  // Estados Touched
  public nombreTouched = signal(false);
  public apellidoTouched = signal(false);
  public emailTouched = signal(false);
  public telefonoTouched = signal(false);
  public especialidadTouched = signal(false);
  public experienciaTouched = signal(false);

  // Validaciones
  public nombreErrores = computed(() => {
    const valor = this.trainerForm.nombre().value().trim();
    if (!valor) return 'El nombre es obligatorio.';
    if (valor.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    return null;
  });

  public apellidoErrores = computed(() => {
    const valor = this.trainerForm.apellido().value().trim();
    if (!valor) return 'El apellido es obligatorio.';
    return null;
  });

  public emailErrores = computed(() => {
    const valor = this.trainerForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null;
  });

  public telefonoErrores = computed(() => {
    const valor = this.trainerForm.telefono().value().trim();
    if (!valor) return 'El teléfono es obligatorio.';
    const numRegex = /^\d+$/;
    if (!numRegex.test(valor)) return 'El teléfono debe contener solo números.';
    if (valor.length < 7 || valor.length > 15) return 'El teléfono debe tener una longitud válida (7 a 15 dígitos).';
    return null;
  });

  public especialidadErrores = computed(() => {
    const valor = this.trainerForm.especialidad().value().trim();
    if (!valor) return 'La especialidad es obligatoria.';
    return null;
  });

  public experienciaErrores = computed(() => {
    const valor = this.trainerForm.experiencia().value();
    if (valor === null || valor === undefined) return 'La experiencia es obligatoria.';
    if (valor < 0) return 'La experiencia debe ser un valor positivo.';
    if (valor > 50) return 'La experiencia no puede ser mayor a 50 años.';
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.emailErrores() &&
      !this.telefonoErrores() &&
      !this.especialidadErrores() &&
      !this.experienciaErrores()
    );
  });

  activarEdicion(): void {
    // Cargar datos actuales
    this.trainerModel.set({
      nombre: this.entrenador.nombre,
      apellido: this.entrenador.apellido,
      email: this.entrenador.email,
      telefono: this.entrenador.telefono,
      especialidad: this.entrenador.especialidad,
      experiencia: this.entrenador.experiencia
    });

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);
    this.especialidadTouched.set(false);
    this.experienciaTouched.set(false);

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
    this.especialidadTouched.set(true);
    this.experienciaTouched.set(true);

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const v = {
      nombre: this.trainerForm.nombre().value(),
      apellido: this.trainerForm.apellido().value(),
      email: this.trainerForm.email().value(),
      telefono: this.trainerForm.telefono().value(),
      especialidad: this.trainerForm.especialidad().value(),
      experiencia: this.trainerForm.experiencia().value(),
    };

    this.entrenadorSvc.actualizarEntrenador({ id: this.entrenador.id, ...v });
    this.cargando.set(false);
    this.modoEdicion.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 3000);
  }
}

