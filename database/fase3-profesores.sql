-- =============================================================
-- FASE 3: Stored Procedures de Profesores (Admin)
-- Ejecutar contra la base INSBAPA
-- =============================================================
USE INSBAPA;
GO

-- =============================================================
-- 1. SP_ListarProfesoresPaginado
-- Lista profesores con búsqueda, paginación y conteo total.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ListarProfesoresPaginado')
    DROP PROCEDURE SP_ListarProfesoresPaginado;
GO

CREATE PROCEDURE SP_ListarProfesoresPaginado
    @Busqueda      NVARCHAR(100) = NULL,
    @Pagina        INT = 1,
    @TamanioPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Pagina - 1) * @TamanioPagina;

    SELECT
        pr.Profesor_ID,
        pr.CodigoProfesor,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        p.Telefono,
        u.Username,
        u.Iniciales,
        u.Activo
    FROM PROFESORES pr
    INNER JOIN USUARIOS u ON pr.Usuario_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    WHERE (@Busqueda IS NULL
           OR p.PrimerNombre LIKE '%' + @Busqueda + '%'
           OR p.PrimerApellido LIKE '%' + @Busqueda + '%'
           OR pr.CodigoProfesor LIKE '%' + @Busqueda + '%'
           OR p.Correo LIKE '%' + @Busqueda + '%')
    ORDER BY p.PrimerApellido, p.PrimerNombre
    OFFSET @Offset ROWS FETCH NEXT @TamanioPagina ROWS ONLY;

    SELECT COUNT(*) AS Total
    FROM PROFESORES pr
    INNER JOIN USUARIOS u ON pr.Usuario_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    WHERE (@Busqueda IS NULL
           OR p.PrimerNombre LIKE '%' + @Busqueda + '%'
           OR p.PrimerApellido LIKE '%' + @Busqueda + '%'
           OR pr.CodigoProfesor LIKE '%' + @Busqueda + '%'
           OR p.Correo LIKE '%' + @Busqueda + '%');
END
GO

-- =============================================================
-- 2. SP_ObtenerProfesorPorId
-- Detalle completo de un profesor.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerProfesorPorId')
    DROP PROCEDURE SP_ObtenerProfesorPorId;
GO

CREATE PROCEDURE SP_ObtenerProfesorPorId
    @Profesor_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pr.Profesor_ID,
        pr.CodigoProfesor,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        p.Telefono,
        p.FechaNacimiento,
        u.Username,
        u.Iniciales,
        u.Activo,
        u.Usuario_ID
    FROM PROFESORES pr
    INNER JOIN USUARIOS u ON pr.Usuario_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    WHERE pr.Profesor_ID = @Profesor_ID;
END
GO

-- =============================================================
-- 3. SP_ProfesorClasesAsignadas
-- Clases asignadas al profesor con materia, grado, sección y # estudiantes.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ProfesorClasesAsignadas')
    DROP PROCEDURE SP_ProfesorClasesAsignadas;
GO

CREATE PROCEDURE SP_ProfesorClasesAsignadas
    @Profesor_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.Curso_ID,
        c.Codigo,
        c.Nombre AS Materia,
        g.Grado_ID,
        g.Nombre AS Grado,
        s.Seccion_ID,
        s.Nombre AS Seccion,
        (SELECT COUNT(*)
         FROM ESTUDIANTES e
         WHERE e.Grado_ID = pc.Grado_ID
           AND e.Seccion_ID = pc.Seccion_ID
           AND e.Activo = 1) AS Estudiantes
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    WHERE pc.Profesor_ID = @Profesor_ID
      AND pc.Activo = 1
    ORDER BY g.Orden, s.Nombre, c.Nombre;
END
GO

-- =============================================================
-- 4. SP_ActualizarProfesorAdmin
-- Actualiza datos de persona, estado de usuario y código profesor.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ActualizarProfesorAdmin')
    DROP PROCEDURE SP_ActualizarProfesorAdmin;
GO

CREATE PROCEDURE SP_ActualizarProfesorAdmin
    @Profesor_ID    INT,
    @PrimerNombre   NVARCHAR(50),
    @SegundoNombre  NVARCHAR(50) = NULL,
    @PrimerApellido NVARCHAR(50),
    @SegundoApellido NVARCHAR(50) = NULL,
    @Correo         NVARCHAR(100),
    @Telefono       NVARCHAR(20) = NULL,
    @CodigoProfesor NVARCHAR(20) = NULL,
    @Activo         BIT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Persona_ID INT, @Usuario_ID INT;
    SELECT @Persona_ID = Persona_ID, @Usuario_ID = Usuario_ID
    FROM PROFESORES WHERE Profesor_ID = @Profesor_ID;

    UPDATE PERSONAS
    SET PrimerNombre   = @PrimerNombre,
        SegundoNombre  = @SegundoNombre,
        PrimerApellido = @PrimerApellido,
        SegundoApellido = @SegundoApellido,
        Correo         = @Correo,
        Telefono       = @Telefono
    WHERE Persona_ID = @Persona_ID;

    UPDATE USUARIOS
    SET Activo = @Activo
    WHERE Usuario_ID = @Usuario_ID;

    UPDATE PROFESORES
    SET CodigoProfesor = @CodigoProfesor
    WHERE Profesor_ID = @Profesor_ID;

    SELECT 1 AS Resultado, 'Profesor actualizado correctamente' AS Mensaje;
END
GO
