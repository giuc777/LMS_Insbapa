# AGENTS.md

## Project

INSBAPA — LMS platform for a secondary education institute. Monorepo with three parts: Angular front-end, .NET back-end, SQL Server database, plus a static HTML prototype.

## Structure

- `front-end/` — Angular 21 app (pnpm, Vitest, Playwright E2E). Full login, dashboard, shell, ajustes components with services, guards, interceptors.
- `back-end/API-LMS/` — .NET 10 Web API. Endpoints for auth, profile, dashboard, admin CRUD. Uses BCrypt + JWT.
- `database/` — SQL Server scripts: schema, stored procedures, seed data.
- `prototipo-insbapa/` — Static HTML/CSS/JS prototype. See `prototipo-insbapa/AGENTS.md` for details.

## Commands

### Front-end (`front-end/`)

```bash
pnpm install              # install deps
pnpm start                # dev server → http://localhost:4200
pnpm build                # production build
pnpm test                 # run Vitest unit tests
pnpm test:e2e             # run Playwright E2E tests (requires both servers running)
pnpm test:e2e:login       # run only login module E2E tests
pnpm test:e2e:ui          # Playwright UI mode (interactive)
pnpm test:e2e:debug       # Playwright debug mode (step by step)
pnpm test:e2e:report      # open HTML test report
```

Package manager is **pnpm** (configured in `angular.json` → `cli.packageManager`).

### Back-end (`back-end/API-LMS/API-LMS/`)

```bash
dotnet run                # starts API on http://localhost:5275
dotnet build              # compile
```

Requires .NET 10 SDK.

### Database (`database/`)

Run scripts in order against SQL Server (`.\SQLEXPRESS`):
1. `01-create-schema.sql` — creates `INSBAPA` database and tables
2. `02-stored-procedures.sql` — stored procedures
3. `03-seed-data.sql` — demo admin/profesor/estudiante + token `REG-DEMO2026`

Quick run: `sqlcmd -S .\SQLEXPRESS -E -i database\01-create-schema.sql` (repeat for each file).

### Prototype (`prototipo-insbapa/`)

```bash
python -m http.server 5050   # from prototipo-insbapa/
# open http://localhost:5050/login.html
```

## E2E Testing (Playwright)

Location: `front-end/tests-e2e/`

```
tests-e2e/
├── playwright.config.ts         # config: webServer auto-starts Angular + .NET
├── test-data.ts                 # test credentials (student/teacher/admin)
├── fixtures/auth.fixture.ts     # authenticated page fixtures per role
├── pages/
│   ├── login.page.ts            # LoginPage POM
│   └── shell.page.ts            # ShellPage POM
└── tests/
    ├── login.spec.ts            # 10 tests: login page, success, failure, loading
    ├── auth-guard.spec.ts       # 4 tests: redirect, session, logout, persistence
    └── ajustes.spec.ts          # 3 tests: profile, password, admin tabs
```

**Requirements:** Both Angular (`:4200`) and .NET API (`:5275`) must be running. The `playwright.config.ts` has `webServer` config to auto-start them if `reuseExistingServer: true`.

**Key pattern:** Radio buttons in login are CSS-hidden; the Page Object clicks the `<label class="role-card">` wrapper, not the `<input>`.

## Code style

- **Front-end**: Prettier with single quotes, 100 char width, Angular HTML parser. TypeScript strict mode.
- **EditorConfig**: 2-space indent, UTF-8, final newline.
- **Back-end**: .NET conventions, nullable enabled, implicit usings.
- **Prototype**: Vanilla JS, IIFE modules, no linter.

## Gotchas

- **Back-end config**: `appsettings.Development.json` is gitignored. Copy `appsettings.Development.example.json` → `appsettings.Development.json` and set your local connection string.
- Database stored procedures expect BCrypt verification to happen in .NET code, not SQL. Seed data uses `PLACEHOLDER_HASH`.
- The API runs on port `5275` (not 5000) — check `launchSettings.json`.
- `prototipo-insbapa/` is a standalone static prototype, not connected to the Angular front-end.
- No CI/CD pipelines, no Docker config, no ESLint configured.
- Front-end unit tests use Vitest (not Karma/Jasmine). E2E tests use Playwright.
- Playwright radio buttons: do not use `locator.check()` on hidden `<input type="radio">`; click the parent `<label>` instead.
