import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Usuario, LoginResponse, LoginRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly userSignal = signal<Usuario | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  readonly usuario = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly rol = computed(() => this.userSignal()?.rol ?? '');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const token = localStorage.getItem('insbapa_token');
      const userJson = localStorage.getItem('insbapa_usuario');
      if (token && userJson) {
        this.tokenSignal.set(token);
        this.userSignal.set(JSON.parse(userJson));
      }
    } catch {
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('insbapa_token');
    localStorage.removeItem('insbapa_usuario');
  }

  login(username: string, password: string) {
    const body: LoginRequest = { username, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, body);
  }

  saveSession(response: LoginResponse): void {
    localStorage.setItem('insbapa_token', response.token);
    localStorage.setItem('insbapa_usuario', JSON.stringify(response.usuario));
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.usuario);
  }

  logout(): void {
    this.clearStorage();
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  actualizarPerfil(datos: {
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    correo: string;
    telefono?: string;
    fechaNacimiento?: string;
  }) {
    return this.http.put<Usuario>(`${this.apiUrl}/api/auth/perfil`, datos);
  }

  cambiarContrasena(body: { contrasenaActual: string; nuevaContrasena: string }) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/api/auth/cambiar-contrasena`, body);
  }

  updateLocalUser(usuario: Usuario): void {
    localStorage.setItem('insbapa_usuario', JSON.stringify(usuario));
    this.userSignal.set(usuario);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getRolKey(): string {
    const rol = this.rol().toLowerCase();
    if (rol.includes('administrador')) return 'administrador';
    if (rol.includes('profesor')) return 'profesor';
    if (rol.includes('estudiante')) return 'estudiante';
    return rol;
  }
}
