# Seguridad — INSBAPA

## Resumen de mejoras implementadas

Se implementaron 5 mejoras de seguridad inspired en el plan de hardening de LexControl, adaptadas al contexto de INSBAPA sin afectar el desarrollo existente.

---

## 1. Blacklist de JWT (logout server-side)

**Antes:** Logout solo limpiaba `localStorage` en el frontend. El token JWT seguía siendo válido hasta su expiración (8 horas).

**Ahora:** Al hacer logout, el JTI del token se agrega a la tabla `TOKEN_BLACKLIST`. Cualquier request con ese token es rechazado por el middleware antes de llegar al endpoint.

### Archivos involucrados

| Archivo | Acción |
|---------|--------|
| `database/seguridad.sql` | Tabla `TOKEN_BLACKLIST` + 3 SPs |
| `Middleware/TokenBlacklistMiddleware.cs` | Nuevo — intercepta requests autenticados |
| `Endpoints/AuthEndpoints.cs` | Nuevo endpoint `POST /api/auth/logout` |
| `Services/DbService.cs` | Nuevo método `BlacklistTokenAsync()` |
| `Program.cs` | Registra middleware entre `UseAuthentication` y `UseAuthorization` |

### SPs creados

- `SP_TokenBlacklist_Insertar` — agrega JTI a blacklist
- `SP_TokenBlacklist_Existe` — verifica si un JTI está revocado
- `SP_TokenBlacklist_Limpiar` — elimina tokens expirados (para job programado)

### Para ejecutar

```bash
sqlcmd -S .\SQLEXPRESS -E -i database\seguridad.sql
```

---

## 2. Reducción de expiración JWT (480 → 60 min)

**Antes:** Tokens JWT válidos por 8 horas (480 min).

**Ahora:** Tokens válidos por 1 hora (60 min).

### Archivo modificado

- `appsettings.json` → `ExpirationMinutes: 60`

---

## 3. Rate limiting en login (anti fuerza bruta)

**Antes:** Sin límite de intentos de login.

**Ahora:** Máximo 10 intentos por minuto por IP en `POST /api/auth/login`. Si se excede, retorna HTTP 429 Too Many Requests.

### Archivo modificado

- `Program.cs` → `AddRateLimiter()` con política `fixed window` de 10 req/min
- `AuthEndpoints.cs` → `[EnableRateLimiting("login")]` en el endpoint de login

---

## 4. Mensajes de error uniformes (anti-enumeración)

**Antes:** El login devolvía mensajes diferentes para "usuario no existe" vs "contraseña incorrecta", permitiendo enumerar usuarios válidos.

**Ahora:** Ambos casos devuelven el mismo mensaje: `"Credenciales inválidas."`. La verificación de usuario activo se hace primero, y la verificación de contraseña después, pero el error es idéntico.

### Archivo modificado

- `Endpoints/AuthEndpoints.cs` → Flujo reordenado + mensajes unificados

---

## 5. CORS configurable

**Antes:** Origen hardcodeado a `http://localhost:4200` en `Program.cs`.

**Ahora:** Los orígenes permitidos se leen de `appsettings.json`:

```json
{
  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

En producción, se puede sobreescribir con variables de entorno o `appsettings.Production.json`.

---

## 6. Frontend: logout + interceptor actualizado

**Logout:** Ahora llama al endpoint `POST /api/auth/logout` antes de limpiar localStorage. El backend agrega el JTI a la blacklist.

**Interceptor:** Si recibe un 401 (token expirado o en blacklist), automáticamente redirige a `/login`.

### Archivos modificados

- `front-end/src/app/services/auth.service.ts` → `logout()` notifica al backend
- `front-end/src/app/interceptors/auth.interceptor.ts` → Manejo de 401

---

## Resumen de archivos

### Base de datos
| Archivo | Estado |
|---------|--------|
| `database/seguridad.sql` | **NUEVO** — Ejecutar en SQL Server |

### Back-end (.NET)
| Archivo | Estado |
|---------|--------|
| `Program.cs` | Modificado — middleware + rate limiting + CORS |
| `Endpoints/AuthEndpoints.cs` | Modificado — logout + rate limit + mensajes |
| `Services/DbService.cs` | Modificado — `BlacklistTokenAsync()` |
| `Middleware/TokenBlacklistMiddleware.cs` | **NUEVO** |
| `appsettings.json` | Modificado — expiration + CORS config |

### Front-end (Angular)
| Archivo | Estado |
|---------|--------|
| `services/auth.service.ts` | Modificado — logout server-side |
| `interceptors/auth.interceptor.ts` | Modificado — manejo de 401 |

---

## Rollback

Cada cambio es independiente. Para revertir:

```sql
-- Revertir blacklist
DROP TABLE IF EXISTS TOKEN_BLACKLIST;
DROP PROCEDURE IF EXISTS SP_TokenBlacklist_Insertar;
DROP PROCEDURE IF EXISTS SP_TokenBlacklist_Existe;
DROP PROCEDURE IF EXISTS SP_TokenBlacklist_Limpiar;
```

```json
// Revertir expiración en appsettings.json
"ExpirationMinutes": 480
```

Los cambios de middleware, rate limiting y CORS se revierten eliminando las líneas correspondientes de `Program.cs`.
