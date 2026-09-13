import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-cursos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-cursos.component.html',
  styleUrl: './admin-cursos.component.css'
})
export class AdminCursosComponent implements OnInit {
  cursos = signal<any[]>([]);
  grados = signal<any[]>([]);
  secciones = signal<any[]>([]);
  cursosCatalogo = signal<any[]>([]);
  profesoresCatalogo = signal<any[]>([]);

  busqueda = signal('');
  gradoFiltro = signal<number | ''>('');
  seccionFiltro = signal<number | ''>('');
  loading = signal(false);

  mostrarModal = signal(false);
  esEdicion = signal(false);
  asignacionEditId = signal(0);
  formMensaje = signal('');
  formExito = signal(false);
  formLoading = signal(false);

  mostrarDetalle = signal(false);
  cursoDetalle = signal<any>(null);

  form = { cursoId: 0, gradoId: 0, seccionId: 0, profesorId: 0 };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarDatos();
  }

  cargarCatalogos(): void {
    this.adminService.obtenerGrados().subscribe({ next: (d) => this.grados.set(d) });
    this.adminService.obtenerSecciones().subscribe({ next: (d) => this.secciones.set(d) });
    this.adminService.obtenerCursosCatalogo().subscribe({ next: (d) => this.cursosCatalogo.set(d) });
    this.adminService.obtenerProfesoresCatalogo().subscribe({ next: (d) => this.profesoresCatalogo.set(d) });
  }

  cargarDatos(): void {
    this.loading.set(true);
    const grado = this.gradoFiltro() || undefined;
    const seccion = this.seccionFiltro() || undefined;
    this.adminService.listarCursosAdmin(this.busqueda() || undefined, grado, seccion).subscribe({
      next: (d) => { this.cursos.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirCrear(): void {
    this.esEdicion.set(false);
    this.form = { cursoId: 0, gradoId: 0, seccionId: 0, profesorId: 0 };
    this.formMensaje.set('');
    this.formExito.set(false);
    this.mostrarModal.set(true);
  }

  abrirEditar(curso: any): void {
    this.esEdicion.set(true);
    this.asignacionEditId.set(curso.Asignacion_ID);
    this.form = {
      cursoId: curso.Curso_ID,
      gradoId: curso.Grado_ID,
      seccionId: curso.Seccion_ID,
      profesorId: curso.Profesor_ID,
    };
    this.formMensaje.set('');
    this.formExito.set(false);
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  submit(): void {
    if (!this.form.cursoId || !this.form.gradoId || !this.form.seccionId || !this.form.profesorId) {
      this.formExito.set(false);
      this.formMensaje.set('Complete todos los campos.');
      return;
    }

    this.formLoading.set(true);
    const obs = this.esEdicion()
      ? this.adminService.actualizarCursoAsignacion(this.asignacionEditId(), this.form)
      : this.adminService.crearCursoAsignacion(this.form);

    obs.subscribe({
      next: (res) => {
        this.formExito.set(true);
        this.formMensaje.set(res.message || 'Operación exitosa');
        this.formLoading.set(false);
        this.cargarDatos();
        setTimeout(() => this.cerrarModal(), 1500);
      },
      error: (err) => {
        this.formExito.set(false);
        this.formMensaje.set(err.error?.error || 'Error en la operación');
        this.formLoading.set(false);
      }
    });
  }

  eliminar(curso: any): void {
    if (!confirm(`¿Eliminar ${curso.Materia} (${curso.Grado} ${curso.Seccion})?`)) return;
    this.adminService.eliminarCursoAsignacion(curso.Asignacion_ID).subscribe({
      next: () => this.cargarDatos(),
      error: () => alert('Error al eliminar')
    });
  }

  verDetalle(curso: any): void {
    this.cursoDetalle.set(curso);
    this.mostrarDetalle.set(true);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle.set(false);
  }
}
