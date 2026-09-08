/* ============================================================
   INSBAPA - Prototipo
   Store de datos persistente (localStorage)
   Los datos semilla vienen de data.js; los cambios se guardan
   para que no se pierdan al recargar la página.
   ============================================================ */

const STORE_CONTRASENA = 'insbapaContrasenaStore';
const STORE_PERFIL = 'insbapaPerfilStore';
const STORE_TOKENS = 'insbapaTokensStore';
const STORE_CUENTAS = 'insbapaCuentasStore';

function leerJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* usar fallback */ }
  return fallback;
}

function guardarJson(key, valor) {
  try { localStorage.setItem(key, JSON.stringify(valor)); } catch (e) { /* ignore */ }
}

/* ---------- Cambios de contraseña (desde Ajustes) ---------- */
function obtenerCambiosContrasena() {
  return leerJson(STORE_CONTRASENA, {});
}

function guardarCambioContrasena(usuario, nueva) {
  const cambios = obtenerCambiosContrasena();
  cambios[usuario] = nueva;
  guardarJson(STORE_CONTRASENA, cambios);
}

/* ---------- Perfil (desde Ajustes) ---------- */
function obtenerPerfil() {
  return leerJson(STORE_PERFIL, {});
}

function guardarPerfil(perfil) {
  guardarJson(STORE_PERFIL, perfil);
}

/* ---------- Tokens de matrícula ---------- */
function obtenerTokens() {
  return leerJson(STORE_TOKENS, []);
}

function guardarTokens(lista) {
  guardarJson(STORE_TOKENS, lista);
}

/* Merge de tokens semilla (data.js) con los persistidos en localStorage.
   Los cambios de usos/estado guardados sobreescriben a la semilla. */
function todosLosTokens() {
  const persistidos = obtenerTokens();
  const mapa = {};
  persistidos.forEach((t) => { mapa[t.token] = t; });
  const semilla = (typeof TOKENS_REGISTRO !== 'undefined') ? TOKENS_REGISTRO : [];
  const base = semilla.map((t) => mapa[t.token] || Object.assign({}, t));
  semilla.forEach((t) => { delete mapa[t.token]; });
  return base.concat(Object.keys(mapa).map((k) => mapa[k]));
}

/* ---------- Cuentas creadas por auto-registro ---------- */
function obtenerCuentas() {
  return leerJson(STORE_CUENTAS, {});
}

function guardarCuentas(cuentas) {
  guardarJson(STORE_CUENTAS, cuentas);
}