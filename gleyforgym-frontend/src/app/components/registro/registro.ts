import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  registroForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  errorMessage = '';
  successMessage = '';

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, email, telefono } = this.registroForm.value;

    const existe = this.usuarioService.obtenerUsuarios().some(u => u.email === email);
    if (existe) {
      this.errorMessage = 'El correo electrónico ya está registrado.';
      return;
    }

    const nuevoUsuario = this.usuarioService.registrarUsuario({
      nombre,
      apellido,
      email,
      telefono,
      rol: 'cliente',
      activo: true
    });

    this.clienteService.registrarCliente({
      ...nuevoUsuario,
      membresiaId: 1,
      entrenadorId: 1,
      objetivo: 'General',
      peso: 70,
      altura: 170
    });

    this.errorMessage = '';
    this.successMessage = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
