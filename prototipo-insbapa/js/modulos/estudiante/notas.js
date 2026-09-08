/* ============================================================
   INSBAPA - Prototipo
   Portal Estudiante: Notas (calificaciones por bloque)
   ============================================================ */

const EstudianteNotas = (function () {
  const BLOQUES = ['Primer Bloque', 'Segundo Bloque'];
  let bloque = 'Segundo Bloque';

  function viewEl() { return document.getElementById('view'); }

  function render() {
    const tabs = BLOQUES.map((b) =>
      '<button class="tab' + (bloque === b ? ' active' : '') + '" data-bloque="' + b + '">' + b + '</button>'
    ).join('');

    const rows = EST_NOTAS.map((n) =>
      '<tr>' +
      '<td><b>' + escapeHtml(n.cursoNombre) + '</b></td>' +
      '<td>' + n.tarea1 + '</td>' +
      '<td>' + n.examen1 + '</td>' +
      '<td>' + n.tarea2 + '</td>' +
      '<td>' + n.proyecto + '</td>' +
      '<td>' + n.participacion + '</td>' +
      '<td><b>' + n.promedio.toFixed(1) + '</b></td>' +
      '<td>' + (n.promedio >= 60 ? '<span class="badge badge-green">Aprobado</span>' : '<span class="badge badge-red">Reprobado</span>') + '</td>' +
      '</tr>'
    ).join('');

    const promedio = Math.round((EST_NOTAS.reduce((s, n) => s + n.promedio, 0) / EST_NOTAS.length) * 10) / 10;

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ESTUDIANTE / NOTAS</div>' +
      '<h2>Mis Calificaciones</h2>' +
      '<div class="page-sub">Ciclo Escolar 2024 · Egreso 2027</div></div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabs + '</div>' +
      '<div style="display:flex;gap:10px">' +
      '<div class="stat-card" style="padding:10px 16px"><div class="stat-label">Promedio</div><div class="stat-value" style="font-size:20px">' + promedio.toFixed(1) + '</div></div>' +
      '<button class="btn btn-outline" data-reporte>' + ICONS.download + ' Descargar Reporte</button>' +
      '</div></div>' +

      '<div class="card"><div class="card-title">Calificaciones por Materia · ' + escapeHtml(bloque) + '</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Materia</th><th>Tarea 1</th><th>Examen 1</th><th>Tarea 2</th><th>Proyecto</th><th>Participación</th><th>Promedio</th><th>Estado</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { bloque = b.dataset.bloque; render(); });
    });
    viewEl().querySelector('[data-reporte]').addEventListener('click', () => {
      showToast('Reporte de calificaciones generado (demo).', 'success');
    });
  }

  return { render: render };
})();