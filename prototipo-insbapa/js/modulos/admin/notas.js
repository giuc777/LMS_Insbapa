/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Notas (por grado y sección)
   ============================================================ */

const AdminNotas = (function () {
  const GRADOS = ['Primero Básico', 'Segundo Básico', 'Tercero Básico'];
  const SECCIONES_POR_GRADO = {
    'Primero Básico': ['A', 'B'],
    'Segundo Básico': ['A', 'B'],
    'Tercero Básico': ['A'],
  };
  let grado = 'Primero Básico';
  let seccion = 'A';

  function viewEl() { return document.getElementById('view'); }

  function render() {
    const detalle = ADMIN_NOTAS_DETALLE.find((d) => d.grado === grado && d.seccion === seccion) || ADMIN_NOTAS_DETALLE[0];
    const secciones = SECCIONES_POR_GRADO[grado] || ['A'];

    const tabsGrado = GRADOS.map((g) =>
      '<button class="tab' + (grado === g ? ' active' : '') + '" data-grado="' + g + '">' + g + '</button>'
    ).join('');

    const selSeccion = secciones.map((s) => opt(seccion, s, 'Sección ' + s)).join('');

    const statAprobacion = Math.round((detalle.aprobados / (detalle.aprobados + detalle.reprobados)) * 100);

    const rows = detalle.estudiantes.map((est, i) =>
      '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td><b>' + escapeHtml(est.nombre) + '</b></td>' +
      '<td>' + escapeHtml(est.carnet) + '</td>' +
      '<td>' + est.tarea1 + '</td>' +
      '<td>' + est.examen1 + '</td>' +
      '<td>' + est.tarea2 + '</td>' +
      '<td>' + est.proyecto + '</td>' +
      '<td>' + est.participacion + '</td>' +
      '<td><b>' + est.promedio.toFixed(1) + '</b></td>' +
      '<td>' + (est.promedio >= 60 ? '<span class="badge badge-green">Aprobado</span>' : '<span class="badge badge-red">Reprobado</span>') + '</td>' +
      '</tr>'
    ).join('');

    const promedioGeneral = (ADMIN_NOTAS.filter((n) => n.grado === grado)[0] || ADMIN_NOTAS[0]).promedio;

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / NOTAS</div>' +
      '<h2>Resumen de Notas</h2>' +
      '<div class="page-sub">Rendimiento académico por grado y sección — Ciclo 2026.</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">' +
      '<div class="stat-card alt-green"><div class="stat-label">Promedio general</div><div class="stat-value">' + promedioGeneral.toFixed(1) + '</div><div class="stat-foot"><span class="up">Ciclo 2026</span></div></div>' +
      '<div class="stat-card"><div class="stat-label">Estudiantes evaluados</div><div class="stat-value">' + ADMIN_NOTAS.reduce((s, n) => s + n.estudiantes, 0) + '</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Aprobados total</div><div class="stat-value">' + ADMIN_NOTAS.reduce((s, n) => s + n.aprobados, 0) + '</div></div>' +
      '<div class="stat-card alt-red"><div class="stat-label">Reprobados total</div><div class="stat-value">' + ADMIN_NOTAS.reduce((s, n) => s + n.reprobados, 0) + '</div></div>' +
      '</div>' +

      '<div class="flex-between" style="margin:20px 0 18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabsGrado + '</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<select class="form-control" id="filtroSeccion" style="width:auto">' + selSeccion + '</select>' +
      '<button class="btn btn-outline" data-reporte-seccion>' + ICONS.download + ' Reporte Sección</button>' +
      '</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-bottom:20px">' +
      '<div class="stat-card alt-green"><div class="stat-label">Promedio sección</div><div class="stat-value">' + detalle.promedio.toFixed(1) + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Estudiantes</div><div class="stat-value">' + (detalle.aprobados + detalle.reprobados) + '</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Aprobados</div><div class="stat-value">' + detalle.aprobados + '</div></div>' +
      '<div class="stat-card alt-red"><div class="stat-label">Reprobados</div><div class="stat-value">' + detalle.reprobados + '</div></div>' +
      '</div>' +

      '<div class="card"><div class="card-title">' + escapeHtml(grado) + ' · Sección ' + escapeHtml(seccion) + ' — Detalle de Calificaciones</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>No.</th><th>Estudiante</th><th>Carnet</th><th>Tarea 1</th><th>Examen 1</th><th>Tarea 2</th><th>Proyecto</th><th>Particip.</th><th>Promedio</th><th>Estado</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +

      '<div class="flex mt-3" style="justify-content:flex-end;gap:10px">' +
      '<button class="btn btn-outline" data-reporte>' + ICONS.download + ' Generar Reporte Final</button>' +
      '</div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => {
        grado = b.dataset.grado;
        seccion = SECCIONES_POR_GRADO[grado][0];
        render();
      });
    });
    document.getElementById('filtroSeccion').addEventListener('change', (e) => {
      seccion = e.target.value;
      render();
    });
    viewEl().querySelector('[data-reporte]').addEventListener('click', () => {
      showToast('Reporte final generado (demo).', 'success');
    });
    viewEl().querySelector('[data-reporte-seccion]').addEventListener('click', () => {
      showToast('Reporte de ' + grado + ' Sección ' + seccion + ' exportado (demo).', 'success');
    });
  }

  return { render: render };
})();
