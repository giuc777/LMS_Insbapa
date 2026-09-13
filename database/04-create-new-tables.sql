/* ============================================================
   INSBAPA — Tablas nuevas para módulos del sistema
   Fase 0: Anuncios, Tareas, Exámenes, Notas, Materiales, Mantenimiento
   Motor: SQL Server
   ============================================================ */

USE INSBAPA;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =============================================================
-- 1. ANUNCIOS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ANUNCIOS') AND type = 'U')
BEGIN
    CREATE TABLE ANUNCIOS (
        Anuncio_ID INT IDENTITY(1,1) PRIMARY KEY,
        Titulo NVARCHAR(150) NOT NULL,
        Cuerpo NVARCHAR(MAX) NOT NULL,
        Categoria NVARCHAR(50) NOT NULL DEFAULT N'Academico',
        Autor_ID INT NOT NULL,
        Estado NVARCHAR(20) NOT NULL DEFAULT N'Publicado',
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        FechaModificacion DATETIME2 NULL,
        Activo BIT NOT NULL DEFAULT 1,
        CONSTRAINT FK_Anuncios_Usuarios FOREIGN KEY (Autor_ID) REFERENCES USUARIOS(Usuario_ID)
    );
    PRINT 'Tabla ANUNCIOS creada.';
END
ELSE
    PRINT 'Tabla ANUNCIOS ya existe.';
GO

-- =============================================================
-- 2. ANUNCIOS_DESTINATARIOS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ANUNCIOS_DESTINATARIOS') AND type = 'U')
BEGIN
    CREATE TABLE ANUNCIOS_DESTINATARIOS (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Anuncio_ID INT NOT NULL,
        Rol_Destinatario NVARCHAR(30) NOT NULL,
        Grado_ID INT NULL,
        Seccion_ID INT NULL,
        Leido BIT NOT NULL DEFAULT 0,
        FechaLectura DATETIME2 NULL,
        CONSTRAINT FK_AnunciosDest_Anuncios FOREIGN KEY (Anuncio_ID) REFERENCES ANUNCIOS(Anuncio_ID),
        CONSTRAINT FK_AnunciosDest_Grados FOREIGN KEY (Grado_ID) REFERENCES GRADOS(Grado_ID),
        CONSTRAINT FK_AnunciosDest_Secciones FOREIGN KEY (Seccion_ID) REFERENCES SECCIONES(Seccion_ID)
    );
    PRINT 'Tabla ANUNCIOS_DESTINATARIOS creada.';
END
ELSE
    PRINT 'Tabla ANUNCIOS_DESTINATARIOS ya existe.';
GO

-- =============================================================
-- 3. TAREAS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'TAREAS') AND type = 'U')
BEGIN
    CREATE TABLE TAREAS (
        Tarea_ID INT IDENTITY(1,1) PRIMARY KEY,
        Titulo NVARCHAR(150) NOT NULL,
        Instrucciones NVARCHAR(MAX) NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        FechaLimite DATETIME2 NOT NULL,
        Peso DECIMAL(5,2) NOT NULL DEFAULT 1.0,
        Estado NVARCHAR(20) NOT NULL DEFAULT N'Activa',
        Curso_ID INT NOT NULL,
        Grado_ID INT NOT NULL,
        Seccion_ID INT NOT NULL,
        CreadoPor_ID INT NOT NULL,
        CONSTRAINT FK_Tareas_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
        CONSTRAINT FK_Tareas_Grados FOREIGN KEY (Grado_ID) REFERENCES GRADOS(Grado_ID),
        CONSTRAINT FK_Tareas_Secciones FOREIGN KEY (Seccion_ID) REFERENCES SECCIONES(Seccion_ID),
        CONSTRAINT FK_Tareas_Usuarios FOREIGN KEY (CreadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
    );
    PRINT 'Tabla TAREAS creada.';
END
ELSE
    PRINT 'Tabla TAREAS ya existe.';
GO

-- =============================================================
-- 4. TAREAS_RECURSOS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'TAREAS_RECURSOS') AND type = 'U')
BEGIN
    CREATE TABLE TAREAS_RECURSOS (
        Recurso_ID INT IDENTITY(1,1) PRIMARY KEY,
        Tarea_ID INT NOT NULL,
        Nombre NVARCHAR(200) NOT NULL,
        URL NVARCHAR(500) NOT NULL,
        CONSTRAINT FK_TareasRecursos_Tareas FOREIGN KEY (Tarea_ID) REFERENCES TAREAS(Tarea_ID)
    );
    PRINT 'Tabla TAREAS_RECURSOS creada.';
