/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Mantenimiento
   ============================================================ */

const AdminMantenimiento = (function () {
  function viewEl() { return document.getElementById('view'); }

  function badgeEstado(estado) {
    const map = { 'Programado': 'badge-gold', 'Completado': 'badge-green', 'En Proceso': 'badge-primary' };
    return '<span class="badge ' + (map[estado] || 'badge-gray') + '">' + escapeHtml(estado) + '</span>';
  }

  function render() {
    const rows = ADMIN_MANTENIMIENTO.map((m) =>
      '<tr>' +
      '<td><b>' + escapeHtml(m.tipo) + '</b></td>' +
      '<td>' + escapeHtml(m.descripcion) + '</td>' +
      '<td>' + escapeHtml(m.fecha) + '</td>' +
      '<td>' + escapeHtml(m.inicio) + ' - ' + escapeHtml(m.fin) + '</td>' +
      '<td>' + badgeEstado(m.estado) + '</td>' +
      '<td style="text-align:right">' +
      (m.estado === 'Programado' ? '<button class="btn btn-outline btn-sm" data-cancelar="' + m.id + '">Cancelar</button>' : '') +
      '</td></tr>'
    ).join('');

    const proximos = ADMIN_MANTENIMIENTO.filter((m) => m.estado === 'Programado').length;

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / MANTENIMIENTO</div>' +
      '<h2>Mantenimiento del Sistema</h2>' +
      '<div class="page-sub">Programa ventanas de mantenimiento y supervisa el estado de la plataforma.</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">' +
      '<div class="stat-card alt-gold"><div class="stat-label">Mantenimientos programados</div><div class="stat-value">' + proximos + '</div></div>' +
      '<div class="stat-card alt-green"><div class="stat-label">Completados</div><div class="stat-value">' + ADMIN_MANTENIMIENTO.filter((m) => m.estado === 'Completado').length + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Última verificación</div><div class="stat-value" style="font-size:22px">Hoy 08:00</div><div class="stat-foot">Servicios operativos</div></div>' +
      '</div>' +

      '<div class="flex" style="justify-content:flex-end;margin:20px 0">' +
      '<button class="btn btn-primary" data-nuevo-mt>' + ICONS.mantenimiento + ' Programar Mantenimiento</button>' +
      '</div>' +

      '<div class="card"><div class="card-title">Historial de Mantenimiento</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Horario</th><th>Estado</th><th style="text-align:right">Acciones</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';

    viewEl().querySelectorAll('[data-cancelar]').forEach((b) => {
      b.addEventListener('click', () => {
        confirmar({
          titulo: 'Cancelar mantenimiento',
          mensaje: '¿Desea cancelar este mantenimiento programado?',
          confirmarTexto: 'Cancelar',
          tipo: 'danger',
          onConfirmar: () => showToast('Mantenimiento cancelado.', 'success'),
        });
      });
    });
    viewEl().querySelector('[data-nuevo-mt]').addEventListener('click', programar);
  }

  function programar() {
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Mantenimiento</button>' +
      '<div class="crumb mt-2">MANTENIMIENTO / NUEVO</div>' +
      '<h2>Programar Mantenimiento</h2>' +
      '<div class="page-sub">Los usuarios verán el aviso en la pantalla de inicio de sesión.</div></div>' +

      '<div class="card" style="max-width:620px">' +
      '<form id="formMantenimiento" novalidate>' +
      '<div class="form-group"><label for="mtTipo">Tipo de mantenimiento</label>' +
      '<select class="form-control" id="mtTipo">' +
      '<option>Mantenimiento programado</option>' +
      '<option>Actualización de plataforma</option>' +
      '<option>Respaldo de base de datos</option>' +
      '<option>Revisión de seguridad</option>' +
      '</select></div>' +
      '<div class="form-group"><label for="mtDescripcion">Descripción</label>' +
      '<textarea class="form-control" id="mtDescripcion" rows="4" placeholder="Describe las tareas a realizar..."></textarea></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="form-group"><label for="mtFecha">Fecha</label>' +
      '<input class="form-control" id="mtFecha" type="date" value="2026-08-30"></div>' +
      '<div class="form-group"><label for="mtHorario">Horario</label>' +
      '<select class="form-control" id="mtHorario">' +
      '<option>02:00 - 04:00 AM</option>' +
      '<option>22:00 - 23:59</option>' +
      '<option>01:00 - 03:00 AM</option>' +
      '</select></div>' +
      '</div>' +
      '<div class="flex" style="justify-content:flex-end;gap:10px;margin-top:8px">' +
      '<button class="btn btn-outline" type="button" data-cancelar>Cancelar</button>' +
      '<button class="btn btn-primary" type="submit">' + ICONS.check + ' Programar</button>' +
      '</div></form></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', render);
    viewEl().querySelector('[data-cancelar]').addEventListener('click', render);
    document.getElementById('formMantenimiento').addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Mantenimiento programado correctamente.', 'success');
      render();
    });
  }

  return { render: render };
})();