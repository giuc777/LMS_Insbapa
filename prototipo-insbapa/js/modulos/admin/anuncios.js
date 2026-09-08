/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Anuncios institucionales
   ============================================================ */

const AdminAnuncios = (function () {
  const TABS = ['Publicados', 'Borradores'];
  let tab = 'Publicados';
  let vista = 'lista';

  function viewEl() { return document.getElementById('view'); }

  function badgeEstado(estado) {
    const map = { 'PÚBLICO': 'badge-primary', 'BORRADOR': 'badge-gold' };
    return '<span class="badge ' + (map[estado] || 'badge-gray') + '">' + escapeHtml(estado) + '</span>';
  }

  function render() {
    const tabs = TABS.map((t) =>
      '<button class="tab' + (tab === t ? ' active' : '') + '" data-tab="' + t + '">' + t + '</button>'
    ).join('');

    const lista = ADMIN_ANUNCIOS.filter((a) => (tab === 'Publicados' ? a.estado === 'PÚBLICO' : a.estado === 'BORRADOR'));
    const items = lista.map((a) =>
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.anuncios + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(a.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(a.destinatarios) + ' · ' + escapeHtml(a.fecha) + '</div>' +
      '<div class="dli-sub" style="margin-top:4px">' + escapeHtml(a.cuerpo) + '</div></div>' +
      '<div style="text-align:right">' + badgeEstado(a.estado) + '<br>' +
      '<button class="btn btn-outline btn-sm mt-1" data-editar="' + a.id + '">Editar</button></div>' +
      '</div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / ANUNCIOS</div>' +
      '<h2>Anuncios Institucionales</h2>' +
      '<div class="page-sub">Comunicados dirigidos a toda la comunidad educativa.</div></div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabs + '</div>' +
      '<button class="btn btn-primary" data-crear>' + ICONS.anuncios + ' Crear Anuncio</button>' +
      '</div>' +
      '<div class="card"><div style="margin-top:0">' +
      (items || '<p class="muted">No hay anuncios en esta categoría.</p>') +
      '</div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { tab = b.dataset.tab; render(); });
    });
    viewEl().querySelectorAll('[data-editar]').forEach((b) => {
      b.addEventListener('click', () => showToast('Editar anuncio (demo).', 'info'));
    });
    viewEl().querySelector('[data-crear]').addEventListener('click', crear);
  }

  function crear() {
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Anuncios</button>' +
      '<div class="crumb mt-2">ANUNCIOS / NUEVO</div>' +
      '<h2>Crear Anuncio Institucional</h2>' +
      '<div class="page-sub">Será visible para toda la comunidad educativa.</div></div>' +

      '<div class="card" style="max-width:680px">' +
      '<form id="formAnuncioAdmin" novalidate>' +
      '<div class="form-group"><label for="aaTitulo">Título</label>' +
      '<input class="form-control" id="aaTitulo" placeholder="Ej. Suspensión de clases por feriado"></div>' +
      '<div class="form-group"><label for="aaCuerpo">Cuerpo del anuncio</label>' +
      '<textarea class="form-control" id="aaCuerpo" rows="6" placeholder="Escribe el contenido del comunicado..."></textarea></div>' +
      '<div class="form-group"><label for="aaAdjuntos">Adjuntar archivos (opcional)</label>' +
      '<input class="form-control" id="aaAdjuntos" type="file" multiple></div>' +
      '<div class="form-group"><label>Destinatarios</label>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:8px">' +
      '<label class="role-option"><input type="radio" name="aaDestino" value="Todos" checked><span class="role-card">Todos</span></label>' +
      '<label class="role-option"><input type="radio" name="aaDestino" value="Estudiantes"><span class="role-card">Estudiantes</span></label>' +
      '<label class="role-option"><input type="radio" name="aaDestino" value="Profesores"><span class="role-card">Profesores</span></label>' +
      '</div></div>' +
      '<div class="flex" style="justify-content:flex-end;gap:10px;margin-top:10px">' +
      '<button class="btn btn-outline" type="button" data-borrador>Guardar Borrador</button>' +
      '<button class="btn btn-primary" type="submit">' + ICONS.check + ' Publicar</button>' +
      '</div></form></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => { vista = 'lista'; render(); });
    viewEl().querySelector('[data-borrador]').addEventListener('click', () => {
      showToast('Anuncio guardado como borrador (demo).', 'info');
      vista = 'lista'; render();
    });
    document.getElementById('formAnuncioAdmin').addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('aaTitulo').value.trim();
      if (!titulo) {
        showToast('El título es obligatorio.', 'warning');
        return;
      }
      showToast('Anuncio publicado correctamente.', 'success');
      vista = 'lista'; render();
    });
  }

  return { render: render };
})();