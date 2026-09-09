/* ============================================================
   INSBAPA — Actualización de contraseñas demo
   Reemplaza PLACEHOLDER_HASH con hashes BCrypt reales.
   Ejecutar después de 03-seed-data.sql.
   ============================================================ */

USE INSBAPA;
GO

-- =============================================================
-- Verificar que existan los usuarios
-- =============================================================
IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE Username = 'admin')
BEGIN
    PRINT 'ERROR: Ejecutar primero 03-seed-data.sql';
    RETURN;
END
GO

-- =============================================================
-- ADMIN — contraseña: admin123
-- =============================================================
UPDATE USUARIOS
SET Contrasena = N'$2b$10$5fIfWHeAqKW4MmGjmdTxFOg.4YwDUoqpzZD5NonB.1ogysWq9uOea',
    FechaModificacion = GETDATE()
WHERE Username = N'admin'
  AND Contrasena = N'PLACEHOLDER_HASH';

IF @@ROWCOUNT > 0
    PRINT 'Admin actualizado (admin / admin123)';
ELSE
    PRINT 'Admin: sin cambios (ya tiene hash válido o no existe)';
GO

-- =============================================================
-- PROFESOR — contraseña: profesor123
-- =============================================================
UPDATE USUARIOS
SET Contrasena = N'$2b$10$ruiteH12PXl4VkSJICFFdeE8wmDou4eb67Zn67RzLdQpjSEcVnhGe',
    FechaModificacion = GETDATE()
WHERE Username = N'profesor'
  AND Contrasena = N'PLACEHOLDER_HASH';

IF @@ROWCOUNT > 0
    PRINT 'Profesor actualizado (profesor / profesor123)';
ELSE
    PRINT 'Profesor: sin cambios (ya tiene hash válido o no existe)';
GO

-- =============================================================
-- ESTUDIANTE — contraseña: estudiante123
-- =============================================================
UPDATE USUARIOS
SET Contrasena = N'$2b$10$YLzNgzHD1ZLSx1qH0i48He2H2Z9/xRWkOiqwL.zsXPOnR9ddf1WRm',
    FechaModificacion = GETDATE()
WHERE Username = N'estudiante'
  AND Contrasena = N'PLACEHOLDER_HASH';

IF @@ROWCOUNT > 0
    PRINT 'Estudiante actualizado (estudiante / estudiante123)';
ELSE
    PRINT 'Estudiante: sin cambios (ya tiene hash válido o no existe)';
GO

PRINT '========================================';
PRINT 'Contraseñas demo actualizadas correctamente.';
PRINT '  admin      / admin123';
PRINT '  profesor   / profesor123';
PRINT '  estudiante / estudiante123';
PRINT '========================================';
GO
