/* ============================================================
   INSBAPA — Procedimientos almacenados
   Módulo: Administración de Usuarios (solo Admin)
   ============================================================ */

USE INSBAPA;
GO

-- =============================================================
-- SP: SP_ListarEstudiantes
-- Lista y busca estudiantes por nombre, carnet o correo.
-- Filtros opcionales por grado y sección.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ListarEstudiantes')
    DROP PROCEDURE SP_ListarEstudiantes;
GO

CREATE PROCEDURE SP_ListarEstudiantes
    @Busqueda   NVARCHAR(100) = NULL,
    @Grado_ID   INT = NULL,
    @Seccion_ID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.Usuario_ID,
        u.Username,
        u.Iniciales,
        u.Activo,
        e.Carnet,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        p.Telefono,
        g.Grado_ID,
        g.Nombre AS Grado,
        s.Seccion_ID,
        s.Nombre AS Seccion
    FROM ESTUDIANTES e
    INNER JOIN USUARIOS u ON u.Usuario_ID = e.Usuario_ID
    INNER JOIN PERSONAS p ON p.Persona_ID = u.Persona_ID
    INNER JOIN GRADOS g ON g.Grado_ID = e.Grado_ID
    INNER JOIN SECCIONES s ON s.Seccion_ID = e.Seccion_ID
    WHERE u.Activo = 1
      AND (@Busqueda IS NULL
           OR p.PrimerNombre LIKE '%' + @Busqueda + '%'
           OR p.PrimerApellido LIKE '%' + @Busqueda + '%'
           OR e.Carnet LIKE '%' + @Busqueda + '%'
           OR p.Correo LIKE '%' + @Busqueda + '%'
           OR u.Username LIKE '%' + @Busqueda + '%')
      AND (@Grado_ID IS NULL OR e.Grado_ID = @Grado_ID)
      AND (@Seccion_ID IS NULL OR e.Seccion_ID = @Seccion_ID)
    ORDER BY p.PrimerApellido, p.PrimerNombre;
END
GO

-- =============================================================
-- SP: SP_ListarProfesores
-- Lista y busca profesores por nombre, código o correo.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ListarProfesores')
    DROP PROCEDURE SP_ListarProfesores;
GO

CREATE PROCEDURE SP_ListarProfesores
    @Busqueda NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.Usuario_ID,
        u.Username,
        u.Iniciales,
        u.Activo,
        pr.CodigoProfesor,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        p.Telefono
    FROM PROFESORES pr
    INNER JOIN USUARIOS u ON u.Usuario_ID = pr.Usuario_ID
    INNER JOIN PERSONAS p ON p.Persona_ID = u.Persona_ID
    WHERE u.Activo = 1
      AND (@Busqueda IS NULL
           OR p.PrimerNombre LIKE '%' + @Busqueda + '%'
           OR p.PrimerApellido LIKE '%' + @Busqueda + '%'
           OR pr.CodigoProfesor LIKE '%' + @Busqueda + '%'
           OR p.Correo LIKE '%' + @Busqueda + '%'
           OR u.Username LIKE '%' + @Busqueda + '%')
    ORDER BY p.PrimerApellido, p.PrimerNombre;
END
GO

-- =============================================================
-- SP: SP_ListarAdministradores
-- Lista y busca administradores por nombre o correo.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ListarAdministradores')
    DROP PROCEDURE SP_ListarAdministradores;
GO

CREATE PROCEDURE SP_ListarAdministradores
    @Busqueda NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.Usuario_ID,
        u.Username,
        u.Iniciales,
        u.Activo,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        p.Telefono
    FROM USUARIOS u
    INNER JOIN ROLES r ON r.Rol_ID = u.Rol_ID
    INNER JOIN PERSONAS p ON p.Persona_ID = u.Persona_ID
    WHERE r.Nombre = 'Administrador'
      AND u.Activo = 1
      AND (@Busqueda IS NULL
           OR p.PrimerNombre LIKE '%' + @Busqueda + '%'
           OR p.PrimerApellido LIKE '%' + @Busqueda + '%'
           OR p.Correo LIKE '%' + @Busqueda + '%'
           OR u.Username LIKE '%' + @Busqueda + '%')
    ORDER BY p.PrimerApellido, p.PrimerNombre;
END
GO

-- =============================================================
-- SP: SP_AdminCambiarContrasena
-- Cambia la contraseña de cualquier usuario sin verificar la actual.
-- Solo para uso del administrador.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_AdminCambiarContrasena')
    DROP PROCEDURE SP_AdminCambiarContrasena;
