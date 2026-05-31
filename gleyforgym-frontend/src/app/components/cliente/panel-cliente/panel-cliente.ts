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
    this.pagoSvc.getPagosPendientes(this.CLIENTE_ID).length
  );

  readonly asistenciasMes = computed(() =>
    this.asistenciaSvc.getDiasAsistidosMes(this.CLIENTE_ID)
  );

  readonly rutinas = computed(() =>
    this.rutinaSvc.getRutinasDeCliente(this.CLIENTE_ID)
  );

  readonly ultimosRegistros = computed(() =>
    this.asistenciaSvc.getAsistenciasDeCliente(this.CLIENTE_ID).slice(0, 5)
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
