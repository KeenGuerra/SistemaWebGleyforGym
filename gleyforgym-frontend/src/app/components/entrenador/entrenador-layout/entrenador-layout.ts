import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { EntrenadorService } from '../../../services/entrenador.service';
import { ClienteService } from '../../../services/cliente.service';
import { AsistenciaService } from '../../../services/asistencia.service';
import { RutinaService } from '../../../services/rutina.service';

@Component({
  selector: 'app-entrenador-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './entrenador-layout.html',
  styleUrl: './entrenador-layout.css',
})
export class EntrenadorLayout implements OnInit {
  private usuarioSvc    = inject(UsuarioService);
  private entrenadorSvc = inject(EntrenadorService);
  private clienteSvc    = inject(ClienteService);
  private asistenciaSvc = inject(AsistenciaService);
  private rutinaSvc     = inject(RutinaService);
  private router        = inject(Router);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.usuarioSvc.checkSession().then(user => {
      if (!user || user.rol !== 'ENTRENADOR') {
        this.usuarioSvc.logout();
        this.router.navigate(['/login']);
      } else {
        this.entrenadorSvc.cargarEntrenadores();
        this.clienteSvc.cargarClientes();
        this.asistenciaSvc.cargarAsistencias();
        this.rutinaSvc.cargarRutinas();
      }
    });
  }

  readonly iniciales      = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;
  readonly entrenador     = computed(() => this.entrenadorSvc.getEntrenadorActual());

  readonly menuItems = [
    { label: 'Panel Principal',   icon: 'bi-grid-1x2-fill',        ruta: '/entrenador/panel' },
    { label: 'Clientes Asignados',icon: 'bi-people-fill',           ruta: '/entrenador/clientes' },
    { label: 'Asistencia',        icon: 'bi-calendar-check-fill',   ruta: '/entrenador/asistencia' },
    { label: 'Rutinas',           icon: 'bi-clipboard2-pulse-fill', ruta: '/entrenador/rutinas' },
    { label: 'Mi Perfil',         icon: 'bi-person-fill',           ruta: '/entrenador/perfil' },
  ];

  readonly menuSecundario = [
    { label: 'Configuración',     icon: 'bi-gear-fill',            ruta: '/entrenador/configuracion' }
  ];

  /* Título del topbar según la ruta activa */
  readonly tituloTopbar = computed(() => {
    const url = this.router.url;
    const item = this.menuItems.find(m => url.startsWith(m.ruta));
    return item ? item.label : 'Panel Principal';
  });

  readonly busqueda = signal('');
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
