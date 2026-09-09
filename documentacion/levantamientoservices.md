# Levantamiento de Servicios — INSBAPA

Guía paso a paso para levantar el proyecto completo en un nuevo dispositivo.

---

## 1. Requisitos previos

| Componente | Versión mínima | Verificar con |
|------------|----------------|---------------|
| Node.js | 18+ | `node -v` |
| pnpm | 9+ | `pnpm -v` |
| .NET SDK | 10.0 | `dotnet --version` |
| SQL Server | 2019+ (Express sirve) | SQL Server Management Studio o `sqlcmd` |
| Git | 2.x | `git --version` |

### Instalar pnpm (si no está)

```bash
npm install -g pnpm
```

### Verificar .NET SDK

```bash
dotnet --list-sdk
```

Debe mostrar una versión `10.0.x`. Si no está, descargar desde https://dotnet.microsoft.com/download/dotnet/10.0

---

## 2. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd prueba1
```

---

## 3. Base de datos

### 3.1 Crear la base de datos

Ejecutar los scripts en orden contra tu instancia de SQL Server:

```bash
# Opción A: Usando sqlcmd
sqlcmd -S TU_SERVIDOR -i database/01-create-schema.sql
sqlcmd -S TU_SERVIDOR -i database/02-stored-procedures.sql
sqlcmd -S_SERVIDOR -i database/03-seed-data.sql
sqlcmd -S TU_SERVIDOR -i database/04-update-passwords.sql
```

```bash
# Opción B: Usando SQL Server Management Studio (SSMS)
# Abrir cada archivo .sql en orden y ejecutar (F5)
```

### 3.2 Cambiar el servidor SQL en los scripts

Si tu instancia de SQL Server tiene un nombre diferente, editar `database/01-create-schema.sql` y buscar:

```sql
CREATE DATABASE INSBAPA;
```

Después del `USE INSBAPA;`, verificar que la conexión funcione con tu instancia.

### 3.3 Contraseñas de los usuarios demo

El script `04-update-passwords.sql` actualiza las contraseñas con hashes BCrypt reales. Si ejecutás los scripts en orden, las credenciales demo funcionan directamente:

| Usuario | Contraseña |
|---------|------------|
| `admin` | `admin123` |
| `profesor` | `profesor123` |
| `estudiante` | `estudiante123` |

Si necesitás regenerar los hashes, ejecutar en .NET:

```csharp
BCrypt.Net.BCrypt.HashPassword("admin123")
```

Y reemplazar el hash en el script SQL.

---

## 4. Back-end (API .NET)

### 4.1 Configurar la cadena de conexión

El archivo `appsettings.Development.json` **no se sube al repositorio** (está en `.gitignore`). Copiar el template:

```bash
cd back-end/API-LMS/API-LMS
cp appsettings.Development.example.json appsettings.Development.json
```

Editar `appsettings.Development.json` y cambiar el servidor SQL:

```json
{
  "ConnectionStrings": {
    "INSBAPA": "Server=TU_SERVIDOR\\TU_INSTANCIA;Database=INSBAPA;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "SecretKey": "INSBAPA-2025-SECRET-KEY-FOR-JWT-TOKENS-32CHARS!",
    "Issuer": "INSBAPA",
    "Audience": "INSBAPA-App",
    "ExpirationMinutes": 480
  }
}
```

**Cambiar `TU_SERVIDOR\\TU_INSTANCIA`** por el nombre real de tu SQL Server. Ejemplos:

| Entorno | Connection String |
|---------|-------------------|
| SQL Express local | `Server=MI-PC\SQLEXPRESS;Database=INSBAPA;...` |
| SQL Server completo | `Server=localhost;Database=INSBAPA;...` |
| Autenticación SQL | Agregar `User Id=sa;Password=tucontraseña;` y quitar `Trusted_Connection=True` |

### 4.2 Instalar dependencias y compilar

```bash
cd back-end/API-LMS/API-LMS
dotnet restore
dotnet build
```

### 4.3 Ejecutar la API

```bash
dotnet run
```

La API arranca en: **http://localhost:5275**

Swagger disponible en: **http://localhost:5275/swagger**

### 4.4 Verificar que funciona

Abrir en el navegador: http://localhost:5275/

Debe mostrar: `INSBAPA API is running.`

Probar el login con curl:

```bash
curl -X POST http://localhost:5275/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Respuesta esperada:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "usuarioId": 1,
    "username": "admin",
    "rol": "Administrador",
    ...
  }
}
```

---

## 5. Front-end (Angular)

### 5.1 Configurar la URL del API

Editar `front-end/src/environments/environment.development.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5275'   // Cambiar si el API corre en otro puerto
};
```

También editar `front-end/src/environments/environment.ts` (producción):

```ts
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5275'   // URL del API en producción
};
```

### 5.2 Instalar dependencias

```bash
cd front-end
pnpm install
```

### 5.3 Ejecutar en modo desarrollo

```bash
pnpm start
```

El front-end arranca en: **http://localhost:4200**

### 5.4 Verificar

Abrir http://localhost:4200/login en el navegador. Debe mostrarse la pantalla de login.

---

## 6. CORS — Configuración

La API permite solicitudes desde `http://localhost:4200` (configurado en `Program.cs`):

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});
```

Si el front-end corre en otro puerto, agregar esa política en `Program.cs`:

```csharp
policy.WithOrigins("http://localhost:4200", "http://localhost:OTRO_PUERTO")
```

---

## 7. JWT — Configuración

Los tokens JWT se configuran en `appsettings*.json`:

| Parámetro | Valor actual | Descripción |
|-----------|-------------|-------------|
| `SecretKey` | `INSBAPA-2025-SECRET-KEY-FOR-JWT-TOKENS-32CHARS!` | Clave HMAC-SHA256 (mínimo 32 caracteres) |
| `Issuer` | `INSBAPA` | Emisor del token |
| `Audience` | `INSBAPA-App` | Audiencia del token |
| `ExpirationMinutes` | `480` | Expiración: 8 horas |

**IMPORTANTE:** Si se cambia el `SecretKey`, todos los tokens anteriores se invalidan.

---

## 8. Puertos por defecto

| Servicio | Puerto | URL |
|----------|--------|-----|
| API .NET | 5275 | http://localhost:5275 |
| Swagger | 5275 | http://localhost:5275/swagger |
| Angular Dev | 4200 | http://localhost:4200 |
| Prototipo HTML | 5050 | http://localhost:5050 |

Si algún puerto está ocupado, cambiarlo:

**API (.NET):** Editar `Properties/launchSettings.json` o usar:

```bash
dotnet run --urls "http://localhost:OTRO_PUERTO"
```

**Angular:** Editar `angular.json` → `architect.serve.options.port` o usar:

```bash
pnpm start -- --port 4300
```

---

## 9. Troubleshooting

### Error: "Connection string 'INSBAPA' not found"

El archivo `appsettings.Development.json` no existe o no tiene la cadena de conexión. Seguir el paso 4.1.

### Error: "No connection could be made because the target machine actively refused it"

SQL Server no está corriendo o el nombre/instancia es incorrecto. Verificar con SQL Server Configuration Manager.

### Error: "Login failed for user"

Autenticación incorrecta. Si usás `Trusted_Connection=True`, asegurarse de que el usuario de Windows tenga acceso a SQL Server.

### Error: CORS policy blocks request

El front-end está corriendo en un puerto diferente a `4200`. Agregar ese puerto a la política CORS en `Program.cs`.

### Error: "Token validation failed"

El token expiró (8 horas) o el `SecretKey` cambió. Cerrar sesión y volver a iniciar.

### Front-end no muestra errores de la API

Verificar la consola del navegador (F12 → Network). Las respuestas de error de la API vienen con `statusCode: 401` o `400` y un cuerpo `{ "error": "mensaje" }`.

---

## 10. Estructura del proyecto

```
prueba1/
├── AGENTS.md                    # Guía para agents de código
├── .gitignore                   # Ignora node_modules, bin, appsettings.Development.json
├── back-end/
│   └── API-LMS/API-LMS/
│       ├── Program.cs           # Configuración principal (CORS, JWT, endpoints)
│       ├── appsettings.json     # Config base (commiteada)
│       ├── appsettings.Development.example.json  # Template
│       ├── Endpoints/
│       │   ├── AuthEndpoints.cs       # Login + perfil
│       │   ├── DashboardEndpoints.cs  # Dashboard por rol
│       │   └── PerfilEndpoints.cs     # Actualizar perfil + cambiar contraseña
│       ├── Models/
│       │   └── UsuarioDto.cs    # DTO de usuario
│       └── Services/
│           ├── AuthService.cs   # BCrypt + JWT
│           └── DbService.cs     # Acceso a BD vía SPs
├── database/
│   ├── 01-create-schema.sql     # Tablas e índices
│   ├── 02-stored-procedures.sql # SPs
│   ├── 03-seed-data.sql         # Usuarios demo
│   └── 04-update-passwords.sql  # Hashes BCrypt
├── documentacion/
│   ├── levantamientoservices.md # Este archivo
│   └── login.md                 # Documentación del login
├── front-end/
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── app.ts                  # Root component
│       │   ├── app.config.ts           # Providers (router, http, interceptor)
│       │   ├── app.routes.ts           # Rutas
│       │   ├── interceptors/
│       │   │   └── auth.interceptor.ts # Inyecta Bearer token
│       │   ├── guards/
│       │   │   └── auth.guard.ts       # Protege rutas autenticadas
│       │   ├── models/
│       │   │   └── usuario.model.ts    # Interfaces TypeScript
│       │   ├── pages/
│       │   │   ├── login/              # Login
│       │   │   ├── shell/              # Shell (sidebar + topbar)
│       │   │   └── dashboard/          # Dashboard por rol
│       │   └── services/
│       │       └── auth.service.ts     # Estado de auth + localStorage
│       └── environments/
│           ├── environment.ts          # Producción
│           └── environment.development.ts  # Desarrollo
└── prototipo-insbapa/           # Prototipo estático HTML/CSS/JS
```
