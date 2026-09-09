# Documentación del Login — INSBAPA

Flujo completo de autenticación: desde el formulario en Angular hasta la verificación en SQL Server.

---

## 1. Resumen del flujo

```
┌──────────────┐     POST /api/auth/login      ┌──────────────┐     SP_Login      ┌──────────────┐
│              │  ───────────────────────────►  │              │  ───────────────►  │              │
│  Angular     │  { username, password }        │  .NET API    │  @Username         │  SQL Server  │
│  LoginComponent                               │  AuthEndpoints                   │  USUARIOS    │
│              │  ◄───────────────────────────  │              │  ◄───────────────  │              │
└──────────────┘   { token, usuario }           └──────────────┘   Hash + UserData  └──────────────┘
       │
       │  saveSession() → localStorage
       │  navigate('/sistema')
       ▼
┌──────────────┐
│  Dashboard   │
│  (Shell)     │
└──────────────┘
```

---

## 2. Front-end — Componente de Login

### Archivos involucrados

| Archivo | Propósito |
|---------|-----------|
| `src/app/pages/login/login.component.ts` | Lógica del login (65 líneas) |
| `src/app/pages/login/login.component.html` | Template con formulario (94 líneas) |
| `src/app/pages/login/login.component.css` | Estilos split-screen (238 líneas) |
| `src/app/services/auth.service.ts` | Servicio de autenticación (72 líneas) |
| `src/app/models/usuario.model.ts` | Interfaces TypeScript (32 líneas) |
| `src/app/interceptors/auth.interceptor.ts` | Inyección de token JWT (17 líneas) |
| `src/app/guards/auth.guard.ts` | Guard de rutas (15 líneas) |
| `src/app/app.routes.ts` | Definición de rutas (23 líneas) |
| `src/app/app.config.ts` | Providers de la app (14 líneas) |

### 2.1 LoginComponent — Estados reactivos

El componente usa **signals** de Angular para manejar estado:

```typescript
username = signal('');        // Texto del campo usuario
password = signal('');        // Texto del campo contraseña
rol = signal('estudiante');   // Rol seleccionado (radio button)
loading = signal(false);      // true mientras se espera la respuesta del API
error = signal('');           // Mensaje de error a mostrar
```

### 2.2 Template — Estructura visual

El login usa un layout **split-screen** (pantalla dividida):

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│   Panel Hero (izq.)     │   Panel Formulario (der)│
│                         │                         │
│   • Logo INSBAPA        │   • Título              │
│   • Título              │   • Selector de rol      │
│   • Descripción         │   • Formulario login     │
│   • Copyright           │   • Credenciales demo    │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

En pantallas pequeñas (< 980px), el panel hero se oculta y el formulario ocupa todo el ancho.

### 2.3 Selector de rol

Tres tarjetas radio que el usuario debe seleccionar antes de iniciar sesión:

```html
<label class="role-card" [class.active]="rol() === 'estudiante'">
  <input type="radio" name="rol" value="estudiante"
         [checked]="rol() === 'estudiante'"
         (change)="rol.set('estudiante')">
  <span class="role-icon">...</span>
  <span class="role-label">Estudiante</span>
</label>
```

**Importante:** El rol se compara con la respuesta del API. Si el usuario selecciona "Estudiante" pero ingresa con credenciales de admin, se muestra error.

### 2.4 Flujo de `onLogin()`

```
1. Limpiar error anterior
   └─► error.set('')

2. Validar campos vacíos
   └─► Si username o password están vacíos:
       error.set('Complete todos los campos.')
       return

3. Activar estado de carga
   └─► loading.set(true)

4. Llamar al API
   └─► authService.login(username, password)
       POST http://localhost:5275/api/auth/login
       Body: { "username": "admin", "password": "admin123" }

5. Respuesta exitosa (next):
   a. Comparar rol seleccionado vs rol del usuario
      └─► Si no coinciden: error 'Usuario, contraseña o rol incorrectos.'
   
   b. Guardar sesión
      └─► authService.saveSession(response)
          → localStorage.setItem('insbapa_token', token)
          → localStorage.setItem('insbapa_usuario', JSON.stringify(usuario))
          → tokenSignal.set(token)
          → userSignal.set(usuario)
   
   c. Navegar al sistema
      └─► router.navigate(['/sistema'])
          → Redirige a /sistema/dashboard (por la ruta con redirect)

6. Error (error callback):
   └─► error.set(err.error?.error || 'Error de conexión con el servidor.')
```

### 2.5 Interceptador de HTTP (auth.interceptor.ts)

Todas las peticiones HTTP pasan por este interceptor. Si hay un token guardado, lo agrega al header:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
```

Se registra en `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

