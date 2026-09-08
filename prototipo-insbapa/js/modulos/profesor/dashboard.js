/* ============================================================
   INSBAPA - Prototipo
   Portal Profesores: Dashboard
   ============================================================ */

const ProfesorDashboard = (function () {
  function viewEl() { return document.getElementById('view'); }

  function render() {
    const sesion = window.obtenerSesion ? window.obtenerSesion() : {};
    const nombreProfesor = sesion.nombre || 'Profesor';
    const porCalificar = PRO_TAREAS.filter((t) => t.estado === 'Por Calificar').length;
    const activas = PRO_TAREAS.filter((t) => t.estado === 'Activa').length;
    const totalEstudiantes = PRO_CLASES.reduce((s, c) => s + c.estudiantes, 0);

    const acciones =
      '<div class="card"><div class="card-title">Acciones Rápidas</div><div class="card-sub">Tareas y evaluaciones</div>' +
      '<div style="display:grid;gap:10px;margin-top:14px">' +
      '<button class="btn btn-primary" data-nav="tareas">' + ICONS.tareas + ' Crear Tarea</button>' +
      '<button class="btn btn-secondary" data-nav="examenes">' + ICONS.examenes + ' Nuevo Examen</button>' +
      '<button class="btn btn-outline" data-nav="clases">' + ICONS.estudiantes + ' Pasar Lista</button>' +
      '</div></div>';

    const anuncios = PRO_ANUNCIOS.slice(0, 2).map((a) =>
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.anuncios + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(a.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(a.destinatarios) + ' · ' + escapeHtml(a.fecha) + '</div></div>' +
      '<span class="badge badge-green">Publicado</span></div>'
    ).join('');

    const clases = PRO_CLASES.map((c) =>
      '<div class="card" style="padding:18px">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<div style="width:42px;height:42px;border-radius:10px;background:' + c.color + ';color:' + c.colorText + ';display:flex;align-items:center;justify-content:center;font-weight:700">' + ICONS.cursos + '</div>' +
      '<div><div class="dli-title">' + escapeHtml(c.materia) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.grado) + ' · Sección ' + escapeHtml(c.seccion) + '</div></div>' +
      '<div style="margin-left:auto;text-align:right"><div class="stat-value" style="font-size:20px">' + c.estudiantes + '</div><div class="dli-sub">estudiantes</div></div>' +
      '</div></div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">PROFESOR / DASHBOARD</div>' +
      '<h2>Bienvenido, ' + escapeHtml(nombreProfesor) + '</h2>' +
      '<div class="page-sub">Gestiona tus cursos y el progreso de tus estudiantes.</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' +
      '<div class="stat-card alt-gold"><div class="stat-label">Tareas por Calificar</div><div class="stat-value">' + porCalificar + '</div><div class="stat-foot">Revisa las entregas pendientes</div></div>' +
      '<div class="stat-card alt-green"><div class="stat-label">Exámenes Activos</div><div class="stat-value">2</div><div class="stat-foot">En curso esta semana</div></div>' +
      '<div class="stat-card"><div class="stat-label">Estudiantes a cargo</div><div class="stat-value">' + totalEstudiantes + '</div><div class="stat-foot">4 secciones</div></div>' +
      '<div class="stat-card alt-red"><div class="stat-label">Tareas Vencidas</div><div class="stat-value">' + PRO_TAREAS.filter((t) => t.estado === 'Vencida').length + '</div><div class="stat-foot"><span class="down">Requieren atención</span></div></div>' +
      '</div>' +

      '<div class="grid mt-3" style="grid-template-columns:1fr 0.9fr 1.1fr;align-items:start">' +
      acciones +
      '<div class="card"><div class="card-title">Anuncios Recientes</div><div class="card-sub">Publicados a tus clases</div>' +
      '<div style="margin-top:10px">' + anuncios + '</div></div>' +
      '<div class="card"><div class="card-title">Mis Clases</div><div class="card-sub">Resumen del ciclo</div>' +
      '<div style="margin-top:10px;display:grid;gap:12px">' + clases + '</div></div>' +
      '</div>';

    viewEl().querySelectorAll('[data-nav]').forEach((b) => {
      b.addEventListener('click', () => window.navigateDemo(b.dataset.nav));
    });
  }

  return { render: render };
})();