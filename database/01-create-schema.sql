/* ============================================================
   INSBAPA — Script de creación de base de datos
   Módulo: Login / Usuarios / Catálogos básicos
   Motor: SQL Server
   Fuente de diseño: documentacion/modelo-datos.md
   ============================================================ */

-- =============================================================
-- 1. CREAR BASE DE DATOS
-- =============================================================
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'INSBAPA')
BEGIN
    CREATE DATABASE INSBAPA;
END
GO

USE INSBAPA;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =============================================================
-- 2. TABLAS
-- =============================================================

-- -------------------------------------------------------------
-- ROLES — Catálogo de roles del sistema
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ROLES') AND type = 'U')
BEGIN
    CREATE TABLE ROLES (
        Rol_ID      INT IDENTITY(1,1) PRIMARY KEY,
        Nombre      NVARCHAR(50)  NOT NULL,
        Descripcion NVARCHAR(200) NULL,
        Activo      BIT           NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2   NOT NULL DEFAULT GETDATE()
    );

    INSERT INTO ROLES (Nombre, Descripcion) VALUES
        (N'Administrador', N'Acceso total a la plataforma'),
        (N'Profesor',      N'Gestión de clases, tareas y evaluaciones'),
        (N'Estudiante',    N'Acceso a cursos, tareas y evaluaciones');
END
GO

-- -------------------------------------------------------------
-- GRADOS — Catálogo de grados del ciclo básico
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'GRADOS') AND type = 'U')
BEGIN
    CREATE TABLE GRADOS (
        Grado_ID    INT IDENTITY(1,1) PRIMARY KEY,
        Nombre      NVARCHAR(50) NOT NULL,
        Orden       INT          NOT NULL DEFAULT 0,
        Activo      BIT          NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2  NOT NULL DEFAULT GETDATE()
    );

    INSERT INTO GRADOS (Nombre, Orden) VALUES
        (N'Primero Básico',   1),
        (N'Segundo Básico',   2),
        (N'Tercero Básico',   3);
END
GO

-- -------------------------------------------------------------
-- SECCIONES — Catálogo de secciones
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SECCIONES') AND type = 'U')
BEGIN
    CREATE TABLE SECCIONES (
        Seccion_ID  INT IDENTITY(1,1) PRIMARY KEY,
        Nombre      NVARCHAR(10) NOT NULL,
        Activo      BIT          NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2  NOT NULL DEFAULT GETDATE()
    );

    INSERT INTO SECCIONES (Nombre) VALUES
        (N'A'), (N'B'), (N'C');
END
GO

-- -------------------------------------------------------------
-- PERSONAS — Datos personales comunes (1:1 con USUARIOS)
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'PERSONAS') AND type = 'U')
BEGIN
    CREATE TABLE PERSONAS (
        Persona_ID      INT IDENTITY(1,1) PRIMARY KEY,
        PrimerNombre    NVARCHAR(50)  NOT NULL,
        SegundoNombre   NVARCHAR(50)  NULL,
        PrimerApellido  NVARCHAR(50)  NOT NULL,
        SegundoApellido NVARCHAR(50)  NULL,
        Correo          NVARCHAR(100) NOT NULL,
        Telefono        NVARCHAR(20)  NULL,
        FechaNacimiento DATE          NULL,
        FechaCreacion   DATETIME2     NOT NULL DEFAULT GETDATE(),
        Activo          BIT           NOT NULL DEFAULT 1
    );

    CREATE UNIQUE INDEX IX_PERSONAS_Correo ON PERSONAS (Correo);
END
GO

-- -------------------------------------------------------------
-- USUARIOS — Credenciales y rol (INT IDENTITY como PK)
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIOS') AND type = 'U')
BEGIN
    CREATE TABLE USUARIOS (
        Usuario_ID    INT IDENTITY(1,1) PRIMARY KEY,
        Username      NVARCHAR(50)  NOT NULL,
        Contrasena    NVARCHAR(200) NOT NULL,
        Iniciales     NVARCHAR(10)  NULL,
        Rol_ID        INT           NOT NULL,
        Persona_ID    INT           NOT NULL,
        Activo        BIT           NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2     NOT NULL DEFAULT GETDATE(),
        FechaModificacion DATETIME2 NULL,

        CONSTRAINT FK_USUARIOS_ROLES FOREIGN KEY (Rol_ID)
            REFERENCES ROLES (Rol_ID),
        CONSTRAINT FK_USUARIOS_PERSONAS FOREIGN KEY (Persona_ID)
            REFERENCES PERSONAS (Persona_ID)
    );

    CREATE UNIQUE INDEX IX_USUARIOS_Username ON USUARIOS (Username);
