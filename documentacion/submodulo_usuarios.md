# Submódulo: Usuarios y Configuración

Módulo completo de gestión de usuarios y configuración personal del sistema INSBAPA.

---

## 1. Estructura general

El módulo se divide en dos partes principales:

- **Mi Perfil** — Disponible para todos los roles. Permite editar datos personales y cambiar contraseña propia.
- **Gestión de Usuarios** — Disponible solo para el rol **Administrador**. CRUD de estudiantes, profesores y administradores.

Ambas partes conviven en la ruta `/sistema/ajustes`, con un sistema de pestañas que se muestra solo para administradores.

---

## 2. Ruta y navegación

| Ruta | Componente | Protección |
|---|---|---|
| `/sistema/ajustes` | `AjustesComponent` | `authGuard` (requiere login) |

En la barra lateral (`ShellComponent`), el enlace "Ajustes" aparece para todos los usuarios autenticados.

---

## 3. Modelo de datos

```typescript
// front-end/src/app/models/usuario.model.ts
export interface Usuario {
  usuarioId: number;
  username: string;
  iniciales: string;
  rol: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  correo: string;
  telefono?: string;
  fechaNacimiento?: string;
  activo: boolean;
  // Estudiante
  estudianteId?: number;
  carnet?: string;
  gradoId?: number;
  grado?: string;
  seccionId?: number;
  seccion?: string;
  // Profesor
  profesorId?: number;
  codigoProfesor?: string;
}
```

---

## 4. Front-end — Componentes

### 4.1 AjustesComponent (padre)

**Archivos:**
- `front-end/src/app/pages/ajustes/ajustes.component.ts`
- `front-end/src/app/pages/ajustes/ajustes.component.html`
- `front-end/src/app/pages/ajustes/ajustes.component.css`

**Funcionamiento:**
1. Al inicializar, verifica si el usuario es administrador (`authService.getRolKey() === 'administrador'`).
2. Carga los datos del usuario autenticado en signals.
3. Muestra las pestañas "Mi Perfil" / "Gestión de Usuarios" solo si es admin.
4. Para todos los roles, muestra el formulario de perfil y cambio de contraseña.

**Pestañas (solo admin):**

| Pestaña | Contenido |
|---|---|
| `Mi Perfil` | Formulario de datos personales + cambio de contraseña propia |
| `Gestión de Usuarios` | Componente hijo `<app-ajustes-usuarios>` |

**Formularios:**

| Formulario | Campos | Endpoint |
|---|---|---|
| Información Personal | primerNombre, segundoNombre, primerApellido, segundoApellido, correo, telefono, fechaNacimiento | `PUT /api/auth/perfil` |
| Seguridad y Contraseña | contrasenaActual, nuevaContrasena, confirmarContrasena | `POST /api/auth/cambiar-contrasena` |

### 4.2 AjustesUsuariosComponent (hijo)

**Archivos:**
- `front-end/src/app/pages/ajustes/ajustes-usuarios/ajustes-usuarios.component.ts`
- `front-end/src/app/pages/ajustes/ajustes-usuarios/ajustes-usuarios.component.html`
- `front-end/src/app/pages/ajustes/ajustes-usuarios/ajustes-usuarios.component.css`

**Funcionamiento:**
1. Muestra tres pestañas: Estudiantes, Profesores, Administradores.
2. Cada pestaña tiene una tabla de datos con barra de búsqueda.
3. Los estudiantes admiten filtros adicionales por Grado y Sección.
4. El botón "+" abre un modal de creación dinámico según el tipo de usuario seleccionado.
5. El ícono de candado en cada fila abre un modal para cambiar la contraseña del usuario (sin verificar la actual).

**Pestañas y sus columnas:**

| Pestaña | Columnas de tabla | Filtros |
|---|---|---|
| Estudiantes | Carnet, Nombre completo, Grado, Sección, Correo, Acciones | Búsqueda + Grado + Sección |
| Profesores | Código, Nombre completo, Correo, Teléfono, Acciones | Búsqueda |
| Administradores | Nombre completo, Correo, Teléfono, Acciones | Búsqueda |

