using System.Security.Claims;
using API_LMS.Services;
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this WebApplication app)
    {
        app.MapGet("/api/dashboard", [Authorize] async (
            ClaimsPrincipal user,
            DbService db) =>
        {
            var rol = user.FindFirstValue(ClaimTypes.Role);
            var usuarioId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return rol switch
            {
                "Administrador" => await GetDashboardAdmin(db),
                "Profesor" => await GetDashboardProfesor(db, usuarioId),
                "Estudiante" => await GetDashboardEstudiante(db, usuarioId),
                _ => Results.Json(new { error = "Rol no reconocido." }, statusCode: 403)
            };
        })
        .WithName("GetDashboard")
        .WithTags("Dashboard")
        .RequireAuthorization()
        .Produces(200)
        .Produces(403);
    }

    private static async Task<IResult> GetDashboardAdmin(DbService db)
    {
        var metricas = await db.EjecutarSpAsync("SP_ObtenerMetricasAdmin");
        var metrica = metricas.FirstOrDefault();

        return Results.Ok(new
        {
            metricas = new
            {
                totalEstudiantes = metrica?["TotalEstudiantes"] ?? 0,
                totalProfesores = metrica?["TotalProfesores"] ?? 0,
                cursosActivos = metrica?["CursosActivos"] ?? 0
            }
        });
    }

    private static async Task<IResult> GetDashboardProfesor(DbService db, int usuarioId)
    {
        var parametros = new Dictionary<string, object> { { "@Usuario_ID", usuarioId } };
        var clases = await db.EjecutarSpAsync("SP_ListarCursosPorProfesor", parametros);
        var resumen = await db.EjecutarSpAsync("SP_ObtenerResumenProfesor", parametros);
        var resumenData = resumen.FirstOrDefault();

        return Results.Ok(new
        {
            clases,
            resumen = new
            {
                tareasPorCalificar = resumenData?["TareasPorCalificar"] ?? 0,
                examenesActivos = resumenData?["ExamenesActivos"] ?? 0,
                totalEstudiantes = resumenData?["TotalEstudiantes"] ?? 0
            }
        });
    }

    private static async Task<IResult> GetDashboardEstudiante(DbService db, int usuarioId)
    {
        var parametros = new Dictionary<string, object> { { "@Usuario_ID", usuarioId } };
        var cursos = await db.EjecutarSpAsync("SP_ObtenerCursosEstudiante", parametros);
        var resumen = await db.EjecutarSpAsync("SP_ObtenerResumenEstudiante", parametros);
        var resumenData = resumen.FirstOrDefault();

        return Results.Ok(new
        {
            cursos,
            resumen = new
            {
                tareasPendientes = resumenData?["TareasPendientes"] ?? 0,
                examenesProximos = resumenData?["ExamenesProximos"] ?? 0,
                promedioGeneral = resumenData?["PromedioGeneral"] ?? 0
            }
        });
    }
}
