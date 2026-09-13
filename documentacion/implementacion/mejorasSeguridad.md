# Plan de Implementación — Mejoras de Seguridad en LexControl

> **Audiencia:** Agente de IA o desarrollador backend/frontend.
> **Objetivo:** Migrar la autenticación de LexControl de SHA256 sin salt + JWT de 120 min a BCrypt + Refresh Tokens + Blacklist de JWT.
> **Repositorio base:** `LexControl/`
> **Rama sugerida:** `feature/security-hardening`

---

## 📋 Contexto del proyecto

LexControl es un sistema de gestión de expedientes jurídicos compuesto por:

- **Backend:** API REST en `.NET 10` con Dapper + JWT. Carpeta: `Desarrollo/Back-end/LexControlApi/`
- **Frontend:** SPA Angular 20 con standalone components. Carpeta: `Desarrollo/Front-end/LexControlFornt/`
- **Base de datos:** SQL Server `DBLexControl`. Scripts en raíz: `Base_Datos.sql`, `Proceso_almacenados.sql`, `Usuarios_SP.sql`.

**Convenciones obligatorias (ver `AGENTS.md`):**

| Aspecto | Regla |
|---|---|
| Nombres de tablas | `UPPERCASE` |
| Nombres de columnas | `CamelCase` |
| Nombres de SP | `SP_Entidad_Accion` (ej. `SP_Usuario_Autenticar`) |
| Borrado | Nunca `DELETE`; siempre `Activo = 0` (borrado lógico) |
| Acceso a datos | Solo vía Stored Procedures. Nunca SQL dinámico. |
| Comentarios | En español |
| Codificación `Usuarios_SP.sql` | Windows-1252 sin BOM — **no cambiar** |
| Codificación `Base_Datos.sql` | UTF-8 con BOM |

**Estado actual (problema a resolver):**

1. Contraseñas hasheadas con `SHA256` sin salt → vulnerables a rainbow tables.
2. JWT con expiración de 120 min y sin mecanismo de invalidación.
3. No existe refresh token → el usuario debe reloguear cada 2 h.
4. Logout no invalida el token en el servidor.

**Resultado esperado:**

- Contraseñas con `BCrypt` (work factor 12) + migración transparente de hashes legacy.
- Access token JWT de 15 min + refresh token de 7 días con rotación.
- Blacklist de JWT por `JTI` para invalidar tokens antes de expirar.
- Endpoint `/api/auth/logout-all` para cerrar sesión en todos los dispositivos.

---

## 🎯 Objetivos verificables

| # | Objetivo | Criterio de aceptación |
|---|---|---|
| O1 | Hashes BCrypt | Un usuario nuevo tiene `ContraseñaHash` que empieza con `$2a$12$` |
| O2 | Migración transparente | Un usuario legacy con SHA256 se autentica y su hash se reemplaza por BCrypt sin cambiar su contraseña |
| O3 | Access token 15 min | El claim `exp` del JWT es exactamente `iat + 15min` |
| O4 | Refresh token funcional | `POST /api/auth/refresh` devuelve un nuevo par de tokens |
| O5 | Rotación de refresh | El refresh token usado queda `Revocado = 1` y `ReemplazadoPor` apunta al nuevo |
| O6 | Blacklist JWT | Tras logout, un request con el token antiguo devuelve `401 Sesión revocada.` |
| O7 | Logout global | Tras `/api/auth/logout-all`, todos los refresh tokens del usuario quedan revocados |
| O8 | Frontend silencioso | Al expirar el access token, el interceptor refresca sin que el usuario lo note |
| O9 | Sin regresiones | Login de `admin`/`admin123` y todos los tests E2E (22) siguen pasando |

---

## 🗺️ Fases del plan

El plan se divide en **5 fases** que se ejecutan en orden. Cada fase es independiente y verificable.

```
FASE 1 → Migración BD (hashes legacy + SPs)
FASE 2 → Backend: BCrypt + migración transparente
FASE 3 → Backend: Refresh tokens
FASE 4 → Backend: Blacklist JWT
FASE 5 → Frontend: interceptor con refresh automático
FASE 6 → Verificación y limpieza
```

---

## FASE 1 — Migración de base de datos

### 1.1 Crear archivo de migración

