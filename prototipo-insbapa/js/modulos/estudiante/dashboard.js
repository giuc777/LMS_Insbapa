/* ============================================================
   INSBAPA - Prototipo
   Portal Estudiante: Dashboard
   ============================================================ */

const EstudianteDashboard = (function () {
  function viewEl() { return document.getElementById('view'); }

  function badgeEstado(estado) {
    const map = {
      'Pendiente': 'badge-gold',
      'Vencida': 'badge-red',
      'Completada': 'badge-green',
      'Proximo': 'badge-primary',
      'Realizado': 'badge-gray',
    };
    return '<span class="badge ' + (map[estado] || 'badge-gray') + '">' + escapeHtml(estado) + '</span>';
  }

  function renderTareasPendientes() {
    const items = EST_TAREAS.filter((t) => t.estado !== 'Completada').slice(0, 2);
    const ex = EST_EXAMENES.find((x) => x.estado === 'Proximo');
    const list = items.map((t) =>
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:' + (t.estado === 'Vencida' ? 'var(--danger-soft)' : 'var(--warning-soft)') + ';color:' + (t.estado === 'Vencida' ? 'var(--danger)' : 'var(--warning)') + '">' + ICONS.tareas + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + (t.estado === 'Vencida' ? 'Tarea Vencida · ' : 'Tarea Urgente · ') + escapeHtml(t.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(t.cursoNombre) + '</div></div>' +
      '<div class="dli-right">' + badgeEstado(t.estado) + '<br>Vence ' + escapeHtml(t.fecha.toLowerCase()) + '</div>' +
      '</div>'
    ).join('') + (ex ?
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.examenes + '</div>' +
      '<div class="dli-body"><div class="dli-title">Examen Próximo · ' + escapeHtml(ex.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(ex.cursoNombre) + '</div></div>' +
      '<div class="dli-right">' + badgeEstado(ex.estado) + '<br>' + escapeHtml(ex.fecha) + '</div>' +
      '</div>' : '');
    return '<div class="card"><div class="card-title">Pendientes</div><div class="card-sub">Tareas y exámenes por vencer</div>' +
      '<div style="margin-top:12px">' + list +
      '<button class="btn btn-outline btn-sm mt-2" data-nav="tareas">Ver todas las tareas</button>' +
      '</div></div>';
  }

  function renderInfoAcademica() {
    return (
      '<div class="card"><div class="card-title">Info Académica</div><div class="card-sub">Ciclo 2024 · Egreso 2027</div>' +
      '<div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      '<div class="stat-card"><div class="stat-label">Cursos actuales</div><div class="stat-value">' + EST_CURSOS.length + '</div></div>' +
      '<div class="stat-card alt-green"><div class="stat-label">Bloque Actual</div><div class="stat-value" style="font-size:22px;line-height:1.2">2do Bloque</div><div class="stat-foot">Ago - Nov 2024</div></div>' +
      '</div>' +
      '<button class="btn btn-outline btn-sm mt-2" data-nav="notas">Calificaciones por bloque</button>' +
      '</div>'
    );
  }

  function renderAnunciosRecientes() {
    const items = EST_ANUNCIOS.slice(0, 2);
    const list = items.map((a) =>
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:var(--surface-soft);color:var(--muted)">' + ICONS.anuncios + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(a.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(a.categoria) + ' · ' + escapeHtml(a.fecha) + '</div></div>' +
      '</div>'
    ).join('');
    return '<div class="card"><div class="card-title">Anuncios Recientes</div><div class="card-sub">Comunidad INSBAPA</div>' +
      '<div style="margin-top:12px">' + list + '</div></div>';
  }

  function renderMisCursos() {
    const cards = EST_CURSOS.map((c) =>
      '<div class="card" style="padding:18px">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<div style="width:42px;height:42px;border-radius:10px;background:' + c.color + ';color:' + c.colorText + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">' + escapeHtml(c.codigo.slice(0, 4)) + '</div>' +
      '<div style="min-width:0"><div class="dli-title">' + escapeHtml(c.nombre) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(c.profesor) + '</div></div></div>' +
      '<div style="margin-top:12px"><div class="flex-between"><span class="dli-sub">Progreso</span><span class="dli-sub" style="font-weight:600">' + c.progreso + '%</span></div>' +
      '<div style="height:8px;background:var(--surface-soft);border-radius:999px;margin-top:6px;overflow:hidden">' +
      '<div style="height:100%;width:' + c.progreso + '%;background:var(--primary);border-radius:999px"></div></div></div>' +
      '<button class="btn btn-outline btn-sm mt-2" data-ver-curso="' + c.id + '">Ver curso</button>' +
      '</div>'
    ).join('');
    return '<div class="card"><div class="card-title">Mis Cursos</div><div class="card-sub">Periodo actual</div>' +
      '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">' + cards + '</div></div>';
  }

  function render() {
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<div class="crumb">ESTUDIANTE / DASHBOARD</div>' +
      '<h2>Bienvenido de nuevo a tus clases.</h2>' +
      '<div class="page-sub">Este es tu resumen académico del día.</div>' +
      '</div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">' +
      '<div class="stat-card alt-green"><div class="stat-label">Tareas por entregar</div><div class="stat-value">' + EST_TAREAS.filter((t) => t.estado === 'Pendiente').length + '</div><div class="stat-foot"><span class="down" style="color:var(--warning)">' + EST_TAREAS.filter((t) => t.estado === 'Vencida').length + ' vencidas</span></div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Exámenes próximos</div><div class="stat-value">' + EST_EXAMENES.filter((x) => x.estado === 'Proximo').length + '</div><div class="stat-foot">Ven pronto</div></div>' +
      '<div class="stat-card"><div class="stat-label">Promedio general</div><div class="stat-value">' + (Math.round(EST_NOTAS.reduce((s, n) => s + n.promedio, 0) / EST_NOTAS.length * 100) / 100) + '</div><div class="stat-foot"><span class="up">Muy bueno</span></div></div>' +
      '</div>' +

      '<div class="grid mt-3" style="grid-template-columns:1.4fr 0.9fr;align-items:start">' +
      '<div>' + renderTareasPendientes() + '</div>' +
      '<div style="display:grid;gap:20px">' + renderInfoAcademica() + renderAnunciosRecientes() + '</div>' +
      '</div>' +

      '<div class="mt-3">' + renderMisCursos() + '</div>';

    viewEl().querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => window.navigateDemo(btn.dataset.nav));
    });
    viewEl().querySelectorAll('[data-ver-curso]').forEach((btn) => {
      btn.addEventListener('click', () => EstudianteCursos.verCurso(btn.dataset.verCurso));
    });
  }

  return { render: render, badgeEstado: badgeEstado };
})();