/* ============================================================
   INSBAPA — Fase 1: Stored Procedures de Gestión de Cursos
   Motor: SQL Server
   Ejecutar: sqlcmd -S .\SQLEXPRESS -E -i database\fase1-cursos.sql
   ============================================================ */

USE INSBAPA;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =============================================================
-- 1. SP_CrearCursoAsignacion
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_CrearCursoAsignacion')
    DROP PROCEDURE SP_CrearCursoAsignacion;
GO

CREATE PROCEDURE SP_CrearCursoAsignacion
    @Curso_ID INT,
    @Grado_ID INT,
    @Seccion_ID INT,
    @Profesor_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM PROFESORES_CURSOS
        WHERE Curso_ID = @Curso_ID AND Grado_ID = @Grado_ID AND Seccion_ID = @Seccion_ID
    )
    BEGIN
        SELECT 0 AS Asignacion_ID, N'Ya existe esta asignación de curso' AS Mensaje;
        RETURN;
    END

    INSERT INTO PROFESORES_CURSOS (Curso_ID, Grado_ID, Seccion_ID, Profesor_ID)
    VALUES (@Curso_ID, @Grado_ID, @Seccion_ID, @Profesor_ID);

    SELECT SCOPE_IDENTITY() AS Asignacion_ID, N'Curso asignado correctamente' AS Mensaje;
END
GO

PRINT 'SP_CrearCursoAsignacion creado.';
GO

-- =============================================================
-- 2. SP_ActualizarCursoAsignacion
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ActualizarCursoAsignacion')
    DROP PROCEDURE SP_ActualizarCursoAsignacion;
GO

CREATE PROCEDURE SP_ActualizarCursoAsignacion
    @Asignacion_ID INT,
    @Curso_ID INT,
    @Grado_ID INT,
    @Seccion_ID INT,
    @Profesor_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM PROFESORES_CURSOS
        WHERE Curso_ID = @Curso_ID AND Grado_ID = @Grado_ID AND Seccion_ID = @Seccion_ID
          AND Asignacion_ID != @Asignacion_ID
    )
    BEGIN
        SELECT 0 AS Resultado, N'Ya existe esta asignación de curso' AS Mensaje;
        RETURN;
    END

    UPDATE PROFESORES_CURSOS
    SET Curso_ID = @Curso_ID, Grado_ID = @Grado_ID, Seccion_ID = @Seccion_ID, Profesor_ID = @Profesor_ID
    WHERE Asignacion_ID = @Asignacion_ID;

    SELECT 1 AS Resultado, N'Curso actualizado correctamente' AS Mensaje;
END
GO

PRINT 'SP_ActualizarCursoAsignacion creado.';
GO

-- =============================================================
-- 3. SP_EliminarCursoAsignacion
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_EliminarCursoAsignacion')
    DROP PROCEDURE SP_EliminarCursoAsignacion;
GO

CREATE PROCEDURE SP_EliminarCursoAsignacion
    @Asignacion_ID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM PROFESORES_CURSOS WHERE Asignacion_ID = @Asignacion_ID;

    SELECT 1 AS Resultado, N'Curso eliminado correctamente' AS Mensaje;
END
GO

PRINT 'SP_EliminarCursoAsignacion creado.';
GO

-- =============================================================
-- 4. SP_ObtenerCursosCatalogo
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerCursosCatalogo')
    DROP PROCEDURE SP_ObtenerCursosCatalogo;
GO

CREATE PROCEDURE SP_ObtenerCursosCatalogo
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Curso_ID, Codigo, Nombre, Area
    FROM CURSOS
    WHERE Activo = 1
    ORDER BY Nombre;
END
GO

PRINT 'SP_ObtenerCursosCatalogo creado.';
GO

-- =============================================================
-- 5. SP_ObtenerProfesoresCatalogo
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_ObtenerProfesoresCatalogo')
    DROP PROCEDURE SP_ObtenerProfesoresCatalogo;
GO

CREATE PROCEDURE SP_ObtenerProfesoresCatalogo
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pr.Profesor_ID,
        pr.CodigoProfesor,
        p.PrimerNombre + ' ' + ISNULL(p.SegundoNombre, '') + ' ' + p.PrimerApellido AS Nombre
    FROM PROFESORES pr
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    INNER JOIN USUARIOS u ON pr.Usuario_ID = u.Usuario_ID
    WHERE u.Activo = 1
    ORDER BY p.PrimerApellido;
END
GO

PRINT 'SP_ObtenerProfesoresCatalogo creado.';
GO

PRINT '=== Fase 1: SPs de cursos creados correctamente ===';
GO