**Acción:** Crear archivo `Desarrollo/Migrations/001_Security_Migration.sql` con codificación **UTF-8 con BOM**.

**Contenido esperado (estructura):**

```
-- ============================================================
-- MIGRACIÓN 001: HashLegacy + columnas de auditoría de hash
-- Codificación: UTF-8 con BOM
-- Ejecutar sobre DBLexControl
-- ============================================================

USE DBLexControl;
GO

-- Tarea 1.1.1: Agregar columna HashLegacy a USUARIO
--   - Tipo: BIT NOT NULL DEFAULT 0
--   - Solo si no existe (usar IF NOT EXISTS sobre sys.columns)

-- Tarea 1.1.2: Agregar columna FechaUltimoCambioHash a USUARIO
--   - Tipo: DATETIME NULL

-- Tarea 1.1.3: Marcar todos los hashes actuales como legacy
--   UPDATE USUARIO SET HashLegacy = 1, FechaUltimoCambioHash = GETDATE()
--   WHERE HashLegacy = 0

-- Tarea 1.1.4: Crear SP_Usuario_ActualizarHash
--   Params: @ID INT, @ContraseñaHash NVARCHAR(255), @HashLegacy BIT = 0
--   Retorno: 0 OK, -1 usuario no existe
--   Acción: UPDATE USUARIO SET ContraseñaHash, HashLegacy, FechaUltimoCambioHash

-- Tarea 1.1.5: Crear SP_Usuario_ObtenerPorNombre
--   Params: @Usuario NVARCHAR(50)
--   Retorno: SELECT con columnas ID, Persona_ID, Rol_ID, Usuario,
--            ContraseñaHash, HashLegacy, IntentosFallidos, Bloqueado,
--            NombreCompleto, EmailPrincipal, TelefonoPrincipal, Rol

-- Tarea 1.1.6: Modificar SP_Usuario_Autenticar
--   Agregar columna HashLegacy al SELECT existente
```

### 1.2 Crear migración de refresh tokens

**Acción:** Crear archivo `Desarrollo/Migrations/002_RefreshTokens.sql` (UTF-8 con BOM).

**Contenido esperado:**

```
-- Tabla REFRESH_TOKEN con columnas:
--   ID INT IDENTITY PK
--   Usuario_ID INT NOT NULL FK → USUARIO(ID) ON DELETE CASCADE
--   TokenHash NVARCHAR(255) NOT NULL UNIQUE
--   FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
--   FechaExpiracion DATETIME NOT NULL
--   Revocado BIT NOT NULL DEFAULT 0
--   FechaRevocacion DATETIME NULL
--   ReemplazadoPor NVARCHAR(255) NULL
--   UserAgent NVARCHAR(500) NULL
--   IPAddress NVARCHAR(45) NULL
--   Índices: IX_REFRESH_TOKEN_Usuario, IX_REFRESH_TOKEN_Expiracion

-- SP_RefreshToken_Crear
--   @Usuario_ID, @TokenHash, @FechaExpiracion, @UserAgent, @IPAddress
--   Retorno: 0 OK, -1 usuario no existe

-- SP_RefreshToken_Validar
--   @TokenHash
--   Retorno: SELECT con ID, Usuario_ID, FechaExpiracion, Revocado,
--            Usuario, Rol_ID, NombreCompleto, Rol
--   Filtros: Revocado = 0 AND FechaExpiracion > GETDATE()
--            AND U.Activo = 1 AND P.Activo = 1

-- SP_RefreshToken_Revocar
--   @TokenHash, @ReemplazadoPor
--   Acción: UPDATE ... SET Revocado = 1, FechaRevocacion = GETDATE()

-- SP_RefreshToken_RevocarTodos
--   @Usuario_ID
--   Acción: UPDATE todos los tokens activos del usuario

-- SP_RefreshToken_Limpiar (para job)
--   Acción: DELETE FROM REFRESH_TOKEN
--           WHERE FechaExpiracion < GETDATE() OR Revocado = 1
```

### 1.3 Crear migración de blacklist

**Acción:** Crear archivo `Desarrollo/Migrations/003_TokenBlacklist.sql` (UTF-8 con BOM).

**Contenido esperado:**

