/* ============================================================
   INSBAPA - Prototipo
   Sistema: sesión por rol, navegación y enrutado de vistas
   (Datos quemados - sin base de datos)
   ============================================================ */

(function () {
  /* ---------- Sesión ---------- */
  const sesion = (function () {
    try { return JSON.parse(localStorage.getItem('insbapaSesion') || 'null'); }
    catch (e) { return null; }
  })();

  if (!sesion) {
    window.location.href = 'login.html';
    return;
  }

  const viewEl = document.getElementById('view');
  const sidebarNav = document.getElementById('sidebarNav');
  const sidebarUser = document.getElementById('sidebarUser');

  /* ---------- Navegación por portal ---------- */
  const ROLES = {
    estudiante: {
      etiqueta: 'Estudiante',
      brand: 'Ciclo Básico',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'anuncios', label: 'Anuncios', icon: 'anuncios' },
        { id: 'cursos', label: 'Cursos', icon: 'cursos' },
        { id: 'tareas', label: 'Tareas', icon: 'tareas' },
        { id: 'examenes', label: 'Exámenes', icon: 'examenes' },
        { id: 'notas', label: 'Notas', icon: 'notas' },
        { id: 'ajustes', label: 'Ajustes', icon: 'ajustes' },
      ],
    },
    profesor: {
      etiqueta: 'Profesor',
      brand: 'Docente',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'clases', label: 'Mis Clases', icon: 'cursos' },
        { id: 'tareas', label: 'Tareas', icon: 'tareas' },
        { id: 'notas', label: 'Notas', icon: 'notas' },
        { id: 'examenes', label: 'Exámenes', icon: 'examenes' },
        { id: 'materiales', label: 'Materiales', icon: 'materiales' },
        { id: 'anuncios', label: 'Anuncios', icon: 'anuncios' },
        { id: 'ajustes', label: 'Ajustes', icon: 'ajustes' },
      ],
    },
    administrador: {
      etiqueta: 'Administrador',
      brand: 'Administración',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'cursos', label: 'Cursos', icon: 'cursos' },
        { id: 'estudiantes', label: 'Estudiantes', icon: 'estudiantes' },
        { id: 'profesores', label: 'Profesores', icon: 'profesores' },
        { id: 'notas', label: 'Notas', icon: 'notas' },
        { id: 'anuncios', label: 'Anuncios', icon: 'anuncios' },
        { id: 'tokens', label: 'Tokens', icon: 'check' },
        { id: 'mantenimiento', label: 'Mantenimiento', icon: 'mantenimiento' },
        { id: 'ajustes', label: 'Ajustes', icon: 'ajustes' },
      ],
    },
  };

  const rolKey = sesion.rolKey || (sesion.rol === 'Administrador' ? 'administrador' : sesion.rol.toLowerCase());
  const conf = ROLES[rolKey] || ROLES.administrador;

  document.getElementById('brandSub').textContent = conf.brand;

  function renderSidebar() {
    const links = conf.items.map((item) =>
      '<button class="nav-item" data-view="' + item.id + '">' +
      ICONS[item.icon] +
      '<span>' + item.label + '</span>' +
      '</button>'
    ).join('');
    const logout =
      '<button class="nav-item logout" data-view="logout">' + ICONS.logout + '<span>Cerrar Sesión</span></button>';
    sidebarNav.innerHTML = links + logout;

    renderSidebarUser();

    sidebarNav.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.view === 'logout') return cerrarSesion();
        navigate(btn.dataset.view);
      });
    });
  }

  function renderSidebarUser() {
    const perfil = obtenerPerfil()[sesion.usuario] || {};
    const nombre = perfil.nombre || sesion.nombre;
    const iniciales = perfil.iniciales || sesion.iniciales ||
      nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    sidebarUser.innerHTML =
      '<div class="avatar">' + escapeHtml(iniciales) + '</div>' +
      '<div><div class="u-name">' + escapeHtml(nombre) + '</div>' +
      '<div class="u-role">' + escapeHtml(conf.etiqueta) + '</div></div>';
  }

  /* Actualiza el usuario mostrado en el sidebar */
  window.actualizarSesion = function (patch) {
    Object.keys(patch || {}).forEach((k) => { sesion[k] = patch[k]; });
    try { localStorage.setItem('insbapaSesion', JSON.stringify(sesion)); } catch (e) { /* ignore */ }
    renderSidebarUser();
  };

  /* Expone la sesión actual para que los módulos la consulten */
  window.obtenerSesion = function () { return sesion; };

  function setActive(viewId) {
    sidebarNav.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === viewId));
  }

  function cerrarSesion() {
    localStorage.removeItem('insbapaSesion');
    showToast('Sesión cerrada. Hasta pronto.', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 700);
  }

  function renderPlaceholder(viewId, titulo) {
    viewEl.innerHTML =
      '<div class="page-head"><div class="crumb">' + escapeHtml(conf.etiqueta) + '</div>' +
      '<h2>' + escapeHtml(titulo) + '</h2></div>' +
      '<div class="card empty-state"><div class="big">&#128736;</div>' +
      '<h3>Módulo en construcción</h3><p class="muted">Este módulo se implementará en los próximos pasos del prototipo.</p></div>';
  }

  function navigate(viewId) {
    setActive(viewId);
    const mods = {
      estudiante: {
        dashboard: function () { EstudianteDashboard.render(); },
        anuncios: function () { EstudianteAnuncios.render(); },
        cursos: function () { EstudianteCursos.render(); },
        tareas: function () { EstudianteTareas.render(); },
        examenes: function () { EstudianteExamenes.render(); },
        notas: function () { EstudianteNotas.render(); },
      },
      profesor: {
        dashboard: function () { ProfesorDashboard.render(); },
        clases: function () { ProfesorClases.render(); },
        tareas: function () { ProfesorTareas.render(); },
        notas: function () { ProfesorNotas.render(); },
        examenes: function () { ProfesorExamenes.render(); },
        materiales: function () { ProfesorMateriales.render(); },
        anuncios: function () { ProfesorAnuncios.render(); },
      },
      administrador: {
        dashboard: function () { AdminDashboard.render(); },
        cursos: function () { AdminCursos.render(); },
        estudiantes: function () { AdminEstudiantes.render(); },
        profesores: function () { AdminProfesores.render(); },
        notas: function () { AdminNotas.render(); },
        anuncios: function () { AdminAnuncios.render(); },
        tokens: function () { AdminTokens.render(); },
        mantenimiento: function () { AdminMantenimiento.render(); },
      },
    };
    const mapa = mods[conf === ROLES.estudiante ? 'estudiante' : conf === ROLES.profesor ? 'profesor' : 'administrador'];
    if (viewId === 'dashboard' || (mapa && mapa[viewId])) {
      if (viewId === 'dashboard') {
        if (conf === ROLES.estudiante) EstudianteDashboard.render();
        else if (conf === ROLES.profesor) ProfesorDashboard.render();
        else AdminDashboard.render();
      } else {
        mapa[viewId]();
      }
    } else if (viewId === 'ajustes') {
      renderAjustes();
    } else {
      const item = conf.items.find((n) => n.id === viewId);
      renderPlaceholder(viewId, item ? item.label : viewId);
    }
  }

  /* ---------- Ajustes (compartido entre portales) ---------- */
  function renderAjustes() {
    const perfil = obtenerPerfil();
    const p = perfil[sesion.usuario] || {};
    const bloque =
      '<div class="page-head"><div class="crumb">' + escapeHtml(conf.etiqueta) + '</div>' +
      '<h2>Ajustes</h2><div class="page-sub">Configuración de perfil</div></div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">' +
      '<div class="card">' +
      '<div class="card-title">Información Personal</div><div class="card-sub">Tus datos de perfil.</div>' +
      '<div class="mt-2"><form id="ajustesPerfil" novalidate>' +
      '<div class="form-group"><label for="pfNombre">Nombre completo</label>' +
      '<input class="form-control" id="pfNombre" value="' + escapeHtml(p.nombre || sesion.nombre) + '"></div>' +
      '<div class="form-group"><label for="pfCorreo">Correo institucional</label>' +
      '<input class="form-control" id="pfCorreo" type="email" value="' + escapeHtml(p.correo || sesion.usuario + '@institute.edu') + '"></div>' +
      '<button class="btn btn-primary" type="submit">Guardar perfil</button>' +
      '</form></div></div>' +
      '<div class="card">' +
      '<div class="card-title">Seguridad y Contraseña</div><div class="card-sub">Actualiza tu contraseña de acceso.</div>' +
      '<div class="mt-2"><form id="ajustesPassword" novalidate>' +
      '<div class="form-group"><label for="paNueva">Nueva contraseña</label>' +
      '<input class="form-control" id="paNueva" type="password" placeholder="••••••••"></div>' +
      '<div class="form-group"><label for="paConfirma">Confirmar contraseña</label>' +
      '<input class="form-control" id="paConfirma" type="password" placeholder="••••••••"></div>' +
      '<button class="btn btn-primary" type="submit">Actualizar contraseña</button>' +
      '</form></div></div>' +
      '</div>';

    viewEl.innerHTML = bloque;

    document.getElementById('ajustesPerfil').addEventListener('submit', (e) => {
      e.preventDefault();
      const nuevo = Object.assign({}, perfil[sesion.usuario] || {}, {
        nombre: document.getElementById('pfNombre').value.trim(),
        correo: document.getElementById('pfCorreo').value.trim(),
      });
      perfil[sesion.usuario] = nuevo;
      guardarPerfil(perfil);
      actualizarSesion({ nombre: nuevo.nombre });
      showToast('Perfil actualizado.', 'success');
    });

    document.getElementById('ajustesPassword').addEventListener('submit', (e) => {
      e.preventDefault();
      const nueva = document.getElementById('paNueva').value;
      const confirma = document.getElementById('paConfirma').value;
      if (nueva.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
        return;
      }
      if (nueva !== confirma) {
        showToast('Las contraseñas no coinciden.', 'error');
        return;
      }
      guardarCambioContrasena(sesion.usuario, nueva);
      showToast('Contraseña actualizada correctamente.', 'success');
      document.getElementById('paNueva').value = '';
      document.getElementById('paConfirma').value = '';
    });
  }

  /* Expone navegación para módulos (botones data-nav) */
  window.navigateDemo = navigate;

  /* ---------- Topbar ---------- */
  document.getElementById('btnSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('globalSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const term = e.target.value.trim();
      if (term) showToast('Búsqueda global por: "' + term + '" (demo).', 'info');
    }
  });
  document.getElementById('topbarDate').textContent = new Date().toLocaleDateString('es-GT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  /* ---------- Arranque ---------- */
  renderSidebar();
  navigate('dashboard');
})();