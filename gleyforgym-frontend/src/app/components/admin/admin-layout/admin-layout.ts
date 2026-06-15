import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { ClienteService } from '../../../services/cliente.service';
import { EntrenadorService } from '../../../services/entrenador.service';
import { MembresiaService } from '../../../services/membresia.service';
import { PagoService } from '../../../services/pago.service';
import { AsistenciaService } from '../../../services/asistencia.service';
import { RutinaService } from '../../../services/rutina.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit {
  private usuarioSvc = inject(UsuarioService);
  private clienteSvc = inject(ClienteService);
  private entrenadorSvc = inject(EntrenadorService);
  private membresiaSvc = inject(MembresiaService);
  private pagoSvc = inject(PagoService);
  private asistenciaSvc = inject(AsistenciaService);
  private rutinaSvc = inject(RutinaService);
  private router = inject(Router);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    // Verificar que exista una sesión activa, si no redirigir a login
    this.usuarioSvc.checkSession().then(user => {
      if (!user || user.rol !== 'ADMINISTRADOR') {
        this.usuarioSvc.logout();
        this.router.navigate(['/login']);
      } else {
        // Cargar todos los datos desde el servidor
        this.clienteSvc.cargarClientes();
        this.entrenadorSvc.cargarEntrenadores();
        this.membresiaSvc.cargarMembresias();
        this.pagoSvc.cargarPagos();
        this.asistenciaSvc.cargarAsistencias();
        this.rutinaSvc.cargarRutinas();
        this.usuarioSvc.cargarUsuarios();
      }
    });
  }

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
    this.usuarioSvc.logout();
    this.router.navigate(['/login']);
  }
}