```
-- Tabla TOKEN_BLACKLIST con columnas:
--   JTI NVARCHAR(50) PK
--   Usuario_ID INT NOT NULL
--   FechaExpiracion DATETIME NOT NULL
--   FechaRevocacion DATETIME NOT NULL DEFAULT GETDATE()
--   Motivo NVARCHAR(200) NULL
--   Índice: IX_TOKEN_BLACKLIST_Expiracion

-- SP_TokenBlacklist_Insertar
--   @JTI, @Usuario_ID, @FechaExpiracion, @Motivo
--   Retorno: 0 OK

-- SP_TokenBlacklist_Existe
--   @JTI
--   Retorno: SELECT COUNT(1) AS Total
--            WHERE JTI = @JTI AND FechaExpiracion > GETDATE()

-- SP_TokenBlacklist_Limpiar
--   Acción: DELETE FROM TOKEN_BLACKLIST WHERE FechaExpiracion < GETDATE()
```

### 1.4 Ejecutar migraciones

**Acción (manual o por agente con acceso a SQL):**

```
1. Backup completo:
   BACKUP DATABASE DBLexControl TO DISK = 'C:\Backups\DBLexControl_pre_security.bak'

2. Ejecutar en orden:
   - 001_Security_Migration.sql
   - 002_RefreshTokens.sql
   - 003_TokenBlacklist.sql
```

**Verificación Fase 1:**

```sql
-- Debe devolver 3 (las 3 columnas/tablas nuevas existen)
SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID('USUARIO') AND name = 'HashLegacy';
SELECT COUNT(*) FROM sys.tables  WHERE name = 'REFRESH_TOKEN';
SELECT COUNT(*) FROM sys.tables  WHERE name = 'TOKEN_BLACKLIST';

-- Todos los usuarios deben tener HashLegacy = 1 al inicio
SELECT COUNT(*) FROM USUARIO WHERE HashLegacy = 0;  -- Esperado: 0

-- Los SPs existen
SELECT name FROM sys.procedures WHERE name LIKE 'SP_RefreshToken%';
SELECT name FROM sys.procedures WHERE name LIKE 'SP_TokenBlacklist%';
```

**Criterio de aceptación Fase 1:** Los 3 queries devuelven el resultado esperado y el login de `admin` sigue funcionando con la versión actual del backend (compatibilidad hacia atrás).

---

## FASE 2 — Backend: BCrypt + migración transparente

### 2.1 Agregar paquete NuGet

**Archivo:** `Desarrollo/Back-end/LexControlApi/LexControlApi.csproj`

**Acción:** Agregar dentro del `<ItemGroup>` existente:

```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
```

**Comando:** `dotnet restore` dentro de la carpeta del proyecto.

### 2.2 Crear/actualizar `HashHelper.cs`

**Archivo:** `Desarrollo/Back-end/LexControlApi/Helpers/HashHelper.cs`

**Contrato requerido (firmas):**

```csharp
public static class HashHelper
{
    // Work factor 12 ≈ 250ms por hash en hardware moderno.
    private const int WorkFactor = 12;

    // Genera hash BCrypt con salt embebido. Devuelve string de 60 chars con prefijo $2a$12$.
    public static string HashPassword(string password);

    // Verifica contraseña contra hash BCrypt. Captura SaltParseException y devuelve false.
    public static bool VerifyPassword(string password, string hash);

    // [LEGACY] SHA256 hex sin salt. Marcar con [Obsolete]. Solo para migración.
    public static string Sha256Hex(string texto);

    // Detecta si un hash es BCrypt (empieza con $2a$, $2b$ o $2y$).
    public static bool EsHashBcrypt(string hash);
}
```

**Notas:**
- Los comentarios deben ir en español.
- `WorkFactor` debe ser constante configurable (idealmente leída de `appsettings.json` en una mejora futura, pero por ahora constante).

### 2.3 Crear modelo de fila `UsuarioFila`

**Archivo:** `Desarrollo/Back-end/LexControlApi/Data/UsuarioFila.cs`

**Contrato:**

```csharp
public class UsuarioFila
{
    public int ID { get; set; }
    public int Persona_ID { get; set; }
    public int Rol_ID { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public string ContraseñaHash { get; set; } = string.Empty;
    public bool HashLegacy { get; set; }       // NUEVO
    public int IntentosFallidos { get; set; }
    public bool Bloqueado { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string? EmailPrincipal { get; set; }
    public string? TelefonoPrincipal { get; set; }
    public string Rol { get; set; } = string.Empty;
}
```

