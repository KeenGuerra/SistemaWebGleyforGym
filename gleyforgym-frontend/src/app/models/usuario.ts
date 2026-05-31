export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: 'admin' | 'entrenador' | 'cliente';
  activo: boolean;
  fechaRegistro: string;
  avatar?: string;
}
