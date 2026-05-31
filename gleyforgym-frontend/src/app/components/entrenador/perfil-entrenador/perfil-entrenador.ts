import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EntrenadorService } from '../../../services/entrenador.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-entrenador',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil-entrenador.html',
  styleUrl: './perfil-entrenador.css',
})
export class PerfilEntrenador {
  private entrenadorSvc = inject(EntrenadorService);
  private usuarioSvc    = inject(UsuarioService);
  private fb            = inject(FormBuilder);

  readonly entrenador   = this.entrenadorSvc.getEntrenadorActual();
  readonly iniciales    = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;
  readonly modoEdicion  = signal(false);
  readonly guardado     = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre:       [this.entrenador.nombre,    [Validators.required, Validators.minLength(2)]],
    apellido:     [this.entrenador.apellido,  [Validators.required, Validators.minLength(2)]],
    email:        [this.entrenador.email,     [Validators.required, Validators.email]],
    telefono:     [this.entrenador.telefono,  [Validators.required, Validators.minLength(7)]],
    especialidad: [this.entrenador.especialidad, Validators.required],
    experiencia:  [this.entrenador.experiencia, [Validators.required, Validators.min(0), Validators.max(50)]],
  });

  activarEdicion(): void {
    this.modoEdicion.set(true);
    this.guardado.set(false);
  }

  cancelar(): void {
    this.modoEdicion.set(false);
    this.form.patchValue({
      nombre:       this.entrenador.nombre,
      apellido:     this.entrenador.apellido,
      email:        this.entrenador.email,
      telefono:     this.entrenador.telefono,
      especialidad: this.entrenador.especialidad,
      experiencia:  this.entrenador.experiencia,
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.entrenadorSvc.actualizarEntrenador({ id: this.entrenador.id, ...v });
    this.modoEdicion.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 3000);
  }

  hasError(campo: string, error: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }
}
