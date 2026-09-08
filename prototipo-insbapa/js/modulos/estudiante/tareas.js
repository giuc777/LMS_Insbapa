/* ============================================================
   INSBAPA - Prototipo
   Portal Estudiante: Tareas (Pendientes/Completadas/Vencidas)
   y Detalle de Tarea con entrega (drag & drop simulado)
   ============================================================ */

const EstudianteTareas = (function () {
  const TABS = ['Pendientes', 'Completadas', 'Vencidas'];
  const ESTADO_MAP = { 'Pendientes': 'Pendiente', 'Completadas': 'Completada', 'Vencidas': 'Vencida' };
  let tab = 'Pendientes';

  function viewEl() { return document.getElementById('view'); }

  function render() {
    const filtered = EST_TAREAS.filter((t) => t.estado === ESTADO_MAP[tab]);
    const tabs = TABS.map((t) =>
      '<button class="tab' + (tab === t ? ' active' : '') + '" data-tab="' + t + '">' + t + '</button>'
    ).join('');

    const items = filtered.map((t) =>
      '<div class="dash-list-item" style="cursor:pointer" data-tarea="' + t.id + '">' +
      '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.tareas + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(t.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(t.cursoNombre) + ' · Vence ' + escapeHtml(t.fechaLimite) + '</div></div>' +
      '<div style="text-align:right">' + EstudianteDashboard.badgeEstado(t.estado) +
      (t.estado === 'Completada' ? '<div class="dli-sub" style="margin-top:4px">Nota: <b>' + (t.entregaNota || '-') + '</b></div>' : '') +
      '</div>' +
      '</div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ESTUDIANTE / TAREAS</div>' +
      '<h2>Mis Tareas</h2>' +
      '<div class="page-sub">Consulta el estado de tus entregas.</div></div>' +
      '<div class="tabs">' + tabs + '</div>' +
      '<div class="card"><div style="margin-top:0">' +
      (items || '<p class="muted">No hay tareas en esta categoría.</p>') +
      '</div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { tab = b.dataset.tab; render(); });
    });
    viewEl().querySelectorAll('[data-tarea]').forEach((el) => {
      el.addEventListener('click', () => verDetalle(el.dataset.tarea));
    });
  }

  function verDetalle(id) {
    const t = EST_TAREAS.find((x) => x.id === id);
    if (!t) return;
    const recursos = (t.recursos || []).map((r) =>
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:var(--surface-soft);color:var(--muted)">' + ICONS.file + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(r) + '</div></div>' +
      '<button class="btn btn-outline btn-sm" data-recurso>Descargar</button></div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Tareas</button>' +
      '<div class="crumb mt-2">TAREAS / DETALLE</div>' +
      '<h2>' + escapeHtml(t.titulo) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(t.cursoNombre) + ' · Peso ' + t.peso + '% · Vence ' + escapeHtml(t.fechaLimite) + '</div></div>' +

      '<div class="grid" style="grid-template-columns:1.2fr 0.8fr;align-items:start">' +
      '<div>' +
      '<div class="card"><div class="card-title">Instrucciones</div>' +
      '<p style="line-height:1.7;margin-top:10px">' + escapeHtml(t.instrucciones) + '</p></div>' +
      '<div class="card mt-3"><div class="card-title">Recursos y Materiales</div>' +
      '<div style="margin-top:10px">' + (recursos || '<p class="muted">Sin recursos adjuntos.</p>') + '</div></div>' +
      '</div>' +
      '<div>' +
      '<div class="card"><div class="card-title">Mi Entrega</div>' +
      '<div class="card-sub">Adjunta tu archivo para enviar la tarea.</div>' +
      '<div style="margin-top:14px;border:2px dashed var(--border);border-radius:var(--radius);padding:26px;text-align:center;cursor:pointer" id="dropZona">' +
      '<div style="font-size:34px;color:var(--primary)">' + ICONS.upload + '</div>' +
      '<p style="font-weight:600;color:var(--ink);margin-top:8px">Arrastra tu archivo aquí</p>' +
      '<p class="muted" style="font-size:13px">o haz clic para seleccionar · PDF, DOCX, JPG · máx 10 MB</p>' +
      '<div id="archivoSeleccionado" style="display:none;margin-top:10px;padding:10px;background:var(--primary-soft);border-radius:var(--radius-sm)"></div>' +
      '</div>' +
      '<input type="file" id="inputArchivo" style="display:none">' +
      '<button class="btn btn-primary btn-block mt-2" data-enviar ' + (t.estado === 'Completada' ? 'disabled' : '') + '>' +
      (t.estado === 'Completada' ? 'Entrega finalizada' : 'Enviar Tarea') + '</button>' +
      (t.estado === 'Completada' ? '<p class="muted mt-2" style="font-size:13px">Tu entrega fue calificada con <b>' + t.entregaNota + '</b>.</p>' : '') +
      '</div></div>' +
      '</div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', render);
    viewEl().querySelectorAll('[data-recurso]').forEach((b) => {
      b.addEventListener('click', () => showToast('Descarga iniciada (demo).', 'info'));
    });

    const zona = document.getElementById('dropZona');
    const input = document.getElementById('inputArchivo');
    const sel = document.getElementById('archivoSeleccionado');
    zona.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      if (input.files[0]) mostrarArchivo(input.files[0].name);
    });
    zona.addEventListener('dragover', (e) => { e.preventDefault(); zona.style.borderColor = 'var(--primary)'; });
    zona.addEventListener('dragleave', () => { zona.style.borderColor = 'var(--border)'; });
    zona.addEventListener('drop', (e) => {
      e.preventDefault();
      zona.style.borderColor = 'var(--border)';
      if (e.dataTransfer.files[0]) mostrarArchivo(e.dataTransfer.files[0].name);
    });

    function mostrarArchivo(nombre) {
      sel.textContent = '📎 ' + escapeHtml(nombre);
      sel.style.display = 'block';
      showToast('Archivo adjuntado: ' + nombre, 'success');
    }

    const enviar = viewEl().querySelector('[data-enviar]');
    if (enviar) {
      enviar.addEventListener('click', () => {
        if (!input.files[0]) {
          showToast('Adjunta un archivo antes de enviar.', 'warning');
          return;
        }
        showToast('Tarea enviada correctamente.', 'success');
        enviar.disabled = true;
        enviar.textContent = 'Enviado';
      });
    }
  }

  return { render: render, verDetalle: verDetalle };
})();