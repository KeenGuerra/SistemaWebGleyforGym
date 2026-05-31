import { Component, inject, computed, signal } from '@angular/core';
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

  readonly stats = computed(() => {
    const entrenador    = this.entrenadorSvc.getEntrenadorActual();
    const clientes      = this.clienteSvc.getClientesPorEntrenador(1);
    const asistHoy      = this.asistenciaSvc.asistenciasHoy();
    const rutinasCant   = this.rutinaSvc.getRutinasPorEntrenador(1).filter(r => r.activa).length;
    return {
      totalClientes:   clientes.length,
      clientesActivos: clientes.filter(c => c.activo).length,
      asistenciaHoy:   asistHoy.length,
      rutinasActivas:  rutinasCant,
    };
  });

  readonly asistenciasSemana = computed(() => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const todas = this.asistenciaSvc.getAsistenciasPorEntrenador(1);
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

  readonly clientesRecientes = computed(() =>
    this.clienteSvc.getClientesPorEntrenador(1).slice(0, 4)
  );

  readonly sesionesHoy = computed(() => {
    const clientes = this.clienteSvc.getClientesPorEntrenador(1);
    const asistHoy = this.asistenciaSvc.asistenciasHoy();
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
