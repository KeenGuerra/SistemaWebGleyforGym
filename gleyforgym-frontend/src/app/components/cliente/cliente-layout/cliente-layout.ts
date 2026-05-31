import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { MembresiaService } from '../../../services/membresia.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cliente-layout.html',
  styleUrl: './cliente-layout.css',
})
export class ClienteLayout {
  private usuarioSvc = inject(UsuarioService);
  private membresiaSvc = inject(MembresiaService);

  readonly usuario = this.usuarioSvc.usuarioActual;
  readonly iniciales = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;

  readonly membresia = computed(() =>
    this.membresiaSvc.getMembresiaActiva(5)
  );

  readonly menuItems = [
    { label: 'Panel Principal', icon: 'bi-grid-1x2-fill', ruta: '/cliente/panel' },
    { label: 'Mi Perfil', icon: 'bi-person-fill', ruta: '/cliente/perfil' },
    { label: 'Mi Membresía', icon: 'bi-card-checklist', ruta: '/cliente/membresia' },
    { label: 'Mis Pagos', icon: 'bi-credit-card-fill', ruta: '/cliente/pagos' },
    { label: 'Mi Asistencia', icon: 'bi-calendar-check-fill', ruta: '/cliente/asistencia' },
    { label: 'Mis Rutinas', icon: 'bi-clipboard2-pulse-fill', ruta: '/cliente/rutinas' },
  ];

  readonly menuSecundario = [
    { label: 'Configuración', icon: 'bi-gear-fill', ruta: '/cliente/configuracion' },
  ];

  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
