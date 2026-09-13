import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';
import { AjustesUsuariosComponent } from './ajustes-usuarios/ajustes-usuarios.component';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [AjustesUsuariosComponent],
  templateUrl: './ajustes.component.html',
  styleUrl: './ajustes.component.css'
})
export class AjustesComponent implements OnInit {
  authService = inject(AuthService);

  pestanaActiva = signal<'perfil' | 'usuarios'>('perfil');

  primerNombre = signal('');
  segundoNombre = signal('');
  primerApellido = signal('');
  segundoApellido = signal('');
  correo = signal('');
  telefono = signal('');
  fechaNacimiento = signal('');

  perfilLoading = signal(false);
  perfilMensaje = signal('');
  perfilExito = signal(false);

  contrasenaActual = signal('');
  nuevaContrasena = signal('');
  confirmarContrasena = signal('');
  passwordLoading = signal(false);
  passwordMensaje = signal('');
  passwordExito = signal(false);

  esAdmin = signal(false);

  ngOnInit(): void {
    const u = this.authService.usuario();
    if (u) {
      this.primerNombre.set(u.primerNombre ?? '');
      this.segundoNombre.set(u.segundoNombre ?? '');
      this.primerApellido.set(u.primerApellido ?? '');
      this.segundoApellido.set(u.segundoApellido ?? '');
      this.correo.set(u.correo ?? '');
      this.telefono.set(u.telefono ?? '');
      this.fechaNacimiento.set(u.fechaNacimiento ?? '');
    }
    this.esAdmin.set(this.authService.getRolKey() === 'administrador');
  }

  guardarPerfil(): void {
    if (this.perfilLoading()) return;
    this.perfilLoading.set(true);
    this.perfilMensaje.set('');

    this.authService.actualizarPerfil({
      primerNombre: this.primerNombre(),
      segundoNombre: this.segundoNombre(),
      primerApellido: this.primerApellido(),
      segundoApellido: this.segundoApellido(),
      correo: this.correo(),
      telefono: this.telefono(),
      fechaNacimiento: this.fechaNacimiento()
    }).subscribe({
      next: (res) => {
        this.authService.updateLocalUser(res);
        this.perfilMensaje.set('Perfil actualizado correctamente.');
        this.perfilExito.set(true);
        this.perfilLoading.set(false);
      },
      error: (err) => {
        this.perfilMensaje.set(err.error?.message || 'Error al guardar.');
        this.perfilExito.set(false);
        this.perfilLoading.set(false);
      }
    });
  }

  cambiarContrasena(): void {
    if (this.passwordLoading()) return;

    if (this.nuevaContrasena() !== this.confirmarContrasena()) {
      this.passwordMensaje.set('Las contrasenas no coinciden.');
      this.passwordExito.set(false);
      return;
    }

    if (this.nuevaContrasena().length < 6) {
      this.passwordMensaje.set('La nueva contrasena debe tener al menos 6 caracteres.');
      this.passwordExito.set(false);
      return;
    }

    this.passwordLoading.set(true);
    this.passwordMensaje.set('');

    this.authService.cambiarContrasena({
      contrasenaActual: this.contrasenaActual(),
      nuevaContrasena: this.nuevaContrasena()
    }).subscribe({
      next: () => {
        this.passwordMensaje.set('Contrasena actualizada correctamente.');
        this.passwordExito.set(true);
        this.contrasenaActual.set('');
        this.nuevaContrasena.set('');
        this.confirmarContrasena.set('');
        this.passwordLoading.set(false);
      },
      error: (err) => {
        this.passwordMensaje.set(err.error?.message || 'Error al actualizar contrasena.');
        this.passwordExito.set(false);
        this.passwordLoading.set(false);
      }
    });
  }
}
