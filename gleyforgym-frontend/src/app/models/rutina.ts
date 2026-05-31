export type NivelRutina = 'principiante' | 'intermedio' | 'avanzado';

export interface Ejercicio {
  nombre: string;
  series: number;
  repeticiones: string;
  descanso: string;
  notas?: string;
}

export interface Rutina {
  id: number;
  nombre: string;
  clienteId: number;
  entrenadorId: number;
  diasSemana: string[];
  nivel: NivelRutina;
  objetivo: string;
  ejercicios: Ejercicio[];
  fechaCreacion: string;
  activa: boolean;
  descripcion?: string;
}
