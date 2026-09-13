-- =============================================================
-- FASE 2: Stored Procedures de Estudiantes (Admin)
-- Ejecutar contra la base INSBAPA
-- =============================================================
USE INSBAPA;
GO

-- =============================================================
-- 1. SP_ListarEstudiantesPaginado
-- Lista estudiantes con filtros, paginación y conteo total.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ListarEstudiantesPaginado')
    DROP PROCEDURE SP_ListarEstudiantesPaginado;
GO

CREATE PROCEDURE SP_ListarEstudiantesPaginado
    @Busqueda      NVARCHAR(100) = NULL,
    @Grado_ID      INT = NULL,
    @Seccion_ID    INT = NULL,
    @Pagina        INT = 1,
    @TamanioPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Pagina - 1) * @TamanioPagina;

    SELECT
        e.Estudiante_ID,
        e.Carnet,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        g.Grado_ID,
        g.Nombre AS Grado,
        s.Seccion_ID,
        s.Nombre AS Seccion,
        u.Username,
        u.Iniciales,
        u.Activo
    FROM ESTUDIANTES e
    INNER JOIN USUARIOS u ON e.Usuario_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    INNER JOIN GRADOS g ON e.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON e.Seccion_ID = s.Seccion_ID
    WHERE (@Busqueda IS NULL
           OR p.PrimerNombre LIKE '%' + @Busqueda + '%'
           OR p.PrimerApellido LIKE '%' + @Busqueda + '%'
           OR e.Carnet LIKE '%' + @Busqueda + '%'
           OR p.Correo LIKE '%' + @Busqueda + '%')
      AND (@Grado_ID IS NULL OR e.Grado_ID = @Grado_ID)
      AND (@Seccion_ID IS NULL OR e.Seccion_ID = @Seccion_ID)
    ORDER BY p.PrimerApellido, p.PrimerNombre
    OFFSET @Offset ROWS FETCH NEXT @TamanioPagina ROWS ONLY;

    -- Total de registros (para paginación)
    SELECT COUNT(*) AS Total
    FROM ESTUDIANTES e
    INNER JOIN USUARIOS u ON e.Usuario_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    INNER JOIN GRADOS g ON e.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON e.Seccion_ID = s.Seccion_ID
    WHERE (@Busqueda IS NULL
           OR p.PrimerNombre LIKE '%' + @Busqueda + '%'
           OR p.PrimerApellido LIKE '%' + @Busqueda + '%'
           OR e.Carnet LIKE '%' + @Busqueda + '%'
           OR p.Correo LIKE '%' + @Busqueda + '%')
      AND (@Grado_ID IS NULL OR e.Grado_ID = @Grado_ID)
      AND (@Seccion_ID IS NULL OR e.Seccion_ID = @Seccion_ID);
END
GO

-- =============================================================
-- 2. SP_ObtenerEstudiantePorId
-- Detalle completo de un estudiante.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerEstudiantePorId')
    DROP PROCEDURE SP_ObtenerEstudiantePorId;
GO

CREATE PROCEDURE SP_ObtenerEstudiantePorId
    @Estudiante_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Estudiante_ID,
        e.Carnet,
        p.PrimerNombre,
        p.SegundoNombre,
        p.PrimerApellido,
        p.SegundoApellido,
        p.Correo,
        p.Telefono,
        p.FechaNacimiento,
        g.Grado_ID,
        g.Nombre AS Grado,
        s.Seccion_ID,
        s.Nombre AS Seccion,
        u.Username,
        u.Iniciales,
        u.Activo,
        u.Usuario_ID
    FROM ESTUDIANTES e
    INNER JOIN USUARIOS u ON e.Usuario_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    INNER JOIN GRADOS g ON e.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON e.Seccion_ID = s.Seccion_ID
    WHERE e.Estudiante_ID = @Estudiante_ID;
END
GO

-- =============================================================
-- 3. SP_EstudianteCursosInscritos
-- Cursos asignados al estudiante con promedio.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_EstudianteCursosInscritos')
    DROP PROCEDURE SP_EstudianteCursosInscritos;
GO

CREATE PROCEDURE SP_EstudianteCursosInscritos
    @Estudiante_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.Curso_ID,
        c.Nombre AS Materia,
        c.Codigo,
        g.Nombre AS Grado,
        s.Nombre AS Seccion,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Profesor,
        ISNULL(n.Promedio, 0) AS Promedio,
        CASE WHEN n.Estado = 'Aprobado' THEN 1 ELSE 0 END AS Aprobado
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    INNER JOIN PROFESORES pr ON pc.Profesor_ID = pr.Profesor_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    INNER JOIN ESTUDIANTES e ON e.Grado_ID = g.Grado_ID AND e.Seccion_ID = s.Seccion_ID
    LEFT JOIN NOTAS n ON n.Estudiante_ID = e.Estudiante_ID AND n.Curso_ID = c.Curso_ID AND n.Bloque = 1
    WHERE e.Estudiante_ID = @Estudiante_ID
    ORDER BY c.Nombre;
END
GO

-- =============================================================
-- 4. SP_ActualizarEstudianteAdmin
-- Actualiza datos de persona, estado de usuario y grado/sección.
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ActualizarEstudianteAdmin')
    DROP PROCEDURE SP_ActualizarEstudianteAdmin;
GO

CREATE PROCEDURE SP_ActualizarEstudianteAdmin
    @Estudiante_ID  INT,
    @PrimerNombre   NVARCHAR(50),
    @SegundoNombre  NVARCHAR(50) = NULL,
    @PrimerApellido NVARCHAR(50),
    @SegundoApellido NVARCHAR(50) = NULL,
    @Correo         NVARCHAR(100),
    @Telefono       NVARCHAR(20) = NULL,
    @Grado_ID       INT,
    @Seccion_ID     INT,
    @Activo         BIT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Persona_ID INT, @Usuario_ID INT;
    SELECT @Persona_ID = Persona_ID, @Usuario_ID = Usuario_ID
    FROM ESTUDIANTES WHERE Estudiante_ID = @Estudiante_ID;

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

    UPDATE ESTUDIANTES
    SET Grado_ID   = @Grado_ID,
        Seccion_ID = @Seccion_ID
    WHERE Estudiante_ID = @Estudiante_ID;

    SELECT 1 AS Resultado, 'Estudiante actualizado correctamente' AS Mensaje;
END
GO
