/* ============================================================
   INSBAPA - Prototipo
   Portal Estudiante: Anuncios
   ============================================================ */

const EstudianteAnuncios = (function () {
  const CATEGORIAS = ['Todos', 'Académico', 'Eventos', 'Comunidad', 'Deportes', 'Soporte IT'];

  function viewEl() { return document.getElementById('view'); }
  let estado = { cat: 'Todos', busqueda: '', detalle: null };

  function render() {
    const list = EST_ANUNCIOS.filter((a) =>
      (estado.cat === 'Todos' || a.categoria === estado.cat) &&
      (!estado.busqueda || a.titulo.toLowerCase().includes(estado.busqueda.toLowerCase()))
    );
    const tabs = CATEGORIAS.map((c) =>
      '<button class="tab' + (estado.cat === c ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>'
    ).join('');
    const items = list.map((a) =>
      '<div class="dash-list-item" style="cursor:pointer" data-detalle="' + a.id + '">' +
      '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.anuncios + '</div>' +
      '<div class="dli-body"><div class="dli-title">' + escapeHtml(a.titulo) + (a.leido ? '' : ' <span class="badge badge-primary">Nuevo</span>') + '</div>' +
      '<div class="dli-sub">' + escapeHtml(a.categoria) + ' · ' + escapeHtml(a.fecha) + '</div>' +
      '<div class="dli-sub" style="margin-top:4px">' + escapeHtml(a.resumen) + '</div></div>' +
      '</div>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ESTUDIANTE / ANUNCIOS</div>' +
      '<h2>Noticias Recientes</h2>' +
      '<div class="page-sub">Mantente al día con la comunidad INSBAPA.</div></div>' +

      '<div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px">' +
      '<div class="tabs" style="margin:0">' + tabs + '</div>' +
      '<div class="search-box" style="max-width:280px">' +
      '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></span>' +
      '<input class="form-control" id="anuncioBuscar" type="text" placeholder="Buscar noticia..." style="padding-left:38px">' +
      '</div></div>' +

      '<div class="card"><div style="margin-top:0">' +
      (items || '<p class="muted">No hay anuncios para esta categoría.</p>') +
      '</div></div>' +
      '<p class="muted mt-2">Página 1 de ' + Math.max(1, Math.ceil(list.length / 6)) + '</p>';

    viewEl().querySelectorAll('.tab').forEach((t) => {
      t.addEventListener('click', () => { estado.cat = t.dataset.cat; render(); });
    });
    viewEl().querySelectorAll('[data-detalle]').forEach((el) => {
      el.addEventListener('click', () => verDetalle(el.dataset.detalle));
    });
    document.getElementById('anuncioBuscar').addEventListener('input', (e) => {
      estado.busqueda = e.target.value.trim();
      render();
    });
  }

  function verDetalle(id) {
    const a = EST_ANUNCIOS.find((x) => x.id === id);
    if (!a) return;
    estado.detalle = a;
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Anuncios</button>' +
      '<div class="crumb mt-2">' + escapeHtml(a.categoria) + '</div>' +
      '<h2>' + escapeHtml(a.titulo) + '</h2>' +
      '<div class="page-sub">Publicado: ' + escapeHtml(a.fecha) + '</div></div>' +
      '<div class="card">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
      '<div class="dli-ico" style="background:var(--primary-soft);color:var(--primary)">' + ICONS.anuncios + '</div>' +
      '<div><div class="dli-title">' + escapeHtml(a.titulo) + '</div><div class="dli-sub">' + escapeHtml(a.categoria) + '</div></div></div>' +
      '<p style="line-height:1.7">' + escapeHtml(a.resumen) + '</p>' +
      '<p style="line-height:1.7;margin-top:12px" class="muted">Estimados estudiantes, estamos emocionados de darles la bienvenida al ciclo académico 2024. Los invitamos a participar activamente en las actividades y a usar la plataforma para su aprendizaje y desarrollo profesional.</p>' +
      '</div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => {
      estado.detalle = null;
      render();
    });
  }

  return { render: render };
})();