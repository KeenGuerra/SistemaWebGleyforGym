import { Component, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AsistenciaService } from '../../../services/asistencia.service';
import { ClienteService } from '../../../services/cliente.service';
import { Asistencia } from '../../../models/asistencia';

@Component({
  selector: 'app-asistencia-entrenador',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './asistencia-entrenador.html',
  styleUrl: './asistencia-entrenador.css',
})
export class AsistenciaEntrenador {
  private asistenciaSvc = inject(AsistenciaService);
  private clienteSvc    = inject(ClienteService);
  private fb            = inject(FormBuilder);

  readonly fechaFiltro = signal(new Date().toISOString().split('T')[0]);
  readonly mostrarFormulario = signal(false);
  readonly mensajeExito = signal('');

  readonly clientes = computed(() =>
    this.clienteSvc.getClientesPorEntrenador(1)
  );

  readonly asistenciasFiltradas = computed(() => {
    const fecha    = this.fechaFiltro();
    const todas    = this.asistenciaSvc.getAsistenciasPorEntrenador(1);
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

  readonly form = this.fb.nonNullable.group({
    clienteId:   [0, [Validators.required, Validators.min(1)]],
    fecha:       [new Date().toISOString().split('T')[0], Validators.required],
    horaEntrada: ['07:00', Validators.required],
    horaSalida:  [''],
    observaciones: [''],
  });

  cambiarFecha(evento: Event): void {
    this.fechaFiltro.set((evento.target as HTMLInputElement).value);
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    this.mensajeExito.set('');
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    let duracion: number | undefined;
    if (v.horaEntrada && v.horaSalida) {
      const [hE, mE] = v.horaEntrada.split(':').map(Number);
      const [hS, mS] = v.horaSalida.split(':').map(Number);
      duracion = (hS * 60 + mS) - (hE * 60 + mE);
    }

    this.asistenciaSvc.registrarAsistencia({
      clienteId:     v.clienteId,
      entrenadorId:  1,
      fecha:         v.fecha,
      horaEntrada:   v.horaEntrada,
      horaSalida:    v.horaSalida || undefined,
      duracionMinutos: duracion,
      observaciones: v.observaciones || undefined,
    });

    this.mensajeExito.set('Asistencia registrada correctamente');
    this.mostrarFormulario.set(false);
    this.form.reset({ fecha: new Date().toISOString().split('T')[0], horaEntrada: '07:00' });
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }

  iniciales(nombre: string): string {
    const partes = nombre.split(' ');
    return partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`.toUpperCase()
      : nombre.substring(0, 2).toUpperCase();
  }

  hasError(campo: string, error: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }
}
