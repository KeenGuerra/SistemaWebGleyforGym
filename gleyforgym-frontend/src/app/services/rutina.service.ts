import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rutina } from '../models/rutina';

@Injectable({ providedIn: 'root' })
export class RutinaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/rutinas'; // Configuración base para FastAPI


  private _rutinas = signal<Rutina[]>([
    {
      id: 1, nombre: 'Fuerza y Potencia — Lunes/Miércoles/Viernes',
      clienteId: 5, entrenadorId: 1,
      diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
      nivel: 'intermedio', objetivo: 'Pérdida de grasa y tonificación',
      descripcion: 'Rutina de fuerza progresiva con énfasis en compuestos',
      fechaCreacion: '2025-03-01', activa: true,
      ejercicios: [
        { nombre: 'Sentadilla con barra', series: 4, repeticiones: '8-10', descanso: '90 seg', notas: 'Bajar paralela' },
        { nombre: 'Press de banca', series: 4, repeticiones: '8-10', descanso: '90 seg' },
        { nombre: 'Peso muerto', series: 3, repeticiones: '6-8', descanso: '120 seg', notas: 'Espalda neutra' },
        { nombre: 'Dominadas asistidas', series: 3, repeticiones: '8-12', descanso: '60 seg' },
        { nombre: 'Plancha frontal', series: 3, repeticiones: '45 seg', descanso: '30 seg' },
      ]
    },
    {
      id: 2, nombre: 'Cardio + Core — Martes/Jueves',
      clienteId: 5, entrenadorId: 1,
      diasSemana: ['Martes', 'Jueves'],
      nivel: 'principiante', objetivo: 'Resistencia cardiovascular',
      descripcion: 'Sesión de cardio moderado y fortalecimiento del core',
      fechaCreacion: '2025-03-01', activa: true,
      ejercicios: [
        { nombre: 'Caminata en cinta (inclinación 5°)', series: 1, repeticiones: '20 min', descanso: '0 seg' },
        { nombre: 'Mountain climbers', series: 4, repeticiones: '30 seg', descanso: '20 seg' },
        { nombre: 'Burpees', series: 3, repeticiones: '10', descanso: '60 seg' },
        { nombre: 'Abdominales en bicicleta', series: 3, repeticiones: '20', descanso: '30 seg' },
        { nombre: 'Superman', series: 3, repeticiones: '15', descanso: '30 seg' },
      ]
    },
    {
      id: 3, nombre: 'Hipertrofia — 5 días',
      clienteId: 6, entrenadorId: 1,
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      nivel: 'avanzado', objetivo: 'Ganancia muscular',
      descripcion: 'Split de 5 días enfocado en hipertrofia',
      fechaCreacion: '2025-02-15', activa: true,
      ejercicios: [
        { nombre: 'Press militar', series: 4, repeticiones: '10-12', descanso: '60 seg' },
        { nombre: 'Remo con barra', series: 4, repeticiones: '10-12', descanso: '60 seg' },
        { nombre: 'Curl de bíceps', series: 3, repeticiones: '12-15', descanso: '45 seg' },
        { nombre: 'Extensión de tríceps', series: 3, repeticiones: '12-15', descanso: '45 seg' },
      ]
    },
    {
      id: 4, nombre: 'Tonificación — 3 días',
      clienteId: 7, entrenadorId: 1,
      diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
      nivel: 'principiante', objetivo: 'Tonificación',
      descripcion: 'Rutina completa para principiantes',
      fechaCreacion: '2025-04-10', activa: true,
      ejercicios: [
        { nombre: 'Sentadilla con peso corporal', series: 3, repeticiones: '15', descanso: '60 seg' },
        { nombre: 'Flexiones de rodillas', series: 3, repeticiones: '10', descanso: '60 seg' },
        { nombre: 'Zancadas', series: 3, repeticiones: '12 cada pierna', descanso: '60 seg' },
        { nombre: 'Abdominales básicos', series: 3, repeticiones: '20', descanso: '30 seg' },
      ]
    },
  ]);

  readonly rutinas = this._rutinas.asReadonly();

  obtenerRutinas(): Rutina[] {
    return this._rutinas();
  }

  readonly rutinasActivas = computed(() =>
    this._rutinas().filter(r => r.activa)
  );

  getRutinasDeCliente(clienteId: number): Rutina[] {
    return this._rutinas().filter(r => r.clienteId === clienteId && r.activa);
  }

  getRutinasPorEntrenador(entrenadorId: number): Rutina[] {
    return this._rutinas().filter(r => r.entrenadorId === entrenadorId);
  }

  agregarRutina(rutina: Omit<Rutina, 'id'>): void {
    const nuevoId = Math.max(...this._rutinas().map(r => r.id)) + 1;
    this._rutinas.update(lista => [...lista, { ...rutina, id: nuevoId }]);
  }

  actualizarRutina(id: number, datos: Partial<Rutina>): void {
    this._rutinas.update(lista =>
      lista.map(r => r.id === id ? { ...r, ...datos } : r)
    );
  }

  desactivarRutina(id: number): void {
    this.actualizarRutina(id, { activa: false });
  }
}
