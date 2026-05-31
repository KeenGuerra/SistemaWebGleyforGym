import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil-cliente.html',
  styleUrl: './perfil-cliente.css',
})
export class PerfilCliente {
  private clienteSvc  = inject(ClienteService);
  private usuarioSvc  = inject(UsuarioService);
  private fb          = inject(FormBuilder);

  private readonly CLIENTE_ID = 5;
  readonly cliente    = this.clienteSvc.getClientePorId(this.CLIENTE_ID)!;
  readonly iniciales  = this.usuarioSvc.iniciales;
  readonly modoEdicion = signal(false);
  readonly guardado   = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre:   [this.cliente.nombre,   [Validators.required, Validators.minLength(2)]],
    apellido: [this.cliente.apellido, [Validators.required, Validators.minLength(2)]],
    email:    [this.cliente.email,    [Validators.required, Validators.email]],
    telefono: [this.cliente.telefono, [Validators.required, Validators.minLength(7)]],
    objetivo: [this.cliente.objetivo, Validators.required],
    peso:     [this.cliente.peso ?? 0, [Validators.min(20), Validators.max(300)]],
    altura:   [this.cliente.altura ?? 0, [Validators.min(100), Validators.max(250)]],
  });

  activarEdicion(): void {
    this.modoEdicion.set(true);
    this.guardado.set(false);
  }

  cancelar(): void {
    this.modoEdicion.set(false);
    this.form.patchValue({
      nombre:   this.cliente.nombre,
      apellido: this.cliente.apellido,
      email:    this.cliente.email,
      telefono: this.cliente.telefono,
      objetivo: this.cliente.objetivo,
      peso:     this.cliente.peso,
      altura:   this.cliente.altura,
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.clienteSvc.actualizarCliente({ ...this.cliente, ...v });
    this.modoEdicion.set(false);
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 3000);
  }

  get imc(): number {
    const p = this.form.value.peso ?? this.cliente.peso ?? 0;
    const a = this.form.value.altura ?? this.cliente.altura ?? 1;
    return a > 0 ? +(p / ((a / 100) ** 2)).toFixed(1) : 0;
  }

  get categoriaImc(): string {
    const v = this.imc;
    if (v < 18.5) return 'Bajo peso';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  hasError(campo: string, error: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }
}
