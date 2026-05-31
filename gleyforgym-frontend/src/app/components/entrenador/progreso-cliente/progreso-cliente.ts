import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProgresoService } from '../../../services/progreso.service';
import { ClienteService } from '../../../services/cliente.service';
import { Progreso } from '../../../models/progreso';

@Component({
  selector: 'app-progreso-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './progreso-cliente.html',
  styleUrl: './progreso-cliente.css',
})
export class ProgresoCliente implements OnInit {
  private route       = inject(ActivatedRoute);
  private progresoSvc = inject(ProgresoService);
  private clienteSvc  = inject(ClienteService);
  private fb          = inject(FormBuilder);

  readonly clienteId = signal(0);
  readonly cliente   = computed(() => this.clienteSvc.getClientePorId(this.clienteId()));
  readonly progresos = computed(() => this.progresoSvc.getProgresosDeCliente(this.clienteId()));
  readonly ultimo    = computed(() => this.progresoSvc.getUltimoProgreso(this.clienteId()));
  readonly mostrarFormulario = signal(false);
  readonly guardado  = signal(false);

  readonly form = this.fb.nonNullable.group({
    fecha:             ['', Validators.required],
    peso:              [0, [Validators.required, Validators.min(20), Validators.max(300)]],
    altura:            [0, [Validators.required, Validators.min(100), Validators.max(250)]],
    porcentajeGrasa:   [undefined as number | undefined],
    porcentajeMuscular:[undefined as number | undefined],
    notas:             [''],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clienteId.set(id);
    const hoy = new Date().toISOString().split('T')[0];
    this.form.patchValue({ fecha: hoy });
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    this.guardado.set(false);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const altura = v.altura;
    const imc = +(v.peso / ((altura / 100) ** 2)).toFixed(1);

    this.progresoSvc.registrarProgreso({
      clienteId: this.clienteId(),
      fecha: v.fecha,
      peso: v.peso,
      altura,
      imc,
      porcentajeGrasa: v.porcentajeGrasa,
      porcentajeMuscular: v.porcentajeMuscular,
      notas: v.notas,
    });

    this.guardado.set(true);
    this.mostrarFormulario.set(false);
    this.form.reset();
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

  hasError(campo: string, error: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }
}
