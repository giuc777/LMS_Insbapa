import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-ajustes-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ajustes-usuarios.component.html',
  styleUrl: './ajustes-usuarios.component.css'
})
export class AjustesUsuariosComponent implements OnInit {
  pestanaActiva = signal<'estudiantes' | 'profesores' | 'administradores'>('estudiantes');

  estudiantes = signal<any[]>([]);
  profesores = signal<any[]>([]);
  administradores = signal<any[]>([]);

  busqueda = signal('');
  gradoFiltro = signal<number | ''>('');
  seccionFiltro = signal<number | ''>('');

  grados = signal<any[]>([]);
  secciones = signal<any[]>([]);

  loading = signal(false);
  mostrarModal = signal(false);
  modalTipo = signal<'estudiante' | 'profesor' | 'administrador'>('estudiante');
  modalMensaje = signal('');
  modalExito = signal(false);
  modalLoading = signal(false);

  mostrarModalContrasena = signal(false);
  usuarioContrasenaId = signal(0);
  usuarioContrasenaNombre = signal('');
  nuevaContrasenaAdmin = signal('');
  contrasenaAdminMensaje = signal('');
  contrasenaAdminExito = signal(false);
  contrasenaAdminLoading = signal(false);

  form = {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    telefono: '',
    username: '',
    contrasena: '',
    gradoId: 0,
    seccionId: 0,
    codigoProfesor: '',
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarDatos();
  }

  cargarCatalogos(): void {
    this.adminService.obtenerGrados().subscribe({ next: (d) => this.grados.set(d) });
    this.adminService.obtenerSecciones().subscribe({ next: (d) => this.secciones.set(d) });
  }

  cargarDatos(): void {
    this.loading.set(true);
    const tipo = this.pestanaActiva();

    if (tipo === 'estudiantes') {
      const grado = this.gradoFiltro() || undefined;
      const seccion = this.seccionFiltro() || undefined;
      this.adminService.listarEstudiantes(this.busqueda() || undefined, grado, seccion).subscribe({
        next: (d) => { this.estudiantes.set(d); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else if (tipo === 'profesores') {
      this.adminService.listarProfesores(this.busqueda() || undefined).subscribe({
        next: (d) => { this.profesores.set(d); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else {
      this.adminService.listarAdministradores(this.busqueda() || undefined).subscribe({
        next: (d) => { this.administradores.set(d); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  cambiarPestana(pestana: 'estudiantes' | 'profesores' | 'administradores'): void {
    this.pestanaActiva.set(pestana);
    this.busqueda.set('');
    this.gradoFiltro.set('');
    this.seccionFiltro.set('');
    this.cargarDatos();
  }

  onBusqueda(): void {
    this.cargarDatos();
  }

  abrirCrear(tipo: 'estudiante' | 'profesor' | 'administrador'): void {
    this.modalTipo.set(tipo);
    this.modalMensaje.set('');
    this.form = {
      primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
      correo: '', telefono: '', username: '', contrasena: '',
      gradoId: 0, seccionId: 0, codigoProfesor: '',
    };
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  submitCrear(): void {
    this.modalMensaje.set('');

    if (!this.form.primerNombre || !this.form.primerApellido || !this.form.correo || !this.form.username || !this.form.contrasena) {
      this.modalExito.set(false);
      this.modalMensaje.set('Complete todos los campos obligatorios.');
      return;
    }

    if (this.form.contrasena.length < 6) {
      this.modalExito.set(false);
      this.modalMensaje.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.modalTipo() === 'estudiante' && (!this.form.gradoId || !this.form.seccionId)) {
      this.modalExito.set(false);
      this.modalMensaje.set('Seleccione grado y sección.');
      return;
    }

    this.modalLoading.set(true);

    const data = { ...this.form };

    let obs;
    if (this.modalTipo() === 'estudiante') {
      obs = this.adminService.crearEstudiante(data);
    } else if (this.modalTipo() === 'profesor') {
      obs = this.adminService.crearProfesor(data);
    } else {
      obs = this.adminService.crearAdministrador(data);
    }

    obs.subscribe({
      next: (res) => {
        this.modalExito.set(true);
        this.modalMensaje.set(res.message);
        this.modalLoading.set(false);
        this.cargarDatos();
      },
      error: (err) => {
        this.modalExito.set(false);
        this.modalMensaje.set(err.error?.error || 'Error al crear usuario.');
        this.modalLoading.set(false);
      }
    });
  }

  abrirContrasena(usuarioId: number, nombre: string): void {
    this.usuarioContrasenaId.set(usuarioId);
    this.usuarioContrasenaNombre.set(nombre);
    this.nuevaContrasenaAdmin.set('');
    this.contrasenaAdminMensaje.set('');
    this.mostrarModalContrasena.set(true);
  }

  cerrarModalContrasena(): void {
    this.mostrarModalContrasena.set(false);
  }

  submitContrasena(): void {
    this.contrasenaAdminMensaje.set('');

    if (!this.nuevaContrasenaAdmin()) {
      this.contrasenaAdminExito.set(false);
      this.contrasenaAdminMensaje.set('Ingrese la nueva contraseña.');
      return;
    }

    if (this.nuevaContrasenaAdmin().length < 6) {
      this.contrasenaAdminExito.set(false);
      this.contrasenaAdminMensaje.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.contrasenaAdminLoading.set(true);

    this.adminService.cambiarContrasena(this.usuarioContrasenaId(), this.nuevaContrasenaAdmin()).subscribe({
      next: (res) => {
        this.contrasenaAdminExito.set(true);
        this.contrasenaAdminMensaje.set(res.message);
        this.contrasenaAdminLoading.set(false);
        this.nuevaContrasenaAdmin.set('');
      },
      error: (err) => {
        this.contrasenaAdminExito.set(false);
        this.contrasenaAdminMensaje.set(err.error?.error || 'Error al cambiar contraseña.');
        this.contrasenaAdminLoading.set(false);
      }
    });
  }
}
