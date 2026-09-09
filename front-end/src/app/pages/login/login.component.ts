import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  rol = signal('estudiante');
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    if (authService.isLoggedIn()) {
      router.navigate(['/sistema']);
    }
  }

  onLogin(): void {
    this.error.set('');

    if (!this.username() || !this.password()) {
      this.error.set('Complete todos los campos.');
      return;
    }

    this.loading.set(true);

    this.authService.login(this.username(), this.password()).subscribe({
      next: (response) => {
        const rolSeleccionado = this.rol().toLowerCase();
        const rolUsuario = response.usuario.rol.toLowerCase();
        const rolMap: Record<string, string> = {
          estudiante: 'estudiante',
          profesor: 'profesor',
          administrador: 'administrador'
        };

        if (rolMap[rolSeleccionado] !== rolMap[rolUsuario]) {
          this.loading.set(false);
          this.error.set('Usuario, contraseña o rol incorrectos.');
          return;
        }

        this.authService.saveSession(response);
        this.loading.set(false);
        this.router.navigate(['/sistema']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Error de conexión con el servidor.');
      }
    });
  }
}
