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

  // ── Estudiantes (detalle, cursos, edición) ──────────────

  obtenerEstudiantePorId(id: number) {
    return this.http.get<any>(`${this.apiUrl}/api/admin/estudiantes/${id}`);
  }

  obtenerEstudianteCursos(id: number) {
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/estudiantes/${id}/cursos`);
  }

  actualizarEstudiante(id: number, data: any) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/api/admin/estudiantes/${id}`, data);
  }

  // ── Cursos ────────────────────────────────────────────

  listarCursosAdmin(busqueda?: string, gradoId?: number, seccionId?: number) {
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    if (gradoId) params = params.set('gradoId', gradoId.toString());
    if (seccionId) params = params.set('seccionId', seccionId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/cursos`, { params });
  }

  obtenerCursosCatalogo() {
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/cursos/catalogo`);
  }

  obtenerProfesoresCatalogo() {
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/cursos/profesores-catalogo`);
  }

  crearCursoAsignacion(data: any) {
    return this.http.post<{ asignacionId: number; message: string }>(`${this.apiUrl}/api/admin/cursos`, data);
  }

  actualizarCursoAsignacion(id: number, data: any) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/api/admin/cursos/${id}`, data);
  }

  eliminarCursoAsignacion(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/api/admin/cursos/${id}`);
  }
}