**Modal de creación por tipo:**

| Tipo | Campos obligatorios | Campos adicionales |
|---|---|---|
| Estudiante | Nombre, Apellido, Correo, Username, Contraseña | Grado (select), Sección (select) |
| Profesor | Nombre, Apellido, Correo, Teléfono, Username, Contraseña | Código Profesor |
| Administrador | Nombre, Apellido, Correo, Teléfono, Username, Contraseña | — |

**Modal de cambio de contraseña (admin):**
- Muestra el nombre del usuario seleccionado.
- Campo: Nueva contraseña.
- Endpoint: `POST /api/admin/cambiar-contrasena`
- **Nota:** No verifica la contraseña actual del admin (privilegio de administrador).

---

## 5. Front-end — Servicios

### 5.1 AdminService

**Archivo:** `front-end/src/app/services/admin.service.ts`

Responsable de todas las llamadas HTTP del módulo de administración de usuarios.

| Método | HTTP | Endpoint | Parámetros |
|---|---|---|---|
| `listarEstudiantes(busqueda?, gradoId?, seccionId?)` | GET | `/api/admin/estudiantes` | Query params opcionales |
| `listarProfesores(busqueda?)` | GET | `/api/admin/profesores` | Query param opcional |
| `listarAdministradores(busqueda?)` | GET | `/api/admin/administradores` | Query param opcional |
| `obtenerGrados()` | GET | `/api/admin/grados` | — |
| `obtenerSecciones()` | GET | `/api/admin/secciones` | — |
| `crearEstudiante(data)` | POST | `/api/admin/estudiantes` | Body: `CrearEstudianteRequest` |
| `crearProfesor(data)` | POST | `/api/admin/profesores` | Body: `CrearProfesorRequest` |
| `crearAdministrador(data)` | POST | `/api/admin/administradores` | Body: `CrearAdministradorRequest` |
| `cambiarContrasena(usuarioId, nuevaContrasena)` | POST | `/api/admin/cambiar-contrasena` | Body: `{ usuarioId, nuevaContrasena }` |

### 5.2 AuthService (usado por Mi Perfil)

**Archivo:** `front-end/src/app/services/auth.service.ts`

Métodos relevantes para este módulo:

| Método | Endpoint | Uso |
|---|---|---|
| `actualizarPerfil(datos)` | `PUT /api/auth/perfil` | Guardar cambios del perfil propio |
| `cambiarContrasena(body)` | `POST /api/auth/cambiar-contrasena` | Cambiar contraseña propia (requiere actual) |
| `updateLocalUser(usuario)` | — | Actualiza localStorage + signal después de guardar |
| `getRolKey()` | — | Retorna string del rol para controlar visibilidad de pestañas |

---

## 6. Back-end — Endpoints

### 6.1 AdminUsuariosEndpoints

**Archivo:** `back-end/API-LMS/API-LMS/Endpoints/AdminUsuariosEndpoints.cs`

Todos los endpoints requieren `[Authorize(Roles = "Administrador")]`.

| Método | Ruta | SP | Descripción |
|---|---|---|---|
| GET | `/api/admin/estudiantes` | `SP_ListarEstudiantes` | Listar/buscar estudiantes |
| GET | `/api/admin/profesores` | `SP_ListarProfesores` | Listar/buscar profesores |
| GET | `/api/admin/administradores` | `SP_ListarAdministradores` | Listar/buscar administradores |
| GET | `/api/admin/grados` | `SP_ObtenerGrados` | Catálogo de grados |
| GET | `/api/admin/secciones` | `SP_ObtenerSecciones` | Catálogo de secciones |
| POST | `/api/admin/estudiantes` | `SP_RegistrarEstudianteAdmin` | Crear estudiante (sin token) |
| POST | `/api/admin/profesores` | `SP_RegistrarProfesor` | Crear profesor |
| POST | `/api/admin/administradores` | `SP_RegistrarAdministrador` | Crear administrador |
| POST | `/api/admin/cambiar-contrasena` | `SP_AdminCambiarContrasena` | Reset de contraseña por admin |

