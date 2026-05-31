import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  private usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder);

  // Filtros y búsquedas
  readonly selectedRolFilter = signal<string>('todos');
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);
  readonly editingUser = signal<Usuario | null>(null);

  // Formulario reactivo
  userForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    rol: ['cliente', [Validators.required]],
    activo: [true]
  });

  // Lista filtrada
  readonly filteredUsuarios = computed(() => {
    const list = this.usuarioService.usuarios();
    const filter = this.selectedRolFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter(u => {
      const matchRol = filter === 'todos' || u.rol === filter;
      const matchSearch =
        u.nombre.toLowerCase().includes(query) ||
        u.apellido.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.telefono.includes(query);
      return matchRol && matchSearch;
    });
  });

  setRolFilter(rol: string): void {
    this.selectedRolFilter.set(rol);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  openAddModal(): void {
    this.editingUser.set(null);
    this.userForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      rol: 'cliente',
      activo: true
    });
    this.showModal.set(true);
  }

  openEditModal(user: Usuario): void {
    this.editingUser.set(user);
    this.userForm.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      activo: user.activo
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formVal = this.userForm.value;
    const editing = this.editingUser();

    if (editing) {
      // Actualizar
      this.usuarioService.actualizarUsuario({
        ...editing,
        ...formVal
      });
    } else {
      // Registrar
      this.usuarioService.registrarUsuario({
        ...formVal
      });
    }

    this.closeModal();
  }

  toggleActivo(user: Usuario): void {
    this.usuarioService.actualizarUsuario({
      ...user,
      activo: !user.activo
    });
  }
}