### 2.4 Actualizar `AuthService.LoginAsync`

**Archivo:** `Desarrollo/Back-end/LexControlApi/Services/AuthService.cs`

**Lógica requerida (flujo):**

```
1. Calcular hashLegacy = HashHelper.Sha256Hex(request.Contrasena)
2. Llamar SP_Usuario_Autenticar con { Usuario, ContraseñaHash = hashLegacy }
3. SI fila encontrada Y fila.HashLegacy == true:
      - Migración transparente:
        nuevoHash = HashHelper.HashPassword(request.Contrasena)
        Llamar SP_Usuario_ActualizarHash con { fila.ID, nuevoHash, HashLegacy = false }
4. SI NO fila encontrada:
      - Fallback: SP_Usuario_ObtenerPorNombre(request.Usuario)
      - Si candidato existe Y NO bloqueado Y VerifyPassword(request.Contrasena, candidato.ContraseñaHash):
          fila = candidato
      - SI NO:
          RegistrarIntentoFallido
          throw ExcepcionNegocio("Usuario o contraseña incorrectos.")
5. Actualizar UltimoAcceso con SP_Usuario_ActualizarAcceso
6. Generar JWT (ver Fase 3) y refresh token
7. Devolver LoginResponseDto con token, expiracion, refreshToken y datos del usuario
```

**IMPORTANTE:** El mensaje de error debe ser idéntico para "usuario no existe" y "contraseña incorrecta" → "Usuario o contraseña incorrectos." (evitar enumeración de usuarios).

### 2.5 Actualizar DTO `LoginResponseDto`

**Archivo:** `Desarrollo/Back-end/LexControlApi/Dtos/Auth/LoginResponseDto.cs`

**Agregar propiedad:**

```csharp
public string RefreshToken { get; set; } = string.Empty;
```

### 2.6 Actualizar creación/edición de usuarios

**Archivos:**
- `Services/UsuarioService.cs`
- `Dtos/Usuarios/UsuarioCrearDto.cs`
- `Dtos/Usuarios/UsuarioActualizarDto.cs`

**Lógica requerida:**

- En `Crear`: reemplazar `HashHelper.Sha256Hex(dto.Contrasena)` por `HashHelper.HashPassword(dto.Contrasena)`.
- En `Actualizar`: si `dto.Contrasena` es null/vacío, no tocar el hash. Si viene, hashear con BCrypt.
- En `CambiarContrasena` (perfil): hashear la nueva con BCrypt.

**Buscar en el código todas las apariciones de `Sha256Hex`** y reemplazarlas por `HashPassword`, salvo la rama legacy de `AuthService`.

### 2.7 Actualizar `Program.cs`

**Acción:** Registrar `IJwtService` y `JwtService` en DI (se implementa en Fase 3).

**Verificación Fase 2:**

```
1. dotnet build debe compilar sin errores.
2. Ejecutar dotnet run.
3. Login con admin/admin123 → debe funcionar.
4. Verificar en BD:
   SELECT Usuario, HashLegacy, LEFT(ContraseñaHash, 7) AS Prefijo
   FROM USUARIO WHERE Usuario = 'admin';
   -- Esperado: HashLegacy = 0, Prefijo = '$2a$12$'
5. Crear un usuario nuevo vía POST /api/usuarios → verificar que su hash es BCrypt.
```

**Criterio de aceptación Fase 2:** El admin se autentica y su hash en BD cambió de SHA256 a BCrypt. Los usuarios nuevos se crean con BCrypt.

---

## FASE 3 — Backend: Refresh Tokens

### 3.1 Crear `JwtService`

**Archivo:** `Desarrollo/Back-end/LexControlApi/Services/JwtService.cs`

**Contrato:**

```csharp
public interface IJwtService
{
    // Genera access token con expiración corta (15 min).
    // Claims: NameIdentifier, Name, usuario, rol_id, Role, jti (Guid), exp.
    (string token, DateTime expiracion) GenerarAccessToken(
        int usuarioId, string nombreCompleto, string usuario, int rolId, string rol);
}

public class JwtService : IJwtService { /* implementación */ }
```

