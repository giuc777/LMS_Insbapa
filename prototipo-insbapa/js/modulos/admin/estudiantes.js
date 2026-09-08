/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Estudiantes
   ============================================================ */

const AdminEstudiantes = (function () {
  const PAGE = 4;
  let estado = { busqueda: '', grado: 'Todos', pagina: 1 };

  function viewEl() { return document.getElementById('view'); }

  function filtered() {
    return ADMIN_ESTUDIANTES.filter((e) =>
      (estado.grado === 'Todos' || e.grado === estado.grado) &&
      (!estado.busqueda || e.nombre.toLowerCase().includes(estado.busqueda.toLowerCase()) || e.carnet.includes(estado.busqueda))
    );
  }

  function render() {
    const lista = filtered();
    const totalPaginas = Math.max(1, Math.ceil(lista.length / PAGE));
    if (estado.pagina > totalPaginas) estado.pagina = totalPaginas;
    const desde = (estado.pagina - 1) * PAGE;
    const items = lista.slice(desde, desde + PAGE);

    const grados = ['Todos', 'Primero Básico', 'Segundo Básico', 'Tercero Básico'];
    const selGrado = grados.map((g) => opt(estado.grado, g, g)).join('');

    const rows = items.map((e) =>
      '<tr>' +
      '<td>' + escapeHtml(e.carnet) + '</td>' +
      '<td><b>' + escapeHtml(e.nombre) + '</b></td>' +
      '<td>' + escapeHtml(e.grado) + '</td>' +
      '<td>' + escapeHtml(e.seccion) + '</td>' +
      '<td>' + (e.activo ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>') + '</td>' +
      '<td style="text-align:right">' +
      '<button class="btn btn-outline btn-sm" data-ver="' + e.id + '">Ver</button> ' +
      '<button class="btn btn-outline btn-sm" data-editar="' + e.id + '">Editar</button></td>' +
      '</tr>'
    ).join('');

    const pagination =
      '<div class="flex-between mt-3" style="flex-wrap:wrap;gap:10px">' +
      '<span class="dli-sub">Mostrando ' + items.length + ' de ' + lista.length + ' estudiantes</span>' +
      '<div class="flex" style="gap:6px">' +
      '<button class="btn btn-outline btn-sm" data-pagina="prev" ' + (estado.pagina <= 1 ? 'disabled' : '') + '>← Anterior</button>' +
      '<span class="dli-sub" style="padding:6px 10px">Página ' + estado.pagina + ' de ' + totalPaginas + '</span>' +
      '<button class="btn btn-outline btn-sm" data-pagina="next" ' + (estado.pagina >= totalPaginas ? 'disabled' : '') + '>Siguiente →</button>' +
      '</div></div>';

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / ESTUDIANTES</div>' +
      '<h2>Estudiantes</h2>' +
      '<div class="page-sub">' + ADMIN_ESTUDIANTES.length + ' registrados · ' + ADMIN_ESTUDIANTES.filter((e) => e.activo).length + ' activos</div></div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<div class="search-box" style="max-width:280px">' +
      '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></span>' +
      '<input class="form-control" id="filtroEstudiante" type="text" placeholder="Buscar por nombre o carnet..." style="padding-left:38px">' +
      '</div>' +
      '<select class="form-control" id="filtroGradoEst" style="width:auto">' + selGrado + '</select>' +
      '</div>' +
      '<button class="btn btn-primary" data-nuevo-est>' + ICONS.estudiantes + ' Registrar Estudiante</button>' +
      '</div>' +

      '<div class="card"><div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Carnet</th><th>Nombre</th><th>Grado</th><th>Sección</th><th>Estado</th><th style="text-align:right">Acciones</th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="6" class="muted">No hay estudiantes que coincidan.</td></tr>') + '</tbody>' +
      '</table></div>' + pagination + '</div>';

    document.getElementById('filtroEstudiante').addEventListener('input', (e) => {
      estado.busqueda = e.target.value.trim();
      estado.pagina = 1;
      render();
    });
    document.getElementById('filtroGradoEst').addEventListener('change', (e) => {
      estado.grado = e.target.value;
      estado.pagina = 1;
      render();
    });
    viewEl().querySelectorAll('[data-pagina]').forEach((b) => {
      b.addEventListener('click', () => {
        estado.pagina += b.dataset.pagina === 'next' ? 1 : -1;
        render();
      });
    });
    viewEl().querySelectorAll('[data-ver]').forEach((b) => {
      b.addEventListener('click', () => verEstudiante(b.dataset.ver));
    });
    viewEl().querySelectorAll('[data-editar]').forEach((b) => {
      b.addEventListener('click', () => editarEstudiante(b.dataset.editar));
    });
    viewEl().querySelector('[data-nuevo-est]').addEventListener('click', nuevoEstudiante);
  }

  /* ---------- Ver perfil del estudiante ---------- */
  function verEstudiante(id) {
    const e = ADMIN_ESTUDIANTES.find((x) => x.id === id);
    if (!e) return showToast('Estudiante no encontrado.', 'error');

    const cursos = [
      { materia: 'Lengua y Literatura', promedio: 91.8 },
      { materia: 'Ciencias Naturales', promedio: 85.8 },
      { materia: 'Cálculo Avanzado', promedio: 80.0 },
      { materia: 'Historia Moderna', promedio: 91.8 },
    ];

    const cursosHtml = cursos.map((c) =>
      '<tr><td>' + escapeHtml(c.materia) + '</td><td><b>' + c.promedio.toFixed(1) + '</b></td>' +
      '<td>' + (c.promedio >= 60 ? '<span class="badge badge-green">Aprobado</span>' : '<span class="badge badge-red">Reprobado</span>') + '</td></tr>'
    ).join('');

    const html =
      '<div class="modal-backdrop" id="modalVerEst" style="display:none">' +
      '<div class="modal" style="max-width:560px">' +
      '<div class="modal-header"><h3>Perfil del Estudiante</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">' +
      '<div class="avatar" style="width:56px;height:56px;font-size:20px">' + escapeHtml(e.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()) + '</div>' +
      '<div><div style="font-size:18px;font-weight:600">' + escapeHtml(e.nombre) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(e.carnet) + '</div></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
      '<div><div class="dli-sub">Grado</div><div><b>' + escapeHtml(e.grado) + '</b></div></div>' +
      '<div><div class="dli-sub">Sección</div><div><b>' + escapeHtml(e.seccion) + '</b></div></div>' +
      '<div><div class="dli-sub">Estado</div><div>' + (e.activo ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>') + '</div></div>' +
      '<div><div class="dli-sub">Email</div><div><b>' + escapeHtml(e.nombre.toLowerCase().replace(/ /g, '.').replace(/['"]/g, '') + '@institute.edu') + '</b></div></div>' +
      '</div>' +
      '<div style="margin-top:20px"><div class="dli-sub" style="margin-bottom:8px">Cursos inscritos</div>' +
      '<table class="data-table"><thead><tr><th>Materia</th><th>Promedio</th><th>Estado</th></tr></thead>' +
      '<tbody>' + cursosHtml + '</tbody></table></div>' +
      '</div>' +
      '<div class="modal-footer"><button class="btn btn-outline" data-cerrar>Cerrar</button></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalVerEst');
    modal.style.display = 'flex';
    modal.querySelectorAll('[data-cerrar]').forEach((b) => {
      b.addEventListener('click', () => { modal.remove(); });
    });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.remove(); });
  }

  /* ---------- Editar estudiante ---------- */
  function editarEstudiante(id) {
    const e = ADMIN_ESTUDIANTES.find((x) => x.id === id);
    if (!e) return showToast('Estudiante no encontrado.', 'error');

    const seccionesA = ['A', 'B'];
    const seccionesB = ['A', 'B'];
    const seccionesC = ['A'];

    const html =
      '<div class="modal-backdrop" id="modalEditarEst" style="display:none">' +
      '<div class="modal" style="max-width:520px">' +
      '<div class="modal-header"><h3>Editar Estudiante</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<form id="formEditarEst" novalidate>' +
      '<div class="form-group"><label>Nombre completo</label>' +
      '<input class="form-control" id="eeNombre" value="' + escapeHtml(e.nombre) + '"></div>' +
      '<div class="form-group"><label>Email institucional</label>' +
      '<input class="form-control" id="eeEmail" type="email" value="' + escapeHtml(e.nombre.toLowerCase().replace(/ /g, '.').replace(/['"]/g, '') + '@institute.edu') + '"></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="form-group"><label>Grado</label>' +
      '<select class="form-control" id="eeGrado">' +
      '<option' + (e.grado === 'Primero Básico' ? ' selected' : '') + '>Primero Básico</option>' +
      '<option' + (e.grado === 'Segundo Básico' ? ' selected' : '') + '>Segundo Básico</option>' +
      '<option' + (e.grado === 'Tercero Básico' ? ' selected' : '') + '>Tercero Básico</option>' +
      '</select></div>' +
      '<div class="form-group"><label>Sección</label>' +
      '<select class="form-control" id="eeSeccion">' +
      '<option' + (e.seccion === 'A' ? ' selected' : '') + '>A</option>' +
      '<option' + (e.seccion === 'B' ? ' selected' : '') + '>B</option>' +
      '</select></div>' +
      '</div>' +
      '<div class="form-group"><label>Estado</label>' +
      '<select class="form-control" id="eeEstado">' +
      '<option value="true"' + (e.activo ? ' selected' : '') + '>Activo</option>' +
      '<option value="false"' + (!e.activo ? ' selected' : '') + '>Inactivo</option>' +
      '</select></div>' +
      '</form></div>' +
      '<div class="modal-footer">' +
      '<button class="btn btn-outline" data-cerrar>Cancelar</button>' +
      '<button class="btn btn-primary" data-guardar>' + ICONS.check + ' Guardar Cambios</button>' +
      '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalEditarEst');
    modal.style.display = 'flex';

    function cerrar() { modal.remove(); }
    modal.querySelectorAll('[data-cerrar]').forEach((b) => { b.addEventListener('click', cerrar); });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) cerrar(); });
    modal.querySelector('[data-guardar]').addEventListener('click', () => {
      const nombre = document.getElementById('eeNombre').value.trim();
      if (!nombre) { showToast('El nombre es obligatorio.', 'warning'); return; }
      e.nombre = nombre;
      e.grado = document.getElementById('eeGrado').value;
      e.seccion = document.getElementById('eeSeccion').value;
      e.activo = document.getElementById('eeEstado').value === 'true';
      cerrar();
      showToast('Estudiante actualizado correctamente.', 'success');
      render();
    });
  }

  /* ---------- Registrar nuevo estudiante ---------- */
  function nuevoEstudiante() {
    const html =
      '<div class="modal-backdrop" id="modalNuevoEst" style="display:none">' +
      '<div class="modal" style="max-width:520px">' +
      '<div class="modal-header"><h3>Registrar Estudiante</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<form id="formNuevoEst" novalidate>' +
      '<div class="form-group"><label>Nombre completo</label>' +
      '<input class="form-control" id="neNombre" placeholder="Ej. Carlos Hernández"></div>' +
      '<div class="form-group"><label>Carnet</label>' +
      '<input class="form-control" id="neCarnet" placeholder="Ej. 20260015"></div>' +
      '<div class="form-group"><label>Email institucional</label>' +
      '<input class="form-control" id="neEmail" type="email" placeholder="correo@institute.edu"></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="form-group"><label>Grado</label>' +
      '<select class="form-control" id="neGrado">' +
      '<option>Primero Básico</option><option>Segundo Básico</option><option>Tercero Básico</option>' +
      '</select></div>' +
      '<div class="form-group"><label>Sección</label>' +
      '<select class="form-control" id="neSeccion"><option>A</option><option>B</option></select></div>' +
      '</div>' +
      '</form></div>' +
      '<div class="modal-footer">' +
      '<button class="btn btn-outline" data-cerrar>Cancelar</button>' +
      '<button class="btn btn-primary" data-guardar>' + ICONS.check + ' Registrar</button>' +
      '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalNuevoEst');
    modal.style.display = 'flex';

    function cerrar() { modal.remove(); }
    modal.querySelectorAll('[data-cerrar]').forEach((b) => { b.addEventListener('click', cerrar); });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) cerrar(); });
    modal.querySelector('[data-guardar]').addEventListener('click', () => {
      const nombre = document.getElementById('neNombre').value.trim();
      const carnet = document.getElementById('neCarnet').value.trim();
      if (!nombre || !carnet) { showToast('Nombre y carnet son obligatorios.', 'warning'); return; }
      showToast('Estudiante "' + nombre + '" registrado exitosamente.', 'success');
      cerrar();
    });
  }

  return { render: render };
})();
