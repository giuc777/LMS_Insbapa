/* ============================================================
   INSBAPA — Procedimientos almacenados
   Módulo: Login / Usuarios / Catálogos / Token de registro
   ============================================================ */

USE INSBAPA;
GO

-- =============================================================
-- SP: SP_Login
-- Valida credenciales y retorna datos del usuario autenticado.
-- La verificación de contraseña (BCrypt) se hace en .NET;
-- este SP solo retorna el hash para que la app lo verifique.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_Login')
    DROP PROCEDURE SP_Login;
GO

CREATE PROCEDURE SP_Login
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.Usuario_ID,
        u.Username,
        u.Contrasena,
        u.Iniciales,
        u.Activo,
        r.Nombre  AS Rol,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo
    FROM USUARIOS u
    INNER JOIN ROLES r ON r.Rol_ID = u.Rol_ID
    INNER JOIN PERSONAS p ON p.Persona_ID = u.Persona_ID
    WHERE u.Username = @Username
      AND u.Activo = 1;
END
GO

-- =============================================================
-- SP: SP_RegistrarEstudiante
-- Crea PERSONA + USUARIO + ESTUDIANTE en una transacción.
-- Valida que el token exista, esté activo y tenga usos.
-- La contraseña ya viene hasheada desde .NET (BCrypt).
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_RegistrarEstudiante')
    DROP PROCEDURE SP_RegistrarEstudiante;
GO

