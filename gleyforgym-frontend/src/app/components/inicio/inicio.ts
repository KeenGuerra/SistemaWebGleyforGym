import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  readonly planes = [
    { nombre: 'Mensual Básica', precio: 1800, periodo: 'Mes', desc: 'Acceso completo a sala de pesas y máquinas estándar.' },
    { nombre: 'Mensual Premium', precio: 2500, periodo: 'Mes', desc: 'Acceso a todas las clases, pesas, asesoría de entrenador y vestidores.', destacado: true },
    { nombre: 'Trimestral', precio: 6500, periodo: '3 Meses', desc: 'Suscripción por 3 meses con descuento especial incluido.' },
    { nombre: 'Anual', precio: 24000, periodo: 'Año', desc: 'Acceso ilimitado por un año completo. Máximo beneficio y ahorro.' }
  ];
}
