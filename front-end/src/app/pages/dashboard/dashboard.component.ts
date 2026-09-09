import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  data = signal<any>(null);
  loading = signal(true);
  rol = signal('');
  today = new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(
    private http: HttpClient,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.rol.set(this.authService.getRolKey());
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.http.get(`${environment.apiUrl}/api/dashboard`).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
