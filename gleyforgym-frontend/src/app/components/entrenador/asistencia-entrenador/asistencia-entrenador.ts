import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../services/asistencia.service';
import { ClienteService } from '../../../services/cliente.service';
import { Asistencia } from '../../../models/asistencia';

@Component({
  selector: 'app-asistencia-entrenador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './asistencia-entrenador.html',
  styleUrl: './asistencia-entrenador.css',
})
export class AsistenciaEntrenador {
  private asistenciaSvc = inject(AsistenciaService);
  private clienteSvc    = inject(ClienteService);

  readonly fechaFiltro = signal(new Date().toISOString().split('T')[0]);
  readonly mostrarFormulario = signal(false);
  readonly mensajeExito = signal('');

  readonly clientes = computed(() =>
    this.clienteSvc.obtenerClientes().filter(c => c.entrenadorId === 1)
  );

  readonly asistenciasFiltradas = computed(() => {
    const fecha    = this.fechaFiltro();
    const todas    = this.asistenciaSvc.obtenerAsistencias().filter(a => a.entrenadorId === 1);
    const clientes = this.clientes();

    return todas
      .filter(a => !fecha || a.fecha === fecha)
      .map(a => {
        const c = clientes.find(cl => cl.id === a.clienteId);
        return {
          ...a,
          nombreCliente: c ? `${c.nombre} ${c.apellido}` : 'Desconocido',
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  readonly totalHoy = computed(() =>
    this.asistenciaSvc.asistenciasHoy().length
  );

  // Writable Signals de Formulario
  readonly clienteId = signal<number>(0);
  readonly fecha = signal('');
  readonly horaEntrada = signal('07:00');
  readonly horaSalida = signal('');
  readonly observaciones = signal('');

  // Estados Touched
  readonly clienteIdTouched = signal(false);
  readonly fechaTouched = signal(false);
  readonly horaEntradaTouched = signal(false);

  // Validaciones
  readonly clienteIdInvalid = computed(() => this.clienteId() <= 0);
  readonly fechaInvalid = computed(() => this.fecha().trim() === '');
  readonly horaEntradaInvalid = computed(() => this.horaEntrada().trim() === '');

  readonly formInvalid = computed(() => {
    return this.clienteIdInvalid() || this.fechaInvalid() || this.horaEntradaInvalid();
  });

  cambiarFecha(evento: Event): void {
    this.fechaFiltro.set((evento.target as HTMLInputElement).value);
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    this.mensajeExito.set('');

    // Resetear form
    this.clienteId.set(0);
    this.fecha.set(new Date().toISOString().split('T')[0]);
    this.horaEntrada.set('07:00');
    this.horaSalida.set('');
    this.observaciones.set('');

    // Resetear touched
    this.clienteIdTouched.set(false);
    this.fechaTouched.set(false);
    this.horaEntradaTouched.set(false);
  }

  registrar(): void {
    this.clienteIdTouched.set(true);
    this.fechaTouched.set(true);
    this.horaEntradaTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const horaEntradaVal = this.horaEntrada();
    const horaSalidaVal = this.horaSalida();
    let duracion: number | undefined;
    if (horaEntradaVal && horaSalidaVal) {
      const [hE, mE] = horaEntradaVal.split(':').map(Number);
      const [hS, mS] = horaSalidaVal.split(':').map(Number);
      duracion = (hS * 60 + mS) - (hE * 60 + mE);
    }

    this.asistenciaSvc.registrarAsistencia({
      clienteId:     this.clienteId(),
      entrenadorId:  1,
      fecha:         this.fecha(),
      horaEntrada:   horaEntradaVal,
      horaSalida:    horaSalidaVal || undefined,
      duracionMinutos: duracion,
      observaciones: this.observaciones() || undefined,
    });

    this.mensajeExito.set('Asistencia registrada correctamente');
    this.mostrarFormulario.set(false);
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }

  iniciales(nombre: string): string {
    const partes = nombre.split(' ');
    return partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`.toUpperCase()
      : nombre.substring(0, 2).toUpperCase();
  }
}

