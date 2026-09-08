/* ============================================================
   INSBAPA - Prototipo
   Portal Administrador: Tokens de Registro (códigos de matrícula).
   Simula POST/GET de /api/TokenRegistro: generar y listar códigos.
   ============================================================ */

const AdminTokens = (function () {
  let vista = 'lista';

  function viewEl() { return document.getElementById('view'); }

  function badgeEstado(t) {
    if (t.usosActual >= t.maximoUsos) return '<span class="badge badge-gray">Agotado</span>';
    if (t.fechaExpiracion && new Date(t.fechaExpiracion) < new Date()) return '<span class="badge badge-red">Expirado</span>';
    if (!t.activo) return '<span class="badge badge-gray">Inactivo</span>';
    return '<span class="badge badge-green">Activo</span>';
  }

  function generarCodigo() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const rnd = (typeof crypto !== 'undefined' && crypto.getRandomValues)
      ? crypto.getRandomValues(new Uint32Array(8))
      : null;
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      const idx = rnd ? rnd[i] % chars.length : Math.floor(Math.random() * chars.length);
      codigo += chars.charAt(idx);
    }
    return 'REG-' + codigo;
  }

  function render() {
    const lista = todosLosTokens();
    const activos = lista.filter((t) => t.activo && t.usosActual < t.maximoUsos && (!t.fechaExpiracion || new Date(t.fechaExpiracion) >= new Date())).length;

    const rows = lista.map((t) =>
      '<tr>' +
      '<td><b style="font-family:monospace">' + escapeHtml(t.token) + '</b></td>' +
      '<td>' + escapeHtml(t.descripcion || '—') + '</td>' +
      '<td>' + escapeHtml(t.rol || 'Estudiante') + '</td>' +
      '<td>' + t.usosActual + ' / ' + t.maximoUsos + '</td>' +
      '<td>' + escapeHtml(new Date(t.fechaExpiracion).toLocaleDateString('es-GT')) + '</td>' +
      '<td>' + badgeEstado(t) + '</td>' +
      '<td style="text-align:right">' +
      (t.activo && t.usosActual < t.maximoUsos && new Date(t.fechaExpiracion) >= new Date()
        ? '<button class="btn btn-outline btn-sm" data-inactivar="' + escapeHtml(t.token) + '">Desactivar</button>' : '') +
      '</td></tr>'
    ).join('');

    viewEl().innerHTML =
      '<div class="page-head"><div class="crumb">ADMINISTRADOR / TOKENS</div>' +
      '<h2>Tokens de Registro</h2>' +
      '<div class="page-sub">Genera códigos de matrícula para que los estudiantes creen su propio perfil.</div></div>' +

      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">' +
      '<div class="stat-card alt-green"><div class="stat-label">Tokens activos</div><div class="stat-value">' + activos + '</div></div>' +
      '<div class="stat-card alt-gold"><div class="stat-label">Total generados</div><div class="stat-value">' + lista.length + '</div></div>' +
      '<div class="stat-card"><div class="stat-label">Usos disponibles</div><div class="stat-value">' +
      lista.reduce((acc, t) => acc + Math.max(0, t.maximoUsos - t.usosActual), 0) + '</div></div>' +
      '</div>' +

      '<div class="flex" style="justify-content:flex-end;margin:20px 0">' +
      '<button class="btn btn-primary" data-nuevo-token>' + ICONS.check + ' Generar Token</button>' +
      '</div>' +

      '<div class="card"><div class="card-title">Códigos de matrícula</div>' +
      '<div class="table-wrap mt-2"><table class="data-table">' +
      '<thead><tr><th>Código</th><th>Descripción</th><th>Rol</th><th>Usos</th><th>Expira</th><th>Estado</th><th style="text-align:right">Acciones</th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="7" class="muted">Aún no se han generado tokens.</td></tr>') + '</tbody>' +
      '</table></div></div>';

    viewEl().querySelectorAll('[data-inactivar]').forEach((b) => {
      b.addEventListener('click', () => {
        const codigo = b.dataset.inactivar;
        confirmar({
          titulo: 'Desactivar token',
          mensaje: '¿Desea desactivar el código <b>' + escapeHtml(codigo) + '</b>? Los estudiantes ya no podrán usarlo.',
          confirmarTexto: 'Desactivar',
          tipo: 'danger',
          onConfirmar: () => {
            const lista2 = todosLosTokens();
            const t = lista2.find((x) => x.token === codigo);
            if (t) { t.activo = false; guardarTokens(lista2); }
            showToast('Token desactivado.', 'success');
            render();
          },
        });
      });
    });
    viewEl().querySelector('[data-nuevo-token]').addEventListener('click', () => { vista = 'nuevo'; generar(); });
  }

  function generar() {
    viewEl().innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-outline btn-sm" data-volver>← Volver a Tokens</button>' +
      '<div class="crumb mt-2">TOKENS / NUEVO</div>' +
      '<h2>Generar Token</h2>' +
      '<div class="page-sub">El código se comparte con los estudiantes para que se registren.</div></div>' +

      '<div class="card" style="max-width:560px">' +
      '<form id="formTokenNuevo" novalidate>' +
      '<div class="form-group"><label for="tkDescripcion">Descripción</label>' +
      '<input class="form-control" id="tkDescripcion" placeholder="Ej. Matrícula Primer Grado 2026"></div>' +
      '<div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="form-group"><label for="tkMaxUsos">Máximo de usos</label>' +
      '<input class="form-control" id="tkMaxUsos" type="number" min="1" max="999" value="40"></div>' +
      '<div class="form-group"><label for="tkMinutos">Validez (minutos)</label>' +
      '<input class="form-control" id="tkMinutos" type="number" min="5" max="120" value="60"></div>' +
      '</div>' +
      '<div class="flex" style="justify-content:flex-end;gap:10px;margin-top:8px">' +
      '<button class="btn btn-outline" type="button" data-cancelar>Cancelar</button>' +
      '<button class="btn btn-primary" type="submit">' + ICONS.check + ' Generar</button>' +
      '</div></form></div>';

    viewEl().querySelector('[data-volver]').addEventListener('click', () => { vista = 'lista'; render(); });
    viewEl().querySelector('[data-cancelar]').addEventListener('click', () => { vista = 'lista'; render(); });
    document.getElementById('formTokenNuevo').addEventListener('submit', (e) => {
      e.preventDefault();
      const descripcion = document.getElementById('tkDescripcion').value.trim();
      const maxUsos = parseInt(document.getElementById('tkMaxUsos').value, 10) || 40;
      const minutos = parseInt(document.getElementById('tkMinutos').value, 10) || 60;

      const lista = todosLosTokens();
      lista.push({
        id: 'TKN-' + String(lista.length + 1).padStart(3, '0'),
        token: generarCodigo(),
        descripcion: descripcion,
        rol: 'Estudiante',
        maximoUsos: maxUsos,
        usosActual: 0,
        fechaExpiracion: new Date(Date.now() + minutos * 60000).toISOString(),
        activo: true,
      });
      guardarTokens(lista);

      showToast('Token generado correctamente.', 'success');
      vista = 'lista'; render();
    });
  }

  return { render: render };
})();
