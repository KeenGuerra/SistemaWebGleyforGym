import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgresoService } from '../../../services/progreso.service';
import { ClienteService } from '../../../services/cliente.service';
import { Progreso } from '../../../models/progreso';

@Component({
  selector: 'app-progreso-cliente',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './progreso-cliente.html',
  styleUrl: './progreso-cliente.css',
})
export class ProgresoCliente implements OnInit {
  private route       = inject(ActivatedRoute);
  private progresoSvc = inject(ProgresoService);
  private clienteSvc  = inject(ClienteService);

  readonly clienteId = signal(0);
  readonly cliente   = computed(() => this.clienteSvc.getClientePorId(this.clienteId()));
  readonly progresos = computed(() =>
    this.progresoSvc.obtenerProgreso()
      .filter(p => p.clienteId === this.clienteId())
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  );
  readonly ultimo    = computed(() => {
    const list = this.progresos();
    return list.length > 0 ? list[0] : undefined;
  });
  readonly mostrarFormulario = signal(false);
  readonly guardado  = signal(false);

  // Writable Signals del Formulario
  readonly fecha = signal('');
  readonly peso = signal<number>(0);
  readonly altura = signal<number>(0);
  readonly porcentajeGrasa = signal<number | undefined>(undefined);
  readonly porcentajeMuscular = signal<number | undefined>(undefined);
  readonly notas = signal('');

  // Estados Touched
  readonly fechaTouched = signal(false);
  readonly pesoTouched = signal(false);
  readonly alturaTouched = signal(false);

  // Validaciones
  readonly fechaInvalid = computed(() => this.fecha().trim() === '');
  readonly pesoInvalid = computed(() => this.peso() < 20 || this.peso() > 300);
  readonly alturaInvalid = computed(() => this.altura() < 100 || this.altura() > 250);

  readonly formInvalid = computed(() => {
    return this.fechaInvalid() || this.pesoInvalid() || this.alturaInvalid();
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clienteId.set(id);
    const hoy = new Date().toISOString().split('T')[0];
    this.fecha.set(hoy);
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    this.guardado.set(false);
    
    // Resetear form
    this.fecha.set(new Date().toISOString().split('T')[0]);
    this.peso.set(0);
    this.altura.set(0);
    this.porcentajeGrasa.set(undefined);
    this.porcentajeMuscular.set(undefined);
    this.notas.set('');

    // Resetear touched
    this.fechaTouched.set(false);
    this.pesoTouched.set(false);
    this.alturaTouched.set(false);
  }

  guardar(): void {
    this.fechaTouched.set(true);
    this.pesoTouched.set(true);
    this.alturaTouched.set(true);

    if (this.formInvalid()) {
      return;
    }

    const pesoVal = this.peso();
    const alturaVal = this.altura();
    const imc = +(pesoVal / ((alturaVal / 100) ** 2)).toFixed(1);

    this.progresoSvc.registrarProgreso({
      clienteId: this.clienteId(),
      fecha: this.fecha(),
      peso: pesoVal,
      altura: alturaVal,
      imc,
      porcentajeGrasa: this.porcentajeGrasa(),
      porcentajeMuscular: this.porcentajeMuscular(),
      notas: this.notas(),
    });

    this.guardado.set(true);
    this.mostrarFormulario.set(false);
  }

  iniciales(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  variacion(campo: keyof Progreso): string {
    const lista = this.progresos();
    if (lista.length < 2) return '';
    const actual   = lista[0][campo] as number;
    const anterior = lista[1][campo] as number;
    const diff = +(actual - anterior).toFixed(1);
    return diff > 0 ? `+${diff}` : `${diff}`;
  }

  esMejora(campo: 'peso' | 'imc' | 'porcentajeGrasa'): boolean {
    const lista = this.progresos();
    if (lista.length < 2) return false;
    const actual   = lista[0][campo] as number;
    const anterior = lista[1][campo] as number;
    return actual < anterior;
  }
}

