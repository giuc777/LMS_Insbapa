import { Component, inject, signal } from '@angular/core';
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
  private authService = inject(AuthService);
  private router = inject(Router);

  rol = signal<'estudiante' | 'profesor' | 'administrador'>('estudiante');
  username = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  onLogin(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.username(), this.password()).subscribe({
      next: (res) => {
        this.authService.saveSession(res);
        this.router.navigate(['/sistema']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Credenciales incorrectas.');
        this.loading.set(false);
      }
    });
  }
}