**Configuración leída de `appsettings.json`:**

```json
{
  "Jwt": {
    "Key": "<clave de al menos 32 caracteres>",
    "Issuer": "LexControlApi",
    "Audience": "LexControlSpa",
    "AccessTokenMinutes": 15,
    "RefreshTokenDays": 7
  }
}
```

**Notas:**
- El claim `Jti` (JWT ID) es **obligatorio** para que la blacklist funcione.
- La clave en producción debe venir de variable de entorno `JWT__KEY`, no del JSON.

### 3.2 Crear `IRefreshTokenService` y `RefreshTokenService`

**Archivo:** `Desarrollo/Back-end/LexControlApi/Services/RefreshTokenService.cs`

**Contrato:**

```csharp
public interface IRefreshTokenService
{
    Task<LoginResponseDto> RotarAsync(string refreshToken, string? userAgent, string? ip);
    Task RevocarAsync(string refreshToken);
    Task RevocarTodosAsync(int usuarioId);
    Task<string> CrearAsync(int usuarioId, string? userAgent, string? ip);
}

public class RefreshTokenService : IRefreshTokenService { /* ... */ }
```

**Lógica requerida:**

- `CrearAsync`: genera 64 bytes aleatorios con `RandomNumberGenerator.GetBytes(64)`, los codifica en base64url (`+`→`-`, `/`→`_`, quitar `=`), hashea con SHA256 hex para guardar en BD, llama `SP_RefreshToken_Crear`.
- `RotarAsync`: valida el token con `SP_RefreshToken_Validar`, genera nuevo par access+refresh, revoca el anterior con `SP_RefreshToken_Revocar` pasando `ReemplazadoPor`.
- `RevocarAsync`: hash del token + `SP_RefreshToken_Revocar` con `ReemplazadoPor = null`.
- `RevocarTodosAsync`: llama `SP_RefreshToken_RevocarTodos`.

**IMPORTANTE:** El refresh token **nunca** se guarda en claro en BD. Solo su hash SHA256.

### 3.3 Crear DTOs de refresh

**Archivos:**
- `Dtos/Auth/RefreshRequestDto.cs` → `{ RefreshToken: string }`
- `Dtos/Auth/LogoutRequestDto.cs` → `{ RefreshToken: string }`

### 3.4 Actualizar `AuthController`

**Archivo:** `Desarrollo/Back-end/LexControlApi/Controllers/AuthController.cs`

**Endpoints requeridos:**

| Método | Ruta | Auth | Acción |
|---|---|---|---|
| POST | `/api/auth/login` | Anónimo | Ya existe (devolver refresh token ahora) |
| POST | `/api/auth/refresh` | Anónimo | Rotar par de tokens |
| POST | `/api/auth/logout` | Autenticado | Revocar refresh actual |
| POST | `/api/auth/logout-all` | Autenticado | Revocar todos los refresh del usuario |

**Cuerpo de `/api/auth/refresh`:** `{ refreshToken: string }`
**Respuesta:** mismo formato que login (`LoginResponseDto`).

### 3.5 Registrar servicios en `Program.cs`

```csharp
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<IJwtService, JwtService>();
```

### 3.6 Configurar autenticación JWT con `Jti`

**Acción:** En la configuración de `AddAuthentication().AddJwtBearer(...)`, **no** deshabilitar el claim `Jti`. Por defecto `JwtSecurityTokenHandler` lo conserva, pero verificar que no haya un `NameClaimType`/`RoleClaimType` que lo sobrescriba.

**Verificación Fase 3:**

```
1. Login exitoso → respuesta incluye refreshToken.
2. POST /api/auth/refresh con ese refreshToken → devuelve nuevo par.
3. En BD:
   SELECT TOP 5 * FROM REFRESH_TOKEN ORDER BY ID DESC;
   -- El token usado debe tener Revocado = 1 y ReemplazadoPor apuntando al nuevo hash.
4. Reusar el mismo refresh token viejo → debe devolver 401/400.
5. Decodificar el JWT en jwt.io → verificar que expira en 15 min y tiene claim jti.
```

**Criterio de aceptación Fase 3:** El refresh rota correctamente y el access token dura 15 min.

---

## FASE 4 — Backend: Blacklist JWT

