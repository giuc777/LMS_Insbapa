/* ============================================================
   INSBAPA - Prototipo
   Portal Profesores: Gestión de Exámenes
   (lista + crear + editor de preguntas + vista previa + resultados)
   ============================================================ */

const ProfesorExamenes = (function () {
  let tab = 'Próximos';
  let vista = 'lista'; // lista | nueva | editarPreguntas | editarPregunta | preview | resultados
  let examenActual = null;
  let preguntaEditando = null;
  let preguntasLocal = [];
  let nextId = 100;
  let _clickForaneoEditor = null;

  function viewEl() { return document.getElementById('view'); }

  /* ============================================================
     LISTA DE EXÁMENES
     ============================================================ */
  function render() {
    vista = 'lista';
    if (_clickForaneoEditor) { document.removeEventListener('click', _clickForaneoEditor); _clickForaneoEditor = null; }
    const proximos = PRO_EXAMENES.filter((e) => e.estado === 'Próximo');
    const finalizados = PRO_EXAMENES.filter((e) => e.estado === 'Finalizado');
    const items = tab === 'Próximos' ? proximos : finalizados;

    const tabs =
      '<button class="tab' + (tab === 'Próximos' ? ' active' : '') + '" data-tab="Próximos">Próximos (' + proximos.length + ')</button>' +
      '<button class="tab' + (tab === 'Finalizados' ? ' active' : '') + '" data-tab="Finalizados">Finalizados (' + finalizados.length + ')</button>';

    const rows = items.map((e) => {
      const preguntasGuardadas = (PRO_EXAMEN_PREGUNTAS[e.id] || []).length;
      return '<tr>' +
      '<td><b>' + escapeHtml(e.titulo) + '</b></td>' +
      '<td>' + escapeHtml(e.grado) + ' · ' + escapeHtml(e.seccion) + '</td>' +
      '<td>' + escapeHtml(e.materia) + '</td>' +
      '<td>' + e.duracion + ' min</td>' +
      '<td>' + escapeHtml(e.fecha) + '</td>' +
      '<td><span class="badge ' + (e.estado === 'Próximo' ? 'badge-primary' : 'badge-green') + '">' + escapeHtml(e.estado) + '</span></td>' +
      '<td>' +
      (e.estado === 'Finalizado'
        ? '<button class="btn btn-primary btn-sm" data-resultados="' + e.id + '">' + ICONS.notas + ' Resultados</button>'
        : '<button class="btn btn-outline btn-sm" data-editar-preguntas="' + e.id + '">' + ICONS.edit + ' Editor</button> ') +
      '</td></tr>';
    }).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">PROFESOR / EXÁMENES</div>' +
      '<h2>Gestión de Exámenes</h2>' +
      '<div class="page-sub">Crea y administra evaluaciones para tus cursos.</div></div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabs + '</div>' +
      '<button class="btn btn-primary" data-nuevo-examen>' + ICONS.examenes + ' Crear Examen</button>' +
      '</div>' +

      '<div class="card"><div class="card-title">Exámenes · ' + escapeHtml(tab) + '</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Examen</th><th>Grado/Sección</th><th>Materia</th><th>Duración</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="7" class="muted">No hay exámenes en esta categoría.</td></tr>') + '</tbody>' +
      '</table></div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { tab = b.dataset.tab; render(); });
    });
    viewEl().querySelector('[data-nuevo-examen]').addEventListener('click', nuevoExamen);
    viewEl().querySelectorAll('[data-resultados]').forEach((b) => {
      b.addEventListener('click', () => verResultados(b.dataset.resultados));
    });
    viewEl().querySelectorAll('[data-editar-preguntas]').forEach((b) => {
      b.addEventListener('click', () => editarPreguntas(b.dataset.editarPreguntas));
    });
  }

  /* ============================================================
     CREAR EXAMEN (metadata)
     ============================================================ */
  function nuevoExamen() {
    vista = 'nueva';
    const grados = PRO_CLASES.map((c) =>
      '<option value="' + c.grado + ' · ' + c.seccion + '">' + c.grado + ' · Sección ' + c.seccion + '</option>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Exámenes</button>' +
      '<div class="crumb mt-2">EXÁMENES / NUEVO EXAMEN</div>' +
      '<h2>Crear Examen</h2>' +
      '<div class="page-sub">Paso 1: Configura los datos generales. Luego agregarás las preguntas.</div></div>' +

      '<div class="card" style="max-width:720px">' +
      '<form id="formNuevoExamen" novalidate>' +
      '<div class="form-group"><label for="neTitulo">Título del examen</label>' +
      '<input class="form-control" id="neTitulo" placeholder="Ej. Examen Parcial: Álgebra"></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="form-group"><label for="neClase">Grado / Sección</label>' +
      '<select class="form-control" id="neClase">' + grados + '</select></div>' +
      '<div class="form-group"><label for="neMateria">Materia</label>' +
      '<select class="form-control" id="neMateria">' +
      '<option>Matemáticas I</option><option>Matemáticas II</option><option>Matemáticas III</option>' +
      '</select></div>' +
      '<div class="form-group"><label for="neDuracion">Duración (minutos)</label>' +
      '<input class="form-control" id="neDuracion" type="number" min="10" max="180" value="45"></div>' +
      '<div class="form-group"><label for="neFecha">Fecha programada</label>' +
      '<input class="form-control" id="neFecha" type="date" value="2026-08-25"></div>' +
      '<div class="form-group"><label for="neTipo">Tipo de preguntas</label>' +
      '<select class="form-control" id="neTipo">' +
      '<option>Opción múltiple</option><option>Desarrollo</option><option>Mixto</option>' +
      '</select></div>' +
      '<div class="form-group"><label for="nePuntaje">Puntaje total</label>' +
      '<input class="form-control" id="nePuntaje" type="number" min="1" max="100" value="100"></div>' +
      '</div>' +
      '<div class="flex" style="justify-content:flex-end;gap:10px;margin-top:8px">' +
      '<button class="btn btn-outline" type="button" data-volver>Cancelar</button>' +
      '<button class="btn btn-primary" type="submit">' + ICONS.check + ' Crear y Agregar Preguntas</button>' +
      '</div>' +
      '</form></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => render());
    document.getElementById('formNuevoExamen').addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('neTitulo').value.trim();
      if (!titulo) { showToast('El título es obligatorio.', 'warning'); return; }
      const claseVal = document.getElementById('neClase').value;
      const partes = claseVal.split(' · ');
      const nuevoId = 'PEX-' + String(PRO_EXAMENES.length + 1).padStart(2, '0');
      const nuevoExamen = {
        id: nuevoId, titulo: titulo, grado: partes[0], seccion: partes[1],
        materia: document.getElementById('neMateria').value,
        duracion: parseInt(document.getElementById('neDuracion').value) || 45,
        fecha: document.getElementById('neFecha').value, estado: 'Próximo',
        preguntas: 0, tipo: document.getElementById('neTipo').value,
        puntaje: parseInt(document.getElementById('nePuntaje').value) || 100,
      };
      PRO_EXAMENES.push(nuevoId);
      PRO_EXAMENES[PRO_EXAMENES.length - 1] = nuevoExamen;
      PRO_EXAMEN_PREGUNTAS[nuevoId] = [];
      showToast('Examen creado. Ahora agrega las preguntas.', 'success');
      editarPreguntas(nuevoId);
    });
  }

  /* ============================================================
     EDITOR DE PREGUNTAS
     ============================================================ */
  function editarPreguntas(examenId) {
    const examen = PRO_EXAMENES.find((e) => e.id === examenId);
    if (!examen) return showToast('Examen no encontrado.', 'error');
    examenActual = examen;
    vista = 'editarPreguntas';

    if (!PRO_EXAMEN_PREGUNTAS[examenId]) PRO_EXAMEN_PREGUNTAS[examenId] = [];
    preguntasLocal = PRO_EXAMEN_PREGUNTAS[examenId].map(function (p) {
      return { id: p.id, tipo: p.tipo, texto: p.texto, opciones: p.opciones.slice(), correcta: p.correcta, puntos: p.puntos };
    });
    nextId = preguntasLocal.length > 0 ? Math.max.apply(null, preguntasLocal.map(function (p) { return p.id; })) + 1 : 1;

    renderEditor();
  }

  function renderEditor() {
    const totalPuntos = preguntasLocal.reduce(function (s, p) { return s + p.puntos; }, 0);
    const countOpcion = preguntasLocal.filter(function (p) { return p.tipo === 'opcion'; }).length;
    const countDesarrollo = preguntasLocal.filter(function (p) { return p.tipo === 'desarrollo'; }).length;
    const countArchivo = preguntasLocal.filter(function (p) { return p.tipo === 'archivo'; }).length;

    const preguntasHtml = preguntasLocal.map(function (p, i) {
      const tipoLabel = p.tipo === 'opcion' ? 'Opción múltiple' : p.tipo === 'desarrollo' ? 'Desarrollo' : 'Archivo';
      const tipoColor = p.tipo === 'opcion' ? 'badge-primary' : p.tipo === 'desarrollo' ? 'badge-gold' : 'badge-purple';
      let detalle = '';
      if (p.tipo === 'opcion') {
        detalle = '<div style="display:grid;gap:4px;margin-top:6px">' +
          p.opciones.map(function (op, oi) {
            return '<div style="display:flex;align-items:center;gap:8px;font-size:14px">' +
              '<span style="width:18px;height:18px;border-radius:50%;border:2px solid ' + (p.correcta === oi ? 'var(--primary)' : 'var(--border)') + ';background:' + (p.correcta === oi ? 'var(--primary)' : 'transparent') + ';display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">' +
              (p.correcta === oi ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M22 4L12 14.01l-3-3"/></svg>' : '') +
              '</span>' +
              '<span style="' + (p.correcta === oi ? 'font-weight:600;color:var(--primary)' : '') + '">' + escapeHtml(op) + '</span>' +
              '</div>';
          }).join('') +
          '</div>';
      } else if (p.tipo === 'desarrollo') {
        detalle = '<div style="margin-top:6px;font-size:13px;color:var(--muted)">El estudiante escribirá su respuesta en un campo de texto.</div>';
      } else {
        detalle = '<div style="margin-top:6px;font-size:13px;color:var(--muted)">El estudiante subirá un archivo como respuesta.</div>';
      }

      return '<div class="card" style="padding:16px;margin-bottom:12px;border-left:4px solid ' +
        (p.correcta !== null && p.tipo === 'opcion' ? 'var(--primary)' : 'var(--border)') + '">' +
        '<div style="display:flex;align-items:flex-start;gap:12px">' +
        '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">' +
        '<button class="btn btn-outline btn-sm" data-mover-up="' + i + '" title="Mover arriba"' + (i === 0 ? ' disabled style="opacity:0.3"' : '') + '>↑</button>' +
        '<button class="btn btn-outline btn-sm" data-mover-down="' + i + '" title="Mover abajo"' + (i === preguntasLocal.length - 1 ? ' disabled style="opacity:0.3"' : '') + '>↓</button>' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
        '<span style="font-weight:700;color:var(--muted);font-size:14px">P' + (i + 1) + '</span>' +
        '<span class="badge ' + tipoColor + '">' + tipoLabel + '</span>' +
        '<span class="badge badge-gray">' + p.puntos + ' pts</span>' +
        '<div style="margin-left:auto;display:flex;gap:6px">' +
        '<button class="btn btn-outline btn-sm" data-editar-preg="' + i + '" title="Editar">' + ICONS.edit + '</button>' +
        '<button class="btn btn-outline btn-sm" data-eliminar-preg="' + i + '" title="Eliminar" style="color:var(--danger)">' + ICONS.trash + '</button>' +
        '</div></div>' +
        '<div style="font-size:15px;line-height:1.5">' + escapeHtml(p.texto) + '</div>' +
        detalle +
        '</div></div></div>';
    }).join('');

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver-lista>← Volver a Exámenes</button>' +
      '<div class="crumb mt-2">EXÁMENES / EDITOR DE PREGUNTAS</div>' +
      '<h2>' + escapeHtml(examenActual.titulo) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(examenActual.grado) + ' · Sección ' + escapeHtml(examenActual.seccion) + ' · ' + escapeHtml(examenActual.materia) + '</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:20px">' +
      '<div class="stat-card"><div class="stat-label">Preguntas</div><div class="stat-value">' + preguntasLocal.length + '</div></div>' +
      '<div class="stat-card alt-green"><div class="stat-label">Puntaje total</div><div class="stat-value">' + totalPuntos + ' pts</div></div>' +
      '<div class="stat-card"><div class="stat-label">Opción múltiple</div><div class="stat-value">' + countOpcion + '</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Desarrollo</div><div class="stat-value">' + countDesarrollo + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Archivo</div><div class="stat-value">' + countArchivo + '</div></div>' +
      '</div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<div class="dropdown" style="position:relative" id="ddAgregar">' +
      '<button class="btn btn-primary" data-abrir-dd>' + ICONS.check + ' Agregar Pregunta</button>' +
      '<div class="dropdown-menu" id="menuAgregar" style="display:none;position:absolute;top:100%;left:0;margin-top:6px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);box-shadow:var(--shadow-md);min-width:200px;z-index:10">' +
      '<button class="dropdown-item" data-tipo-nueva="opcion" style="display:block;width:100%;text-align:left;padding:10px 16px;border:none;background:none;cursor:pointer;font-size:14px">Opción múltiple</button>' +
      '<button class="dropdown-item" data-tipo-nueva="desarrollo" style="display:block;width:100%;text-align:left;padding:10px 16px;border:none;background:none;cursor:pointer;font-size:14px;border-top:1px solid var(--border-soft)">Desarrollo</button>' +
      '<button class="dropdown-item" data-tipo-nueva="archivo" style="display:block;width:100%;text-align:left;padding:10px 16px;border:none;background:none;cursor:pointer;font-size:14px;border-top:1px solid var(--border-soft)">Archivo</button>' +
      '</div></div>' +
      '<button class="btn btn-outline" data-preview>' + ICONS.examenes + ' Vista Previa</button>' +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
      '<button class="btn btn-outline" data-guardar-borrador>Guardar Borrador</button>' +
      '<button class="btn btn-primary" data-publicar>' + ICONS.check + ' Publicar Examen</button>' +
      '</div></div>' +

      '<div id="listaPreguntas">' +
      (preguntasHtml || '<div class="card empty-state"><div class="big">&#128221;</div><h3>Sin preguntas</h3><p class="muted">Haz clic en "Agregar Pregunta" para comenzar a construir el examen.</p></div>') +
      '</div>';

    /* Eventos del editor */
    viewEl().querySelector('[data-volver-lista]').addEventListener('click', function () { render(); });
    viewEl().querySelector('[data-abrir-dd]').addEventListener('click', function (ev) {
      ev.stopPropagation();
      var menu = document.getElementById('menuAgregar');
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    if (_clickForaneoEditor) document.removeEventListener('click', _clickForaneoEditor);
    _clickForaneoEditor = function () {
      var menu = document.getElementById('menuAgregar');
      if (menu) menu.style.display = 'none';
    };
    document.addEventListener('click', _clickForaneoEditor);
    viewEl().querySelectorAll('[data-tipo-nueva]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        agregarPregunta(btn.dataset.tipoNueva);
      });
    });
    viewEl().querySelectorAll('[data-editar-preg]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        editarPreguntaIndividual(parseInt(btn.dataset.editarPreg));
      });
    });
    viewEl().querySelectorAll('[data-eliminar-preg]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.eliminarPreg);
        confirmar({
          titulo: 'Eliminar pregunta',
          mensaje: '¿Desea eliminar la pregunta P' + (idx + 1) + '? Esta acción no se puede deshacer.',
          confirmarTexto: 'Eliminar',
          tipo: 'danger',
          onConfirmar: function () {
            preguntasLocal.splice(idx, 1);
            showToast('Pregunta eliminada.', 'success');
            renderEditor();
          },
        });
      });
    });
    viewEl().querySelectorAll('[data-mover-up]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.moverUp);
        if (idx > 0) {
          var temp = preguntasLocal[idx];
          preguntasLocal[idx] = preguntasLocal[idx - 1];
          preguntasLocal[idx - 1] = temp;
          renderEditor();
        }
      });
    });
    viewEl().querySelectorAll('[data-mover-down]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.moverDown);
        if (idx < preguntasLocal.length - 1) {
          var temp = preguntasLocal[idx];
          preguntasLocal[idx] = preguntasLocal[idx + 1];
          preguntasLocal[idx + 1] = temp;
          renderEditor();
        }
      });
    });
    viewEl().querySelector('[data-preview]').addEventListener('click', function () {
      if (preguntasLocal.length === 0) { showToast('Agrega al menos una pregunta para ver la vista previa.', 'warning'); return; }
      vistaPreview();
    });
    viewEl().querySelector('[data-guardar-borrador]').addEventListener('click', function () {
      guardarPreguntas();
      showToast('Borrador guardado (' + preguntasLocal.length + ' preguntas).', 'info');
    });
    viewEl().querySelector('[data-publicar]').addEventListener('click', function () {
      if (preguntasLocal.length === 0) { showToast('Agrega al menos una pregunta antes de publicar.', 'warning'); return; }
      confirmar({
        titulo: 'Publicar examen',
        mensaje: '¿Desea publicar este examen con ' + preguntasLocal.length + ' preguntas? Los estudiantes serán notificados.',
        confirmarTexto: 'Publicar',
        onConfirmar: function () {
          guardarPreguntas();
          examenActual.preguntas = preguntasLocal.length;
          showToast('Examen publicado correctamente.', 'success');
          render();
        },
      });
    });
  }

  /* ============================================================
     AGREGAR / EDITAR PREGUNTA INDIVIDUAL
     ============================================================ */
  function agregarPregunta(tipo) {
    var menu = document.getElementById('menuAgregar');
    if (menu) menu.style.display = 'none';
    var nueva = { id: nextId++, tipo: tipo, texto: '', opciones: tipo === 'opcion' ? ['', ''] : [], correcta: null, puntos: 10 };
    preguntasLocal.push(nueva);
    editarPreguntaIndividual(preguntasLocal.length - 1);
  }

  function editarPreguntaIndividual(idx) {
    var p = preguntasLocal[idx];
    if (!p) return;
    preguntaEditando = idx;
    vista = 'editarPregunta';

    var opcionesHtml = '';
    if (p.tipo === 'opcion') {
      var optsHtml = p.opciones.map(function (op, oi) {
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
          '<input type="radio" name="correctaOp" value="' + oi + '"' + (p.correcta === oi ? ' checked' : '') + ' data-correcta="' + oi + '">' +
          '<input class="form-control" type="text" value="' + escapeHtml(op) + '" data-opcion="' + oi + '" placeholder="Opción ' + (oi + 1) + '" style="flex:1">' +
          (p.opciones.length > 2 ? '<button class="btn btn-outline btn-sm" data-quitar-opcion="' + oi + '" style="color:var(--danger);flex-shrink:0">' + ICONS.trash + '</button>' : '') +
          '</div>';
      }).join('');
      opcionesHtml =
        '<div class="form-group">' +
        '<label>Opciones de respuesta (marca la correcta)</label>' +
        '<div id="listaOpciones">' + optsHtml + '</div>' +
        (p.opciones.length < 6 ? '<button class="btn btn-outline btn-sm" data-agregar-opcion style="margin-top:6px">+ Agregar opción</button>' : '') +
        '</div>';
    }

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver-editor>← Volver al Editor</button>' +
      '<div class="crumb mt-2">EDITOR / EDITAR PREGUNTA P' + (idx + 1) + '</div>' +
      '<h2>Editar Pregunta</h2>' +
      '<div class="page-sub">' + escapeHtml(examenActual.titulo) + '</div></div>' +

      '<div class="card" style="max-width:720px">' +
      '<form id="formEditarPreg" novalidate>' +
      '<div class="form-group"><label>Tipo de pregunta</label>' +
      '<select class="form-control" id="epTipo">' +
      '<option value="opcion"' + (p.tipo === 'opcion' ? ' selected' : '') + '>Opción múltiple</option>' +
      '<option value="desarrollo"' + (p.tipo === 'desarrollo' ? ' selected' : '') + '>Desarrollo</option>' +
      '<option value="archivo"' + (p.tipo === 'archivo' ? ' selected' : '') + '>Archivo</option>' +
      '</select></div>' +
      '<div class="form-group"><label for="epTexto">Texto de la pregunta</label>' +
      '<textarea class="form-control" id="epTexto" rows="3" placeholder="Escribe la pregunta aquí...">' + escapeHtml(p.texto) + '</textarea></div>' +
      opcionesHtml +
      '<div class="form-group"><label for="epPuntos">Puntos</label>' +
      '<input class="form-control" id="epPuntos" type="number" min="1" max="100" value="' + p.puntos + '" style="max-width:150px"></div>' +
      '<div class="flex" style="justify-content:flex-end;gap:10px;margin-top:8px">' +
      '<button class="btn btn-outline" type="button" data-volver-editor>Cancelar</button>' +
      '<button class="btn btn-primary" type="submit">' + ICONS.check + ' Guardar Pregunta</button>' +
      '</div>' +
      '</form></div>';

    viewEl().querySelectorAll('[data-volver-editor]').forEach(function (btn) {
      btn.addEventListener('click', function () { renderEditor(); });
    });
    document.getElementById('epTipo').addEventListener('change', function () {
      p.tipo = document.getElementById('epTipo').value;
      if (p.tipo === 'opcion' && p.opciones.length < 2) p.opciones = ['', ''];
      if (p.tipo !== 'opcion') { p.opciones = []; p.correcta = null; }
      editarPreguntaIndividual(idx);
    });
    if (p.tipo === 'opcion') {
      viewEl().querySelectorAll('[data-correcta]').forEach(function (r) {
        r.addEventListener('change', function () {
          p.correcta = parseInt(r.dataset.correcta);
        });
      });
      viewEl().querySelectorAll('[data-opcion]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          p.opciones[parseInt(inp.dataset.opcion)] = inp.value;
        });
      });
      viewEl().querySelectorAll('[data-quitar-opcion]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          p.opciones.splice(parseInt(btn.dataset.quitarOpcion), 1);
          if (p.correcta >= p.opciones.length) p.correcta = null;
          editarPreguntaIndividual(idx);
        });
      });
      var btnAgregar = viewEl().querySelector('[data-agregar-opcion]');
      if (btnAgregar) {
        btnAgregar.addEventListener('click', function () {
          if (p.opciones.length < 6) {
            p.opciones.push('');
            editarPreguntaIndividual(idx);
          }
        });
      }
    }
    document.getElementById('formEditarPreg').addEventListener('submit', function (e) {
      e.preventDefault();
      var texto = document.getElementById('epTexto').value.trim();
      if (!texto) { showToast('El texto de la pregunta es obligatorio.', 'warning'); return; }
      if (p.tipo === 'opcion' && p.opciones.some(function (o) { return !o.trim(); })) {
        showToast('Todas las opciones deben tener texto.', 'warning');
        return;
      }
      p.texto = texto;
      p.puntos = parseInt(document.getElementById('epPuntos').value) || 10;
      showToast('Pregunta guardada.', 'success');
      renderEditor();
    });
  }

  /* ============================================================
     VISTA PREVIA
     ============================================================ */
  function vistaPreview() {
    vista = 'preview';
    var totalPuntos = preguntasLocal.reduce(function (s, p) { return s + p.puntos; }, 0);

    var preguntasHtml = preguntasLocal.map(function (p, i) {
      var bloque = '';
      if (p.tipo === 'opcion') {
        var opts = p.opciones.map(function (op, oi) {
          return '<label class="role-option" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid var(--border-soft);border-radius:var(--radius-sm);cursor:pointer">' +
            '<input type="radio" name="prev_p' + i + '" disabled>' +
            '<span>' + escapeHtml(op) + '</span></label>';
        }).join('');
        bloque = '<div style="display:grid;gap:8px;margin-top:12px">' + opts + '</div>';
      } else if (p.tipo === 'desarrollo') {
        bloque = '<textarea class="form-control" rows="3" placeholder="Escriba su respuesta aquí..." disabled style="margin-top:12px"></textarea>';
      } else {
        bloque = '<div style="margin-top:12px;padding:24px;border:2px dashed var(--border);border-radius:var(--radius-sm);text-align:center;color:var(--muted)">' +
          ICONS.upload + ' Arrastre un archivo aquí o haga clic para subir</div>';
      }
      return '<div class="card" style="padding:20px;margin-bottom:16px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '<span style="font-weight:700;color:var(--primary)">Pregunta ' + (i + 1) + '</span>' +
        '<span class="badge badge-gray">' + p.puntos + ' pts</span>' +
        '</div>' +
        '<div style="font-size:15px;line-height:1.6">' + escapeHtml(p.texto) + '</div>' +
        bloque +
        '</div>';
    }).join('');

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver-editor>← Volver al Editor</button>' +
      '<div class="crumb mt-2">EXÁMENES / VISTA PREVIA</div>' +
      '<h2>' + escapeHtml(examenActual.titulo) + '</h2>' +
      '<div class="page-sub">Así verán el examen tus estudiantes</div></div>' +

      '<div class="card" style="padding:24px;margin-bottom:20px;background:var(--primary-soft);border:none">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">' +
      '<div><div style="font-size:18px;font-weight:600">' + escapeHtml(examenActual.titulo) + '</div>' +
      '<div style="color:var(--muted);margin-top:4px">' + escapeHtml(examenActual.materia) + ' · ' + escapeHtml(examenActual.grado) + ' · Sección ' + escapeHtml(examenActual.seccion) + '</div></div>' +
      '<div style="display:flex;gap:16px;text-align:center">' +
      '<div><div style="font-size:22px;font-weight:700">' + preguntasLocal.length + '</div><div style="font-size:12px;color:var(--muted)">Preguntas</div></div>' +
      '<div><div style="font-size:22px;font-weight:700">' + totalPuntos + '</div><div style="font-size:12px;color:var(--muted)">Puntos</div></div>' +
      '<div><div style="font-size:22px;font-weight:700">' + examenActual.duracion + ' min</div><div style="font-size:12px;color:var(--muted)">Duración</div></div>' +
      '</div></div></div>' +

      '<div style="max-width:720px">' + preguntasHtml + '</div>' +

      '<div class="flex" style="justify-content:flex-end;margin-top:20px;gap:10px">' +
      '<button class="btn btn-outline" data-volver-editor>Volver al Editor</button>' +
      '</div>';

    viewEl().querySelectorAll('[data-volver-editor]').forEach(function (btn) {
      btn.addEventListener('click', function () { renderEditor(); });
    });
  }

  /* ============================================================
     VER RESULTADOS (examenes finalizados)
     ============================================================ */
  function verResultados(id) {
    var e = PRO_EXAMENES.find(function (x) { return x.id === id; }) || PRO_EXAMENES[0];
    vista = 'resultados';

    var estudiantes = [
      { nombre: 'Juan Pérez', nota: 92 },
      { nombre: 'Ana Castillo', nota: 85 },
      { nombre: 'Luis Herrera', nota: 78 },
      { nombre: 'María Fernanda López', nota: 95 },
      { nombre: 'Pedro Ramírez', nota: 55 },
      { nombre: 'Sofía Morales', nota: 88 },
      { nombre: 'Carlos Méndez', nota: 70 },
      { nombre: 'Laura Gutiérrez', nota: 96 },
      { nombre: 'Roberto Díaz', nota: 62 },
      { nombre: 'Diego Fuentes', nota: 80 },
    ];

    var rows = estudiantes.map(function (est, i) {
      return '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td><b>' + escapeHtml(est.nombre) + '</b></td>' +
      '<td><input class="form-control nota-examen-input" type="number" min="0" max="100" style="width:80px" value="' + est.nota + '" data-idx="' + i + '"></td>' +
      '<td>' + (est.nota >= 60 ? '<span class="badge badge-green">Aprobado</span>' : '<span class="badge badge-red">Reprobado</span>') + '</td>' +
      '</tr>';
    }).join('');

    var aprobados = estudiantes.filter(function (x) { return x.nota >= 60; }).length;
    var reprobados = estudiantes.length - aprobados;
    var promedio = (estudiantes.reduce(function (s, x) { return s + x.nota; }, 0) / estudiantes.length).toFixed(1);

    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Exámenes</button>' +
      '<div class="crumb mt-2">EXÁMENES / RESULTADOS</div>' +
      '<h2>' + escapeHtml(e.titulo) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(e.grado) + ' · Sección ' + escapeHtml(e.seccion) + ' · ' + escapeHtml(e.materia) + '</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:20px">' +
      '<div class="stat-card alt-green"><div class="stat-label">Promedio</div><div class="stat-value">' + promedio + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Aprobados</div><div class="stat-value">' + aprobados + '</div></div>' +
      '<div class="stat-card alt-red"><div class="stat-label">Reprobados</div><div class="stat-value">' + reprobados + '</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Total</div><div class="stat-value">' + estudiantes.length + '</div></div>' +
      '</div>' +

      '<div class="card"><div class="card-title">Calificaciones por Estudiante</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>No.</th><th>Estudiante</th><th>Nota</th><th>Estado</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<div class="flex" style="justify-content:flex-end;margin-top:16px;gap:10px">' +
      '<button class="btn btn-outline" data-exportar>' + ICONS.download + ' Exportar</button>' +
      '<button class="btn btn-primary" data-guardar>' + ICONS.check + ' Guardar Cambios</button>' +
      '</div></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', function () { render(); });
    viewEl().querySelector('[data-exportar]').addEventListener('click', function () {
      showToast('Reporte de calificaciones exportado (demo).', 'success');
    });
    viewEl().querySelector('[data-guardar]').addEventListener('click', function () {
      showToast('Calificaciones guardadas correctamente.', 'success');
    });
  }

  /* ============================================================
     UTILIDADES
     ============================================================ */
  function guardarPreguntas() {
    PRO_EXAMEN_PREGUNTAS[examenActual.id] = preguntasLocal.map(function (p) {
      return { id: p.id, tipo: p.tipo, texto: p.texto, opciones: p.opciones.slice(), correcta: p.correcta, puntos: p.puntos };
    });
  }

  return { render: render };
})();
