using System.Security.Claims;
using API_LMS.Services;
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class AdminUsuariosEndpoints
{
    public static void MapAdminUsuariosEndpoints(this WebApplication app)
    {
        // ── Listar ──────────────────────────────────────────────

        app.MapGet("/api/admin/estudiantes", [Authorize(Roles = "Administrador")] async (
            string? busqueda, int? gradoId, int? seccionId, int? pagina, int? tamanioPagina, DbService db) =>
        {
            var parametros = new Dictionary<string, object?>();
            if (!string.IsNullOrWhiteSpace(busqueda)) parametros["@Busqueda"] = busqueda;
            if (gradoId.HasValue) parametros["@Grado_ID"] = gradoId;
            if (seccionId.HasValue) parametros["@Seccion_ID"] = seccionId;
            parametros["@Pagina"] = pagina ?? 1;
            parametros["@TamanioPagina"] = tamanioPagina ?? 10;

            var resultado = await db.EjecutarSpAsync("SP_ListarEstudiantesPaginado", parametros);
            return Results.Ok(resultado);
        })
        .WithName("ListarEstudiantesPaginado")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200);

        // ── Detalle, cursos y edición de estudiante ────────────

        app.MapGet("/api/admin/estudiantes/{id:int}", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var parametros = new Dictionary<string, object?> { ["@Estudiante_ID"] = id };
            var resultado = await db.EjecutarSpAsync("SP_ObtenerEstudiantePorId", parametros);
            if (resultado.Count == 0)
                return Results.NotFound(new { error = "Estudiante no encontrado." });
            return Results.Ok(resultado[0]);
        })
        .WithName("ObtenerEstudiantePorId")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(404);

        app.MapGet("/api/admin/estudiantes/{id:int}/cursos", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var parametros = new Dictionary<string, object?> { ["@Estudiante_ID"] = id };
            var resultado = await db.EjecutarSpAsync("SP_EstudianteCursosInscritos", parametros);
            return Results.Ok(resultado);
        })
        .WithName("EstudianteCursosInscritos")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200);

        app.MapPut("/api/admin/estudiantes/{id:int}", [Authorize(Roles = "Administrador")] async (
            int id, ActualizarEstudianteRequest request, DbService db) =>
        {
            var parametros = new Dictionary<string, object?>
            {
                ["@Estudiante_ID"] = id,
                ["@PrimerNombre"] = request.PrimerNombre,
                ["@SegundoNombre"] = request.SegundoNombre ?? (object)DBNull.Value,
                ["@PrimerApellido"] = request.PrimerApellido,
                ["@SegundoApellido"] = request.SegundoApellido ?? (object)DBNull.Value,
                ["@Correo"] = request.Correo,
                ["@Telefono"] = request.Telefono ?? (object)DBNull.Value,
                ["@Grado_ID"] = request.GradoId,
                ["@Seccion_ID"] = request.SeccionId,
                ["@Activo"] = request.Activo
            };
            var resultado = await db.EjecutarSpAsync("SP_ActualizarEstudianteAdmin", parametros);
            if (resultado.Count == 0)
                return Results.BadRequest(new { error = "Error al actualizar el estudiante." });
            return Results.Ok(new { message = resultado[0]["Mensaje"]?.ToString() });
        })
        .WithName("ActualizarEstudianteAdmin")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400);

        app.MapGet("/api/admin/profesores", [Authorize(Roles = "Administrador")] async (
            string? busqueda, int? pagina, int? tamanioPagina, DbService db) =>
        {
            var parametros = new Dictionary<string, object?>();
            if (!string.IsNullOrWhiteSpace(busqueda)) parametros["@Busqueda"] = busqueda;
            parametros["@Pagina"] = pagina ?? 1;
            parametros["@TamanioPagina"] = tamanioPagina ?? 10;

            var resultado = await db.EjecutarSpAsync("SP_ListarProfesoresPaginado", parametros);
            return Results.Ok(resultado);
        })
        .WithName("ListarProfesoresPaginado")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200);

        // ── Detalle, clases y edición de profesor ─────────────

        app.MapGet("/api/admin/profesores/{id:int}", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var parametros = new Dictionary<string, object?> { ["@Profesor_ID"] = id };
            var resultado = await db.EjecutarSpAsync("SP_ObtenerProfesorPorId", parametros);
            if (resultado.Count == 0)
                return Results.NotFound(new { error = "Profesor no encontrado." });
            return Results.Ok(resultado[0]);
        })
        .WithName("ObtenerProfesorPorId")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(404);

        app.MapGet("/api/admin/profesores/{id:int}/clases", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var parametros = new Dictionary<string, object?> { ["@Profesor_ID"] = id };
            var resultado = await db.EjecutarSpAsync("SP_ProfesorClasesAsignadas", parametros);
            return Results.Ok(resultado);
        })
        .WithName("ProfesorClasesAsignadas")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200);

        app.MapPut("/api/admin/profesores/{id:int}", [Authorize(Roles = "Administrador")] async (
            int id, ActualizarProfesorRequest request, DbService db) =>
        {
            var parametros = new Dictionary<string, object?>
            {
                ["@Profesor_ID"] = id,
                ["@PrimerNombre"] = request.PrimerNombre,
                ["@SegundoNombre"] = request.SegundoNombre ?? (object)DBNull.Value,
                ["@PrimerApellido"] = request.PrimerApellido,
                ["@SegundoApellido"] = request.SegundoApellido ?? (object)DBNull.Value,
                ["@Correo"] = request.Correo,
                ["@Telefono"] = request.Telefono ?? (object)DBNull.Value,
                ["@CodigoProfesor"] = request.CodigoProfesor ?? (object)DBNull.Value,
                ["@Activo"] = request.Activo
            };
            var resultado = await db.EjecutarSpAsync("SP_ActualizarProfesorAdmin", parametros);
            if (resultado.Count == 0)
                return Results.BadRequest(new { error = "Error al actualizar el profesor." });
            return Results.Ok(new { message = resultado[0]["Mensaje"]?.ToString() });
        })
        .WithName("ActualizarProfesorAdmin")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400);

        app.MapGet("/api/admin/administradores", [Authorize(Roles = "Administrador")] async (
            string? busqueda, DbService db) =>
        {
            var parametros = new Dictionary<string, object>();
            if (!string.IsNullOrWhiteSpace(busqueda)) parametros["@Busqueda"] = busqueda;

            var resultado = await db.EjecutarSpAsync("SP_ListarAdministradores",
                parametros.Count > 0 ? parametros : null);
            return Results.Ok(resultado);
        })
        .WithName("ListarAdministradores")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200);

        // ── Catálogos ───────────────────────────────────────────

        app.MapGet("/api/admin/grados", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var grados = await db.EjecutarSpAsync("SP_ObtenerGrados");
            return Results.Ok(grados);
        })
        .WithName("ObtenerGrados")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200);

        app.MapGet("/api/admin/secciones", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var secciones = await db.EjecutarSpAsync("SP_ObtenerSecciones");
            return Results.Ok(secciones);
        })
        .WithName("ObtenerSecciones")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200);

        // ── Crear ───────────────────────────────────────────────

        app.MapPost("/api/admin/estudiantes", [Authorize(Roles = "Administrador")] async (
            CrearEstudianteRequest request, DbService db, AuthService auth) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Contrasena))
                return Results.BadRequest(new { error = "Usuario y contraseña son requeridos." });

            if (string.IsNullOrWhiteSpace(request.PrimerNombre) || string.IsNullOrWhiteSpace(request.PrimerApellido))
                return Results.BadRequest(new { error = "Nombre y apellido son requeridos." });

            if (string.IsNullOrWhiteSpace(request.Correo))
                return Results.BadRequest(new { error = "El correo es requerido." });

            var hash = BCrypt.Net.BCrypt.HashPassword(request.Contrasena);
            var usuarioId = await db.RegistrarEstudianteAdminAsync(
                request.PrimerNombre, request.SegundoNombre ?? string.Empty,
                request.PrimerApellido, request.SegundoApellido ?? string.Empty,
                request.Correo, request.Telefono,
                request.Username, hash,
                request.GradoId, request.SeccionId);

            if (usuarioId == 0)
                return Results.BadRequest(new { error = "No se pudo crear el estudiante." });

            return Results.Ok(new { usuarioId, message = "Estudiante creado correctamente." });
        })
        .WithName("CrearEstudiante")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400);

        app.MapPost("/api/admin/profesores", [Authorize(Roles = "Administrador")] async (
            CrearProfesorRequest request, DbService db, AuthService auth) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Contrasena))
                return Results.BadRequest(new { error = "Usuario y contraseña son requeridos." });

            if (string.IsNullOrWhiteSpace(request.PrimerNombre) || string.IsNullOrWhiteSpace(request.PrimerApellido))
                return Results.BadRequest(new { error = "Nombre y apellido son requeridos." });

            if (string.IsNullOrWhiteSpace(request.Correo))
                return Results.BadRequest(new { error = "El correo es requerido." });

            var hash = BCrypt.Net.BCrypt.HashPassword(request.Contrasena);
            var usuarioId = await db.RegistrarProfesorAdminAsync(
                request.PrimerNombre, request.SegundoNombre ?? string.Empty,
                request.PrimerApellido, request.SegundoApellido ?? string.Empty,
                request.Correo, request.Telefono,
                request.Username, hash,
                request.CodigoProfesor);

            if (usuarioId == 0)
                return Results.BadRequest(new { error = "No se pudo crear el profesor." });

            return Results.Ok(new { usuarioId, message = "Profesor creado correctamente." });
        })
        .WithName("CrearProfesor")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400);

        app.MapPost("/api/admin/administradores", [Authorize(Roles = "Administrador")] async (
            CrearAdministradorRequest request, DbService db, AuthService auth) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Contrasena))
                return Results.BadRequest(new { error = "Usuario y contraseña son requeridos." });

            if (string.IsNullOrWhiteSpace(request.PrimerNombre) || string.IsNullOrWhiteSpace(request.PrimerApellido))
                return Results.BadRequest(new { error = "Nombre y apellido son requeridos." });

            if (string.IsNullOrWhiteSpace(request.Correo))
                return Results.BadRequest(new { error = "El correo es requerido." });

            var hash = BCrypt.Net.BCrypt.HashPassword(request.Contrasena);
            var usuarioId = await db.RegistrarAdministradorAsync(
                request.PrimerNombre, request.SegundoNombre ?? string.Empty,
                request.PrimerApellido, request.SegundoApellido ?? string.Empty,
                request.Correo, request.Telefono,
                request.Username, hash);

            if (usuarioId == 0)
                return Results.BadRequest(new { error = "No se pudo crear el administrador." });

            return Results.Ok(new { usuarioId, message = "Administrador creado correctamente." });
        })
        .WithName("CrearAdministrador")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400);

        // ── Cambiar contraseña ───────────────────────────────────

        app.MapPost("/api/admin/cambiar-contrasena", [Authorize(Roles = "Administrador")] async (
            AdminCambiarContrasenaRequest request, DbService db) =>
        {
            if (request.UsuarioId <= 0)
                return Results.BadRequest(new { error = "ID de usuario inválido." });

            if (string.IsNullOrWhiteSpace(request.NuevaContrasena))
                return Results.BadRequest(new { error = "La nueva contraseña es requerida." });

            if (request.NuevaContrasena.Length < 6)
                return Results.BadRequest(new { error = "La contraseña debe tener al menos 6 caracteres." });

            var hash = BCrypt.Net.BCrypt.HashPassword(request.NuevaContrasena);
            var exito = await db.AdminCambiarContrasenaAsync(request.UsuarioId, hash);

            if (!exito)
                return Results.NotFound(new { error = "Usuario no encontrado." });

            return Results.Ok(new { message = "Contraseña actualizada correctamente." });
        })
        .WithName("AdminCambiarContrasena")
        .WithTags("Admin")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400)
        .Produces(404);
    }
}

// ── Request DTOs ────────────────────────────────────────────

public class CrearEstudianteRequest
{
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string? SegundoApellido { get; set; }
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public int GradoId { get; set; }
    public int SeccionId { get; set; }
}

public class CrearProfesorRequest
{
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string? SegundoApellido { get; set; }
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public string? CodigoProfesor { get; set; }
}

public class CrearAdministradorRequest
{
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string? SegundoApellido { get; set; }
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
}

public class AdminCambiarContrasenaRequest
{
    public int UsuarioId { get; set; }
    public string NuevaContrasena { get; set; } = string.Empty;
}

public class ActualizarEstudianteRequest
{
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string? SegundoApellido { get; set; }
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public int GradoId { get; set; }
    public int SeccionId { get; set; }
    public bool Activo { get; set; }
}

public class ActualizarProfesorRequest
{
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string? SegundoApellido { get; set; }
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? CodigoProfesor { get; set; }
    public bool Activo { get; set; }
}
