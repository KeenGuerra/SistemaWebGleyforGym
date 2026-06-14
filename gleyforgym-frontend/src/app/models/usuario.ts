export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  rol: 'ADMINISTRADOR' | 'ENTRENADOR' | 'CLIENTE';
  activo: boolean;
  fechaRegistro: string;
  avatar?: string;
}