### 6.2 AuthEndpoints (perfil propio)

**Archivo:** `back-end/API-LMS/API-LMS/Endpoints/AuthEndpoints.cs`

| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/api/auth/perfil` | Actualizar datos personales del usuario autenticado |
| POST | `/api/auth/cambiar-contrasena` | Cambiar contraseña (requiere contraseña actual) |

### 6.3 DTOs de request

```csharp
// AdminUsuariosEndpoints.cs
public record CrearEstudianteRequest(
    string PrimerNombre, string SegundoNombre,
    string PrimerApellido, string SegundoApellido,
    string Correo, string Telefono,
    string Username, string Contrasena,
    int GradoId, int SeccionId
);

public record CrearProfesorRequest(
    string PrimerNombre, string SegundoNombre,
    string PrimerApellido, string SegundoApellido,
    string Correo, string Telefono,
    string Username, string Contrasena,
    string CodigoProfesor
);

public record CrearAdministradorRequest(
    string PrimerNombre, string SegundoNombre,
    string PrimerApellido, string SegundoApellido,
    string Correo, string Telefono,
    string Username, string Contrasena
);

public record AdminCambiarContrasenaRequest(
    int UsuarioId, string NuevaContrasena
);
```

---

## 7. Back-end — Servicios

### 7.1 DbService

**Archivo:** `back-end/API-LMS/API-LMS/Services/DbService.cs`

Métodos relevantes para el módulo:

| Método | SP | Retorna |
|---|---|---|
| `EjecutarSpAsync(spName, params)` | Cualquier SP | `List<Dictionary<string, object?>>` (genérico) |
| `RegistrarEstudianteAdminAsync(...)` | `SP_RegistrarEstudianteAdmin` | `int` (Usuario_ID) |
| `RegistrarProfesorAdminAsync(...)` | `SP_RegistrarProfesor` | `int` (Usuario_ID) |
| `RegistrarAdministradorAsync(...)` | `SP_RegistrarAdministrador` | `int` (Usuario_ID) |
| `AdminCambiarContrasenaAsync(usuarioId, hash)` | `SP_AdminCambiarContrasena` | `bool` |
| `ActualizarPerfilAsync(...)` | `SP_ActualizarPerfil` | — |
| `CambiarContrasenaAsync(usuarioId, hash)` | `SP_CambiarContrasena` | — |
| `GetUsuarioPorIdAsync(usuarioId)` | `SP_ObtenerUsuarioPorId` | Datos del usuario |

---

## 8. Base de datos — Stored Procedures

### 8.1 SPs de administración de usuarios

**Archivo:** `database/sp_administracion_usuarios.sql`

| SP | Parámetros | Descripción |
|---|---|---|
| `SP_ListarEstudiantes` | `@Busqueda?`, `@Grado_ID?`, `@Seccion_ID?` | Buscar/filtrar estudiantes |
| `SP_ListarProfesores` | `@Busqueda?` | Buscar profesores |
| `SP_ListarAdministradores` | `@Busqueda?` | Buscar administradores |
| `SP_AdminCambiarContrasena` | `@Usuario_ID`, `@NuevaContrasena` | Reset de contraseña por admin |
| `SP_ObtenerGrados` | — | Catálogo de grados |
| `SP_ObtenerSecciones` | — | Catálogo de secciones |
| `SP_RegistrarEstudianteAdmin` | 10 parámetros (nombres, correo, user, pass, grado, sección) | Crear estudiante sin token |

### 8.2 SPs base (en 02-stored-procedures.sql)

| SP | Uso en este módulo |
|---|---|
| `SP_RegistrarProfesor` | Crear profesor desde panel admin |
| `SP_RegistrarAdministrador` | Crear administrador desde panel admin |
| `SP_ActualizarPerfil` | Actualizar perfil propio |
| `SP_CambiarContrasena` | Cambiar contraseña propia |
| `SP_ObtenerUsuarioPorId` | Obtener datos del usuario autenticado |

**Nota importante:** `SP_RegistrarEstudianteAdmin` fue creado como SP separado porque no requiere token de registro (el admin crea directamente). `SP_RegistrarEstudiante` (el original) sí requiere un token válido.

---

## 9. Seguridad

- Todos los endpoints de admin usan `[Authorize(Roles = "Administrador")]`.
- El rol en el JWT es case-sensitive: debe coincidir exactamente con `"Administrador"` (como está en la BD).
- `SP_AdminCambiarContrasena` NO verifica la contraseña actual del admin (es un privilegio de administración).
- `SP_CambiarContrasena` (para cambio propio) SÍ requiere la contraseña actual verificada en .NET con BCrypt.
- Las contraseñas se hashean con BCrypt en .NET antes de enviarse a la BD.

---

## 10. Flujo completo de operaciones

### Crear estudiante (admin)
```
1. Admin abre /sistema/ajustes → pestaña "Gestión de Usuarios"
2. Pestaña "Estudiantes" activa → clic en "+"
3. Modal se abre → completa campos (nombre, apellido, correo, user, pass, grado, sección)
4. Submit → AdminService.crearEstudiante() → POST /api/admin/estudiantes
5. Back-end: SP_RegistrarEstudianteAdmin crea Persona + Usuario + Estudiante
6. Front-end recarga la lista de estudiantes
```

### Cambiar contraseña de usuario (admin)
```
1. Admin hace clic en ícono candado de cualquier fila
2. Modal se abre → muestra nombre del usuario → ingresa nueva contraseña
3. Submit → AdminService.cambiarContrasena() → POST /api/admin/cambiar-contrasena
4. Back-end: SP_AdminCambiarContrasena actualiza el hash directamente
5. Modal se cierra con mensaje de éxito
```

### Editar perfil propio (cualquier rol)
```
1. Usuario abre /sistema/ajustes → pestaña "Mi Perfil" (o única vista si no es admin)
2. Modifica campos del formulario → clic "Guardar Cambios"
3. Submit → AuthService.actualizarPerfil() → PUT /api/auth/perfil
4. Back-end: SP_ActualizarPerfil actualiza la persona
5. Front-end: updateLocalUser() refresca localStorage y signal
```

---

## 11. Archivos del módulo

| # | Capa | Archivo | Propósito |
|---|---|---|---|
| 1 | FE | `pages/ajustes/ajustes.component.ts` | Componente padre (perfil + tabs admin) |
| 2 | FE | `pages/ajustes/ajustes.component.html` | Template del padre |
| 3 | FE | `pages/ajustes/ajustes.component.css` | Estilos del padre |
| 4 | FE | `pages/ajustes/ajustes-usuarios/ajustes-usuarios.component.ts` | CRUD de usuarios |
| 5 | FE | `pages/ajustes/ajustes-usuarios/ajustes-usuarios.component.html` | Template de usuarios |
| 6 | FE | `pages/ajustes/ajustes-usuarios/ajustes-usuarios.component.css` | Estilos de usuarios |
| 7 | FE | `services/admin.service.ts` | HTTP client para endpoints de admin |
| 8 | FE | `services/auth.service.ts` | HTTP client para perfil propio |
| 9 | FE | `models/usuario.model.ts` | Interfaces de datos |
| 10 | FE | `app.routes.ts` | Definición de ruta `/sistema/ajustes` |
| 11 | FE | `pages/shell/shell.component.ts` | Enlace en barra lateral |
| 12 | BE | `Endpoints/AdminUsuariosEndpoints.cs` | 9 endpoints admin + DTOs |
| 13 | BE | `Endpoints/AuthEndpoints.cs` | Endpoints de perfil y contraseña propia |
| 14 | BE | `Services/DbService.cs` | Métodos de acceso a BD |
| 15 | DB | `sp_administracion_usuarios.sql` | 7 stored procedures de admin |
| 16 | DB | `02-stored-procedures.sql` | SPs base (registrar profesor/admin, perfil, contraseña) |
