import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AjustesUsuariosComponent } from './ajustes-usuarios/ajustes-usuarios.component';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [FormsModule, AjustesUsuariosComponent],
  templateUrl: './ajustes.component.html',
  styleUrl: './ajustes.component.css'
})
export class AjustesComponent implements OnInit {
  pestanaActiva = signal<'perfil' | 'usuarios'>('perfil');
  esAdmin = signal(false);

  primerNombre = signal('');
  segundoNombre = signal('');
  primerApellido = signal('');
  segundoApellido = signal('');
  correo = signal('');
  telefono = signal('');
  fechaNacimiento = signal('');

  contrasenaActual = signal('');
  nuevaContrasena = signal('');
  confirmarContrasena = signal('');

  perfilLoading = signal(false);
  passwordLoading = signal(false);
  perfilMensaje = signal('');
  passwordMensaje = signal('');
  perfilExito = signal(false);
  passwordExito = signal(false);

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.esAdmin.set(this.authService.getRolKey() === 'administrador');
    const u = this.authService.usuario();
    if (u) {
      this.primerNombre.set(u.primerNombre || '');
      this.segundoNombre.set(u.segundoNombre || '');
      this.primerApellido.set(u.primerApellido || '');
      this.segundoApellido.set(u.segundoApellido || '');
      this.correo.set(u.correo || '');
      this.telefono.set(u.telefono || '');
      this.fechaNacimiento.set(u.fechaNacimiento || '');
    }
  }

  guardarPerfil(): void {
    this.perfilMensaje.set('');
    this.perfilLoading.set(true);

    this.authService.actualizarPerfil({
      primerNombre: this.primerNombre(),
      segundoNombre: this.segundoNombre(),
      primerApellido: this.primerApellido(),
      segundoApellido: this.segundoApellido(),
      correo: this.correo(),
      telefono: this.telefono() || undefined,
      fechaNacimiento: this.fechaNacimiento() || undefined,
    }).subscribe({
      next: (usuario) => {
        this.authService.updateLocalUser(usuario);
        this.perfilExito.set(true);
        this.perfilMensaje.set('Perfil actualizado correctamente.');
        this.perfilLoading.set(false);
      },
      error: (err) => {
        this.perfilExito.set(false);
        this.perfilMensaje.set(err.error?.error || 'Error al actualizar el perfil.');
        this.perfilLoading.set(false);
      }
    });
  }

  cambiarContrasena(): void {
    this.passwordMensaje.set('');

    if (!this.contrasenaActual() || !this.nuevaContrasena() || !this.confirmarContrasena()) {
      this.passwordExito.set(false);
      this.passwordMensaje.set('Complete todos los campos.');
      return;
    }

    if (this.nuevaContrasena().length < 6) {
      this.passwordExito.set(false);
      this.passwordMensaje.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.nuevaContrasena() !== this.confirmarContrasena()) {
      this.passwordExito.set(false);
      this.passwordMensaje.set('Las contraseñas no coinciden.');
      return;
    }

    this.passwordLoading.set(true);

    this.authService.cambiarContrasena({
      contrasenaActual: this.contrasenaActual(),
      nuevaContrasena: this.nuevaContrasena(),
    }).subscribe({
      next: () => {
        this.passwordExito.set(true);
        this.passwordMensaje.set('Contraseña actualizada correctamente.');
        this.contrasenaActual.set('');
        this.nuevaContrasena.set('');
        this.confirmarContrasena.set('');
        this.passwordLoading.set(false);
      },
      error: (err) => {
        this.passwordExito.set(false);
        this.passwordMensaje.set(err.error?.error || 'Error al cambiar la contraseña.');
        this.passwordLoading.set(false);
      }
    });
  }
}
