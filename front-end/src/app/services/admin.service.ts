import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarEstudiantes(busqueda?: string, gradoId?: number, seccionId?: number) {
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    if (gradoId) params = params.set('gradoId', gradoId.toString());
    if (seccionId) params = params.set('seccionId', seccionId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/estudiantes`, { params });
  }

  listarProfesores(busqueda?: string) {
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/profesores`, { params });
  }

  listarAdministradores(busqueda?: string) {
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/administradores`, { params });
  }

  obtenerGrados() {
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/grados`);
  }

  obtenerSecciones() {
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/secciones`);
  }

  crearEstudiante(data: any) {
    return this.http.post<{ usuarioId: number; message: string }>(`${this.apiUrl}/api/admin/estudiantes`, data);
  }

  crearProfesor(data: any) {
    return this.http.post<{ usuarioId: number; message: string }>(`${this.apiUrl}/api/admin/profesores`, data);
  }

  crearAdministrador(data: any) {
    return this.http.post<{ usuarioId: number; message: string }>(`${this.apiUrl}/api/admin/administradores`, data);
  }

  cambiarContrasena(usuarioId: number, nuevaContrasena: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/api/admin/cambiar-contrasena`, {
      usuarioId,
      nuevaContrasena
    });
  }
}
