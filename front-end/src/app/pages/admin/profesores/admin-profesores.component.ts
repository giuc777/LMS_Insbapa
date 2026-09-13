import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-profesores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-profesores.component.html',
  styleUrl: './admin-profesores.component.css'
})
export class AdminProfesoresComponent implements OnInit {
  profesores = signal<any[]>([]);

  busqueda = signal('');
  loading = signal(false);

  pagina = signal(1);
  totalPaginas = signal(1);
  totalRegistros = signal(0);
  tamanioPagina = 10;

  mostrarModalEditar = signal(false);
  mostrarDetalle = signal(false);
  profesorDetalle = signal<any>(null);
  profesorClases = signal<any[]>([]);

  formMensaje = signal('');
  formExito = signal(false);
  formLoading = signal(false);

  formEditar = {
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    correo: '', telefono: '', codigoProfesor: '', activo: true
  };
  editarId = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.adminService.listarProfesores(
      this.busqueda() || undefined
    ).subscribe({
      next: (d) => {
        this.profesores.set(d);
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

  verDetalle(prof: any): void {
    this.adminService.obtenerProfesorPorId(prof.Profesor_ID).subscribe({
      next: (detalle) => {
        this.profesorDetalle.set(detalle);
        this.adminService.obtenerProfesorClases(prof.Profesor_ID).subscribe({
          next: (clases) => this.profesorClases.set(clases),
          error: () => this.profesorClases.set([])
        });
        this.mostrarDetalle.set(true);
      },
      error: () => alert('Error al obtener detalle')
    });
  }

  abrirEditar(prof: any): void {
    this.editarId = prof.Profesor_ID;
    this.adminService.obtenerProfesorPorId(prof.Profesor_ID).subscribe({
      next: (d) => {
        this.formEditar = {
          primerNombre: d.PrimerNombre || '',
          segundoNombre: d.SegundoNombre || '',
          primerApellido: d.PrimerApellido || '',
          segundoApellido: d.SegundoApellido || '',
          correo: d.Correo || '',
          telefono: d.Telefono || '',
          codigoProfesor: d.CodigoProfesor || '',
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
    if (!f.primerNombre || !f.primerApellido || !f.correo) {
      this.formExito.set(false);
      this.formMensaje.set('Complete todos los campos obligatorios.');
      return;
    }
    this.formLoading.set(true);
    this.adminService.actualizarProfesor(this.editarId, f).subscribe({
      next: (res) => {
        this.formExito.set(true);
        this.formMensaje.set(res.message || 'Profesor actualizado correctamente');
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
    this.mostrarModalEditar.set(false);
    this.mostrarDetalle.set(false);
  }

  iniciales(prof: any): string {
    return (prof.Iniciales || prof.PrimerNombre?.[0] || '') + (prof.PrimerApellido?.[0] || '');
  }
}