END
ELSE
    PRINT 'Tabla TAREAS_RECURSOS ya existe.';
GO

-- =============================================================
-- 5. TAREAS_ENTREGAS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'TAREAS_ENTREGAS') AND type = 'U')
BEGIN
    CREATE TABLE TAREAS_ENTREGAS (
        Entrega_ID INT IDENTITY(1,1) PRIMARY KEY,
        Tarea_ID INT NOT NULL,
        Estudiante_ID INT NOT NULL,
        ArchivoURL NVARCHAR(500) NULL,
        Comentario NVARCHAR(MAX) NULL,
        Puntaje DECIMAL(5,2) NULL,
        Estado NVARCHAR(20) NOT NULL DEFAULT N'Entregada',
        FechaEntrega DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        FechaCalificacion DATETIME2 NULL,
        CalificadoPor_ID INT NULL,
        CONSTRAINT FK_Entregas_Tareas FOREIGN KEY (Tarea_ID) REFERENCES TAREAS(Tarea_ID),
        CONSTRAINT FK_Entregas_Estudiantes FOREIGN KEY (Estudiante_ID) REFERENCES ESTUDIANTES(Estudiante_ID),
        CONSTRAINT FK_Entregas_CalificadoPor FOREIGN KEY (CalificadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
    );
    PRINT 'Tabla TAREAS_ENTREGAS creada.';
END
ELSE
    PRINT 'Tabla TAREAS_ENTREGAS ya existe.';
GO

-- =============================================================
-- 6. EXAMENES
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'EXAMENES') AND type = 'U')
BEGIN
    CREATE TABLE EXAMENES (
        Examen_ID INT IDENTITY(1,1) PRIMARY KEY,
        Titulo NVARCHAR(150) NOT NULL,
        Instrucciones NVARCHAR(MAX) NULL,
        DuracionMinutos INT NOT NULL DEFAULT 60,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        FechaInicio DATETIME2 NULL,
        FechaFin DATETIME2 NULL,
        Estado NVARCHAR(20) NOT NULL DEFAULT N'Borrador',
        PuntajeTotal DECIMAL(5,2) NOT NULL DEFAULT 100,
        Curso_ID INT NOT NULL,
        Grado_ID INT NOT NULL,
        Seccion_ID INT NOT NULL,
        CreadoPor_ID INT NOT NULL,
        CONSTRAINT FK_Examenes_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
        CONSTRAINT FK_Examenes_Grados FOREIGN KEY (Grado_ID) REFERENCES GRADOS(Grado_ID),
        CONSTRAINT FK_Examenes_Secciones FOREIGN KEY (Seccion_ID) REFERENCES SECCIONES(Seccion_ID),
        CONSTRAINT FK_Examenes_Usuarios FOREIGN KEY (CreadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
    );
    PRINT 'Tabla EXAMENES creada.';
END
ELSE
    PRINT 'Tabla EXAMENES ya existe.';
GO

-- =============================================================
-- 7. EXAMEN_PREGUNTAS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'EXAMEN_PREGUNTAS') AND type = 'U')
BEGIN
    CREATE TABLE EXAMEN_PREGUNTAS (
        Pregunta_ID INT IDENTITY(1,1) PRIMARY KEY,
        Examen_ID INT NOT NULL,
        Tipo NVARCHAR(20) NOT NULL,
        Texto NVARCHAR(MAX) NOT NULL,
        Puntos DECIMAL(5,2) NOT NULL DEFAULT 10,
        Orden INT NOT NULL DEFAULT 1,
        Opciones NVARCHAR(MAX) NULL,
        RespuestaCorrecta NVARCHAR(500) NULL,
        CONSTRAINT FK_Preguntas_Examenes FOREIGN KEY (Examen_ID) REFERENCES EXAMENES(Examen_ID)
    );
    PRINT 'Tabla EXAMEN_PREGUNTAS creada.';
