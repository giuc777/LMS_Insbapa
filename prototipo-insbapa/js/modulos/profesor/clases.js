/* ============================================================
   INSBAPA - Prototipo
   Portal Profesores: Mis Clases
   ============================================================ */

const ProfesorClases = (function () {
  const GRADOS = ['Todas', 'Primero Básico', 'Segundo Básico', 'Tercero Básico'];
  let grado = 'Todas';
  let detalle = null;

  function viewEl() { return document.getElementById('view'); }

  function render() {
    const filtered = PRO_CLASES.filter((c) => grado === 'Todas' || c.grado === grado);
    const tabs = GRADOS.map((g) =>
      '<button class="tab' + (grado === g ? ' active' : '') + '" data-grado="' + g + '">' + g + '</button>'
    ).join('');

    const cards = filtered.map((c) =>
      '<div class="card" style="padding:20px;cursor:pointer" data-clase="' + c.id + '">' +
      '<div style="display:flex;align-items:center;gap:14px">' +
      '<div style="width:52px;height:52px;border-radius:12px;background:' + c.color + ';color:' + c.colorText + ';display:flex;align-items:center;justify-content:center">' + ICONS.cursos + '</div>' +
      '<div><div class="dli-title" style="font-size:16px">' + escapeHtml(c.materia) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.grado) + ' · Sección ' + escapeHtml(c.seccion) + '</div></div>' +
      '<div style="margin-left:auto;text-align:center">' +
      '<div class="stat-value" style="font-size:24px">' + c.estudiantes + '</div>' +
      '<div class="dli-sub">estudiantes</div></div></div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
      '<button class="btn btn-outline btn-sm" data-accion="tareas" data-id="' + c.id + '">Tareas</button>' +
      '<button class="btn btn-outline btn-sm" data-accion="notas" data-id="' + c.id + '">Notas</button>' +
      '<button class="btn btn-outline btn-sm" data-accion="materiales" data-id="' + c.id + '">Materiales</button>' +
      '</div></div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">PROFESOR / MIS CLASES</div>' +
      '<h2>Mis Clases</h2>' +
      '<div class="page-sub">Selecciona una clase para gestionar tareas, notas y materiales.</div></div>' +
      '<div class="tabs">' + tabs + '</div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">' + cards + '</div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { grado = b.dataset.grado; render(); });
    });
    viewEl().querySelectorAll('[data-clase]').forEach((el) => {
      el.addEventListener('click', () => verDetalle(el.dataset.clase));
    });
    viewEl().querySelectorAll('[data-accion]').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const accion = b.dataset.accion;
        window.navigateDemo(accion === 'notas' ? 'notas' : accion);
      });
    });
  }

  function verDetalle(id) {
    const c = PRO_CLASES.find((x) => x.id === id);
    if (!c) return;
    detalle = c;
    const tareasClase = PRO_TAREAS.filter((t) => t.clase === c.id);
    const rows = tareasClase.map((t) =>
      '<tr>' +
      '<td><b>' + escapeHtml(t.titulo) + '</b></td>' +
      '<td>' + escapeHtml(t.grado) + ' · ' + escapeHtml(t.seccion) + '</td>' +
      '<td>' + escapeHtml(t.fechaLimite) + '</td>' +
      '<td>' + t.entregadas + ' / ' + t.total + '</td>' +
      '<td><span class="badge ' + t.color + '">' + escapeHtml(t.estado) + '</span></td>' +
      '<td><button class="btn btn-primary btn-sm" data-calificar="' + t.id + '">Calificar</button></td>' +
      '</tr>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Mis Clases</button>' +
      '<div class="crumb mt-2">MIS CLASES / ' + escapeHtml(c.grado) + '</div>' +
      '<h2>' + escapeHtml(c.materia) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(c.grado) + ' · Sección ' + escapeHtml(c.seccion) + ' · ' + c.estudiantes + ' estudiantes</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">' +
      '<div class="stat-card alt-green"><div class="stat-label">Tareas Activas</div><div class="stat-value">' + tareasClase.filter((t) => t.estado === 'Activa').length + '</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Por Calificar</div><div class="stat-value">' + tareasClase.filter((t) => t.estado === 'Por Calificar').length + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Estudiantes</div><div class="stat-value">' + c.estudiantes + '</div></div>' +
      '</div>' +

      '<div class="card mt-3"><div class="card-title">Tareas por Calificar</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Tarea</th><th>Grado/Sección</th><th>Fecha Límite</th><th>Entregas</th><th>Estado</th><th></th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="6" class="muted">Sin tareas registradas.</td></tr>') + '</tbody>' +
      '</table></div></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => { detalle = null; render(); });
    viewEl().querySelectorAll('[data-calificar]').forEach((b) => {
      b.addEventListener('click', () => window.navigateDemo('tareas'));
    });
  }

  return { render: render };
})();