### 4.1 Crear middleware

**Archivo:** `Desarrollo/Back-end/LexControlApi/Middleware/TokenBlacklistMiddleware.cs`

**Contrato:**

```csharp
public class TokenBlacklistMiddleware
{
    private readonly RequestDelegate _next;
    public TokenBlacklistMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, IRepositorio repo)
    {
        // 1. Si el usuario está autenticado, extraer claim Jti.
        // 2. Si existe, consultar SP_TokenBlacklist_Existe.
        // 3. Si está en blacklist → 401 con { success: false, error: "Sesión revocada." }
        // 4. Si no → continuar con _next(context).
    }
}
```

### 4.2 Registrar middleware

**Archivo:** `Desarrollo/Back-end/LexControlApi/Program.cs`

**Acción:** Insertar entre `UseAuthentication()` y `UseAuthorization()`:

```csharp
app.UseAuthentication();
app.UseMiddleware<TokenBlacklistMiddleware>();
app.UseAuthorization();
```

### 4.3 Actualizar logout para agregar JTI a blacklist

**Archivo:** `Desarrollo/Back-end/LexControlApi/Controllers/AuthController.cs`

**Lógica del endpoint `/api/auth/logout`:**

```
1. Revocar refresh token recibido en el body.
2. Extraer JTI del claim del usuario autenticado.
3. Extraer expiración del claim "exp".
4. Llamar SP_TokenBlacklist_Insertar con { JTI, Usuario_ID, FechaExpiracion, Motivo = "logout" }.
5. Devolver 204.
```

**Verificación Fase 4:**

```
1. Login → guardar token y refresh.
2. Llamar POST /api/auth/logout con el refreshToken.
3. Reusar el access token viejo en GET /api/perfil → debe devolver 401 "Sesión revocada."
4. Llamar POST /api/auth/logout-all → verificar que todos los refresh del usuario quedan Revocado = 1.
```

**Criterio de aceptación Fase 4:** Un token revocado deja de funcionar inmediatamente aunque no haya expirado.

---

## FASE 5 — Frontend: refresh automático

### 5.1 Actualizar `AuthService`

**Archivo:** `Desarrollo/Front-end/LexControlFornt/src/app/core/services/auth-service.ts`

**Cambios requeridos:**

1. Agregar `refreshToken: string` a la interfaz `LoginResponse` (o `SesionRespuesta`).
2. Persistir el refresh token en `sessionStorage` con clave `lexcontrol_refresh`.
3. Agregar método `refrescar()` que hace `POST /api/auth/refresh` y persiste el nuevo par.
4. Modificar `cerrarSesion()` para:
   - Notificar al backend con `POST /api/auth/logout` (no bloqueante, ignorar errores).
   - Limpiar `sessionStorage`.
   - Navegar a `/login`.
5. `leerSesion()` debe incluir `refreshToken` al reconstruir la sesión.

### 5.2 Actualizar interceptor

**Archivo:** `Desarrollo/Front-end/LexControlFornt/src/app/core/auth/auth-interceptor.ts`

**Lógica requerida:**

```
1. Si el request es a /api/auth/login o /api/auth/refresh → no adjuntar token.
2. Adjuntar Authorization: Bearer <accessToken> al resto.
3. catchError:
   - SI status === 401 Y NO es endpoint público:
       - SI NO hay refresh en curso:
           refrescando = true
           llamar auth.refrescar()
           switchMap → reintentar el request original con nuevo token
           catchError → auth.cerrarSesion() + throwError
       - SI YA hay refresh en curso:
           esperar a que termine (BehaviorSubject) y reintentar con el nuevo token
   - SI NO → throwError
```

**IMPORTANTE:** Usar `BehaviorSubject<string | null>` compartido a nivel de módulo para evitar múltiples refresh simultáneos.

### 5.3 Actualizar `environment.ts`

**Acción:** Verificar que `apiBaseUrl` apunta al backend correcto (`http://localhost:5181` en dev).

**Verificación Fase 5:**

```
1. ng serve.
2. Login → verificar en DevTools → Application → Session Storage:
   - lexcontrol_token (JWT)
   - lexcontrol_refresh (token opaco)
3. Esperar 15 min (o manipular el token para forzar expiración).
4. Hacer una acción que dispare request → el interceptor debe refrescar sin redirigir a login.
5. Logout → verificar que ambos tokens se borran del storage.
6. Intentar acceder a /dashboard sin sesión → redirige a /login.
```

