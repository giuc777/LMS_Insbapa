/* ============================================================
   INSBAPA - Prototipo
   Login: selector de rol, validaciones y credenciales quemadas
   ============================================================ */

(function () {
  const form = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const btnLogin = document.getElementById('btnLogin');
  const btnLoginText = document.getElementById('btnLoginText');
  const heroTitle = document.getElementById('heroTitle');
  const heroTagline = document.getElementById('heroTagline');

  const credenciales = (typeof CREDENCIALES !== 'undefined') ? CREDENCIALES : {};

  /* Sobrescribe contraseñas cambiadas en Ajustes (persistidas en localStorage) */
  try {
    const cambios = JSON.parse(localStorage.getItem('insbapaContrasenaStore') || 'null');
    if (cambios) {
      Object.keys(cambios).forEach((u) => {
        if (credenciales[u]) credenciales[u].password = cambios[u];
      });
    }
  } catch (e) { /* sin cambios */ }

  /* Fusiona las cuentas creadas por auto-registro (registro.html) */
  const cuentas = (typeof obtenerCuentas === 'function') ? obtenerCuentas() : {};
  Object.keys(cuentas).forEach((u) => {
    credenciales[u] = cuentas[u];
  });

  /* --- Tagline del lado izquierdo según rol seleccionado --- */
  const TAGLINES = {
    estudiante: {
      titulo: 'Plataforma de educación Inteligente y evaluación académica',
      texto: 'Accede a tus cursos, sigue tu progreso y colabora con tus compañeros en nuestro ecosistema de aprendizaje unificado.',
    },
    profesor: {
      titulo: 'Plataforma de educación Inteligente y evaluación académica',
      texto: 'Accede a tus cursos, sigue el progreso de tus alumnos, asigna tareas y haz evaluaciones en nuestro ecosistema de aprendizaje unificado.',
    },
    admin: {
      titulo: 'Plataforma de educación Inteligente y evaluación académica',
      texto: 'Accede a la plataforma, realiza ajustes de mantenimiento, observa reportes y recupera contraseñas.',
    },
  };

  function aplicarTagline(rol) {
    const t = TAGLINES[rol] || TAGLINES.estudiante;
    heroTitle.textContent = t.titulo;
    heroTagline.textContent = t.texto;
  }

  document.querySelectorAll('input[name="rol"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) aplicarTagline(radio.value);
    });
  });

  /* --- Validación de campos vacíos --- */
  function validarUsuario() {
    const input = document.getElementById('usuario');
    const ok = input.value.trim().length > 0;
    input.classList.toggle('is-invalid', !ok);
    document.getElementById('err-usuario').classList.toggle('visible', !ok);
    return ok;
  }

  function validarContrasena() {
    const input = document.getElementById('contrasena');
    const ok = input.value.length > 0;
    input.classList.toggle('is-invalid', !ok);
    document.getElementById('err-contrasena').classList.toggle('visible', !ok);
    return ok;
  }

  document.getElementById('usuario').addEventListener('input', () => {
    document.getElementById('usuario').classList.remove('is-invalid');
    document.getElementById('err-usuario').classList.remove('visible');
    loginError.classList.remove('visible');
  });
  document.getElementById('contrasena').addEventListener('input', () => {
    document.getElementById('contrasena').classList.remove('is-invalid');
    document.getElementById('err-contrasena').classList.remove('visible');
    loginError.classList.remove('visible');
  });

  /* --- Login --- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.classList.remove('visible');

    const usuarioOk = validarUsuario();
    const contrasenaOk = validarContrasena();
    if (!usuarioOk || !contrasenaOk) {
      showToast('Complete los campos obligatorios.', 'warning');
      return;
    }

    const rol = document.querySelector('input[name="rol"]:checked').value;
    const usuario = document.getElementById('usuario').value.trim().toLowerCase();
    const contrasena = document.getElementById('contrasena').value;

    btnLogin.disabled = true;
    btnLoginText.textContent = 'Verificando...';

    /* Simula la autenticación (sin base de datos) */
    setTimeout(() => {
      const match = credenciales[usuario];
      const ROL_ALIAS = { estudiante: 'estudiante', profesor: 'profesor', admin: 'administrador' };
      const rolOK = match && match.usuario.rol.toLowerCase() === ROL_ALIAS[rol];
      const autenticado = match && match.password === contrasena && match.usuario.activo && rolOK;

      if (autenticado) {
        /* El rol seleccionado manda: usar credencial del rol correcto si existe variante */
        const sesion = {
          usuarioId: match.usuario.id,
          usuario: match.usuario.usuario,
          nombre: match.usuario.nombre,
          rol: match.usuario.rol,
          rolKey: rol === 'admin' ? 'administrador' : rol,
          iniciales: match.usuario.iniciales,
          login: new Date().toISOString(),
        };
        localStorage.setItem('insbapaSesion', JSON.stringify(sesion));
        showToast('Bienvenido, ' + match.usuario.nombre + '.', 'success');
        setTimeout(() => { window.location.href = 'sistema.html'; }, 700);
      } else {
        btnLogin.disabled = false;
        btnLoginText.textContent = 'Iniciar Sesión';
        loginError.classList.add('visible');
        showToast('Usuario, contraseña o rol incorrectos.', 'error');
      }
    }, 600);
  });

  /* Redirigir al sistema si ya hay sesión activa */
  if (localStorage.getItem('insbapaSesion')) {
    window.location.href = 'sistema.html';
  }
})();