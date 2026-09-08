# AGENTS.md

## Proyecto
INSBAPA — Plataforma Educativa (LMS) para un instituto de educación secundaria (Ciclo Básico). Prototipo estático en HTML/CSS/JS puro, sin backend ni framework. Todo el dominio (nombres, mensajes, comentarios) va en español.

## Estructura
- `index.html` — redirige al login.
- `login.html` — pantalla dividida: imagen de fondo + logo a la izquierda, formulario con **selector de rol** a la derecha. Incluye enlace al auto-registro.
- `registro.html` — auto-registro de estudiante por **código de matrícula (token)**: valida el token, completa datos y crea la cuenta local.
- `sistema.html` — shell de la aplicación (sidebar + topbar + `#view`).
- `css/styles.css` — design system (paleta verde `#52A344`, fondo `#F6F7F6`, fuente Lexend).
- `img/` — `login-bg.png` y `logo-insbapa.png` (descargados del Figma).
- `js/ui.js` — helpers compartidos: toasts, modales, `escapeHtml`, iconos SVG en `ICONS`.
- `js/data.js` — datos quemados y credenciales demo; también `GRADOS_SECCIONES` y `TOKENS_REGISTRO`.
- `js/store.js` — persistencia en localStorage (perfil, contraseña, tokens y cuentas auto-registradas).
- `js/login.js` — login con validaciones y sesión por rol; fusiona cuentas auto-registradas.
- `js/registro.js` — lógica del auto-registro por token (simula `POST /api/TokenRegistro`).
- `js/app.js` — enrutado de vistas y navegación según el rol del usuario.
- `js/modulos/{estudiante,profesor,admin}/` — un archivo por pantalla; módulos IIFE que exponen `render()`. Admin incluye `tokens.js` (generar/listar códigos de matrícula).

## Accesos demo
| Portal | Usuario | Contraseña |
|--------|---------|------------|
| Estudiante | `estudiante` | `estudiante123` |
| Profesor | `profesor` | `profesor123` |
| Administrador | `admin` | `admin123` |

Código de matrícula demo (auto-registro): `REG-DEMO2026` (40 usos).

## Módulos por portal
- **Estudiante** — Dashboard, Anuncios, Cursos, Tareas, Exámenes (flujo completo con temporizador y mapa de preguntas), Notas, Ajustes.
- **Profesor** — Dashboard, Mis Clases, Tareas (crear/calificar), Notas, Materiales, Anuncios.
- **Admin** — Dashboard, Cursos, Estudiantes, Profesores, Notas, Anuncios, Tokens, Mantenimiento.

## Diseño / Figma
- El diseño viene del archivo Figma "Login" (file key `TCq9APVyMdbIcO2BM0n3R5`).
- El dashboard admin sigue el nodo `71:296` del Figma.

## Cómo correr
1. Servir la carpeta con un servidor estático, por ejemplo: `python -m http.server 5050` desde `prototipo-insbapa/`.
2. Abrir `http://localhost:5050/login.html`.
Puede funcionar abriendo `login.html` directamente con `file://`, pero se recomienda servidor local.

## Reglas clave
- HTML/CSS/JS vanilla, sin librerías externas.
- Los datos se queman en `data.js`; los cambios de perfil/contraseña persisten en localStorage.
- Los tokens y las cuentas auto-registradas persisten en localStorage (`insbapaTokensStore`, `insbapaCuentasStore`); `store.js` expone `todosLosTokens()` (merge de semilla + persistido).
- Cada módulo es un IIFE que expone `render()`; no usar ids globales fuera de los módulos.
- La navegación entre vistas usa botones con `data-nav` (los módulos llaman `window.navigateDemo(...)`) o `data-*` con listeners.
- Verificar los `.js` con `node --check` y probar la navegación manualmente en el navegador (no hay lint/ESLint).

## Gotchas
- **Script load order matters**: `ui.js` → `data.js` → `store.js` → módulos → `app.js`/`login.js`. Si se reordena o agrega un `<script>`, los IIFEs de módulos dependen de `ICONS`, `escapeHtml`, `CREDENCIALES` y `todosLosTokens()` que ya existen al momento de carga.
- Cambiar una contraseña desde Ajustes persiste en localStorage y sobreescribe la demo al iniciar sesión.
- El rol del login usa alias (`admin` → credencial `Administrador`); no cambiar `rolKey`/`ROLES` en `app.js` sin ajustar el mapa de roles en `login.js` y `app.js`.
- `login.html` y `registro.html` cargan `js/store.js` (además de `ui.js` y `data.js`); `login.js` depende de `obtenerCuentas()`.
- Las cuentas creadas por auto-registro se guardan en `insbapaCuentasStore` y solo persisten en ese navegador; no se escriben en `data.js`.
- Solo `EXA-01` tiene `EXAMEN_ACTIVO` definido en `data.js`; el botón "Comenzar" del examen está hardcodeado a ese ID (`examenes.js:20`). Si se agregan más exámenes activos, refactorizar la referencia.