using System.Security.Claims;
using API_LMS.Models;
using API_LMS.Services;
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class PerfilEndpoints
{
    public static void MapPerfilEndpoints(this WebApplication app)
    {
        app.MapPut("/api/auth/perfil", [Authorize] async (
            ClaimsPrincipal user,
            ActualizarPerfilRequest request,
            DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

            await db.ActualizarPerfilAsync(
                usuarioId,
                request.PrimerNombre,
                request.SegundoNombre ?? string.Empty,
                request.PrimerApellido,
                request.SegundoApellido ?? string.Empty,
                request.Correo,
                request.Telefono,
                request.FechaNacimiento);

            var usuario = await db.GetUsuarioPorIdAsync(usuarioId);
            return Results.Ok(usuario);
        })
        .WithName("ActualizarPerfil")
        .WithTags("Perfil")
        .RequireAuthorization()
        .Produces<UsuarioDto>()
        .Produces(400);

        app.MapPost("/api/auth/cambiar-contrasena", [Authorize] async (
            ClaimsPrincipal user,
            CambiarContrasenaRequest request,
            DbService db,
            AuthService auth) =>
        {
            var usuarioId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (string.IsNullOrWhiteSpace(request.ContrasenaActual) || string.IsNullOrWhiteSpace(request.NuevaContrasena))
            {
                return Results.BadRequest(new { error = "Contraseña actual y nueva contraseña son requeridas." });
            }

            if (request.NuevaContrasena.Length < 6)
            {
                return Results.BadRequest(new { error = "La nueva contraseña debe tener al menos 6 caracteres." });
            }

            var hashActual = await db.GetPasswordHashByIdAsync(usuarioId);
            if (hashActual == null)
            {
                return Results.NotFound(new { error = "Usuario no encontrado." });
            }

            if (!auth.VerifyPassword(request.ContrasenaActual, hashActual))
            {
                return Results.BadRequest(new { error = "La contraseña actual es incorrecta." });
            }

            var nuevoHash = BCrypt.Net.BCrypt.HashPassword(request.NuevaContrasena);
            await db.CambiarContrasenaAsync(usuarioId, nuevoHash);

            return Results.Ok(new { message = "Contraseña actualizada correctamente." });
        })
        .WithName("CambiarContrasena")
        .WithTags("Perfil")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400)
        .Produces(404);
    }
}

public class ActualizarPerfilRequest
{
    public string PrimerNombre { get; set; } = string.Empty;
    public string? SegundoNombre { get; set; }
    public string PrimerApellido { get; set; } = string.Empty;
    public string? SegundoApellido { get; set; }
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public DateTime? FechaNacimiento { get; set; }
}

public class CambiarContrasenaRequest
{
    public string ContrasenaActual { get; set; } = string.Empty;
    public string NuevaContrasena { get; set; } = string.Empty;
}
