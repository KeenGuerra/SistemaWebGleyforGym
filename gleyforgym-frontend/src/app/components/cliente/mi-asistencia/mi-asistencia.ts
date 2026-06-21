import { Component, inject, computed, signal } from '@angular/core';
import { AsistenciaService } from '../../../services/asistencia.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ClienteService } from '../../../services/cliente.service';
import { Paginacion } from '../../compartido/paginacion/paginacion';

@Component({
  selector: 'app-mi-asistencia',
  standalone: true,
  imports: [Paginacion],
  templateUrl: './mi-asistencia.html',
  styleUrl: './mi-asistencia.css',
})
export class MiAsistencia {
  private asistenciaSvc = inject(AsistenciaService);
  private usuarioSvc = inject(UsuarioService);
  private clienteSvc = inject(ClienteService);

  // Paginación
  readonly paginaActual = signal<number>(1);
  readonly itemsPorPagina = 10;

  readonly clienteActual = computed(() => {
    const user = this.usuarioSvc.usuarioActual();
    return this.clienteSvc.clientes().find(c => c.email === user.email);
  });

  readonly CLIENTE_ID = computed(() => this.clienteActual()?.id || 0);

  readonly mesActual = signal(new Date().getMonth());
  readonly anioActual = signal(new Date().getFullYear());

  readonly asistencias = computed(() =>
    this.asistenciaSvc.obtenerAsistencias().filter(a => a.clienteId === this.CLIENTE_ID())
  );

  // Lista paginada
  readonly paginatedAsistencias = computed(() => {
    const list = this.asistencias();
    // Ordenar de forma descendente por fecha y hora de entrada
    const sorted = [...list].sort((a, b) => {
      if (a.fecha !== b.fecha) {
        return b.fecha.localeCompare(a.fecha);
      }
      return b.horaEntrada.localeCompare(a.horaEntrada);
    });
    const page = this.paginaActual();
    const start = (page - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    return sorted.slice(start, end);
  });


  readonly diasAsistidos = computed(() =>
    new Set(this.asistencias().map(a => a.fecha))
  );

  readonly diasEstesMes = computed(() => {
    const mes = this.mesActual();
    const anio = this.anioActual();
    return this.asistencias().filter(a => {
      const d = new Date(a.fecha);
      return d.getMonth() === mes && d.getFullYear() === anio;
    }).length;
  });

  readonly rachaActual = computed(() => {
    const fechas = [...this.diasAsistidos()].sort((a, b) => b.localeCompare(a));
    if (fechas.length === 0) return 0;
    let racha = 1;
    const hoy = new Date();
    for (let i = 0; i < fechas.length - 1; i++) {
      const curr = new Date(fechas[i]);
      const next = new Date(fechas[i + 1]);
      const diff = (curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 2) racha++;
      else break;
    }
    return racha;
  });

  readonly diasCalendario = computed(() => {
    const mes  = this.mesActual();
    const anio = this.anioActual();
    const primerDia = new Date(anio, mes, 1).getDay();
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const dias: Array<{ numero: number | null; fecha: string | null; estado: 'vacio' | 'asistio' | 'normal' }> = [];

    for (let i = 0; i < primerDia; i++) {
      dias.push({ numero: null, fecha: null, estado: 'vacio' });
    }
    for (let d = 1; d <= totalDias; d++) {
      const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dias.push({
        numero: d,
        fecha,
        estado: this.diasAsistidos().has(fecha) ? 'asistio' : 'normal',
      });
    }
    return dias;
  });

  readonly nombreMes = computed(() => {
    const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${nombres[this.mesActual()]} ${this.anioActual()}`;
  });

  mesPrevio(): void {
    let mes = this.mesActual() - 1;
    let anio = this.anioActual();
    if (mes < 0) { mes = 11; anio--; }
    this.mesActual.set(mes);
    this.anioActual.set(anio);
  }

  mesSiguiente(): void {
    let mes = this.mesActual() + 1;
    let anio = this.anioActual();
    if (mes > 11) { mes = 0; anio++; }
    this.mesActual.set(mes);
    this.anioActual.set(anio);
  }
}