### 2.6 Guard de rutas (auth.guard.ts)

Protege las rutas que requieren autenticación:

```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;    // Permitir navegación
  }

  router.navigate(['/login']);  // Redirigir al login
  return false;
};
```

Se aplica en `app.routes.ts`:

```typescript
{
  path: 'sistema',
  canActivate: [authGuard],   // ← Protegido
  children: [...]
}
```

### 2.7 Rutas (app.routes.ts)

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component')... },
  {
    path: 'sistema',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component')... },
    ]
  },
  { path: '**', redirectTo: 'login' }   // Wildcard → login
];
```

### 2.8 Persistencia de sesión (AuthService)

Al recargar la página, el servicio reconstruye el estado desde localStorage:

```typescript
constructor(private http: HttpClient, private router: Router) {
  this.loadFromStorage();   // ← Se ejecuta al instanciar
}

private loadFromStorage(): void {
  const token = localStorage.getItem('insbapa_token');
  const userJson = localStorage.getItem('insbapa_usuario');
  if (token && userJson) {
    this.tokenSignal.set(token);
    this.userSignal.set(JSON.parse(userJson));
  }
}
```

Si el token existe en localStorage, `isLoggedIn()` retorna `true` y el guard permite el acceso.

---

## 3. Back-end — API de Login

### Archivos involucrados

| Archivo | Propósito |
|---------|-----------|
| `Endpoints/AuthEndpoints.cs` | Endpoint POST /api/auth/login (72 líneas) |
| `Services/AuthService.cs` | BCrypt + JWT (51 líneas) |
| `Services/DbService.cs` | Acceso a BD (225 líneas) |
| `Models/UsuarioDto.cs` | DTO de respuesta (29 líneas) |
| `Program.cs` | Configuración de JWT + CORS (94 líneas) |

### 3.1 Endpoint POST /api/auth/login

```csharp
app.MapPost("/api/auth/login", async (
    LoginRequest request,      // { username, password }
    DbService db,              // Acceso a BD
    AuthService auth) =>       // BCrypt + JWT
{
    // 1. Validar campos vacíos
    if (string.IsNullOrWhiteSpace(request.Username) || 
        string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.BadRequest(new { error = "Usuario y contraseña son requeridos." });
    }

    // 2. Obtener hash de contraseña de la BD
    var hash = await db.GetPasswordHashAsync(request.Username);
    if (hash == null)
    {
        return Results.Json(new { error = "Credenciales inválidas." }, statusCode: 401);
    }

    // 3. Verificar contraseña con BCrypt
    if (!auth.VerifyPassword(request.Password, hash))
    {
        return Results.Json(new { error = "Credenciales inválidas." }, statusCode: 401);
    }

    // 4. Obtener datos completos del usuario
    var usuario = await db.LoginAsync(request.Username);
    if (usuario == null || !usuario.Activo)
    {
        return Results.Json(new { error = "Usuario inactivo o no encontrado." }, statusCode: 401);
    }

    // 5. Generar token JWT
    var token = auth.GenerateToken(usuario.UsuarioId, usuario.Username, usuario.Rol);

    // 6. Devolver respuesta
    return Results.Ok(new LoginResponse
    {
        Token = token,
        Usuario = usuario
    });
});
```

### 3.2 Modelo de petición y respuesta

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "usuarioId": 1,
    "username": "admin",
    "iniciales": "AD",
    "rol": "Administrador",
    "primerNombre": "Administrador",
    "segundoNombre": "",
    "primerApellido": "Sistema",
    "segundoApellido": "",
    "correo": "admin@insbapa.edu",
    "telefono": null,
    "fechaNacimiento": null,
    "activo": true,
    "estudianteId": null,
    "carnet": null,
    "gradoId": null,
    "grado": null,
    "seccionId": null,
    "seccion": null,
    "profesorId": null,
    "codigoProfesor": null
  }
}
```

**Response (401):**

```json
{
  "error": "Credenciales inválidas."
}
```

### 3.3 SP_Login — Procedimiento en BD

```sql
CREATE PROCEDURE SP_Login
    @Username NVARCHAR(50)
AS
BEGIN
    SELECT 
        u.Usuario_ID,
        u.Username,
        u.Iniciales,
        u.Activo,
        r.Nombre AS Rol,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        u.Contrasena    -- Hash BCrypt
    FROM USUARIOS u
    INNER JOIN ROLES r ON u.Rol_ID = r.Rol_ID
    INNER JOIN PERSONAS p ON u.Persona_ID = p.Persona_ID
    WHERE u.Username = @Username;
END
```

