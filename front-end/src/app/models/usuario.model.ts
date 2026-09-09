export interface Usuario {
  usuarioId: number;
  username: string;
  iniciales: string;
  rol: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  correo: string;
  telefono?: string;
  fechaNacimiento?: string;
  activo: boolean;
  estudianteId?: number;
  carnet?: string;
  gradoId?: number;
  grado?: string;
  seccionId?: number;
  seccion?: string;
  profesorId?: number;
  codigoProfesor?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface LoginRequest {
  username: string;
  password: string;
}
