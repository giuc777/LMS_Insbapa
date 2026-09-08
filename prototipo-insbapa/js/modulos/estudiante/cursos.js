/* ============================================================
   INSBAPA - Prototipo
   Portal Estudiante: Cursos y Detalle de Curso
   ============================================================ */

const EstudianteCursos = (function () {
  function viewEl() { return document.getElementById('view'); }

  function renderCurso(c) {
    const materiales = c.materiales.map((m) =>
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:var(--surface-soft);color:var(--muted)">' + ICONS[m.tipo === 'Video' ? 'video' : 'file'] + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(m.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(m.tipo) + ' · ' + escapeHtml(m.tam) + '</div></div>' +
      '<button class="btn btn-outline btn-sm" data-material>Descargar</button>' +
      '</div>'
    ).join('');

    const tareas = EST_TAREAS.filter((t) => t.curso === c.codigo).map((t) =>
      '<div class="dash-list-item">' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(t.titulo) + '</div>' +
      '<div class="dli-sub">Vence: ' + escapeHtml(t.fechaLimite) + '</div></div>' +
      '<div>' + EstudianteDashboard.badgeEstado(t.estado) + '</div>' +
      '</div>'
    ).join('');

    const examenes = EST_EXAMENES.filter((x) => x.curso === c.codigo).map((x) =>
      '<div class="dash-list-item">' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(x.titulo) + '</div>' +
      '<div class="dli-sub">' + (x.estado === 'Realizado' ? 'Nota: ' + (x.nota || '-') : escapeHtml(x.fecha)) + '</div></div>' +
      '<div>' + EstudianteDashboard.badgeEstado(x.estado) + '</div>' +
      '</div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Mis Cursos</button>' +
      '<div class="crumb mt-2">CURSOS / ' + escapeHtml(c.codigo) + '</div>' +
      '<h2>' + escapeHtml(c.nombre) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(c.grado) + ' · Sección ' + escapeHtml(c.seccion) + ' · ' + escapeHtml(c.profesor) + '</div></div>' +

      '<div class="grid" style="grid-template-columns:1.2fr 0.8fr;align-items:start">' +
      '<div>' +
      '<div class="card"><div class="card-title">Materiales de estudio</div><div class="card-sub">Recursos de la unidad actual</div>' +
      '<div style="margin-top:12px">' + (materiales || '<p class="muted">Sin materiales aún.</p>') + '</div></div>' +
      '<div class="card mt-3"><div class="card-title">Evaluaciones</div><div class="card-sub">Exámenes del curso</div>' +
      '<div style="margin-top:12px">' + (examenes || '<p class="muted">Sin evaluaciones.</p>') + '</div></div>' +
      '</div>' +
      '<div>' +
      '<div class="card"><div class="card-title">Tareas pendientes</div><div class="card-sub">Lo que debes entregar</div>' +
      '<div style="margin-top:12px">' + (tareas || '<p class="muted">Sin tareas pendientes.</p>') + '</div></div>' +
      '<div class="card mt-3 alt-green"><div class="card-title">Progreso</div>' +
      '<div class="stat-value" style="font-size:30px">' + c.progreso + '%</div>' +
      '<div style="height:10px;background:#fff;border-radius:999px;overflow:hidden">' +
      '<div style="height:100%;width:' + c.progreso + '%;background:var(--primary);border-radius:999px"></div></div></div>' +
      '</div>' +
      '</div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', render);
    viewEl().querySelectorAll('[data-material]').forEach((b) => {
      b.addEventListener('click', () => showToast('Descarga iniciada (demo).', 'info'));
    });
  }

  function render() {
    const cards = EST_CURSOS.map((c) =>
      '<div class="card" style="padding:20px;cursor:pointer" data-curso="' + c.id + '">' +
      '<div style="display:flex;align-items:center;gap:14px">' +
      '<div style="width:52px;height:52px;border-radius:12px;background:' + c.color + ';color:' + c.colorText + ';display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px">' + escapeHtml(c.codigo.slice(0, 4)) + '</div>' +
      '<div style="min-width:0"><div class="dli-title" style="font-size:16px">' + escapeHtml(c.nombre) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.grado) + ' · Sección ' + escapeHtml(c.seccion) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.profesor) + '</div></div>' +
      '<div style="margin-left:auto;text-align:right">' +
      '<div class="stat-value" style="font-size:22px">' + c.progreso + '%</div>' +
      '<div class="dli-sub">progreso</div></div></div>' +
      '</div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ESTUDIANTE / CURSOS</div>' +
      '<h2>Mis Cursos</h2>' +
      '<div class="page-sub">Selecciona un curso para ver sus materiales y tareas.</div></div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">' + cards + '</div>';

    viewEl().querySelectorAll('[data-curso]').forEach((el) => {
      el.addEventListener('click', () => verCurso(el.dataset.curso));
    });
  }

  function verCurso(id) {
    const c = EST_CURSOS.find((x) => x.id === id);
    if (c) renderCurso(c);
  }

  return { render: render, verCurso: verCurso };
})();