CREATE PROCEDURE SP_RegistrarEstudiante
    @PrimerNombre    NVARCHAR(50),
    @SegundoNombre   NVARCHAR(50),
    @PrimerApellido  NVARCHAR(50),
    @SegundoApellido NVARCHAR(50),
    @Correo          NVARCHAR(100),
    @Telefono        NVARCHAR(20),
    @Username        NVARCHAR(50),
    @ContrasenaHash  NVARCHAR(200),
    @CodigoToken     NVARCHAR(20),
    @Grado_ID        INT,
    @Seccion_ID      INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validar token
        DECLARE @TokenID INT;
        DECLARE @MaxUsos INT;
        DECLARE @UsosActuales INT;
        DECLARE @FechaExp DATETIME2;

        SELECT
            @TokenID = Token_ID,
            @MaxUsos = MaximoUsos,
            @UsosActuales = UsosActuales,
            @FechaExp = FechaExpiracion
        FROM TOKENS_REGISTRO
        WHERE Codigo = @CodigoToken AND Activo = 1;

        IF @TokenID IS NULL
        BEGIN
            RAISERROR('Token no encontrado o inactivo.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @FechaExp < GETDATE()
        BEGIN
            RAISERROR('Token expirado.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @UsosActuales >= @MaxUsos
        BEGIN
            RAISERROR('Token sin usos disponibles.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 2. Verificar que el username no exista
        IF EXISTS (SELECT 1 FROM USUARIOS WHERE Username = @Username)
        BEGIN
            RAISERROR('El nombre de usuario ya existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 3. Verificar que el correo no exista
        IF EXISTS (SELECT 1 FROM PERSONAS WHERE Correo = @Correo AND Activo = 1)
        BEGIN
            RAISERROR('El correo ya está registrado.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 4. Obtener Rol Estudiante
        DECLARE @RolEstudianteID INT;
        SELECT @RolEstudianteID = Rol_ID FROM ROLES WHERE Nombre = 'Estudiante';

        -- 5. Insertar PERSONA
        DECLARE @PersonaID INT;
        INSERT INTO PERSONAS (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Correo, Telefono)
        VALUES (@PrimerNombre, @SegundoNombre, @PrimerApellido, @SegundoApellido, @Correo, @Telefono);
        SET @PersonaID = SCOPE_IDENTITY();

        -- 6. Insertar USUARIO
        DECLARE @UsuarioID INT;
        DECLARE @Iniciales NVARCHAR(10) = UPPER(LEFT(@PrimerNombre, 1) + LEFT(@PrimerApellido, 1));
        INSERT INTO USUARIOS (Username, Contrasena, Iniciales, Rol_ID, Persona_ID)
        VALUES (@Username, @ContrasenaHash, @Iniciales, @RolEstudianteID, @PersonaID);
        SET @UsuarioID = SCOPE_IDENTITY();

        -- 7. Generar carnet (año + secuencial)
        DECLARE @Ano NVARCHAR(4) = CAST(YEAR(GETDATE()) AS NVARCHAR(4));
        DECLARE @Secuencial INT;
        SELECT @Secuencial = COUNT(*) + 1 FROM ESTUDIANTES;
        DECLARE @Carnet NVARCHAR(20) = @Ano + RIGHT('0000' + CAST(@Secuencial AS NVARCHAR(4)), 4);

        -- 8. Insertar ESTUDIANTE
        INSERT INTO ESTUDIANTES (Carnet, Persona_ID, Usuario_ID, Grado_ID, Seccion_ID)
        VALUES (@Carnet, @PersonaID, @UsuarioID, @Grado_ID, @Seccion_ID);

        -- 9. Actualizar token
        UPDATE TOKENS_REGISTRO
        SET UsosActuales = UsosActuales + 1
        WHERE Token_ID = @TokenID;

        -- Si alcanzó el máximo, desactivar
        IF @UsosActuales + 1 >= @MaxUsos
        BEGIN
            UPDATE TOKENS_REGISTRO SET Activo = 0 WHERE Token_ID = @TokenID;
        END

        COMMIT TRANSACTION;

        -- Retornar datos del usuario creado
        SELECT
            @UsuarioID   AS Usuario_ID,
            @Username    AS Username,
            @Iniciales   AS Iniciales,
            N'Estudiante' AS Rol,
            @PrimerNombre AS PrimerNombre,
            @PrimerApellido AS PrimerApellido,
            @Correo       AS Correo,
            @Carnet       AS Carnet;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END
GO

-- =============================================================
-- SP: SP_ObtenerUsuarioPorId
-- Retorna usuario con datos personales y rol.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerUsuarioPorId')
    DROP PROCEDURE SP_ObtenerUsuarioPorId;
GO

CREATE PROCEDURE SP_ObtenerUsuarioPorId
    @Usuario_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.Usuario_ID,
        u.Username,
        u.Iniciales,
        u.Activo,
        u.FechaCreacion,
        r.Rol_ID,
        r.Nombre AS Rol,
        p.Persona_ID,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        p.Telefono,
        p.FechaNacimiento,
        -- Datos de estudiante si aplica
        e.Estudiante_ID,
        e.Carnet,
        e.Grado_ID,
        g.Nombre AS Grado,
        e.Seccion_ID,
        s.Nombre AS Seccion,
        -- Datos de profesor si aplica
        pr.Profesor_ID,
        pr.CodigoProfesor
    FROM USUARIOS u
    INNER JOIN ROLES r ON r.Rol_ID = u.Rol_ID
    INNER JOIN PERSONAS p ON p.Persona_ID = u.Persona_ID
    LEFT JOIN ESTUDIANTES e ON e.Usuario_ID = u.Usuario_ID
    LEFT JOIN GRADOS g ON g.Grado_ID = e.Grado_ID
    LEFT JOIN SECCIONES s ON s.Seccion_ID = e.Seccion_ID
    LEFT JOIN PROFESORES pr ON pr.Usuario_ID = u.Usuario_ID
    WHERE u.Usuario_ID = @Usuario_ID;
END
GO

-- =============================================================
-- SP: SP_ListarCursosPorProfesor
-- Retorna todos los cursos asignados a un profesor.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ListarCursosPorProfesor')
    DROP PROCEDURE SP_ListarCursosPorProfesor;
GO

CREATE PROCEDURE SP_ListarCursosPorProfesor
    @Usuario_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pc.Asignacion_ID,
        c.Curso_ID,
        c.Codigo   AS CursoCodigo,
        c.Nombre   AS CursoNombre,
        c.Area     AS CursoArea,
        g.Grado_ID,
        g.Nombre   AS Grado,
        s.Seccion_ID,
        s.Nombre   AS Seccion
    FROM PROFESORES_CURSOS pc
    INNER JOIN PROFESORES pr ON pr.Profesor_ID = pc.Profesor_ID
    INNER JOIN CURSOS c ON c.Curso_ID = pc.Curso_ID
    INNER JOIN GRADOS g ON g.Grado_ID = pc.Grado_ID
    INNER JOIN SECCIONES s ON s.Seccion_ID = pc.Seccion_ID
    WHERE pr.Usuario_ID = @Usuario_ID
      AND pc.Activo = 1
    ORDER BY g.Orden, s.Nombre, c.Nombre;
END
GO

-- =============================================================
-- SP: SP_GenerarTokenRegistro
-- Crea un nuevo token de matrícula (solo admin).
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_GenerarTokenRegistro')
    DROP PROCEDURE SP_GenerarTokenRegistro;
GO

CREATE PROCEDURE SP_GenerarTokenRegistro
    @Descripcion    NVARCHAR(100),
    @MaximoUsos     INT,
    @MinutosValidez INT,
    @CreadoPor      INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Generar código aleatorio tipo REG-XXXXXXXX
    DECLARE @Chars NVARCHAR(36) = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    DECLARE @Codigo NVARCHAR(20) = 'REG-';
    DECLARE @i INT = 0;
    WHILE @i < 8
    BEGIN
        SET @Codigo = @Codigo + SUBSTRING(@Chars, ABS(CHECKSUM(NEWID())) % 36 + 1, 1);
        SET @i = @i + 1;
    END

    -- Verificar unicidad (colisión extremadamente improbable, pero por seguridad)
    WHILE EXISTS (SELECT 1 FROM TOKENS_REGISTRO WHERE Codigo = @Codigo)
    BEGIN
        SET @Codigo = 'REG-';
        SET @i = 0;
        WHILE @i < 8
        BEGIN
            SET @Codigo = @Codigo + SUBSTRING(@Chars, ABS(CHECKSUM(NEWID())) % 36 + 1, 1);
            SET @i = @i + 1;
        END
    END

    DECLARE @FechaExp DATETIME2 = DATEADD(MINUTE, @MinutosValidez, GETDATE());

    INSERT INTO TOKENS_REGISTRO (Codigo, Descripcion, MaximoUsos, FechaExpiracion, CreadoPor)
    VALUES (@Codigo, @Descripcion, @MaximoUsos, @FechaExp, @CreadoPor);

    SELECT
        SCOPE_IDENTITY() AS Token_ID,
        @Codigo          AS Codigo,
        @Descripcion     AS Descripcion,
        @MaximoUsos      AS MaximoUsos,
        0                AS UsosActuales,
        @FechaExp        AS FechaExpiracion,
        1                AS Activo;
END
GO

-- =============================================================
-- SP: SP_ListarTokensRegistro
-- Lista todos los tokens con su estado calculado.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ListarTokensRegistro')
    DROP PROCEDURE SP_ListarTokensRegistro;
GO

CREATE PROCEDURE SP_ListarTokensRegistro
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.Token_ID,
        t.Codigo,
        t.Descripcion,
        t.MaximoUsos,
        t.UsosActuales,
        t.FechaExpiracion,
        t.FechaCreacion,
        CASE
            WHEN t.Activo = 0 THEN N'Inactivo'
            WHEN t.UsosActuales >= t.MaximoUsos THEN N'Agotado'
            WHEN t.FechaExpiracion < GETDATE() THEN N'Expirado'
            ELSE N'Activo'
        END AS Estado,
        CASE
            WHEN t.Activo = 1
             AND t.UsosActuales < t.MaximoUsos
             AND t.FechaExpiracion >= GETDATE()
            THEN 1 ELSE 0
        END AS Disponible,
        u.Username AS CreadoPor
    FROM TOKENS_REGISTRO t
    LEFT JOIN USUARIOS u ON u.Usuario_ID = t.CreadoPor
    ORDER BY t.FechaCreacion DESC;
END
GO

-- =============================================================
-- SP: SP_ValidarTokenRegistro
-- Verifica si un código de matrícula es válido.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ValidarTokenRegistro')
    DROP PROCEDURE SP_ValidarTokenRegistro;
GO

CREATE PROCEDURE SP_ValidarTokenRegistro
    @Codigo NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.Token_ID,
        t.Codigo,
        t.Descripcion,
        t.MaximoUsos,
        t.UsosActuales,
        t.FechaExpiracion,
        CASE
            WHEN t.Activo = 0 THEN 0
            WHEN t.UsosActuales >= t.MaximoUsos THEN 0
            WHEN t.FechaExpiracion < GETDATE() THEN 0
            ELSE 1
        END AS Valido,
        CASE
            WHEN t.Activo = 0 THEN N'Inactivo'
            WHEN t.UsosActuales >= t.MaximoUsos THEN N'Sinusos'
            WHEN t.FechaExpiracion < GETDATE() THEN N'Expirado'
            ELSE N'OK'
        END AS Razon
    FROM TOKENS_REGISTRO t
    WHERE t.Codigo = @Codigo;
END
GO

-- =============================================================
-- SP: SP_ActualizarPerfil
-- Actualiza datos personales de un usuario.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ActualizarPerfil')
    DROP PROCEDURE SP_ActualizarPerfil;
GO

CREATE PROCEDURE SP_ActualizarPerfil
    @Usuario_ID     INT,
    @PrimerNombre   NVARCHAR(50),
    @SegundoNombre  NVARCHAR(50),
    @PrimerApellido NVARCHAR(50),
    @SegundoApellido NVARCHAR(50),
    @Telefono       NVARCHAR(20),
    @FechaNacimiento DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PersonaID INT;
    SELECT @PersonaID = Persona_ID FROM USUARIOS WHERE Usuario_ID = @Usuario_ID;

    IF @PersonaID IS NULL
    BEGIN
        RAISERROR('Usuario no encontrado.', 16, 1);
        RETURN;
    END

    UPDATE PERSONAS
    SET PrimerNombre   = @PrimerNombre,
        SegundoNombre  = @SegundoNombre,
        PrimerApellido = @PrimerApellido,
        SegundoApellido = @SegundoApellido,
        Telefono       = @Telefono,
        FechaNacimiento = @FechaNacimiento
    WHERE Persona_ID = @PersonaID;

    -- Actualizar iniciales
    DECLARE @Iniciales NVARCHAR(10) = UPPER(LEFT(@PrimerNombre, 1) + LEFT(@PrimerApellido, 1));
    UPDATE USUARIOS
    SET Iniciales = @Iniciales,
        FechaModificacion = GETDATE()
    WHERE Usuario_ID = @Usuario_ID;
END
GO

-- =============================================================
-- SP: SP_CambiarContrasena
-- Actualiza la contraseña de un usuario (hash viene de .NET).
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_CambiarContrasena')
    DROP PROCEDURE SP_CambiarContrasena;
GO

CREATE PROCEDURE SP_CambiarContrasena
    @Usuario_ID       INT,
    @NuevaContrasena  NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE Usuario_ID = @Usuario_ID AND Activo = 1)
    BEGIN
        RAISERROR('Usuario no encontrado o inactivo.', 16, 1);
        RETURN;
    END

    UPDATE USUARIOS
    SET Contrasena = @NuevaContrasena,
        FechaModificacion = GETDATE()
    WHERE Usuario_ID = @Usuario_ID;
END
GO

-- =============================================================
-- SP: SP_RegistrarProfesor
-- Crea PERSONA + USUARIO + PROFESOR en una transacción.
-- La contraseña ya viene hasheada desde .NET (BCrypt).
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_RegistrarProfesor')
    DROP PROCEDURE SP_RegistrarProfesor;
GO

CREATE PROCEDURE SP_RegistrarProfesor
    @PrimerNombre     NVARCHAR(50),
    @SegundoNombre    NVARCHAR(50),
    @PrimerApellido   NVARCHAR(50),
    @SegundoApellido  NVARCHAR(50),
    @Correo           NVARCHAR(100),
    @Telefono         NVARCHAR(20),
    @Username         NVARCHAR(50),
    @ContrasenaHash   NVARCHAR(200),
    @CodigoProfesor   NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Verificar que el username no exista
        IF EXISTS (SELECT 1 FROM USUARIOS WHERE Username = @Username)
        BEGIN
            RAISERROR('El nombre de usuario ya existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 2. Verificar que el correo no exista
        IF EXISTS (SELECT 1 FROM PERSONAS WHERE Correo = @Correo AND Activo = 1)
        BEGIN
            RAISERROR('El correo ya está registrado.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 3. Obtener Rol Profesor
        DECLARE @RolProfesorID INT;
        SELECT @RolProfesorID = Rol_ID FROM ROLES WHERE Nombre = 'Profesor';

        -- 4. Insertar PERSONA
        DECLARE @PersonaID INT;
        INSERT INTO PERSONAS (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Correo, Telefono)
        VALUES (@PrimerNombre, @SegundoNombre, @PrimerApellido, @SegundoApellido, @Correo, @Telefono);
        SET @PersonaID = SCOPE_IDENTITY();

        -- 5. Insertar USUARIO
        DECLARE @UsuarioID INT;
        DECLARE @Iniciales NVARCHAR(10) = UPPER(LEFT(@PrimerNombre, 1) + LEFT(@PrimerApellido, 1));
        INSERT INTO USUARIOS (Username, Contrasena, Iniciales, Rol_ID, Persona_ID)
        VALUES (@Username, @ContrasenaHash, @Iniciales, @RolProfesorID, @PersonaID);
        SET @UsuarioID = SCOPE_IDENTITY();

        -- 6. Generar código profesor si no se proporcionó
        IF @CodigoProfesor IS NULL OR LTRIM(RTRIM(@CodigoProfesor)) = ''
        BEGIN
            DECLARE @Secuencial INT;
            SELECT @Secuencial = COUNT(*) + 1 FROM PROFESORES;
            SET @CodigoProfesor = 'PRF-' + RIGHT('000' + CAST(@Secuencial AS NVARCHAR(4)), 3);
        END

        -- 7. Verificar que el código no exista
        IF EXISTS (SELECT 1 FROM PROFESORES WHERE CodigoProfesor = @CodigoProfesor)
        BEGIN
            RAISERROR('El código de profesor ya existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 8. Insertar PROFESOR
        INSERT INTO PROFESORES (CodigoProfesor, Persona_ID, Usuario_ID)
        VALUES (@CodigoProfesor, @PersonaID, @UsuarioID);

        COMMIT TRANSACTION;

        -- Retornar datos del usuario creado
        SELECT
            @UsuarioID        AS Usuario_ID,
            @Username         AS Username,
            @Iniciales        AS Iniciales,
            N'Profesor'       AS Rol,
            @PrimerNombre     AS PrimerNombre,
            @PrimerApellido   AS PrimerApellido,
            @Correo           AS Correo,
            @CodigoProfesor   AS CodigoProfesor;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END
GO

-- =============================================================
-- SP: SP_RegistrarAdministrador
-- Crea PERSONA + USUARIO con rol Administrador en una transacción.
-- La contraseña ya viene hasheada desde .NET (BCrypt).
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_RegistrarAdministrador')
    DROP PROCEDURE SP_RegistrarAdministrador;
GO

CREATE PROCEDURE SP_RegistrarAdministrador
    @PrimerNombre    NVARCHAR(50),
    @SegundoNombre   NVARCHAR(50),
    @PrimerApellido  NVARCHAR(50),
    @SegundoApellido NVARCHAR(50),
    @Correo          NVARCHAR(100),
    @Telefono        NVARCHAR(20),
    @Username        NVARCHAR(50),
    @ContrasenaHash  NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Verificar que el username no exista
        IF EXISTS (SELECT 1 FROM USUARIOS WHERE Username = @Username)
        BEGIN
            RAISERROR('El nombre de usuario ya existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 2. Verificar que el correo no exista
        IF EXISTS (SELECT 1 FROM PERSONAS WHERE Correo = @Correo AND Activo = 1)
        BEGIN
            RAISERROR('El correo ya está registrado.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 3. Obtener Rol Administrador
        DECLARE @RolAdminID INT;
        SELECT @RolAdminID = Rol_ID FROM ROLES WHERE Nombre = 'Administrador';

        -- 4. Insertar PERSONA
        DECLARE @PersonaID INT;
        INSERT INTO PERSONAS (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Correo, Telefono)
        VALUES (@PrimerNombre, @SegundoNombre, @PrimerApellido, @SegundoApellido, @Correo, @Telefono);
        SET @PersonaID = SCOPE_IDENTITY();

        -- 5. Insertar USUARIO
        DECLARE @UsuarioID INT;
        DECLARE @Iniciales NVARCHAR(10) = UPPER(LEFT(@PrimerNombre, 1) + LEFT(@PrimerApellido, 1));
        INSERT INTO USUARIOS (Username, Contrasena, Iniciales, Rol_ID, Persona_ID)
        VALUES (@Username, @ContrasenaHash, @Iniciales, @RolAdminID, @PersonaID);
        SET @UsuarioID = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        -- Retornar datos del usuario creado
        SELECT
            @UsuarioID      AS Usuario_ID,
            @Username       AS Username,
            @Iniciales      AS Iniciales,
            N'Administrador' AS Rol,
            @PrimerNombre   AS PrimerNombre,
            @PrimerApellido AS PrimerApellido,
            @Correo         AS Correo;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END
GO

-- =============================================================
-- SP: SP_ObtenerMetricasAdmin
-- Retorna métricas generales del sistema para el dashboard admin.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerMetricasAdmin')
    DROP PROCEDURE SP_ObtenerMetricasAdmin;
GO

CREATE PROCEDURE SP_ObtenerMetricasAdmin
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM ESTUDIANTES e INNER JOIN USUARIOS u ON u.Usuario_ID = e.Usuario_ID WHERE u.Activo = 1) AS TotalEstudiantes,
        (SELECT COUNT(*) FROM PROFESORES pr INNER JOIN USUARIOS u ON u.Usuario_ID = pr.Usuario_ID WHERE u.Activo = 1) AS TotalProfesores,
        (SELECT COUNT(*) FROM PROFESORES_CURSOS pc WHERE pc.Activo = 1) AS CursosActivos;
END
GO

-- =============================================================
-- SP: SP_ObtenerResumenProfesor
-- Retorna resumen del dashboard del profesor.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerResumenProfesor')
    DROP PROCEDURE SP_ObtenerResumenProfesor;
GO

CREATE PROCEDURE SP_ObtenerResumenProfesor
    @Usuario_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ProfesorID INT;
    SELECT @ProfesorID = Profesor_ID FROM PROFESORES WHERE Usuario_ID = @Usuario_ID;

    -- Tareas por calificar (entregadas sin nota)
    DECLARE @TareasPorCalificar INT = 0;

    -- Total de estudiantes a cargo
    DECLARE @TotalEstudiantes INT = 0;
    SELECT @TotalEstudiantes = COUNT(DISTINCT e.Usuario_ID)
    FROM PROFESORES_CURSOS pc
    INNER JOIN ESTUDIANTES e ON e.Grado_ID = pc.Grado_ID AND e.Seccion_ID = pc.Seccion_ID
    WHERE pc.Profesor_ID = @ProfesorID AND pc.Activo = 1;

    SELECT
        @TareasPorCalificar AS TareasPorCalificar,
        0 AS ExamenesActivos,
        @TotalEstudiantes AS TotalEstudiantes;
END
GO

-- =============================================================
-- SP: SP_ObtenerResumenEstudiante
-- Retorna resumen del dashboard del estudiante.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerResumenEstudiante')
    DROP PROCEDURE SP_ObtenerResumenEstudiante;
GO

CREATE PROCEDURE SP_ObtenerResumenEstudiante
    @Usuario_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    SELECT
        0 AS TareasPendientes,
        0 AS ExamenesProximos,
        0 AS PromedioGeneral;
END
GO

-- =============================================================
-- SP: SP_ObtenerCursosEstudiante
-- Retorna los cursos del estudiante con profesor asignado.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerCursosEstudiante')
    DROP PROCEDURE SP_ObtenerCursosEstudiante;
GO

CREATE PROCEDURE SP_ObtenerCursosEstudiante
    @Usuario_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @GradoID INT;
    DECLARE @SeccionID INT;

    SELECT @GradoID = e.Grado_ID, @SeccionID = e.Seccion_ID
    FROM ESTUDIANTES e WHERE e.Usuario_ID = @Usuario_ID;

    SELECT
        c.Curso_ID AS CursoId,
        c.Codigo AS Codigo,
        c.Nombre AS Nombre,
        c.Area AS Area,
        g.Nombre AS Grado,
        s.Nombre AS Seccion,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Profesor
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON c.Curso_ID = pc.Curso_ID
    INNER JOIN GRADOS g ON g.Grado_ID = pc.Grado_ID
    INNER JOIN SECCIONES s ON s.Seccion_ID = pc.Seccion_ID
    INNER JOIN PROFESORES pr ON pr.Profesor_ID = pc.Profesor_ID
    INNER JOIN PERSONAS p ON p.Persona_ID = pr.Persona_ID
    WHERE pc.Grado_ID = @GradoID
      AND pc.Seccion_ID = @SeccionID
      AND pc.Activo = 1
    ORDER BY c.Nombre;
END
GO

PRINT 'Procedimientos almacenados creados correctamente.';
GO
