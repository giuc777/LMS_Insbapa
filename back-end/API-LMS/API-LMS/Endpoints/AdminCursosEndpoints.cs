using API_LMS.Services;
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class AdminCursosEndpoints
{
    public static void MapAdminCursosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/cursos")
            .RequireAuthorization()
            .WithTags("Admin");

        group.MapGet("/", [Authorize(Roles = "Administrador")] async (
            string? busqueda, int? gradoId, int? seccionId, DbService db) =>
        {
            var param = new Dictionary<string, object?>();
            if (!string.IsNullOrEmpty(busqueda)) param["@Busqueda"] = busqueda;
            if (gradoId.HasValue) param["@Grado_ID"] = gradoId;
            if (seccionId.HasValue) param["@Seccion_ID"] = seccionId;
            var result = await db.EjecutarSpAsync("SP_ListarCursosAdmin",
                param.Count > 0 ? param! : null);
            return Results.Ok(result);
        })
        .WithName("ListarCursosAdmin")
        .Produces(200);

        group.MapGet("/catalogo", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ObtenerCursosCatalogo");
            return Results.Ok(result);
        })
        .WithName("ObtenerCursosCatalogo")
        .Produces(200);

        group.MapGet("/profesores-catalogo", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ObtenerProfesoresCatalogo");
            return Results.Ok(result);
        })
        .WithName("ObtenerProfesoresCatalogo")
        .Produces(200);

        group.MapPost("/", [Authorize(Roles = "Administrador")] async (
            CrearCursoAsignacionRequest request, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Curso_ID"] = request.CursoId,
                ["@Grado_ID"] = request.GradoId,
                ["@Seccion_ID"] = request.SeccionId,
                ["@Profesor_ID"] = request.ProfesorId
            };
            var result = await db.EjecutarSpAsync("SP_CrearCursoAsignacion", param);
            if (result.Count == 0) return Results.BadRequest(new { error = "Error al crear curso" });
            var first = result[0];
            if (Convert.ToInt32(first["Asignacion_ID"]) == 0)
                return Results.BadRequest(new { error = first["Mensaje"]?.ToString() });
            return Results.Ok(new { asignacionId = first["Asignacion_ID"], message = first["Mensaje"]?.ToString() });
        })
        .WithName("CrearCursoAsignacion")
        .Produces(200)
        .Produces(400);

        group.MapPut("/{id}", [Authorize(Roles = "Administrador")] async (
            int id, CrearCursoAsignacionRequest request, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Asignacion_ID"] = id,
                ["@Curso_ID"] = request.CursoId,
                ["@Grado_ID"] = request.GradoId,
                ["@Seccion_ID"] = request.SeccionId,
                ["@Profesor_ID"] = request.ProfesorId
            };
            var result = await db.EjecutarSpAsync("SP_ActualizarCursoAsignacion", param);
            if (result.Count == 0) return Results.BadRequest(new { error = "Error al actualizar" });
            var first = result[0];
            if (Convert.ToInt32(first["Resultado"]) == 0)
                return Results.BadRequest(new { error = first["Mensaje"]?.ToString() });
            return Results.Ok(new { message = first["Mensaje"]?.ToString() });
        })
        .WithName("ActualizarCursoAsignacion")
        .Produces(200)
        .Produces(400);

        group.MapDelete("/{id}", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var param = new Dictionary<string, object?> { ["@Asignacion_ID"] = id };
            var result = await db.EjecutarSpAsync("SP_EliminarCursoAsignacion", param);
            return Results.Ok(new { message = "Curso eliminado" });
        })
        .WithName("EliminarCursoAsignacion")
        .Produces(200);
    }
}

public record CrearCursoAsignacionRequest(
    int CursoId, int GradoId, int SeccionId, int ProfesorId
);
