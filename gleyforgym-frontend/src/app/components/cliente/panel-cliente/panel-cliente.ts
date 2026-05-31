import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MembresiaService } from '../../../services/membresia.service';
import { PagoService } from '../../../services/pago.service';
import { AsistenciaService } from '../../../services/asistencia.service';
import { RutinaService } from '../../../services/rutina.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-panel-cliente',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './panel-cliente.html',
  styleUrl: './panel-cliente.css',
})
export class PanelCliente {
  private membresiaSvc = inject(MembresiaService);
  private pagoSvc      = inject(PagoService);
  private asistenciaSvc = inject(AsistenciaService);
  private rutinaSvc    = inject(RutinaService);
  private usuarioSvc   = inject(UsuarioService);

  private readonly CLIENTE_ID = 5;

  readonly nombreCliente = this.usuarioSvc.nombreCompleto;

  readonly membresia = computed(() =>
    this.membresiaSvc.getMembresiaActiva(this.CLIENTE_ID)
  );

  readonly diasRestantes = computed(() => {
    const m = this.membresia();
    return m ? this.membresiaSvc.calcularDiasRestantes(m.fechaFin) : 0;
  });

  readonly pagosPendientes = computed(() =>
    this.pagoSvc.obtenerPagos()
      .filter(p => p.clienteId === this.CLIENTE_ID && p.estado === 'pendiente')
      .length
  );

  readonly asistenciasMes = computed(() => {
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return this.asistenciaSvc.obtenerAsistencias()
      .filter(a => a.clienteId === this.CLIENTE_ID && new Date(a.fecha) >= inicioMes)
      .length;
  });

  readonly rutinas = computed(() =>
    this.rutinaSvc.obtenerRutinas().filter(r => r.clienteId === this.CLIENTE_ID && r.activa)
  );

  readonly ultimosRegistros = computed(() =>
    this.asistenciaSvc.obtenerAsistencias()
      .filter(a => a.clienteId === this.CLIENTE_ID)
      .slice(0, 5)
  );

  readonly progresoPorcentaje = computed(() => {
    const dias = this.diasRestantes();
    const total = 30;
    return Math.min(100, Math.round((dias / total) * 100));
  });

  readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  diaEnRutina(dia: string): boolean {
    const diaCompleto: Record<string, string> = {
      'Lun': 'Lunes', 'Mar': 'Martes', 'Mié': 'Miércoles',
      'Jue': 'Jueves', 'Vie': 'Viernes', 'Sáb': 'Sábado', 'Dom': 'Domingo'
    };
    return this.rutinas().some(r =>
      r.diasSemana.includes(diaCompleto[dia])
    );
  }
}
