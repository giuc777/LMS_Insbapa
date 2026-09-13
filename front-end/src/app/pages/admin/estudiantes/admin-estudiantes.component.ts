import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-estudiantes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-estudiantes.component.html',
  styleUrl: './admin-estudiantes.component.css'
})
export class AdminEstudiantesComponent implements OnInit {
  estudiantes = signal<any[]>([]);
  grados = signal<any[]>([]);
  secciones = signal<any[]>([]);

  busqueda = signal('');
  gradoFiltro = signal<number | ''>('');
  seccionFiltro = signal<number | ''>('');
  loading = signal(false);

  pagina = signal(1);
  totalPaginas = signal(1);
  totalRegistros = signal(0);
  tamanioPagina = 10;

  mostrarModalCrear = signal(false);
  mostrarModalEditar = signal(false);
  mostrarDetalle = signal(false);
  estudianteDetalle = signal<any>(null);
  estudianteCursos = signal<any[]>([]);

  formMensaje = signal('');
  formExito = signal(false);
  formLoading = signal(false);

  formCrear = {
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    correo: '', telefono: '', username: '', contrasena: '',
    gradoId: 0, seccionId: 0
  };

  formEditar = {
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    correo: '', telefono: '', gradoId: 0, seccionId: 0, activo: true
  };
  editarId = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.obtenerGrados().subscribe({ next: (d) => this.grados.set(d) });
    this.adminService.obtenerSecciones().subscribe({ next: (d) => this.secciones.set(d) });
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    const params: any = { pagina: this.pagina(), tamanioPagina: this.tamanioPagina };
    if (this.busqueda()) params.busqueda = this.busqueda();
    if (this.gradoFiltro()) params.gradoId = this.gradoFiltro();
    if (this.seccionFiltro()) params.seccionId = this.seccionFiltro();

    this.adminService.listarEstudiantes(
      params.busqueda, params.gradoId, params.seccionId
    ).subscribe({
      next: (d) => {
        this.estudiantes.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  buscar(): void {
    this.pagina.set(1);
    this.cargarDatos();
  }

  paginaAnterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update(p => p - 1);
      this.cargarDatos();
    }
  }

  paginaSiguiente(): void {
    if (this.pagina() < this.totalPaginas()) {
      this.pagina.update(p => p + 1);
      this.cargarDatos();
    }
  }

  abrirCrear(): void {
    this.formCrear = {
      primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
      correo: '', telefono: '', username: '', contrasena: '',
      gradoId: 0, seccionId: 0
    };
    this.formMensaje.set('');
    this.formExito.set(false);
    this.mostrarModalCrear.set(true);
  }

  submitCrear(): void {
    const f = this.formCrear;
    if (!f.primerNombre || !f.primerApellido || !f.correo || !f.username || !f.contrasena || !f.gradoId || !f.seccionId) {
      this.formExito.set(false);
      this.formMensaje.set('Complete todos los campos obligatorios.');
      return;
    }
    this.formLoading.set(true);
    this.adminService.crearEstudiante(f).subscribe({
      next: (res) => {
        this.formExito.set(true);
        this.formMensaje.set(res.message || 'Estudiante creado correctamente');
        this.formLoading.set(false);
        this.cargarDatos();
        setTimeout(() => this.mostrarModalCrear.set(false), 1500);
      },
      error: (err) => {
        this.formExito.set(false);
        this.formMensaje.set(err.error?.error || 'Error al crear estudiante');
        this.formLoading.set(false);
      }
    });
  }

  verDetalle(est: any): void {
    this.adminService.obtenerEstudiantePorId(est.Estudiante_ID).subscribe({
      next: (detalle) => {
        this.estudianteDetalle.set(detalle);
        this.adminService.obtenerEstudianteCursos(est.Estudiante_ID).subscribe({
          next: (cursos) => this.estudianteCursos.set(cursos),
          error: () => this.estudianteCursos.set([])
        });
        this.mostrarDetalle.set(true);
      },
      error: () => alert('Error al obtener detalle')
    });
  }

  abrirEditar(est: any): void {
    this.editarId = est.Estudiante_ID;
    this.adminService.obtenerEstudiantePorId(est.Estudiante_ID).subscribe({
      next: (d) => {
        this.formEditar = {
          primerNombre: d.PrimerNombre || '',
          segundoNombre: d.SegundoNombre || '',
          primerApellido: d.PrimerApellido || '',
          segundoApellido: d.SegundoApellido || '',
          correo: d.Correo || '',
          telefono: d.Telefono || '',
          gradoId: d.Grado_ID || 0,
          seccionId: d.Seccion_ID || 0,
          activo: d.Activo ?? true
        };
        this.formMensaje.set('');
        this.formExito.set(false);
        this.mostrarModalEditar.set(true);
      },
      error: () => alert('Error al obtener datos')
    });
  }

  submitEditar(): void {
    const f = this.formEditar;
    if (!f.primerNombre || !f.primerApellido || !f.correo || !f.gradoId || !f.seccionId) {
      this.formExito.set(false);
      this.formMensaje.set('Complete todos los campos obligatorios.');
      return;
    }
    this.formLoading.set(true);
    this.adminService.actualizarEstudiante(this.editarId, f).subscribe({
      next: (res) => {
        this.formExito.set(true);
        this.formMensaje.set(res.message || 'Estudiante actualizado correctamente');
        this.formLoading.set(false);
        this.cargarDatos();
        setTimeout(() => this.mostrarModalEditar.set(false), 1500);
      },
      error: (err) => {
        this.formExito.set(false);
        this.formMensaje.set(err.error?.error || 'Error al actualizar');
        this.formLoading.set(false);
      }
    });
  }

  cerrarModales(): void {
    this.mostrarModalCrear.set(false);
    this.mostrarModalEditar.set(false);
    this.mostrarDetalle.set(false);
  }

  iniciales(est: any): string {
    return (est.Iniciales || est.PrimerNombre?.[0] || '') + (est.PrimerApellido?.[0] || '');
  }
}
