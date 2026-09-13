/* ============================================================
   INSBAPA — Stored Procedures Fase 0
   Correcciones de dashboard + SPs nuevos
   Motor: SQL Server
   ============================================================ */

USE INSBAPA;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =============================================================
-- 1. CORREGIR SP_ObtenerResumenProfesor (devolver datos reales)
-- =============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SP_ObtenerResumenProfesor') AND type = 'P')
    DROP PROCEDURE SP_ObtenerResumenProfesor;
GO

CREATE PROCEDURE SP_ObtenerResumenProfesor
    @Usuario_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM TAREAS t
         INNER JOIN PROFESORES_CURSOS pc ON t.Curso_ID = pc.Curso_ID
         INNER JOIN PROFESORES p ON pc.Profesor_ID = p.Profesor_ID
         WHERE p.Usuario_ID = @Usuario_ID AND t.Estado = 'Activa') AS TareasPorCalificar,

        (SELECT COUNT(*) FROM EXAMENES e
         INNER JOIN PROFESORES_CURSOS pc ON e.Curso_ID = pc.Curso_ID
         INNER JOIN PROFESORES p ON pc.Profesor_ID = p.Profesor_ID
         WHERE p.Usuario_ID = @Usuario_ID AND e.Estado = 'Activo') AS ExamenesActivos,

        (SELECT COUNT(DISTINCT te.Estudiante_ID)
         FROM TAREAS_ENTREGAS te
         INNER JOIN TAREAS t ON te.Tarea_ID = t.Tarea_ID
         INNER JOIN PROFESORES_CURSOS pc ON t.Curso_ID = pc.Curso_ID
         INNER JOIN PROFESORES p ON pc.Profesor_ID = p.Profesor_ID
         WHERE p.Usuario_ID = @Usuario_ID) AS TotalEstudiantes;
END;
GO

PRINT 'SP_ObtenerResumenProfesor corregido.';
GO

-- =============================================================
-- 2. CORREGIR SP_ObtenerResumenEstudiante (devolver datos reales)
-- =============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SP_ObtenerResumenEstudiante') AND type = 'P')
    DROP PROCEDURE SP_ObtenerResumenEstudiante;
GO

CREATE PROCEDURE SP_ObtenerResumenEstudiante
    @Usuario_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    IF @EstudianteID IS NULL
    BEGIN
        SELECT 0 AS TareasPendientes, 0 AS ExamenesPendientes, 0 AS PromedioGeneral;
        RETURN;
    END

    SELECT
        -- Tareas pendientes (activas y sin entrega)
        (SELECT COUNT(*) FROM TAREAS t
         WHERE t.Grado_ID = (SELECT Grado_ID FROM ESTUDIANTES WHERE Estudiante_ID = @EstudianteID)
           AND t.Seccion_ID = (SELECT Seccion_ID FROM ESTUDIANTES WHERE Estudiante_ID = @EstudianteID)
           AND t.Estado = 'Activa'
           AND NOT EXISTS (
               SELECT 1 FROM TAREAS_ENTREGAS te
               WHERE te.Tarea_ID = t.Tarea_ID AND te.Estudiante_ID = @EstudianteID
           )) AS TareasPendientes,

        -- Exámenes pendientes (activos y sin intento)
        (SELECT COUNT(*) FROM EXAMENES ex
         WHERE ex.Grado_ID = (SELECT Grado_ID FROM ESTUDIANTES WHERE Estudiante_ID = @EstudianteID)
           AND ex.Seccion_ID = (SELECT Seccion_ID FROM ESTUDIANTES WHERE Estudiante_ID = @EstudianteID)
           AND ex.Estado = 'Activo'
           AND NOT EXISTS (
               SELECT 1 FROM EXAMEN_INTENTOS ei
               WHERE ei.Examen_ID = ex.Examen_ID AND ei.Estudiante_ID = @EstudianteID
           )) AS ExamenesPendientes,

        -- Promedio general
        ISNULL((SELECT AVG(Promedio) FROM NOTAS WHERE Estudiante_ID = @EstudianteID AND Promedio IS NOT NULL), 0) AS PromedioGeneral;
END;
GO

PRINT 'SP_ObtenerResumenEstudiante corregido.';
GO

-- =============================================================
-- 3. SP_DesactivarToken
-- =============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SP_DesactivarToken') AND type = 'P')
    DROP PROCEDURE SP_DesactivarToken;
GO

CREATE PROCEDURE SP_DesactivarToken
    @Token_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE TOKENS_REGISTRO SET Activo = 0 WHERE Token_ID = @Token_ID;

    SELECT 1 AS Resultado, N'Token desactivado' AS Mensaje;
END;
GO

PRINT 'SP_DesactivarToken creado.';
GO

-- =============================================================
-- 4. SP_ListarCursosAdmin (para futura Fase 1)
-- =============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SP_ListarCursosAdmin') AND type = 'P')
    DROP PROCEDURE SP_ListarCursosAdmin;
GO

CREATE PROCEDURE SP_ListarCursosAdmin
    @Busqueda NVARCHAR(100) = NULL,
    @Grado_ID INT = NULL,
    @Seccion_ID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pc.Asignacion_ID,
        c.Curso_ID,
        c.Codigo,
        c.Nombre AS Materia,
        c.Area,
        g.Grado_ID,
        g.Nombre AS Grado,
        s.Seccion_ID,
        s.Nombre AS Seccion,
        p.PrimerNombre + ' ' + ISNULL(p.SegundoNombre, '') + ' ' + p.PrimerApellido + ' ' + ISNULL(p.SegundoApellido, '') AS Profesor,
        pr.Profesor_ID,
        (SELECT COUNT(*) FROM ESTUDIANTES e WHERE e.Grado_ID = g.Grado_ID AND e.Seccion_ID = s.Seccion_ID) AS Estudiantes
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    INNER JOIN PROFESORES pr ON pc.Profesor_ID = pr.Profesor_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    WHERE c.Activo = 1
        AND (@Busqueda IS NULL OR c.Nombre LIKE '%' + @Busqueda + '%' OR c.Codigo LIKE '%' + @Busqueda + '%')
        AND (@Grado_ID IS NULL OR g.Grado_ID = @Grado_ID)
        AND (@Seccion_ID IS NULL OR s.Seccion_ID = @Seccion_ID)
    ORDER BY g.Orden, s.Nombre, c.Nombre;
END;
GO

PRINT 'SP_ListarCursosAdmin creado.';
GO

PRINT '=== SPs Fase 0 creados correctamente ===';
GO
