/* ============================================================
   INSBAPA - Prototipo
   Registro de estudiante por código de matrícula (token).
   Valida el token, completa los datos y crea la cuenta local
   para que funcione el login (simula POST /api/TokenRegistro).
   ============================================================ */

(function () {
  const errorBox = document.getElementById('registroError');
  const pasoToken = document.getElementById('pasoToken');
  const pasoDatos = document.getElementById('pasoDatos');
  const tokenOk = document.getElementById('tokenOk');
  let tokenActual = null;

  /* ---------- Utilidades ---------- */

  function ocultarError() {
    errorBox.classList.remove('visible');
  }

  function mostrarError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
  }

  function tokenValido(t) {
    if (!t || !t.activo) return false;
    if (t.usosActual >= t.maximoUsos) return false;
    if (t.fechaExpiracion && new Date(t.fechaExpiracion) < new Date()) return false;
    return true;
  }

  function consumirToken(codigo) {
    const lista = todosLosTokens();
    const t = lista.find((x) => x.token === codigo);
    if (!t) return null;
    t.usosActual += 1;
    if (t.usosActual >= t.maximoUsos) t.activo = false;
    guardarTokens(lista);
    return t;
  }

  /* ---------- Selects de grado / sección ---------- */

  function llenarGrados() {
    const sel = document.getElementById('rgGrado');
    sel.innerHTML = GRADOS_SECCIONES
      .map((g) => opt('', g.grado, g.grado))
      .join('');
  }

  function llenarSecciones(grado) {
    const g = GRADOS_SECCIONES.find((x) => x.grado === grado);
    const sel = document.getElementById('rgSeccion');
    sel.innerHTML = (g ? g.secciones : [])
      .map((s) => opt('', s, s))
      .join('');
  }

  /* ---------- PASO 1: validar token ---------- */

  document.getElementById('formToken').addEventListener('submit', (e) => {
    e.preventDefault();
    ocultarError();

    const input = document.getElementById('tokenRegistro');
    const codigo = input.value.trim().toUpperCase();
    const ok = validateField(input, () => codigo.length > 0, 'El código de matrícula es obligatorio.');
    if (!ok) return;

    const t = todosLosTokens().find((x) => x.token === codigo);
    if (!tokenValido(t)) {
      mostrarError('Código inválido, expirado o sin usos disponibles. Solicita un nuevo código a la institución.');
      return;
    }

    tokenActual = t;
    pasoToken.style.display = 'none';
    pasoDatos.style.display = 'block';
    ocultarError();

    tokenOk.innerHTML =
      '<span>' + ICONS.check + '</span>' +
      '<div>Tu código es válido para <b>' + escapeHtml(t.descripcion || 'matrícula') +
      '</b> · Rol <b>' + escapeHtml(t.rol) + '</b></div>' +
      '<span class="badge badge-green">Válido</span>';

    llenarGrados();
    document.getElementById('rgGrado').dispatchEvent(new Event('change'));
    document.getElementById('rgPrimerNombre').focus();
  });

  document.getElementById('rgGrado').addEventListener('change', (e) => {
    llenarSecciones(e.target.value);
  });

  /* ---------- PASO 2: crear cuenta ---------- */

  document.getElementById('btnVolverLogin').addEventListener('click', () => {
    window.location.href = 'login.html';
  });

  document.getElementById('btnCambiarToken').addEventListener('click', () => {
    tokenActual = null;
    pasoDatos.style.display = 'none';
    pasoToken.style.display = 'block';
    document.getElementById('tokenRegistro').value = '';
    ocultarError();
  });

  document.getElementById('formRegistro').addEventListener('submit', (e) => {
    e.preventDefault();
    ocultarError();

    const primerNombre = document.getElementById('rgPrimerNombre').value.trim();
    const segundoNombre = document.getElementById('rgSegundoNombre').value.trim();
    const primerApellido = document.getElementById('rgPrimerApellido').value.trim();
    const segundoApellido = document.getElementById('rgSegundoApellido').value.trim();
    const email = document.getElementById('rgEmail').value.trim().toLowerCase();
    const grado = document.getElementById('rgGrado').value;
    const seccion = document.getElementById('rgSeccion').value;
    const username = document.getElementById('rgUsuario').value.trim().toLowerCase();
    const pass = document.getElementById('rgPassword').value;
    const pass2 = document.getElementById('rgPassword2').value;

    const okNombre = validateField(document.getElementById('rgPrimerNombre'), () => primerNombre.length > 0, 'Obligatorio.');
    const okApellido = validateField(document.getElementById('rgPrimerApellido'), () => primerApellido.length > 0, 'Obligatorio.');
    const okEmail = validateField(document.getElementById('rgEmail'), () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Ingresa un correo válido.');
    const okGrado = validateField(document.getElementById('rgGrado'), () => grado.length > 0, 'Selecciona un grado.');
    const okSeccion = validateField(document.getElementById('rgSeccion'), () => seccion.length > 0, 'Selecciona una sección.');
    const okPass = validateField(document.getElementById('rgPassword'), () => pass.length >= 6, 'Mínimo 6 caracteres.');
    const okPass2 = validateField(document.getElementById('rgPassword2'), () => pass2.length > 0 && pass === pass2, 'Las contraseñas no coinciden.');

    const credencialesActuales = (typeof CREDENCIALES !== 'undefined') ? CREDENCIALES : {};
    const cuentas = obtenerCuentas();
    const usernameTomado = credencialesActuales[username] || cuentas[username];
    const okUsuario = validateField(document.getElementById('rgUsuario'),
      () => /^[a-z0-9._-]{3,30}$/.test(username) && !usernameTomado,
      usernameTomado ? 'El usuario ya existe.' : 'Usa letras, números, punto, guion (mín. 3).');

    if (!(okNombre && okApellido && okEmail && okGrado && okSeccion && okPass && okPass2 && okUsuario)) {
      showToast('Complete los campos obligatorios.', 'warning');
      return;
    }

    const nombre = [primerNombre, segundoNombre, primerApellido, segundoApellido]
      .filter(Boolean).join(' ');

    cuentas[username] = {
      password: pass,
      usuario: {
        id: 'USR-' + String(Object.keys(cuentas).length + 100).padStart(3, '0'),
        usuario: username,
        nombre: nombre,
        rol: 'Estudiante',
        iniciales: nombre.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
        activo: true,
        correo: email,
        grado: grado,
        seccion: seccion,
      },
    };
    guardarCuentas(cuentas);

    consumirToken(tokenActual.token);

    showToast('Cuenta creada correctamente. Ya puedes iniciar sesión.', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
  });

  /* Limpiar error al escribir */
  ['rgPrimerNombre', 'rgPrimerApellido', 'rgEmail', 'rgGrado', 'rgSeccion', 'rgUsuario', 'rgPassword', 'rgPassword2']
    .forEach((id) => {
      document.getElementById(id).addEventListener('input', () => {
        document.getElementById(id).classList.remove('is-invalid');
        const err = document.getElementById('err-' + id);
        if (err) err.classList.remove('visible');
        ocultarError();
      });
    });
})();
