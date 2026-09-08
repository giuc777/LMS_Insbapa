/* ============================================================
   INSBAPA - Prototipo
   Portal Profesores: Materiales (carpetas)
   ============================================================ */

const ProfesorMateriales = (function () {
  function viewEl() { return document.getElementById('view'); }

  function render() {
    const carpetas = PRO_MATERIALES.map((c) => {
      const items = c.items.map((it) =>
        '<div class="dash-list-item">' +
        '<div class="dli-ico" style="background:var(--surface-soft);color:var(--muted)">' + ICONS.file + '</div>' +
        '<div class="dli-body"><div class="dli-title">' + escapeHtml(it) + '</div></div>' +
        '<button class="btn btn-outline btn-sm" data-descargar>' + ICONS.download + ' Descargar</button></div>'
      ).join('');
      return '<div class="card"><div class="card-title">' + escapeHtml(c.carpeta) + '</div>' +
        '<div style="margin-top:10px">' + items + '</div></div>';
    }).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">PROFESOR / MATERIALES</div>' +
      '<h2>Materiales de Clase</h2>' +
      '<div class="page-sub">Organiza los recursos por carpeta.</div></div>' +

      '<div class="flex" style="justify-content:flex-end;margin-bottom:20px">' +
      '<button class="btn btn-primary" data-subir>' + ICONS.upload + ' Subir Nuevo Material</button>' +
      '</div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">' + carpetas + '</div>';

    viewEl().querySelectorAll('[data-descargar]').forEach((b) => {
      b.addEventListener('click', () => showToast('Descarga iniciada (demo).', 'info'));
    });
    viewEl().querySelector('[data-subir]').addEventListener('click', () => {
      showToast('Subida de material (demo).', 'info');
    });
  }

  return { render: render };
})();