**Criterio de aceptación Fase 5:** El usuario no es expulsado cada 15 min y el logout funciona correctamente.

---

## FASE 6 — Verificación final y limpieza

### 6.1 Tests automatizados

**Unit tests (Jasmine):**

- Agregar test en `auth-service.spec.ts`:
  - `refrescar() actualiza el token y el refresh token en sessionStorage`
  - `cerrarSesion() notifica al backend y limpia el storage`

**E2E tests (Playwright):**

- Ejecutar toda la suite: `npx playwright test`
- Los 22 tests existentes deben seguir pasando.
- Agregar `08-security.spec.ts`:
  - `TC-SEC-001: Logout invalida el token en el servidor`
  - `TC-SEC-002: Refresh automático mantiene la sesión activa`

### 6.2 Verificación manual end-to-end

```
1. Backup de BD antes de todo.
2. Ejecutar las 3 migraciones.
3. Desplegar backend nuevo.
4. Desplegar frontend nuevo.
5. Login con admin → verificar hash BCrypt en BD.
6. Login con un usuario legacy (si existe) → verificar migración transparente.
7. Refresh manual desde DevTools → verificar rotación.
8. Logout → verificar blacklist.
9. Login en 2 pestañas → logout-all desde una → verificar que la otra queda sin sesión.
```

### 6.3 Monitoreo post-despliegue

```sql
-- Uso diario, revisar a las 24h, 72h y 1 semana:
SELECT
    SUM(CASE WHEN HashLegacy = 1 THEN 1 ELSE 0 END) AS PendientesMigrar,
    SUM(CASE WHEN HashLegacy = 0 THEN 1 ELSE 0 END) AS Migrados,
    COUNT(*) AS TotalUsuarios
FROM USUARIO;
```

### 6.4 Limpieza (después de N semanas sin usuarios legacy)

**Acción cuando `PendientesMigrar = 0`:**

1. Eliminar método `Sha256Hex` de `HashHelper` (o marcarlo `private`).
2. Eliminar la rama legacy del `AuthService.LoginAsync` (el paso 4 del flujo).
3. Eliminar la columna `HashLegacy` de `USUARIO` (opcional, mantener por auditoría).
4. Eliminar `SP_Usuario_Autenticar` con parámetro `@ContraseñaHash` legacy y dejar solo la versión que valida por BCrypt.
5. Actualizar `ModuloUsuarios.md` para reflejar el nuevo flujo.

### 6.5 Jobs programados (SQL Agent)

| Job | Frecuencia | Comando |
|---|---|---|
| `LexControl_LimpiarRefreshTokens` | Diario 3 AM | `EXEC SP_RefreshToken_Limpiar` |
| `LexControl_LimpiarBlacklist` | Diario 3 AM | `EXEC SP_TokenBlacklist_Limpiar` |

---

## 🔄 Rollback

Cada migración es **aditiva**. Para revertir:

```sql
-- Rollback 003
DROP TABLE IF EXISTS TOKEN_BLACKLIST;
DROP PROCEDURE IF EXISTS SP_TokenBlacklist_Insertar;
DROP PROCEDURE IF EXISTS SP_TokenBlacklist_Existe;
DROP PROCEDURE IF EXISTS SP_TokenBlacklist_Limpiar;

-- Rollback 002
DROP TABLE IF EXISTS REFRESH_TOKEN;
DROP PROCEDURE IF EXISTS SP_RefreshToken_Crear;
DROP PROCEDURE IF EXISTS SP_RefreshToken_Validar;
DROP PROCEDURE IF EXISTS SP_RefreshToken_Revocar;
DROP PROCEDURE IF EXISTS SP_RefreshToken_RevocarTodos;
DROP PROCEDURE IF EXISTS SP_RefreshToken_Limpiar;

-- Rollback 001
ALTER TABLE USUARIO DROP COLUMN IF EXISTS HashLegacy;
ALTER TABLE USUARIO DROP COLUMN IF EXISTS FechaUltimoCambioHash;
DROP PROCEDURE IF EXISTS SP_Usuario_ActualizarHash;
DROP PROCEDURE IF EXISTS SP_Usuario_ObtenerPorNombre;
-- Restaurar SP_Usuario_Autenticar original desde el script previo
```

