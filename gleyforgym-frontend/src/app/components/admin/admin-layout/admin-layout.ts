import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private usuarioSvc = inject(UsuarioService);
  private router = inject(Router);

  readonly iniciales = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;

  readonly menuItems = [
    { label: 'Panel Principal', icon: 'bi-grid-1x2-fill', ruta: '/admin/panel' },
    { label: 'Usuarios', icon: 'bi-people-fill', ruta: '/admin/usuarios' },
    { label: 'Clientes', icon: 'bi-person-badge-fill', ruta: '/admin/clientes' },
    { label: 'Membresías', icon: 'bi-card-heading', ruta: '/admin/membresias' },
    { label: 'Pagos', icon: 'bi-credit-card-fill', ruta: '/admin/pagos' },
    { label: 'Asistencia', icon: 'bi-calendar-check-fill', ruta: '/admin/asistencia' },
    { label: 'Rutinas', icon: 'bi-clipboard2-pulse-fill', ruta: '/admin/rutinas' },
    { label: 'Mi Perfil', icon: 'bi-person-circle', ruta: '/admin/perfil' },
  ];

  readonly menuSecundario = [
    { label: 'Configuración', icon: 'bi-gear-fill', ruta: '/admin/configuracion' }
  ];

  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.closeSidebar();
    this.router.navigate(['/login']);
  }
}
