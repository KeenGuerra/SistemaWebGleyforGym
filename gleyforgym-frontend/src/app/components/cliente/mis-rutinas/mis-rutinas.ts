import { Component, inject, computed, signal } from '@angular/core';
import { RutinaService } from '../../../services/rutina.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ClienteService } from '../../../services/cliente.service';
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
  private usuarioSvc = inject(UsuarioService);
  private clienteSvc = inject(ClienteService);

  readonly clienteActual = computed(() => {
    const user = this.usuarioSvc.usuarioActual();
    return this.clienteSvc.clientes().find(c => c.email === user.email);
  });

  readonly CLIENTE_ID = computed(() => this.clienteActual()?.id || 0);

  readonly rutinas   = computed(() =>
    this.rutinaSvc.obtenerRutinas().filter(r => r.clienteId === this.CLIENTE_ID() && r.activa)
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