END
ELSE
    PRINT 'Tabla EXAMEN_PREGUNTAS ya existe.';
GO

-- =============================================================
-- 8. EXAMEN_INTENTOS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'EXAMEN_INTENTOS') AND type = 'U')
BEGIN
    CREATE TABLE EXAMEN_INTENTOS (
        Intento_ID INT IDENTITY(1,1) PRIMARY KEY,
        Examen_ID INT NOT NULL,
        Estudiante_ID INT NOT NULL,
        FechaInicio DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        FechaFin DATETIME2 NULL,
        PuntajeObtenido DECIMAL(5,2) NULL,
        Aprobado BIT NULL,
        Respuestas NVARCHAR(MAX) NULL,
        CONSTRAINT FK_Intentos_Examenes FOREIGN KEY (Examen_ID) REFERENCES EXAMENES(Examen_ID),
        CONSTRAINT FK_Intentos_Estudiantes FOREIGN KEY (Estudiante_ID) REFERENCES ESTUDIANTES(Estudiante_ID)
    );
    PRINT 'Tabla EXAMEN_INTENTOS creada.';
END
ELSE
    PRINT 'Tabla EXAMEN_INTENTOS ya existe.';
GO

-- =============================================================
-- 9. NOTAS
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'NOTAS') AND type = 'U')
BEGIN
    CREATE TABLE NOTAS (
        Nota_ID INT IDENTITY(1,1) PRIMARY KEY,
        Estudiante_ID INT NOT NULL,
        Curso_ID INT NOT NULL,
        Bloque INT NOT NULL,
        Tarea1 DECIMAL(5,2) NULL,
        Examen1 DECIMAL(5,2) NULL,
        Tarea2 DECIMAL(5,2) NULL,
        Proyecto DECIMAL(5,2) NULL,
        Participacion DECIMAL(5,2) NULL,
        Promedio DECIMAL(5,2) NULL,
        Estado NVARCHAR(20) NULL,
        FechaModificacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Notas_Estudiantes FOREIGN KEY (Estudiante_ID) REFERENCES ESTUDIANTES(Estudiante_ID),
        CONSTRAINT FK_Notas_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
        CONSTRAINT UQ_Notas_Estudiante_Curso_Bloque UNIQUE (Estudiante_ID, Curso_ID, Bloque)
    );
    PRINT 'Tabla NOTAS creada.';
END
ELSE
    PRINT 'Tabla NOTAS ya existe.';
GO

-- =============================================================
-- 10. MATERIALES
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MATERIALES') AND type = 'U')
BEGIN
    CREATE TABLE MATERIALES (
        Material_ID INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(200) NOT NULL,
        URL NVARCHAR(500) NOT NULL,
        Carpeta NVARCHAR(100) NOT NULL DEFAULT N'General',
        Curso_ID INT NOT NULL,
        SubidoPor_ID INT NOT NULL,
        FechaSubida DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Materiales_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
        CONSTRAINT FK_Materiales_Usuarios FOREIGN KEY (SubidoPor_ID) REFERENCES USUARIOS(Usuario_ID)
    );
    PRINT 'Tabla MATERIALES creada.';
END
ELSE
    PRINT 'Tabla MATERIALES ya existe.';
GO

-- =============================================================
-- 11. MANTENIMIENTO
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MANTENIMIENTO') AND type = 'U')
BEGIN
    CREATE TABLE MANTENIMIENTO (
        Mantenimiento_ID INT IDENTITY(1,1) PRIMARY KEY,
        Tipo NVARCHAR(50) NOT NULL,
        Descripcion NVARCHAR(500) NOT NULL,
        Fecha DATE NOT NULL,
        HoraInicio TIME NOT NULL,
        HoraFin TIME NULL,
        Estado NVARCHAR(20) NOT NULL DEFAULT N'Programado',
        CreadoPor_ID INT NOT NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Mantenimiento_Usuarios FOREIGN KEY (CreadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
    );
    PRINT 'Tabla MANTENIMIENTO creada.';
END
ELSE
    PRINT 'Tabla MANTENIMIENTO ya existe.';
GO

PRINT '=== Todas las tablas nuevas creadas correctamente ===';
GO
