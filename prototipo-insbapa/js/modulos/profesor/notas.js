/* ============================================================
   INSBAPA - Prototipo
   Portal Profesores: Notas (tabla editable)
   ============================================================ */

const ProfesorNotas = (function () {
  const BLOQUES = ['Primer Bloque', 'Segundo Bloque'];
  const GRADOS = ['Primero Básico', 'Segundo Básico', 'Tercero Básico'];
  let bloque = 'Segundo Bloque';
  let grado = 'Primero Básico';

  function viewEl() { return document.getElementById('view'); }

  const ESTUDIANTES = [
    ['01', 'Juan Pérez'], ['02', 'Ana Castillo'], ['03', 'Luis Herrera'],
    ['04', 'María Fernanda López'], ['05', 'Pedro Ramírez'], ['06', 'Sofía Morales'],
  ];
  const NOTAS_SEED = [
    [88, 92, 85, 90, 88], [85, 80, 90, 86, 82], [78, 85, 88, 80, 84],
    [92, 95, 88, 91, 93], [70, 75, 72, 78, 74], [90, 88, 92, 87, 89],
  ];

  function render() {
    const tabsBloque = BLOQUES.map((b) =>
      '<button class="tab' + (bloque === b ? ' active' : '') + '" data-bloque="' + b + '">' + b + '</button>'
    ).join('');
    const selGrado = GRADOS.map((g) => opt(grado, g, g)).join('');

    const rows = ESTUDIANTES.map(([no, nombre], i) => {
      const n = NOTAS_SEED[i];
      const total = n.reduce((s, x) => s + x, 0) / n.length;
      const cols = n.map((v, j) =>
        '<td><input class="form-control nota-input" type="number" min="0" max="100" style="width:70px" value="' + v + '" data-nota="' + i + '-' + j + '"></td>'
      ).join('');
      return '<tr>' +
        '<td>' + no + '</td>' +
        '<td><b>' + escapeHtml(nombre) + '</b></td>' +
        cols +
        '<td><b class="nota-prom" data-prom="' + i + '">' + total.toFixed(1) + '</b></td>' +
        '<td>' + (total >= 60 ? '<span class="badge badge-green">Aprobado</span>' : '<span class="badge badge-red">Reprobado</span>') + '</td>' +
        '</tr>';
    }).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">PROFESOR / NOTAS</div>' +
      '<h2>Gestión de Notas</h2>' +
      '<div class="page-sub">Registra las calificaciones de tus estudiantes.</div></div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabsBloque + '</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<select class="form-control" id="filtroGrado" style="width:auto">' + selGrado + '</select>' +
      '<button class="btn btn-outline" data-exportar>' + ICONS.download + ' Exportar Reporte</button>' +
      '</div></div>' +

      '<div class="card"><div class="card-title">Matemáticas I · ' + escapeHtml(grado) + ' · ' + escapeHtml(bloque) + '</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>No.</th><th>Estudiante</th><th>Tarea 1</th><th>Examen 1</th><th>Tarea 2</th><th>Proyecto</th><th>Particip.</th><th>Total</th><th>Estado</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div class="flex" style="justify-content:flex-end;margin-top:16px">' +
      '<button class="btn btn-primary" data-guardar>' + ICONS.check + ' Guardar Cambios</button>' +
      '</div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { bloque = b.dataset.bloque; render(); });
    });
    document.getElementById('filtroGrado').addEventListener('change', (e) => {
      grado = e.target.value;
      render();
    });
    viewEl().querySelector('[data-exportar]').addEventListener('click', () => {
      showToast('Reporte de notas exportado (demo).', 'success');
    });

    /* Recalcular total en vivo */
    viewEl().querySelectorAll('.nota-input').forEach((inp) => {
      inp.addEventListener('input', () => {
        const [rowIdx] = inp.dataset.nota.split('-');
        const rowInputs = viewEl().querySelectorAll('[data-nota^="' + rowIdx + '-"]');
        let sum = 0;
        rowInputs.forEach((ri) => { sum += Number(ri.value) || 0; });
        const prom = sum / rowInputs.length;
        const el = viewEl().querySelector('[data-prom="' + rowIdx + '"]');
        if (el) el.textContent = prom.toFixed(1);
      });
    });

    viewEl().querySelector('[data-guardar]').addEventListener('click', () => {
      showToast('Notas guardadas correctamente.', 'success');
    });
  }

  return { render: render };
})();