Retorna una sola fila con los datos del usuario y el hash de contraseña. El backend verifica el hash con BCrypt en .NET.

### 3.4 Generación de token JWT

```csharp
public string GenerateToken(int usuarioId, string username, string rol)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, usuarioId.ToString()),  // ID del usuario
        new Claim(ClaimTypes.Name, username),                         // Nombre de usuario
        new Claim(ClaimTypes.Role, rol),                              // Rol (ej: "Administrador")
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())  // ID único del token
    };

    var token = new JwtSecurityToken(
        issuer: "INSBAPA",
        audience: "INSBAPA-App",
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(480),  // 8 horas
        signingCredentials: credentials              // HMAC-SHA256
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

### 3.5 Claims del token

| Claim | Tipo | Ejemplo |
|-------|------|---------|
| `NameIdentifier` | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier` | `"1"` |
| `Name` | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name` | `"admin"` |
| `Role` | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role` | `"Administrador"` |
| `jti` | `jti` | `"a1b2c3d4-..."` (UUID) |

### 3.6 Verificación de contraseña (BCrypt)

```csharp
// Verificar
public bool VerifyPassword(string password, string hash)
{
    return BCrypt.Net.BCrypt.Verify(password, hash);
}

// Hashear (para registro o cambio de contraseña)
var hash = BCrypt.Net.BCrypt.HashPassword("admin123");
```

BCrypt incluye el salt en el hash, así que no es necesario almacenar el salt por separado.

### 3.7 CORS (Program.cs)

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ...

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
```

**Orden importante:** `UseCors` debe ir **antes** de `UseAuthentication` y `UseAuthorization`.

---

## 4. Seguridad

### 4.1 Contraseñas

- Almacenadas como hashes BCrypt en la tabla `USUARIOS.Contrasena`
- Nunca se comparan contraseñas en texto plano
- El SP solo retorna el hash; la verificación es en .NET

### 4.2 Token JWT

- Algoritmo: HMAC-SHA256
- Expiración: 8 horas
- Se almacena en `localStorage` del navegador
- Se envía en cada petición HTTP via header `Authorization: Bearer <token>`

### 4.3 Roles

El rol viene codificado en el token JWT. Los endpoints protegidos con `[Authorize]` verifican el rol:

```csharp
// En DashboardEndpoints.cs
var rol = user.FindFirstValue(ClaimTypes.Role);
return rol switch
{
    "Administrador" => await GetDashboardAdmin(db),
    "Profesor" => await GetDashboardProfesor(db, usuarioId),
    "Estudiante" => await GetDashboardEstudiante(db, usuarioId),
    _ => Results.Json(new { error = "Rol no reconocido." }, statusCode: 403)
};
```

### 4.4 Validación de rol en el login

El front-end valida que el rol seleccionado coincida con el rol del usuario:

```typescript
const rolMap: Record<string, string> = {
  estudiante: 'estudiante',
  profesor: 'profesor',
  administrador: 'administrador'
};

if (rolMap[rolSeleccionado] !== rolMap[rolUsuario]) {
  this.error.set('Usuario, contraseña o rol incorrectos.');
  return;
}
```

Esto evita que un admin se loguee seleccionando "Estudiante".

---

## 5. Endpoints relacionados

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/login` | Login, retorna token + usuario | No |
| `GET` | `/api/auth/perfil` | Obtiene perfil del usuario autenticado | Sí (JWT) |
| `PUT` | `/api/auth/perfil` | Actualiza datos personales | Sí (JWT) |
| `POST` | `/api/auth/cambiar-contrasena` | Cambia contraseña (requiere actual) | Sí (JWT) |

---

## 6. Credenciales demo

| Portal | Usuario | Contraseña | Rol en BD |
|--------|---------|------------|-----------|
| Estudiante | `estudiante` | `estudiante123` | `Estudiante` |
| Profesor | `profesor` | `profesor123` | `Profesor` |
| Administrador | `admin` | `admin123` | `Administrador` |

---

## 7. Errores comunes del login

| Mensaje | Causa |
|---------|-------|
| `"Complete todos los campos."` | Username o password vacíos (validación front-end) |
| `"Credenciales inválidas."` | Usuario no existe o contraseña incorrecta (401 del API) |
| `"Usuario inactivo o no encontrado."` | El usuario tiene `Activo = 0` en la BD |
| `"Usuario, contraseña o rol incorrectos."` | Credenciales correctas pero el rol seleccionado no coincide |
| `"Error de conexión con el servidor."` | El API no está corriendo o hay problema de CORS |
| Page reload sin mensaje | Faltaba `FormsModule` en el componente (ya corregido) |