END
GO

-- -------------------------------------------------------------
-- ESTUDIANTES — Datos específicos de estudiantes
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ESTUDIANTES') AND type = 'U')
BEGIN
    CREATE TABLE ESTUDIANTES (
        Estudiante_ID INT IDENTITY(1,1) PRIMARY KEY,
        Carnet        NVARCHAR(20)  NOT NULL,
        Persona_ID    INT           NOT NULL,
        Usuario_ID    INT           NOT NULL,
        Grado_ID      INT           NOT NULL,
        Seccion_ID    INT           NOT NULL,
        FechaCreacion DATETIME2     NOT NULL DEFAULT GETDATE(),
        Activo        BIT           NOT NULL DEFAULT 1,

        CONSTRAINT FK_ESTUDIANTES_PERSONAS FOREIGN KEY (Persona_ID)
            REFERENCES PERSONAS (Persona_ID),
        CONSTRAINT FK_ESTUDIANTES_USUARIOS FOREIGN KEY (Usuario_ID)
            REFERENCES USUARIOS (Usuario_ID),
        CONSTRAINT FK_ESTUDIANTES_GRADOS FOREIGN KEY (Grado_ID)
            REFERENCES GRADOS (Grado_ID),
        CONSTRAINT FK_ESTUDIANTES_SECCIONES FOREIGN KEY (Seccion_ID)
            REFERENCES SECCIONES (Seccion_ID)
    );

    CREATE UNIQUE INDEX IX_ESTUDIANTES_Carnet ON ESTUDIANTES (Carnet);
    CREATE UNIQUE INDEX IX_ESTUDIANTES_Usuario ON ESTUDIANTES (Usuario_ID);
END
GO

-- -------------------------------------------------------------
-- PROFESORES — Datos específicos de docentes
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'PROFESORES') AND type = 'U')
BEGIN
    CREATE TABLE PROFESORES (
        Profesor_ID     INT IDENTITY(1,1) PRIMARY KEY,
        CodigoProfesor  NVARCHAR(20)  NOT NULL,
        MateriaPrincipal NVARCHAR(100) NULL,
        Persona_ID      INT           NOT NULL,
        Usuario_ID      INT           NOT NULL,
        FechaCreacion   DATETIME2     NOT NULL DEFAULT GETDATE(),
        Activo          BIT           NOT NULL DEFAULT 1,

        CONSTRAINT FK_PROFESORES_PERSONAS FOREIGN KEY (Persona_ID)
            REFERENCES PERSONAS (Persona_ID),
        CONSTRAINT FK_PROFESORES_USUARIOS FOREIGN KEY (Usuario_ID)
            REFERENCES USUARIOS (Usuario_ID)
    );

    CREATE UNIQUE INDEX IX_PROFESORES_Codigo ON PROFESORES (CodigoProfesor);
    CREATE UNIQUE INDEX IX_PROFESORES_Usuario ON PROFESORES (Usuario_ID);
END
GO

-- -------------------------------------------------------------
-- TOKENS_REGISTRO — Códigos de matrícula para auto-registro
-- -------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'TOKENS_REGISTRO') AND type = 'U')
BEGIN
    CREATE TABLE TOKENS_REGISTRO (
        Token_ID          INT IDENTITY(1,1) PRIMARY KEY,
        Codigo            NVARCHAR(20)  NOT NULL,
        Descripcion       NVARCHAR(100) NULL,
        MaximoUsos        INT           NOT NULL DEFAULT 40,
        UsosActuales      INT           NOT NULL DEFAULT 0,
        FechaExpiracion   DATETIME2     NOT NULL,
        Activo            BIT           NOT NULL DEFAULT 1,
        CreadoPor         INT           NULL,
        FechaCreacion     DATETIME2     NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_TOKENS_USUARIOS FOREIGN KEY (CreadoPor)
            REFERENCES USUARIOS (Usuario_ID)
    );

    CREATE UNIQUE INDEX IX_TOKENS_REGISTRO_Codigo ON TOKENS_REGISTRO (Codigo);
END
GO

PRINT 'Tablas creadas correctamente.';
GO
