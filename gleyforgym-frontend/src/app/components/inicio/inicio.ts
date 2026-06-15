import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MembresiaService } from '../../services/membresia.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  private membresiaService = inject(MembresiaService);

  ngOnInit(): void {
    this.membresiaService.cargarPlanes();
  }

  // Calcula el período de facturación basado en la duración en días
  private calcularPeriodo(dias: number): string {
    if (dias <= 31) return 'Mes';
    if (dias <= 95) return '3 Meses';
    if (dias <= 185) return '6 Meses';
    return 'Año';
  }

  // Transforma los planes de la BD al formato visual de las tarjetas
  readonly planes = computed(() => {
    const planesDB = this.membresiaService.planes();

    // Si no hay planes cargados aún, mostramos esqueletos vacíos
    if (planesDB.length === 0) return [];

    // El plan "destacado" es el que tiene mayor precio mensual equivalente
    const precioMensual = (p: typeof planesDB[0]) => p.precio / Math.max(1, p.duracionDias / 30);
    const maxPrecioMensual = Math.max(...planesDB.map(precioMensual));

    return planesDB.map(p => ({
      nombre: p.nombre,
      precio: p.precio,
      periodo: this.calcularPeriodo(p.duracionDias),
      desc: p.descripcion || `Plan de ${p.duracionDias} días de acceso al gimnasio.`,
      destacado: Math.abs(precioMensual(p) - maxPrecioMensual) < 1,
      duracionDias: p.duracionDias
    }));
  });
}
