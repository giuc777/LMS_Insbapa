/* ============================================================
   INSBAPA - Prototipo
   Portal Estudiante: Exámenes (Próximos/Realizados) y flujo de
   examen activo con temporizador, mapa de preguntas y resultado.
   ============================================================ */

const EstudianteExamenes = (function () {
  const TABS = ['Próximos', 'Realizados'];
  let tab = 'Próximos';

  function viewEl() { return document.getElementById('view'); }

  function render() {
    const filtered = EST_EXAMENES.filter((x) => (tab === 'Próximos' ? x.estado === 'Proximo' : x.estado === 'Realizado'));
    const tabs = TABS.map((t) =>
      '<button class="tab' + (tab === t ? ' active' : '') + '" data-tab="' + t + '">' + t + '</button>'
    ).join('');

    const items = filtered.map((x) => {
      const disponible = x.estado === 'Proximo' && x.id === 'EXA-01';
      return '<div class="dash-list-item">' +
        '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.examenes + '</div>' +
        '<div class="dli-body"><div class="dli-title">' + escapeHtml(x.titulo) + '</div>' +
        '<div class="dli-sub">' + escapeHtml(x.cursoNombre) + ' · ' + x.preguntas + ' preguntas · ' + x.duracion + ' min</div></div>' +
        '<div style="text-align:right">' +
        (x.estado === 'Realizado'
          ? '<div><span class="badge badge-green">Nota: ' + (x.nota || '-') + '</span></div><div class="dli-sub mt-1">' + escapeHtml(x.realizadoEl || '') + '</div>'
          : '<button class="btn btn-primary btn-sm" data-comenzar="' + x.id + '">Comenzar</button>') +
        '</div></div>';
    }).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ESTUDIANTE / EXÁMENES</div>' +
      '<h2>Mis Exámenes</h2>' +
      '<div class="page-sub">Realiza tus evaluaciones pendientes.</div></div>' +
      '<div class="tabs">' + tabs + '</div>' +
      '<div class="card"><div style="margin-top:0">' +
      (items || '<p class="muted">No hay exámenes en esta categoría.</p>') +
      '</div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { tab = b.dataset.tab; render(); });
    });
    viewEl().querySelectorAll('[data-comenzar]').forEach((b) => {
      b.addEventListener('click', () => introExamen(b.dataset.comenzar));
    });
  }

  /* ---------- Pantalla de introducción del examen ---------- */
  function introExamen(id) {
    const ex = EXAMEN_ACTIVO;
    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ESTUDIANTE / EXÁMENES / ' + escapeHtml(ex.curso) + '</div>' +
      '<h2>' + escapeHtml(ex.titulo) + '</h2>' +
      '<div class="page-sub">' + escapeHtml(ex.curso) + '</div></div>' +

      '<div class="card" style="max-width:620px">' +
      '<div class="card-title">Instrucciones del examen</div>' +
      '<ul style="line-height:2;color:var(--text);padding-left:20px;margin-top:10px">' +
      '<li>El examen consta de <b>' + ex.preguntas.length + ' preguntas</b>.</li>' +
      '<li>Tienes <b>' + ex.duracionMin + ' minutos</b> para completarlo.</li>' +
      '<li>Puedes navegar libremente entre preguntas usando el mapa.</li>' +
      '<li>Las preguntas de desarrollo requieren respuesta escrita.</li>' +
      '<li>No podrás cambiar tu respuesta después de finalizar.</li>' +
      '</ul>' +
      '<div class="mt-3" style="display:flex;gap:10px;justify-content:flex-end">' +
      '<button class="btn btn-outline" data-volver>Cancelar</button>' +
      '<button class="btn btn-primary" data-iniciar>Comenzar Examen</button>' +
      '</div></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', render);
    viewEl().querySelector('[data-iniciar]').addEventListener('click', () => examenActivo());
  }

  /* ---------- Examen activo ---------- */
  const estado = { indice: 0, respuestas: {}, segundos: 0, timer: null, exam: null };

  function examenActivo() {
    estado.indice = 0;
    estado.respuestas = {};
    estado.segundos = 0;
    estado.exam = EXAMEN_ACTIVO;
    clearInterval(estado.timer);
    renderPregunta();
    estado.timer = setInterval(() => {
      estado.segundos++;
      const el = document.getElementById('timerLbl');
      if (el) el.textContent = formato(estado.exam.duracionMin * 60 - estado.segundos);
      if (estado.segundos >= estado.exam.duracionMin * 60) {
        clearInterval(estado.timer);
        finalizarExamen(true);
      }
    }, 1000);
  }

  function formato(seg) {
    const s = Math.max(0, seg);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function renderPregunta() {
    const ex = estado.exam;
    const p = ex.preguntas[estado.indice];
    const actual = estado.indice + 1;
    const total = ex.preguntas.length;

    const mapa = ex.preguntas.map((q, i) => {
      const cls = estado.respuestas[q.id] ? 'resp' : (i === estado.indice ? 'actual' : '');
      return '<button class="map-item ' + cls + '" data-mapa="' + i + '">' + (i + 1) + '</button>';
    }).join('');

    let cuerpo;
    if (p.tipo === 'opcion') {
      cuerpo = p.opciones.map((op) =>
        '<label class="opcion' + (estado.respuestas[p.id] === op ? ' sel' : '') + '">' +
        '<input type="radio" name="resp" value="' + escapeHtml(op) + '" ' + (estado.respuestas[p.id] === op ? 'checked' : '') + '>' +
        '<span>' + escapeHtml(op) + '</span></label>'
      ).join('');
    } else if (p.tipo === 'desarrollo') {
      cuerpo = '<textarea class="form-control" id="respDesarrollo" rows="6" placeholder="Escribe tu respuesta aquí...">' +
        escapeHtml(estado.respuestas[p.id] || '') + '</textarea>';
    } else {
      cuerpo =
        '<div class="card-sub">Adjunta un archivo como respuesta a esta pregunta.</div>' +
        '<div style="margin-top:10px;border:2px dashed var(--border);border-radius:var(--radius-sm);padding:20px;text-align:center;cursor:pointer" id="dropExamen">' +
        ICONS.upload + ' <span style="font-weight:600">Arrastra tu archivo aquí o haz clic</span>' +
        '<div class="muted" style="font-size:13px">' + (estado.respuestas[p.id] ? 'Archivo adjunto: <b>' + estado.respuestas[p.id] + '</b>' : 'PDF, DOCX, JPG · máx 10 MB') + '</div></div>' +
        '<input type="file" id="inputExamenArchivo" style="display:none">';
    }

    viewEl().innerHTML =
      '<div class="card" style="border:2px solid var(--primary)">' +
      '<div class="flex-between" style="border-bottom:1px solid var(--border-soft);padding-bottom:14px;flex-wrap:wrap;gap:10px">' +
      '<div><div class="card-title">Examen Activo</div>' +
      '<div class="card-sub">' + escapeHtml(ex.titulo) + ' · ' + escapeHtml(ex.curso) + '</div></div>' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<span class="badge badge-primary" style="font-size:14px" id="timerLbl">' + formato(ex.duracionMin * 60) + '</span>' +
      '<button class="btn btn-danger btn-sm" data-finalizar>Finalizar examen</button>' +
      '</div></div>' +

      '<div class="flex-between mt-2" style="align-items:flex-start;gap:20px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:280px">' +
      '<div class="card-sub">Pregunta ' + actual + ' de ' + total + '</div>' +
      '<h3 style="margin-top:8px">' + escapeHtml(p.texto) + '</h3>' +
      '<div class="mt-2" style="display:grid;gap:10px">' + cuerpo + '</div>' +
      '</div>' +
      '<div style="flex:0 0 200px">' +
      '<div class="card-sub">Mapa de preguntas</div>' +
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px">' + mapa + '</div>' +
      '<div class="mt-2" style="font-size:12px;color:var(--muted);line-height:2">' +
      '<span class="map-item resp" style="display:inline-block;width:14px;height:14px"></span> Respondida<br>' +
      '<span class="map-item actual" style="display:inline-block;width:14px;height:14px"></span> Actual<br>' +
      '<span class="map-item" style="display:inline-block;width:14px;height:14px"></span> Pendiente</div>' +
      '</div>' +
      '</div>' +

      '<div class="flex-between mt-3" style="border-top:1px solid var(--border-soft);padding-top:16px">' +
      '<button class="btn btn-outline" data-anterior ' + (estado.indice === 0 ? 'disabled' : '') + '>← Anterior</button>' +
      '<button class="btn btn-primary" data-siguiente>' + (estado.indice === total - 1 ? 'Finalizar examen' : 'Siguiente →') + '</button>' +
      '</div></div>';

    /* Eventos */
    viewEl().querySelectorAll('.opcion input').forEach((i) => {
      i.addEventListener('change', () => {
        estado.respuestas[p.id] = i.value;
        renderPregunta();
      });
    });
    const textarea = document.getElementById('respDesarrollo');
    if (textarea) {
      textarea.addEventListener('input', () => { estado.respuestas[p.id] = textarea.value; });
    }
    const dropEx = document.getElementById('dropExamen');
    if (dropEx) {
      const inputF = document.getElementById('inputExamenArchivo');
      dropEx.addEventListener('click', () => inputF.click());
      dropEx.addEventListener('dragover', (e) => { e.preventDefault(); dropEx.style.borderColor = 'var(--primary)'; });
      dropEx.addEventListener('drop', (e) => {
        e.preventDefault();
        dropEx.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files[0]) {
          estado.respuestas[p.id] = e.dataTransfer.files[0].name;
          renderPregunta();
        }
      });
      inputF.addEventListener('change', () => {
        if (inputF.files[0]) { estado.respuestas[p.id] = inputF.files[0].name; renderPregunta(); }
      });
    }
    viewEl().querySelectorAll('.map-item[data-mapa]').forEach((b) => {
      b.addEventListener('click', () => { estado.indice = Number(b.dataset.mapa); renderPregunta(); });
    });
    viewEl().querySelector('[data-anterior]').addEventListener('click', () => {
      estado.indice--; renderPregunta();
    });
    viewEl().querySelector('[data-siguiente]').addEventListener('click', () => {
      if (estado.indice === total - 1) finalizarExamen(false);
      else { estado.indice++; renderPregunta(); }
    });
    viewEl().querySelector('[data-finalizar]').addEventListener('click', () => {
      finalizarExamen(false);
    });
  }

  /* ---------- Resultado ---------- */
  function finalizarExamen(porTiempo) {
    clearInterval(estado.timer);
    const respondidas = Object.keys(estado.respuestas).length;
    const nota = Math.round(60 + (respondidas / estado.exam.preguntas.length) * 40);
    const aprobado = nota >= 60;

    const desglose = estado.exam.preguntas.map((p) => {
      const respondida = !!estado.respuestas[p.id];
      return '<div class="dash-list-item">' +
        '<div class="dli-ico" style="background:' + (respondida ? 'var(--success-soft)' : 'var(--danger-soft)') + ';color:' + (respondida ? 'var(--success)' : 'var(--danger)') + '">' + ICONS.check + '</div>' +
        '<div class="dli-body"><div class="dli-title">' + escapeHtml(p.texto.length > 60 ? p.texto.slice(0, 60) + '…' : p.texto) + '</div>' +
        '<div class="dli-sub">' + escapeHtml(p.tipo === 'desarrollo' ? 'Pregunta de desarrollo' : 'Opción múltiple') + '</div></div>' +
        '<div>' + (respondida ? '<span class="badge badge-green">Respondida</span>' : '<span class="badge badge-red">Pendiente</span>') + '</div>' +
        '</div>';
    }).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ESTUDIANTE / EXÁMENES / RESULTADO</div>' +
      '<h2>Evaluación Final</h2>' +
      '<div class="page-sub">' + escapeHtml(estado.exam.titulo) + ' · ' + escapeHtml(estado.exam.curso) + '</div></div>' +

      '<div class="card" style="max-width:560px;text-align:center">' +
      '<div style="width:110px;height:110px;border-radius:50%;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;background:' + (aprobado ? 'var(--success-soft)' : 'var(--danger-soft)') + ';color:' + (aprobado ? 'var(--success)' : 'var(--danger)') + '">' +
      '<div class="stat-value" style="font-size:34px">' + nota + '</div>' +
      '<div class="dli-sub">puntos</div></div>' +
      '<h3 style="margin-top:16px">' + (aprobado ? '¡Aprobado!' : 'No aprobado') + '</h3>' +
      '<p class="muted">Respondiste ' + respondidas + ' de ' + estado.exam.preguntas.length + ' preguntas' +
      (porTiempo ? ' · El tiempo se agotó.' : '') + '</p>' +
      '<div class="mt-2" style="display:flex;gap:10px;justify-content:center">' +
      '<button class="btn btn-primary" data-volver>Volver a Exámenes</button>' +
      '</div></div>' +

      '<div class="card mt-3"><div class="card-title">Desglose de Preguntas</div>' +
      '<div style="margin-top:10px">' + desglose + '</div></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => {
      tab = 'Realizados';
      render();
    });
  }

  return { render: render };
})();