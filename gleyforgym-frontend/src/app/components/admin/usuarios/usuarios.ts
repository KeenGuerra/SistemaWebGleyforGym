import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form } from '../../../utils/signal-form';
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

  // Signals de Carga y Error
  public cargando = signal(false);
  public error = signal<string | null>(null);

  // Modelo del Formulario
  public userModel = signal({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    rol: 'CLIENTE' as 'ADMINISTRADOR' | 'ENTRENADOR' | 'CLIENTE',
    activo: true
  });
  public userForm = form(this.userModel);

  // Estados Touched
  public nombreTouched = signal(false);
  public apellidoTouched = signal(false);
  public emailTouched = signal(false);
  public telefonoTouched = signal(false);

  // Validaciones
  public nombreErrores = computed(() => {
    const valor = this.userForm.nombre().value().trim();
    if (!valor) return 'El nombre es obligatorio.';
    return null;
  });

  public apellidoErrores = computed(() => {
    const valor = this.userForm.apellido().value().trim();
    if (!valor) return 'El apellido es obligatorio.';
    return null;
  });

  public emailErrores = computed(() => {
    const valor = this.userForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null;
  });

  public telefonoErrores = computed(() => {
    const valor = this.userForm.telefono().value().trim();
    if (!valor) return 'El teléfono es obligatorio.';
    const numRegex = /^\d+$/;
    if (!numRegex.test(valor)) return 'El teléfono debe contener solo números.';
    if (valor.length < 7 || valor.length > 15) return 'El teléfono debe tener una longitud válida (7 a 15 dígitos).';
    return null;
  });

  public formularioValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.emailErrores() &&
      !this.telefonoErrores()
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
        u.telefono.includes(query) ||
        u.dni.toLowerCase().includes(query);
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
    this.userModel.set({
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      rol: 'CLIENTE',
      activo: true
    });

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
    this.userModel.set({
      nombre: user.nombre,
      apellido: user.apellido,
      dni: user.dni,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      activo: user.activo
    });

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

    if (!this.formularioValido()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const formVal = {
      nombre: this.userForm.nombre().value(),
      apellido: this.userForm.apellido().value(),
      dni: this.userForm.dni().value(),
      email: this.userForm.email().value(),
      telefono: this.userForm.telefono().value(),
      rol: this.userForm.rol().value(),
      activo: this.userForm.activo().value()
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

    this.cargando.set(false);
    this.closeModal();
  }

  toggleActivo(user: Usuario): void {
    this.usuarioService.actualizarUsuario({
      ...user,
      activo: !user.activo
    });
  }
}

