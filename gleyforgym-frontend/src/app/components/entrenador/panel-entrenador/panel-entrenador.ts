import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { AsistenciaService } from '../../../services/asistencia.service';
import { RutinaService } from '../../../services/rutina.service';
import { EntrenadorService } from '../../../services/entrenador.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-panel-entrenador',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel-entrenador.html',
  styleUrl: './panel-entrenador.css',
})
export class PanelEntrenador {
  private clienteSvc    = inject(ClienteService);
  private asistenciaSvc = inject(AsistenciaService);
  private rutinaSvc     = inject(RutinaService);
  private entrenadorSvc = inject(EntrenadorService);
  private usuarioSvc    = inject(UsuarioService);

  readonly nombreEntrenador = this.usuarioSvc.nombreCompleto;

  private readonly entrenadorIdActual = computed(() => {
    const usuarioId = this.usuarioSvc.usuarioActual().id;
    const ent = this.entrenadorSvc.getEntrenadorPorUsuarioId(usuarioId);
    return ent?.id ?? 0;
  });

  readonly stats = computed(() => {
    const eid           = this.entrenadorIdActual();
    const clientes      = this.clienteSvc.obtenerClientes().filter(c => c.entrenadorId === eid);
    const hoyStr        = new Date().toISOString().split('T')[0];
    const asistHoy      = this.asistenciaSvc.obtenerAsistencias().filter(a => a.entrenadorId === eid && a.fecha === hoyStr);
    const rutinasCant   = this.rutinaSvc.obtenerRutinas().filter(r => r.entrenadorId === eid && r.activa).length;
    return {
      totalClientes:   clientes.length,
      clientesActivos: clientes.filter(c => c.activo).length,
      asistenciaHoy:   asistHoy.length,
      rutinasActivas:  rutinasCant,
    };
  });

  readonly asistenciasSemana = computed(() => {
    const eid = this.entrenadorIdActual();
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const todas = this.asistenciaSvc.obtenerAsistencias().filter(a => a.entrenadorId === eid);
    return dias.map((dia, i) => {
      const fecha = new Date();
      const diff  = i - fecha.getDay() + 1;
      const d     = new Date(fecha);
      d.setDate(d.getDate() + diff);
      const fechaStr = d.toISOString().split('T')[0];
      return {
        dia,
        cantidad: todas.filter(a => a.fecha === fechaStr).length,
        max: 5,
      };
    });
  });

  readonly clientesRecientes = computed(() => {
    const eid = this.entrenadorIdActual();
    return this.clienteSvc.obtenerClientes().filter(c => c.entrenadorId === eid).slice(0, 4);
  });

  readonly sesionesHoy = computed(() => {
    const eid = this.entrenadorIdActual();
    const clientes = this.clienteSvc.obtenerClientes().filter(c => c.entrenadorId === eid);
    const hoyStr   = new Date().toISOString().split('T')[0];
    const asistHoy = this.asistenciaSvc.obtenerAsistencias().filter(a => a.entrenadorId === eid && a.fecha === hoyStr);
    return asistHoy.map(a => {
      const c = clientes.find(cl => cl.id === a.clienteId);
      return { ...a, nombreCliente: c ? `${c.nombre} ${c.apellido}` : 'Desconocido' };
    });
  });

  iniciales(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  alturaBarraPorc(cantidad: number, max: number): string {
    return max > 0 ? `${(cantidad / max) * 100}%` : '0%';
  }
}
