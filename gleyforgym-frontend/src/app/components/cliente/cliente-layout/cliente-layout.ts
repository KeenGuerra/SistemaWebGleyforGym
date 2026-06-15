import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { MembresiaService } from '../../../services/membresia.service';
import { ClienteService } from '../../../services/cliente.service';
import { PagoService } from '../../../services/pago.service';
import { AsistenciaService } from '../../../services/asistencia.service';
import { RutinaService } from '../../../services/rutina.service';
import { ProgresoService } from '../../../services/progreso.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cliente-layout.html',
  styleUrl: './cliente-layout.css',
})
export class ClienteLayout implements OnInit {
  private usuarioSvc = inject(UsuarioService);
  private clienteSvc = inject(ClienteService);
  private membresiaSvc = inject(MembresiaService);
  private pagoSvc = inject(PagoService);
  private asistenciaSvc = inject(AsistenciaService);
  private rutinaSvc = inject(RutinaService);
  private progresoSvc = inject(ProgresoService);
  private router = inject(Router);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.usuarioSvc.checkSession().then(user => {
      if (!user || user.rol !== 'CLIENTE') {
        this.usuarioSvc.logout();
        this.router.navigate(['/login']);
      } else {
        // Cargar datos
        this.clienteSvc.cargarClientes();
        this.membresiaSvc.cargarMembresias();
        this.pagoSvc.cargarPagos();
        this.asistenciaSvc.cargarAsistencias();
        this.rutinaSvc.cargarRutinas();
        this.progresoSvc.cargarProgresos();
      }
    });
  }

  readonly usuario = this.usuarioSvc.usuarioActual;
  readonly iniciales = this.usuarioSvc.iniciales;
  readonly nombreCompleto = this.usuarioSvc.nombreCompleto;

  readonly clienteActual = computed(() => {
    const user = this.usuario();
    return this.clienteSvc.clientes().find(c => c.email === user.email);
  });

  readonly clienteId = computed(() => this.clienteActual()?.id || 0);

  readonly membresia = computed(() =>
    this.membresiaSvc.getMembresiaActiva(this.clienteId())
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

  logout(): void {
    this.closeSidebar();
    this.usuarioSvc.logout();
    this.router.navigate(['/login']);
  }
}
