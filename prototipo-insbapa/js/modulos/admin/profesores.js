/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Profesores
   ============================================================ */

const AdminProfesores = (function () {
  function viewEl() { return document.getElementById('view'); }

  function render() {
    const rows = ADMIN_PROFESORES.map((p) =>
      '<tr>' +
      '<td><div class="flex" style="gap:10px"><div class="avatar">' + escapeHtml(p.nombre.split(' ')[1] ? p.nombre.split(' ').slice(1).map((w) => w[0]).join('').toUpperCase() : 'P') + '</div>' +
      '<div><b>' + escapeHtml(p.nombre) + '</b><div class="dli-sub">' + escapeHtml(p.correo) + '</div></div></div></td>' +
      '<td>' + escapeHtml(p.materia) + '</td>' +
      '<td>' + p.cursos + ' cursos</td>' +
      '<td>' + (p.activo ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>') + '</td>' +
      '<td style="text-align:right">' +
      '<button class="btn btn-outline btn-sm" data-ver="' + p.id + '">Ver</button> ' +
      '<button class="btn btn-outline btn-sm" data-editar="' + p.id + '">Editar</button> ' +
      '<button class="btn btn-outline btn-sm" data-reset="' + p.id + '">Reestablecer</button></td>' +
      '</tr>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / PROFESORES</div>' +
      '<h2>Profesores</h2>' +
      '<div class="page-sub">' + ADMIN_PROFESORES.length + ' docentes registrados</div></div>' +

      '<div class="flex" style="justify-content:flex-end;margin-bottom:18px">' +
      '<button class="btn btn-primary" data-nuevo-prof>' + ICONS.profesores + ' Registrar Profesor</button>' +
      '</div>' +

      '<div class="card"><div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Profesor</th><th>Materia</th><th>Cursos</th><th>Estado</th><th style="text-align:right">Acciones</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';

    viewEl().querySelectorAll('[data-ver]').forEach((b) => {
      b.addEventListener('click', () => verProfesor(b.dataset.ver));
    });
    viewEl().querySelectorAll('[data-editar]').forEach((b) => {
      b.addEventListener('click', () => editarProfesor(b.dataset.editar));
    });
    viewEl().querySelectorAll('[data-reset]').forEach((b) => {
      b.addEventListener('click', () => {
        confirmar({
          titulo: 'Reestablecer contraseña',
          mensaje: '¿Desea enviar una nueva contraseña temporal a este profesor?',
          confirmarTexto: 'Reestablecer',
          onConfirmar: () => showToast('Contraseña temporal enviada.', 'success'),
        });
      });
    });
    viewEl().querySelector('[data-nuevo-prof]').addEventListener('click', nuevoProfesor);
  }

  /* ---------- Ver perfil del profesor ---------- */
  function verProfesor(id) {
    const p = ADMIN_PROFESORES.find((x) => x.id === id);
    if (!p) return showToast('Profesor no encontrado.', 'error');

    const cursosAsignados = [
      { materia: 'Matemáticas I', grado: 'Primero Básico', seccion: 'A', estudiantes: 28 },
      { materia: 'Matemáticas I', grado: 'Primero Básico', seccion: 'B', estudiantes: 24 },
      { materia: 'Matemáticas II', grado: 'Segundo Básico', seccion: 'A', estudiantes: 30 },
    ];

    const cursosHtml = cursosAsignados.map((c) =>
      '<tr><td>' + escapeHtml(c.materia) + '</td><td>' + escapeHtml(c.grado) + ' · ' + escapeHtml(c.seccion) + '</td><td>' + c.estudiantes + '</td></tr>'
    ).join('');

    const html =
      '<div class="modal-backdrop" id="modalVerProf" style="display:none">' +
      '<div class="modal" style="max-width:560px">' +
      '<div class="modal-header"><h3>Perfil del Profesor</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">' +
      '<div class="avatar" style="width:56px;height:56px;font-size:20px">' + escapeHtml(p.nombre.split(' ').slice(1).map((w) => w[0]).join('').toUpperCase()) + '</div>' +
      '<div><div style="font-size:18px;font-weight:600">' + escapeHtml(p.nombre) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(p.correo) + '</div></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
      '<div><div class="dli-sub">Materia principal</div><div><b>' + escapeHtml(p.materia) + '</b></div></div>' +
      '<div><div class="dli-sub">Cursos asignados</div><div><b>' + p.cursos + '</b></div></div>' +
      '<div><div class="dli-sub">Estado</div><div>' + (p.activo ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>') + '</div></div>' +
      '<div><div class="dli-sub">Evaluación promedio</div><div><b>4.6 / 5.0</b></div></div>' +
      '</div>' +
      '<div style="margin-top:20px"><div class="dli-sub" style="margin-bottom:8px">Clases asignadas</div>' +
      '<table class="data-table"><thead><tr><th>Materia</th><th>Grado/Sección</th><th>Estudiantes</th></tr></thead>' +
      '<tbody>' + cursosHtml + '</tbody></table></div>' +
      '</div>' +
      '<div class="modal-footer"><button class="btn btn-outline" data-cerrar>Cerrar</button></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalVerProf');
    modal.style.display = 'flex';
    modal.querySelectorAll('[data-cerrar]').forEach((b) => {
      b.addEventListener('click', () => { modal.remove(); });
    });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.remove(); });
  }

  /* ---------- Editar profesor ---------- */
  function editarProfesor(id) {
    const p = ADMIN_PROFESORES.find((x) => x.id === id);
    if (!p) return showToast('Profesor no encontrado.', 'error');

    const html =
      '<div class="modal-backdrop" id="modalEditarProf" style="display:none">' +
      '<div class="modal" style="max-width:520px">' +
      '<div class="modal-header"><h3>Editar Profesor</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<form id="formEditarProf" novalidate>' +
      '<div class="form-group"><label>Nombre completo</label>' +
      '<input class="form-control" id="epNombre" value="' + escapeHtml(p.nombre) + '"></div>' +
      '<div class="form-group"><label>Email institucional</label>' +
      '<input class="form-control" id="epEmail" type="email" value="' + escapeHtml(p.correo) + '"></div>' +
      '<div class="form-group"><label>Materia principal</label>' +
      '<input class="form-control" id="epMateria" value="' + escapeHtml(p.materia) + '"></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="form-group"><label>Cursos asignados</label>' +
      '<input class="form-control" id="epCursos" type="number" min="1" max="10" value="' + p.cursos + '"></div>' +
      '<div class="form-group"><label>Estado</label>' +
      '<select class="form-control" id="epEstado">' +
      '<option value="true"' + (p.activo ? ' selected' : '') + '>Activo</option>' +
      '<option value="false"' + (!p.activo ? ' selected' : '') + '>Inactivo</option>' +
      '</select></div>' +
      '</div>' +
      '</form></div>' +
      '<div class="modal-footer">' +
      '<button class="btn btn-outline" data-cerrar>Cancelar</button>' +
      '<button class="btn btn-primary" data-guardar>' + ICONS.check + ' Guardar Cambios</button>' +
      '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalEditarProf');
    modal.style.display = 'flex';

    function cerrar() { modal.remove(); }
    modal.querySelectorAll('[data-cerrar]').forEach((b) => { b.addEventListener('click', cerrar); });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) cerrar(); });
    modal.querySelector('[data-guardar]').addEventListener('click', () => {
      const nombre = document.getElementById('epNombre').value.trim();
      if (!nombre) { showToast('El nombre es obligatorio.', 'warning'); return; }
      p.nombre = nombre;
      p.correo = document.getElementById('epEmail').value.trim();
      p.materia = document.getElementById('epMateria').value.trim();
      p.cursos = parseInt(document.getElementById('epCursos').value) || 1;
      p.activo = document.getElementById('epEstado').value === 'true';
      cerrar();
      showToast('Profesor actualizado correctamente.', 'success');
      render();
    });
  }

  /* ---------- Registrar nuevo profesor ---------- */
  function nuevoProfesor() {
    const html =
      '<div class="modal-backdrop" id="modalNuevoProf" style="display:none">' +
      '<div class="modal" style="max-width:520px">' +
      '<div class="modal-header"><h3>Registrar Profesor</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<form id="formNuevoProf" novalidate>' +
      '<div class="form-group"><label>Nombre completo</label>' +
      '<input class="form-control" id="npNombre" placeholder="Ej. Prof. María López"></div>' +
      '<div class="form-group"><label>Email institucional</label>' +
      '<input class="form-control" id="npEmail" type="email" placeholder="correo@institute.edu"></div>' +
      '<div class="form-group"><label>Materia principal</label>' +
      '<select class="form-control" id="npMateria">' +
      '<option>Matemáticas I</option><option>Matemáticas II</option><option>Matemáticas III</option>' +
      '<option>Lengua y Literatura</option><option>Ciencias Naturales</option><option>Historia Moderna</option>' +
      '</select></div>' +
      '<div class="form-group"><label>Cursos asignados</label>' +
      '<input class="form-control" id="npCursos" type="number" min="1" max="10" value="2"></div>' +
      '</form></div>' +
      '<div class="modal-footer">' +
      '<button class="btn btn-outline" data-cerrar>Cancelar</button>' +
      '<button class="btn btn-primary" data-guardar>' + ICONS.check + ' Registrar</button>' +
      '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalNuevoProf');
    modal.style.display = 'flex';

    function cerrar() { modal.remove(); }
    modal.querySelectorAll('[data-cerrar]').forEach((b) => { b.addEventListener('click', cerrar); });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) cerrar(); });
    modal.querySelector('[data-guardar]').addEventListener('click', () => {
      const nombre = document.getElementById('npNombre').value.trim();
      const email = document.getElementById('npEmail').value.trim();
      if (!nombre || !email) { showToast('Nombre y email son obligatorios.', 'warning'); return; }
      showToast('Profesor "' + nombre + '" registrado exitosamente.', 'success');
      cerrar();
    });
  }

  return { render: render };
})();