GO

CREATE PROCEDURE SP_AdminCambiarContrasena
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

    SELECT 1 AS Exito;
END
GO

-- =============================================================
-- SP: SP_ObtenerGrados
-- Retorna el catálogo de grados activos.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerGrados')
    DROP PROCEDURE SP_ObtenerGrados;
GO

CREATE PROCEDURE SP_ObtenerGrados
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Grado_ID, Nombre
    FROM GRADOS
    WHERE Activo = 1
    ORDER BY Orden;
END
GO

-- =============================================================
-- SP: SP_ObtenerSecciones
-- Retorna el catálogo de secciones activas.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerSecciones')
    DROP PROCEDURE SP_ObtenerSecciones;
GO

CREATE PROCEDURE SP_ObtenerSecciones
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Seccion_ID, Nombre
    FROM SECCIONES
    WHERE Activo = 1
    ORDER BY Nombre;
END
GO

-- =============================================================
-- SP: SP_RegistrarEstudianteAdmin
-- Crea PERSONA + USUARIO + ESTUDIANTE sin validación de token.
-- Versión para que el administrador registre estudiantes directamente.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_RegistrarEstudianteAdmin')
    DROP PROCEDURE SP_RegistrarEstudianteAdmin;
GO

CREATE PROCEDURE SP_RegistrarEstudianteAdmin
    @PrimerNombre    NVARCHAR(50),
    @SegundoNombre   NVARCHAR(50),
    @PrimerApellido  NVARCHAR(50),
    @SegundoApellido NVARCHAR(50),
    @Correo          NVARCHAR(100),
    @Telefono        NVARCHAR(20),
    @Username        NVARCHAR(50),
    @ContrasenaHash  NVARCHAR(200),
    @Grado_ID        INT,
    @Seccion_ID      INT
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

        -- 3. Verificar que el grado exista
        IF NOT EXISTS (SELECT 1 FROM GRADOS WHERE Grado_ID = @Grado_ID AND Activo = 1)
        BEGIN
            RAISERROR('Grado no válido.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 4. Verificar que la sección exista
        IF NOT EXISTS (SELECT 1 FROM SECCIONES WHERE Seccion_ID = @Seccion_ID AND Activo = 1)
        BEGIN
            RAISERROR('Sección no válida.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 5. Obtener Rol Estudiante
        DECLARE @RolEstudianteID INT;
        SELECT @RolEstudianteID = Rol_ID FROM ROLES WHERE Nombre = 'Estudiante';

        -- 6. Insertar PERSONA
        DECLARE @PersonaID INT;
        INSERT INTO PERSONAS (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Correo, Telefono)
        VALUES (@PrimerNombre, @SegundoNombre, @PrimerApellido, @SegundoApellido, @Correo, @Telefono);
        SET @PersonaID = SCOPE_IDENTITY();

        -- 7. Insertar USUARIO
        DECLARE @UsuarioID INT;
        DECLARE @Iniciales NVARCHAR(10) = UPPER(LEFT(@PrimerNombre, 1) + LEFT(@PrimerApellido, 1));
        INSERT INTO USUARIOS (Username, Contrasena, Iniciales, Rol_ID, Persona_ID)
        VALUES (@Username, @ContrasenaHash, @Iniciales, @RolEstudianteID, @PersonaID);
        SET @UsuarioID = SCOPE_IDENTITY();

        -- 8. Generar carnet (año + secuencial)
        DECLARE @Ano NVARCHAR(4) = CAST(YEAR(GETDATE()) AS NVARCHAR(4));
        DECLARE @Secuencial INT;
        SELECT @Secuencial = COUNT(*) + 1 FROM ESTUDIANTES;
        DECLARE @Carnet NVARCHAR(20) = @Ano + RIGHT('0000' + CAST(@Secuencial AS NVARCHAR(4)), 4);

        -- 9. Insertar ESTUDIANTE
        INSERT INTO ESTUDIANTES (Carnet, Persona_ID, Usuario_ID, Grado_ID, Seccion_ID)
        VALUES (@Carnet, @PersonaID, @UsuarioID, @Grado_ID, @Seccion_ID);

        COMMIT TRANSACTION;

        -- Retornar datos del usuario creado
        SELECT
            @UsuarioID    AS Usuario_ID,
            @Username     AS Username,
            @Iniciales    AS Iniciales,
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

PRINT 'Procedimientos de administración de usuarios creados correctamente.';
GO
