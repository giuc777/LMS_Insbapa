/* ============================================================
   INSBAPA - Prototipo
   Portal Profesores: Anuncios y Crear Anuncio
   ============================================================ */

const ProfesorAnuncios = (function () {
  const TABS = ['Mis Anuncios', 'Anuncios Institucionales'];
  let tab = 'Mis Anuncios';
  let vista = 'lista';

  function viewEl() { return document.getElementById('view'); }

  function render() {
    const tabs = TABS.map((t) =>
      '<button class="tab' + (tab === t ? ' active' : '') + '" data-tab="' + t + '">' + t + '</button>'
    ).join('');

    const items = PRO_ANUNCIOS.map((a) =>
      '<div class="dash-list-item">' +
      '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.anuncios + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(a.titulo) + '</div>' +
      '<div class="dli-sub">' + escapeHtml(a.destinatarios) + ' · ' + escapeHtml(a.fecha) + '</div></div>' +
      '<span class="badge badge-green">' + escapeHtml(a.estado) + '</span></div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">PROFESOR / ANUNCIOS</div>' +
      '<h2>Gestión de Anuncios</h2>' +
      '<div class="page-sub">Comunica novedades a tus clases.</div></div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabs + '</div>' +
      '<button class="btn btn-primary" data-crear>' + ICONS.anuncios + ' Crear Nuevo Anuncio</button>' +
      '</div>' +
      '<div class="card"><div style="margin-top:0">' +
      (items || '<p class="muted">No hay anuncios publicados.</p>') +
      '</div></div>';

    viewEl().querySelectorAll('.tab').forEach((b) => {
      b.addEventListener('click', () => { tab = b.dataset.tab; render(); });
    });
    viewEl().querySelector('[data-crear]').addEventListener('click', crear);
  }

  function crear() {
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Anuncios</button>' +
      '<div class="crumb mt-2">ANUNCIOS / NUEVO</div>' +
      '<h2>Crear Nuevo Anuncio</h2>' +
      '<div class="page-sub">Los destinatarios serán notificados al publicar.</div></div>' +

      '<div class="card" style="max-width:720px">' +
      '<form id="formAnuncio" novalidate>' +
      '<div class="form-group"><label for="anTitulo">Título</label>' +
      '<input class="form-control" id="anTitulo" placeholder="Ej. Práctica para el examen final"></div>' +
      '<div class="form-group"><label for="anCuerpo">Cuerpo del anuncio</label>' +
      '<textarea class="form-control" id="anCuerpo" rows="6" placeholder="Escribe el contenido del anuncio..."></textarea></div>' +
      '<div class="form-group"><label for="anAdjuntos">Adjuntar archivos (opcional)</label>' +
      '<input class="form-control" id="anAdjuntos" type="file" multiple></div>' +
      '<div class="form-group"><label>Selección de Destinatarios</label>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:8px">' +
      '<label class="role-option"><input type="checkbox" value="Primero Básico A" checked><span class="role-card">Primero Básico A</span></label>' +
      '<label class="role-option"><input type="checkbox" value="Primero Básico B"><span class="role-card">Primero Básico B</span></label>' +
      '<label class="role-option"><input type="checkbox" value="Segundo Básico A"><span class="role-card">Segundo Básico A</span></label>' +
      '<label class="role-option"><input type="checkbox" value="Tercero Básico A"><span class="role-card">Tercero Básico A</span></label>' +
      '</div></div>' +
      '<div class="flex" style="justify-content:flex-end;gap:10px;margin-top:10px">' +
      '<button class="btn btn-outline" type="button" data-descartar>Descartar</button>' +
      '<button class="btn btn-outline" type="button" data-borrador>Guardar</button>' +
      '<button class="btn btn-primary" type="submit">' + ICONS.check + ' Publicar</button>' +
      '</div>' +
      '</form></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => { vista = 'lista'; render(); });
    viewEl().querySelector('[data-descartar]').addEventListener('click', () => { vista = 'lista'; render(); });
    viewEl().querySelector('[data-borrador]').addEventListener('click', () => {
      showToast('Anuncio guardado como borrador (demo).', 'info');
      vista = 'lista'; render();
    });
    document.getElementById('formAnuncio').addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('anTitulo').value.trim();
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