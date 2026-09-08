/* ============================================================
   INSBAPA - Prototipo
   Portal Profesores: Gestión de Tareas
   (lista + crear tarea + calificar entregas)
   ============================================================ */

const ProfesorTareas = (function () {
  const BLOQUES = ['Primer Bloque', 'Segundo Bloque'];
  let bloque = 'Segundo Bloque';
  let vista = 'lista'; // lista | nueva | calificar

  function viewEl() { return document.getElementById('view'); }

  function render() {
    const stats =
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:20px">' +
      '<div class="stat-card alt-green"><div class="stat-label">Activas</div><div class="stat-value">' + PRO_TAREAS.filter((t) => t.estado === 'Activa').length + '</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Por Calificar</div><div class="stat-value">' + PRO_TAREAS.filter((t) => t.estado === 'Por Calificar').length + '</div></div>' +
      '<div class="stat-card alt-red"><div class="stat-label">Vencidas</div><div class="stat-value">' + PRO_TAREAS.filter((t) => t.estado === 'Vencida').length + '</div></div>' +
      '</div>';

    const rows = PRO_TAREAS.map((t) =>
      '<tr>' +
      '<td><b>' + escapeHtml(t.titulo) + '</b></td>' +
      '<td>' + escapeHtml(t.grado) + ' · ' + escapeHtml(t.seccion) + '</td>' +
      '<td>' + escapeHtml(t.fechaLimite) + '</td>' +
      '<td>' + t.entregadas + ' / ' + t.total + '</td>' +
      '<td><span class="badge ' + t.color + '">' + escapeHtml(t.estado) + '</span></td>' +
      '<td>' +
      (t.estado === 'Por Calificar'
        ? '<button class="btn btn-primary btn-sm" data-calificar="' + t.id + '">Calificar</button>'
        : '<button class="btn btn-outline btn-sm" data-editar="' + t.id + '">Ver</button>') +
      '</td></tr>'
    ).join('');

    const tabs = BLOQUES.map((b) =>
      '<button class="tab' + (bloque === b ? ' active' : '') + '" data-bloque="' + b + '">' + b + '</button>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">PROFESOR / TAREAS</div>' +
      '<h2>Gestión de Tareas</h2>' +
      '<div class="page-sub">Define los objetivos y criterios de evaluación para tus estudiantes.</div></div>' +

      stats +
      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabs + '</div>' +
      '<button class="btn btn-primary" data-nueva>' + ICONS.tareas + ' Crear Tarea</button>' +
      '</div>' +

      '<div class="card"><div class="card-title">Tareas · ' + escapeHtml(bloque) + '</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Tarea</th><th>Grado/Sección</th><th>Fecha Límite</th><th>Entregas</th><th>Estado</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { bloque = b.dataset.bloque; render(); });
    });
    viewEl().querySelector('[data-nueva]').addEventListener('click', nuevaTarea);
    viewEl().querySelectorAll('[data-calificar]').forEach((b) => {
      b.addEventListener('click', () => calificar(b.dataset.calificar));
    });
    viewEl().querySelectorAll('[data-editar]').forEach((b) => {
      b.addEventListener('click', () => verTarea(b.dataset.editar));
    });
  }

  /* ---------- Nueva tarea (formulario) ---------- */
  function nuevaTarea() {
    const grados = PRO_CLASES.map((c) =>
      '<option value="' + c.grado + ' · ' + c.seccion + '">' + c.grado + ' · Sección ' + c.seccion + '</option>'
    ).join('');
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Tareas</button>' +
      '<div class="crumb mt-2">TAREAS / NUEVA TAREA</div>' +
      '<h2>Crear Tarea</h2>' +
      '<div class="page-sub">Los estudiantes serán notificados al publicar.</div></div>' +

      '<div class="card" style="max-width:720px">' +
      '<form id="formNuevaTarea" novalidate>' +
      '<div class="form-group"><label for="ntTitulo">Título de la tarea</label>' +
      '<input class="form-control" id="ntTitulo" placeholder="Ej. Práctica de ecuaciones lineales"></div>' +
      '<div class="form-group"><label for="ntInstrucciones">Instrucciones</label>' +
      '<textarea class="form-control" id="ntInstrucciones" rows="5" placeholder="Describe qué deben hacer los estudiantes..."></textarea></div>' +
      '<div class="form-group"><label for="ntMaterial">Subir material (opcional)</label>' +
      '<input class="form-control" id="ntMaterial" type="file"></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="form-group"><label for="ntClase">Grado / Sección</label>' +
      '<select class="form-control" id="ntClase">' + grados + '</select></div>' +
      '<div class="form-group"><label for="ntMateria">Materia</label>' +
      '<select class="form-control" id="ntMateria">' +
      '<option>Matemáticas I</option><option>Matemáticas II</option><option>Matemáticas III</option>' +
      '</select></div>' +
      '<div class="form-group"><label for="ntFecha">Fecha límite</label>' +
      '<input class="form-control" id="ntFecha" type="date" value="2026-08-20"></div>' +
      '<div class="form-group"><label for="ntPunteo">Punteo (pts)</label>' +
      '<input class="form-control" id="ntPunteo" type="number" min="1" max="100" value="15"></div>' +
      '</div>' +
      '<div class="flex" style="justify-content:flex-end;gap:10px;margin-top:8px">' +
      '<button class="btn btn-outline" type="button" data-borrador>Guardar Borrador</button>' +
      '<button class="btn btn-primary" type="submit">' + ICONS.check + ' Publicar Tarea</button>' +
      '</div>' +
      '</form></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => { vista = 'lista'; render(); });
    viewEl().querySelector('[data-borrador]').addEventListener('click', () => {
      showToast('Borrador guardado (demo).', 'info');
      vista = 'lista'; render();
    });
    document.getElementById('formNuevaTarea').addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('ntTitulo').value.trim();
      if (!titulo) {
        showToast('El título es obligatorio.', 'warning');
        return;
      }
      showToast('Tarea publicada correctamente.', 'success');
      vista = 'lista'; render();
    });
  }

  /* ---------- Calificación de entregas ---------- */
  function calificar(id) {
    const t = PRO_TAREAS.find((x) => x.id === id) || PRO_TAREAS[0];
    const rows = PRO_ENTREGAS.map((ent) =>
      '<tr>' +
      '<td><b>' + escapeHtml(ent.estudiante) + '</b></td>' +
      '<td>' + (ent.estado === 'Entregado' ? '<span class="badge badge-green">Entregado</span>' : '<span class="badge badge-red">Pendiente</span>') + '</td>' +
      '<td>' + (ent.archivo ? '<a href="#" data-descargar>' + escapeHtml(ent.archivo) + '</a>' : '—') + '</td>' +
      '<td><input class="form-control" type="number" min="0" max="100" style="width:80px" value="' + (ent.puntaje || '') + '" placeholder="Puntaje"></td>' +
      '<td><button class="btn btn-primary btn-sm" data-guardar>' + ICONS.check + ' Guardar</button></td>' +
      '</tr>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Tareas</button>' +
      '<div class="crumb mt-2">TAREAS / CALIFICAR</div>' +
      '<h2>' + escapeHtml(t.titulo) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(t.grado) + ' · Sección ' + escapeHtml(t.seccion) + ' · ' + t.entregadas + ' entregas</div></div>' +

      '<div class="card"><div class="card-title">Entregas de estudiantes</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Estudiante</th><th>Estado</th><th>Archivo</th><th>Puntaje</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div class="flex" style="justify-content:flex-end;margin-top:16px">' +
      '<button class="btn btn-primary" data-guardar-todo>' + ICONS.check + ' Guardar Todos los Cambios</button>' +
      '</div></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => { vista = 'lista'; render(); });
    viewEl().querySelectorAll('[data-descargar]').forEach((a) => {
      a.addEventListener('click', (e) => { e.preventDefault(); showToast('Descarga iniciada (demo).', 'info'); });
    });
    viewEl().querySelectorAll('[data-guardar]').forEach((b) => {
      b.addEventListener('click', () => showToast('Puntaje guardado.', 'success'));
    });
    viewEl().querySelector('[data-guardar-todo]').addEventListener('click', () => {
      showToast('Calificaciones actualizadas.', 'success');
      vista = 'lista'; render();
    });
  }

  /* ---------- Ver tarea (profesor) ---------- */
  function verTarea(id) {
    const t = PRO_TAREAS.find((x) => x.id === id) || PRO_TAREAS[0];
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Tareas</button>' +
      '<div class="crumb mt-2">TAREAS / DETALLE</div>' +
      '<h2>' + escapeHtml(t.titulo) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(t.grado) + ' · Sección ' + escapeHtml(t.seccion) + '</div></div>' +

      '<div class="grid" style="grid-template-columns:1.2fr 0.8fr;align-items:start">' +
      '<div class="card"><div class="card-title">Instrucciones</div>' +
      '<p style="line-height:1.7;margin-top:10px">Resuelve todos los ejercicios mostrando el procedimiento completo. La tarea corresponde al contenido del bloque actual.</p>' +
      '<div class="mt-3" style="display:flex;gap:10px">' +
      '<button class="btn btn-primary" data-editar>Editar Tarea</button>' +
      '<button class="btn btn-outline" data-ver-entregas>Ver Entregas</button>' +
      '</div></div>' +
      '<div class="card"><div class="card-title">Resumen de Entregas</div>' +
      '<div class="stat-value" style="font-size:30px">' + t.entregadas + ' <span style="font-size:16px;color:var(--muted)">/ ' + t.total + '</span></div>' +
      '<div class="dli-sub">' + Math.round((t.entregadas / t.total) * 100) + '% de participación</div>' +
      '<button class="btn btn-secondary btn-sm mt-2" data-calificar-ahora>' + ICONS.tareas + ' Calificar Ahora</button>' +
      '</div></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => { vista = 'lista'; render(); });
    viewEl().querySelector('[data-editar]').addEventListener('click', nuevaTarea);
    viewEl().querySelector('[data-ver-entregas]').addEventListener('click', () => calificar(t.id));
    viewEl().querySelector('[data-calificar-ahora]').addEventListener('click', () => calificar(t.id));
  }

  return { render: render };
})();