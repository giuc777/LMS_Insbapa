/* ============================================================
   INSBAPA — Datos semilla para pruebas
   Crea un admin, un profesor y un estudiante de demo.
   Contraseñas hasheadas con BCrypt (se generan en .NET).
   Aquí se usa un placeholder; el backend las reemplazará.
   ============================================================ */

USE INSBAPA;
GO

-- =============================================================
-- Verificar que las tablas existan
-- =============================================================
IF NOT EXISTS (SELECT 1 FROM ROLES WHERE Nombre = 'Administrador')
BEGIN
    PRINT 'ERROR: Ejecutar primero 01-create-schema.sql';
    RETURN;
END
GO

-- =============================================================
-- ADMIN (Usuario_ID = 1)
-- =============================================================
IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE Username = 'admin')
BEGIN
    DECLARE @AdminPersonaID INT;
    INSERT INTO PERSONAS (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Correo, Telefono)
    VALUES (N'Administrador', NULL, N'Sistema', NULL, N'admin@insbapa.edu', NULL);
    SET @AdminPersonaID = SCOPE_IDENTITY();

    DECLARE @AdminRolID INT = (SELECT Rol_ID FROM ROLES WHERE Nombre = 'Administrador');

    DECLARE @AdminUserID INT;
    INSERT INTO USUARIOS (Username, Contrasena, Iniciales, Rol_ID, Persona_ID)
    VALUES (N'admin', N'PLACEHOLDER_HASH', N'AD', @AdminRolID, @AdminPersonaID);
    SET @AdminUserID = SCOPE_IDENTITY();

    PRINT 'Admin creado (Username: admin) — actualizar contraseña con hash BCrypt desde .NET';
END
GO

-- =============================================================
-- PROFESOR (Usuario_ID = 2)
-- =============================================================
IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE Username = 'profesor')
BEGIN
    DECLARE @ProfPersonaID INT;
    INSERT INTO PERSONAS (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Correo, Telefono)
    VALUES (N'Alejandro', N'', N'García', N'', N'a.garcia@insbapa.edu', NULL);
    SET @ProfPersonaID = SCOPE_IDENTITY();

    DECLARE @ProfRolID INT = (SELECT Rol_ID FROM ROLES WHERE Nombre = 'Profesor');

    DECLARE @ProfUserID INT;
    INSERT INTO USUARIOS (Username, Contrasena, Iniciales, Rol_ID, Persona_ID)
    VALUES (N'profesor', N'PLACEHOLDER_HASH', N'AG', @ProfRolID, @ProfPersonaID);
    SET @ProfUserID = SCOPE_IDENTITY();

    INSERT INTO PROFESORES (CodigoProfesor, MateriaPrincipal, Persona_ID, Usuario_ID)
    VALUES (N'PRF-001', N'Matemáticas', @ProfPersonaID, @ProfUserID);

    PRINT 'Profesor creado (Username: profesor) — actualizar contraseña con hash BCrypt desde .NET';
END
GO

-- =============================================================
-- ESTUDIANTE (Usuario_ID = 3)
-- =============================================================
IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE Username = 'estudiante')
BEGIN
    DECLARE @EstPersonaID INT;
    INSERT INTO PERSONAS (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Correo, Telefono, FechaNacimiento)
    VALUES (N'María', N'Fernanda', N'López', N'', N'maria.lopez@insbapa.edu', NULL, '2010-05-15');
    SET @EstPersonaID = SCOPE_IDENTITY();

    DECLARE @EstRolID INT = (SELECT Rol_ID FROM ROLES WHERE Nombre = 'Estudiante');

    DECLARE @EstUserID INT;
    INSERT INTO USUARIOS (Username, Contrasena, Iniciales, Rol_ID, Persona_ID)
    VALUES (N'estudiante', N'PLACEHOLDER_HASH', N'ML', @EstRolID, @EstPersonaID);
    SET @EstUserID = SCOPE_IDENTITY();

    DECLARE @GradoID INT = (SELECT Grado_ID FROM GRADOS WHERE Nombre = N'Primero Básico');
    DECLARE @SeccionID INT = (SELECT Seccion_ID FROM SECCIONES WHERE Nombre = N'A');

    INSERT INTO ESTUDIANTES (Carnet, Persona_ID, Usuario_ID, Grado_ID, Seccion_ID)
    VALUES (N'20260001', @EstPersonaID, @EstUserID, @GradoID, @SeccionID);

    PRINT 'Estudiante creado (Username: estudiante, Carnet: 20260001)';
END
GO

-- =============================================================
-- TOKEN DE REGISTRO DEMO
-- =============================================================
IF NOT EXISTS (SELECT 1 FROM TOKENS_REGISTRO WHERE Codigo = 'REG-DEMO2026')
BEGIN
    INSERT INTO TOKENS_REGISTRO (Codigo, Descripcion, MaximoUsos, UsosActuales, FechaExpiracion, Activo)
    VALUES (N'REG-DEMO2026', N'Matrícula 2026 — Demo', 40, 0, '2026-12-31T23:59:59', 1);

    PRINT 'Token demo creado: REG-DEMO2026 (40 usos)';
END
GO

PRINT '========================================';
PRINT 'Datos semilla insertados correctamente.';
PRINT 'IMPORTANTE: Las contraseñas son PLACEHOLDER.';
PRINT 'Actualizar con hashes BCrypt desde .NET.';
PRINT '========================================';
GO
