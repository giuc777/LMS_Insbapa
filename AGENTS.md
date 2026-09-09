# AGENTS.md

## Project

INSBAPA — LMS platform for a secondary education institute. Monorepo with three parts: Angular front-end, .NET back-end, SQL Server database, plus a static HTML prototype.

## Structure

- `front-end/` — Angular 21 app (pnpm, Vitest, Prettier). Routes are empty; app is scaffolded but not wired yet.
- `back-end/API-LMS/` — .NET 10 Web API. Minimal; only `Program.cs` with a "Hello World" endpoint.
- `database/` — SQL Server scripts in order: `01-create-schema.sql`, `02-stored-procedures.sql`, `03-seed-data.sql`.
- `prototipo-insbapa/` — Static HTML/CSS/JS prototype. See `prototipo-insbapa/AGENTS.md` for details.

## Commands

### Front-end (`front-end/`)

```bash
pnpm install          # install deps
pnpm start            # dev server → http://localhost:4200
pnpm build            # production build
pnpm test             # run Vitest unit tests
```

Package manager is **pnpm** (configured in `angular.json` → `cli.packageManager`).

### Back-end (`back-end/API-LMS/API-LMS/`)

```bash
dotnet run            # starts API on http://localhost:5000
dotnet build          # compile
```

Requires .NET 10 SDK.

### Database (`database/`)

Run scripts in order against SQL Server:
1. `01-create-schema.sql` — creates `INSBAPA` database and tables
2. `02-stored-procedures.sql` — stored procedures (see list below)
3. `03-seed-data.sql` — demo admin/profesor/estudiante (passwords are PLACEHOLDER_HASH)
4. `04-update-passwords.sql` — replaces PLACEHOLDER_HASH with real BCrypt hashes

Passwords are BCrypt-hashed in .NET, not in the SQL seed. A future script will update them.

**Stored procedures available:**
- `SP_Login` — validate credentials, return user data
- `SP_RegistrarEstudiante` — create person + user + student (requires token)
- `SP_RegistrarProfesor` — create person + user + professor
- `SP_RegistrarAdministrador` — create person + user with admin role
- `SP_ObtenerUsuarioPorId` — get user by ID with all related data
- `SP_ActualizarPerfil` — update person data
- `SP_CambiarContrasena` — update password hash
- `SP_GenerarTokenRegistro` — create enrollment token
- `SP_ListarTokensRegistro` — list all tokens with status
- `SP_ValidarTokenRegistro` — check if token is valid

### Prototype (`prototipo-insbapa/`)

```bash
python -m http.server 5050   # from prototipo-insbapa/
# open http://localhost:5050/login.html
```

## Code style

- **Front-end**: Prettier with single quotes, 100 char width, Angular HTML parser. TypeScript strict mode enabled.
- **EditorConfig**: 2-space indent, UTF-8, final newline.
- **Back-end**: .NET conventions, nullable enabled, implicit usings.
- **Prototype**: Vanilla JS, IIFE modules, no linter. Verify with `node --check`.

## Gotchas

- The front-end is freshly scaffolded. `app.routes.ts` is empty — no routes defined yet.
- The back-end `Program.cs` is a minimal template — no controllers, no DB connection, no middleware configured.
- Database stored procedures expect BCrypt verification to happen in .NET code, not SQL.
- `prototipo-insbapa/` is a standalone static prototype, not connected to the Angular front-end.
- No CI/CD pipelines, no Docker config, no ESLint configured.
- Front-end test runner is Vitest (not Karma/Jasmine).
