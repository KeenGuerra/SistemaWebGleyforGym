import { Component, inject, computed, signal } from '@angular/core';
import { RutinaService } from '../../../services/rutina.service';
import { Rutina } from '../../../models/rutina';

@Component({
  selector: 'app-mis-rutinas',
  standalone: true,
  imports: [],
  templateUrl: './mis-rutinas.html',
  styleUrl: './mis-rutinas.css',
})
export class MisRutinas {
  private rutinaSvc = inject(RutinaService);

  private readonly CLIENTE_ID = 5;

  readonly rutinas   = computed(() =>
    this.rutinaSvc.obtenerRutinas().filter(r => r.clienteId === this.CLIENTE_ID && r.activa)
  );
  readonly rutinaSeleccionada = signal<number | null>(null);

  seleccionar(id: number): void {
    this.rutinaSeleccionada.update(v => v === id ? null : id);
  }

  estaSeleccionada(id: number): boolean {
    return this.rutinaSeleccionada() === id;
  }

  nivelBadgeClass(nivel: string): string {
    return nivel === 'principiante' ? 'gym-badge-success'
      : nivel === 'intermedio' ? 'gym-badge-warning'
      : 'gym-badge-danger';
  }
}
