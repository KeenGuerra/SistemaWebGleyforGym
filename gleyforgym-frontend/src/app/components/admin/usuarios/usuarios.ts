import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  private usuarioService = inject(UsuarioService);

  // Filtros y búsquedas
  readonly selectedRolFilter = signal<string>('todos');
  readonly searchQuery = signal<string>('');

  // Modales
  readonly showModal = signal<boolean>(false);
  readonly editingUser = signal<Usuario | null>(null);

  // Writable Signals de Formulario
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly rol = signal<'admin' | 'entrenador' | 'cliente'>('cliente');
  readonly activo = signal(true);

  // Estados Touched
  readonly nombreTouched = signal(false);
  readonly apellidoTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);

  // Validaciones
  readonly nombreInvalid = computed(() => this.nombre().trim() === '');
  readonly apellidoInvalid = computed(() => this.apellido().trim() === '');
  readonly emailInvalid = computed(() => this.email().trim() === '');
  readonly emailFormatInvalid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email().trim() !== '' && !emailRegex.test(this.email());
  });
  readonly telefonoInvalid = computed(() => this.telefono().trim() === '');

  readonly formInvalid = computed(() => {
    return (
      this.nombreInvalid() ||
      this.apellidoInvalid() ||
      this.emailInvalid() ||
      this.emailFormatInvalid() ||
      this.telefonoInvalid()
    );
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
    
    // Resetear form
    this.nombre.set('');
    this.apellido.set('');
    this.email.set('');
    this.telefono.set('');
    this.rol.set('cliente');
    this.activo.set(true);

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);

    this.showModal.set(true);
  }

  openEditModal(user: Usuario): void {
    this.editingUser.set(user);
    
    // Cargar datos
    this.nombre.set(user.nombre);
    this.apellido.set(user.apellido);
    this.email.set(user.email);
    this.telefono.set(user.telefono);
    this.rol.set(user.rol);
    this.activo.set(user.activo);

    // Resetear touched
    this.nombreTouched.set(false);
    this.apellidoTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  saveUser(): void {
    this.nombreTouched.set(true);
    this.apellidoTouched.set(true);
    this.emailTouched.set(true);
    this.telefonoTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const formVal = {
      nombre: this.nombre(),
      apellido: this.apellido(),
      email: this.email(),
      telefono: this.telefono(),
      rol: this.rol(),
      activo: this.activo()
    };
    
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

