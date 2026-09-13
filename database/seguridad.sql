/* ============================================================
   INSBAPA — Seguridad: Blacklist de JWT
   Motor: SQL Server
   Descripcion: Tabla y SPs para invalidar tokens JWT antes
                de su expiracion (logout server-side).
   Ejecutar: sqlcmd -S .\SQLEXPRESS -E -i database\seguridad.sql
   ============================================================ */

USE INSBAPA;
GO

-- =============================================================
-- 1. TABLA TOKEN_BLACKLIST
-- =============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'TOKEN_BLACKLIST') AND type = 'U')
BEGIN
    CREATE TABLE TOKEN_BLACKLIST (
        JTI              NVARCHAR(50)  NOT NULL PRIMARY KEY,
        Usuario_ID       INT           NOT NULL,
        FechaExpiracion  DATETIME2     NOT NULL,
        FechaRevocacion  DATETIME2     NOT NULL DEFAULT GETDATE(),
        Motivo           NVARCHAR(200) NULL,

        CONSTRAINT FK_BLACKLIST_USUARIOS FOREIGN KEY (Usuario_ID)
            REFERENCES USUARIOS (Usuario_ID)
    );

    CREATE INDEX IX_TOKEN_BLACKLIST_Expiracion ON TOKEN_BLACKLIST (FechaExpiracion);
    PRINT 'Tabla TOKEN_BLACKLIST creada.';
END
ELSE
    PRINT 'Tabla TOKEN_BLACKLIST ya existe.';
GO

-- =============================================================
-- 2. SP: Insertar token en blacklist
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_TokenBlacklist_Insertar')
    DROP PROCEDURE SP_TokenBlacklist_Insertar;
GO

CREATE PROCEDURE SP_TokenBlacklist_Insertar
    @JTI             NVARCHAR(50),
    @Usuario_ID      INT,
    @FechaExpiracion DATETIME2,
    @Motivo          NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Ignorar si ya existe (doble logout, etc.)
    IF NOT EXISTS (SELECT 1 FROM TOKEN_BLACKLIST WHERE JTI = @JTI)
    BEGIN
        INSERT INTO TOKEN_BLACKLIST (JTI, Usuario_ID, FechaExpiracion, Motivo)
        VALUES (@JTI, @Usuario_ID, @FechaExpiracion, @Motivo);
    END

    SELECT 0 AS Resultado;
END
GO

-- =============================================================
-- 3. SP: Verificar si un token esta en blacklist
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_TokenBlacklist_Existe')
    DROP PROCEDURE SP_TokenBlacklist_Existe;
GO

CREATE PROCEDURE SP_TokenBlacklist_Existe
    @JTI NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(1) AS Total
    FROM TOKEN_BLACKLIST
    WHERE JTI = @JTI
      AND FechaExpiracion > GETDATE();
END
GO

-- =============================================================
-- 4. SP: Limpiar tokens expirados de la blacklist
-- (Ejecutar periodicamente via job o task programada)
-- =============================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'SP_TokenBlacklist_Limpiar')
    DROP PROCEDURE SP_TokenBlacklist_Limpiar;
GO

CREATE PROCEDURE SP_TokenBlacklist_Limpiar
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM TOKEN_BLACKLIST
    WHERE FechaExpiracion < GETDATE();

    SELECT @@ROWCOUNT AS Eliminados;
END
GO

PRINT 'SPs de seguridad creados correctamente.';
GO
