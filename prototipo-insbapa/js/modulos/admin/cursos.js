/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Cursos
   ============================================================ */

const AdminCursos = (function () {
  function viewEl() { return document.getElementById('view'); }

  function render() {
    const cards = ADMIN_CURSOS.map((c) =>
      '<div class="card" style="padding:20px">' +
      '<div style="display:flex;align-items:center;gap:14px">' +
      '<div style="width:52px;height:52px;border-radius:12px;background:' + c.color + ';color:' + c.colorText + ';display:flex;align-items:center;justify-content:center">' + ICONS.cursos + '</div>' +
      '<div style="min-width:0"><div class="dli-title" style="font-size:16px">' + escapeHtml(c.materia) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.grado) + ' · Sección ' + escapeHtml(c.seccion) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.profesor) + '</div></div>' +
      '<div style="margin-left:auto;text-align:center">' +
      '<div class="stat-value" style="font-size:20px">' + c.estudiantes + '</div>' +
      '<div class="dli-sub">estudiantes</div></div></div>' +
      '<div class="flex mt-2" style="gap:8px">' +
      '<button class="btn btn-outline btn-sm" data-ver-curso="' + c.id + '">Ver</button>' +
      '<button class="btn btn-outline btn-sm" data-editar-curso="' + c.id + '">Editar</button>' +
      '<button class="btn btn-outline btn-sm" data-desactivar="' + c.id + '">Desactivar</button>' +
      '</div></div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / CURSOS</div>' +
      '<h2>Cursos</h2>' +
      '<div class="page-sub">Administra los cursos y secciones del ciclo escolar.</div></div>' +

      '<div class="flex-between" style="margin-bottom:20px;flex-wrap:wrap;gap:12px">' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));flex:1">' +
      '<div class="stat-card alt-green" style="padding:14px 18px"><div class="stat-label">Cursos activos</div><div class="stat-value" style="font-size:24px">' + ADMIN_CURSOS.filter((c) => c.estudiantes).length + '</div></div>' +
      '<div class="stat-card" style="padding:14px 18px"><div class="stat-label">Estudiantes inscritos</div><div class="stat-value" style="font-size:24px">' + ADMIN_CURSOS.reduce((s, c) => s + c.estudiantes, 0) + '</div></div>' +
      '</div>' +
      '<button class="btn btn-primary" data-nuevo-curso>' + ICONS.cursos + ' Nuevo Curso</button>' +
      '</div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">' + cards + '</div>';

    viewEl().querySelectorAll('[data-ver-curso]').forEach((b) => {
      b.addEventListener('click', () => verCurso(b.dataset.verCurso));
    });
    viewEl().querySelectorAll('[data-editar-curso]').forEach((b) => {
      b.addEventListener('click', () => showToast('Editar curso (demo).', 'info'));
    });
    viewEl().querySelectorAll('[data-desactivar]').forEach((b) => {
      b.addEventListener('click', () => {
        confirmar({
          titulo: 'Desactivar curso',
          mensaje: '¿Desea desactivar este curso? Los estudiantes dejarán de verlo.',
          confirmarTexto: 'Desactivar',
          tipo: 'danger',
          onConfirmar: () => showToast('Curso desactivado.', 'success'),
        });
      });
    });
    viewEl().querySelector('[data-nuevo-curso]').addEventListener('click', () => {
      showToast('Formulario de nuevo curso (demo).', 'info');
    });
  }

  /* ---------- Ver detalle del curso ---------- */
  function verCurso(id) {
    const c = ADMIN_CURSOS.find((x) => x.id === id);
    if (!c) return showToast('Curso no encontrado.', 'error');

    const tareas = [
      { titulo: 'Ecuaciones lineales', fechaLimite: '2026-08-15', entregadas: 22, total: 28, estado: 'Activa' },
      { titulo: 'Fracciones', fechaLimite: '2026-08-18', entregadas: 18, total: 28, estado: 'Activa' },
      { titulo: 'Operaciones básicas', fechaLimite: '2026-08-01', entregadas: 26, total: 28, estado: 'Cerrada' },
    ];

    const tareasHtml = tareas.map((t) =>
      '<tr><td><b>' + escapeHtml(t.titulo) + '</b></td>' +
      '<td>' + escapeHtml(t.fechaLimite) + '</td>' +
      '<td>' + t.entregadas + ' / ' + t.total + '</td>' +
      '<td><span class="badge ' + (t.estado === 'Activa' ? 'badge-primary' : 'badge-gray') + '">' + escapeHtml(t.estado) + '</span></td></tr>'
    ).join('');

    const promedio = 83.6;

    const html =
      '<div class="modal-backdrop" id="modalVerCurso" style="display:none">' +
      '<div class="modal" style="max-width:620px">' +
      '<div class="modal-header"><h3>Detalle del Curso</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">' +
      '<div style="width:52px;height:52px;border-radius:12px;background:' + c.color + ';color:' + c.colorText + ';display:flex;align-items:center;justify-content:center">' + ICONS.cursos + '</div>' +
      '<div><div style="font-size:18px;font-weight:600">' + escapeHtml(c.materia) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.grado) + ' · Sección ' + escapeHtml(c.seccion) + '</div></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:20px">' +
      '<div><div class="dli-sub">Profesor</div><div><b>' + escapeHtml(c.profesor) + '</b></div></div>' +
      '<div><div class="dli-sub">Estudiantes</div><div><b>' + c.estudiantes + '</b></div></div>' +
      '<div><div class="dli-sub">Promedio general</div><div><b>' + promedio + '</b></div></div>' +
      '</div>' +
      '<div><div class="dli-sub" style="margin-bottom:8px">Tareas asignadas</div>' +
      '<table class="data-table"><thead><tr><th>Tarea</th><th>Fecha Límite</th><th>Entregas</th><th>Estado</th></tr></thead>' +
      '<tbody>' + tareasHtml + '</tbody></table></div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button class="btn btn-outline" data-cerrar>Cerrar</button>' +
      '<button class="btn btn-primary" data-editar-modal>' + ICONS.edit + ' Editar Curso</button>' +
      '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalVerCurso');
    modal.style.display = 'flex';

    function cerrar() { modal.remove(); }
    modal.querySelectorAll('[data-cerrar]').forEach((b) => { b.addEventListener('click', cerrar); });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) cerrar(); });
    modal.querySelector('[data-editar-modal]').addEventListener('click', () => {
      cerrar();
      showToast('Formulario de edición de curso (demo).', 'info');
    });
  }

  return { render: render };
})();