**Frontend rollback:** `git revert` del commit que modifica el interceptor y el `AuthService`. El sistema vuelve a JWT de 120 min sin refresh.

---

## 📊 Resumen de archivos tocados

### Backend (.NET)

| Archivo | Acción |
|---|---|
| `LexControlApi.csproj` | Agregar `BCrypt.Net-Next` |
| `Helpers/HashHelper.cs` | Modificar (BCrypt + legacy) |
| `Data/UsuarioFila.cs` | Crear |
| `Services/AuthService.cs` | Modificar (migración + refresh) |
| `Services/RefreshTokenService.cs` | Crear |
| `Services/JwtService.cs` | Crear |
| `Controllers/AuthController.cs` | Modificar (refresh + logout + logout-all) |
| `Dtos/Auth/LoginResponseDto.cs` | Modificar (RefreshToken) |
| `Dtos/Auth/RefreshRequestDto.cs` | Crear |
| `Dtos/Auth/LogoutRequestDto.cs` | Crear |
| `Middleware/TokenBlacklistMiddleware.cs` | Crear |
| `Program.cs` | Modificar (DI + middleware) |
| `appsettings.json` | Modificar (Jwt:AccessTokenMinutes = 15) |

### Frontend (Angular)

| Archivo | Acción |
|---|---|
| `core/services/auth-service.ts` | Modificar (refresh + logout al backend) |
| `core/auth/auth-interceptor.ts` | Modificar (refresh automático) |

### Base de datos

| Archivo | Acción |
|---|---|
| `Desarrollo/Migrations/001_Security_Migration.sql` | Crear |
| `Desarrollo/Migrations/002_RefreshTokens.sql` | Crear |
| `Desarrollo/Migrations/003_TokenBlacklist.sql` | Crear |
| `Usuarios_SP.sql` | Actualizar (reflejar los cambios de migración) |

### Documentación

| Archivo | Acción |
|---|---|
| `ModuloUsuarios.md` | Actualizar §3.1, §5.2, §5.4, §7.2 |
| `Testing.md` | Agregar tests de refresh/logout |

---

## ✅ Checklist final

- [ ] Fase 1: 3 migraciones SQL ejecutadas y verificadas
- [ ] Fase 2: `HashHelper` con BCrypt, login sigue funcionando, hash de `admin` migrado
- [ ] Fase 3: Refresh tokens funcionando con rotación
- [ ] Fase 4: Blacklist bloqueando tokens revocados
- [ ] Fase 5: Interceptor refresca automáticamente sin expulsar al usuario
- [ ] Fase 6: 22 tests E2E pasan + tests nuevos de seguridad pasan
- [ ] Jobs de limpieza configurados en SQL Agent
- [ ] `appsettings.json` sin claves hardcodeadas (usar User Secrets o variables de entorno)
- [ ] Documentación actualizada
- [ ] Backup de BD antes de cada despliegue

---

## 🚨 Reglas para el agente

1. **Nunca** modificar `Proceso_almacenados.sql` (está en Windows-1252 y no debe re-codificarse).
2. **Nunca** commitear claves JWT reales. Usar `dotnet user-secrets` en desarrollo.
3. **Siempre** ejecutar migraciones en orden (001 → 002 → 003).
4. **Siempre** hacer backup de BD antes de ejecutar cualquier migración.
5. **Siempre** verificar que el login de `admin`/`admin123` siga funcionando después de cada fase.
6. **Nunca** mezclar cambios de fases distintas en un mismo commit.
7. **Siempre** comentar en español siguiendo la convención del repositorio.
8. **Nunca** alterar el orden de middleware en `Program.cs`: `UseAuthentication` → `TokenBlacklistMiddleware` → `UseAuthorization`.
9. **Siempre** usar borrado lógico (`Activo = 0`) excepto en `REFRESH_TOKEN` y `TOKEN_BLACKLIST` (que sí se limpian con `DELETE` por ser datos efímeros).
10. **Nunca** romper compatibilidad con la versión anterior del frontend durante el despliegue. Backend y frontend deben desplegarse juntos.