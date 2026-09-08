/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Dashboard (Panel de Control)
   Diseño Figma node 71:296
   ============================================================ */

const AdminDashboard = (function () {
  function viewEl() { return document.getElementById('view'); }

  const MAP_BADGE = {
    'COMPLETADO': 'badge-green',
    'PÚBLICO': 'badge-primary',
    'SYNC': 'badge-purple',
    'EXITOSO': 'badge-green',
    'Programado': 'badge-gold',
  };

  function badgeEstado(estado) {
    return '<span class="badge ' + (MAP_BADGE[estado] || 'badge-gray') + '">' + escapeHtml(estado) + '</span>';
  }

  function renderMetricCards() {
    return (
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' +
      '<div class="stat-card alt-green"><div class="stat-label">Estudiantes totales</div>' +
      '<div class="flex-between"><div class="stat-value">1,250</div>' +
      '<span class="badge badge-green">+12%</span></div>' +
      '<div class="stat-foot"><span class="up">Crecimiento este año</span></div></div>' +
      '<div class="stat-card"><div class="stat-label">Profesores</div><div class="stat-value">42</div>' +
      '<div class="stat-foot">Activos en el ciclo</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Cursos activos</div><div class="stat-value">86</div>' +
      '<div class="stat-foot">3 grados · Ciclo Básico</div></div>' +
      '<div class="stat-card alt-red"><div class="stat-label">Alertas pendientes</div><div class="stat-value">3</div>' +
      '<div class="stat-foot"><span class="down">Requieren revisión</span></div></div>' +
      '</div>'
    );
  }

  function renderCambios() {
    const rows = ADMIN_CAMBIOS.map((c) =>
      '<tr>' +
      '<td><b>' + escapeHtml(c.evento) + '</b></td>' +
      '<td>' + escapeHtml(c.responsable) + '</td>' +
      '<td>' + escapeHtml(c.fecha) + '</td>' +
      '<td>' + badgeEstado(c.estado) + '</td>' +
      '</tr>'
    ).join('');
    return (
      '<div class="card"><div class="flex-between" style="flex-wrap:wrap;gap:10px">' +
      '<div><div class="card-title">Últimos Cambios en el Sistema</div>' +
      '<div class="card-sub">Actividad reciente de la plataforma</div></div>' +
      '<button class="btn btn-outline btn-sm" data-historial>Ver todo el historial</button></div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Evento</th><th>Responsable</th><th>Fecha</th><th>Estado</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>'
    );
  }

  function renderAcciones() {
    const acciones = [
      { label: 'Reestablecer Contraseña', icono: 'ajustes', accion: 'reseteo' },
      { label: 'Mantenimiento del Sistema', icono: 'mantenimiento', accion: 'mantenimiento' },
      { label: 'Generar Reporte Final', icono: 'examenes', accion: 'reporte' },
      { label: 'Nuevo Ciclo Escolar', icono: 'cursos', accion: 'ciclo' },
    ];
    const items = acciones.map((a) =>
      '<button class="control-action" data-accion="' + a.accion + '">' +
      '<span class="ca-ico">' + ICONS[a.icono] + '</span>' +
      '<span class="ca-lbl">' + escapeHtml(a.label) + '</span>' +
      '<svg class="ca-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
      '</button>'
    ).join('');
    return (
      '<div class="card"><div class="card-title">Acciones de Control</div>' +
      '<div class="card-sub">Herramientas administrativas</div>' +
      '<div style="margin-top:14px;display:grid;gap:8px">' + items + '</div></div>'
    );
  }

  /* ---------- Modal historial completo ---------- */
  function verHistorial() {
    const historial = [
      { evento: 'Prof. Mendez actualizó notas de 3ro Básico A', responsable: 'A. Mendez', fecha: '03/09/2026 08:15', estado: 'COMPLETADO' },
      { evento: 'Nuevo anuncio institucional: Inicio de clases', responsable: 'Coordinación', fecha: '03/09/2026 07:30', estado: 'PÚBLICO' },
      { evento: 'Registro de 15 nuevos alumnos en Primero Básico', responsable: 'Sistema', fecha: '02/09/2026 18:30', estado: 'SYNC' },
      { evento: 'Actualización de parches de seguridad v2.4', responsable: 'TI Admin', fecha: '02/09/2026 12:00', estado: 'EXITOSO' },
      { evento: 'Backup automático de base de datos completado', responsable: 'Sistema', fecha: '02/09/2026 02:00', estado: 'COMPLETADO' },
      { evento: 'Prof. García publicó examen parcial de Matemáticas', responsable: 'A. García', fecha: '01/09/2026 16:45', estado: 'PÚBLICO' },
      { evento: 'Mantenimiento programado completado exitosamente', responsable: 'TI Admin', fecha: '01/09/2026 04:00', estado: 'COMPLETADO' },
      { evento: 'Sincronización de calificaciones del primer bloque', responsable: 'Sistema', fecha: '31/08/2026 23:00', estado: 'SYNC' },
      { evento: 'Actualización del sistema LMS a versión 3.2', responsable: 'TI Admin', fecha: '28/08/2026 02:00', estado: 'EXITOSO' },
      { evento: 'Registro de 8 nuevos profesores para el ciclo', responsable: 'RRHH', fecha: '25/08/2026 10:00', estado: 'COMPLETADO' },
    ];

    const rows = historial.map((h) =>
      '<tr>' +
      '<td><b>' + escapeHtml(h.evento) + '</b></td>' +
      '<td>' + escapeHtml(h.responsable) + '</td>' +
      '<td>' + escapeHtml(h.fecha) + '</td>' +
      '<td>' + badgeEstado(h.estado) + '</td>' +
      '</tr>'
    ).join('');

    const html =
      '<div class="modal-backdrop" id="modalHistorial" style="display:none">' +
      '<div class="modal" style="max-width:720px">' +
      '<div class="modal-header"><h3>Historial Completo del Sistema</h3><button class="btn-close" data-cerrar>&times;</button></div>' +
      '<div class="modal-body">' +
      '<div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Evento</th><th>Responsable</th><th>Fecha</th><th>Estado</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button class="btn btn-outline" data-cerrar>Cerrar</button>' +
      '<button class="btn btn-outline" data-exportar-hist>' + ICONS.download + ' Exportar</button>' +
      '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('modalHistorial');
    modal.style.display = 'flex';

    function cerrar() { modal.remove(); }
    modal.querySelectorAll('[data-cerrar]').forEach((b) => { b.addEventListener('click', cerrar); });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) cerrar(); });
    modal.querySelector('[data-exportar-hist]').addEventListener('click', () => {
      showToast('Historial exportado (demo).', 'success');
    });
  }

  function render() {
    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / DASHBOARD</div>' +
      '<h2>Bienvenido, Administrador</h2>' +
      '<div class="page-sub">Gestión integral de la plataforma educativa y supervisión de métricas académicas.</div></div>' +

      renderMetricCards() +

      '<div class="grid mt-3" style="grid-template-columns:1.3fr 0.9fr;align-items:start">' +
      renderCambios() + renderAcciones() +
      '</div>';

    viewEl().querySelector('[data-historial]').addEventListener('click', verHistorial);
    viewEl().querySelectorAll('[data-accion]').forEach((el) => {
      el.addEventListener('click', () => {
        const acciones = {
          reseteo: 'Reestablecer Contraseña',
          mantenimiento: 'Mantenimiento del Sistema',
          reporte: 'Generar Reporte Final',
          ciclo: 'Nuevo Ciclo Escolar',
        };
        showToast('Acción "' + acciones[el.dataset.accion] + '" (demo).', 'info');
      });
    });
  }

  return { render: render, badgeEstado: badgeEstado };
})();
