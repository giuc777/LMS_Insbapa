using System.Security.Claims;
using API_LMS.Models;
using API_LMS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace API_LMS.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", [EnableRateLimiting("login")] async (
            LoginRequest request,
            DbService db,
            AuthService auth) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { error = "Usuario y contraseña son requeridos." });
            }

            var hash = await db.GetPasswordHashAsync(request.Username);
            var usuario = await db.LoginAsync(request.Username);
            if (usuario == null || !usuario.Activo)
            {
                return Results.Json(new { error = "Credenciales inválidas." }, statusCode: 401);
            }

            if (hash == null || !auth.VerifyPassword(request.Password, hash))
            {
                return Results.Json(new { error = "Credenciales inválidas." }, statusCode: 401);
            }

            var token = auth.GenerateToken(usuario.UsuarioId, usuario.Username, usuario.Rol);

            return Results.Ok(new LoginResponse
            {
                Token = token,
                Usuario = usuario
            });
        })
        .WithName("Login")
        .WithTags("Auth")
        .Produces<LoginResponse>()
        .Produces(401);

        app.MapGet("/api/auth/perfil", [Authorize] async (
            ClaimsPrincipal user,
            DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var usuario = await db.GetUsuarioPorIdAsync(usuarioId);

            if (usuario == null)
            {
                return Results.NotFound(new { error = "Usuario no encontrado." });
            }

            return Results.Ok(usuario);
        })
        .WithName("ObtenerPerfil")
        .WithTags("Auth")
        .RequireAuthorization()
        .Produces<UsuarioDto>()
        .Produces(404);

        // ── Logout: agregar JTI a blacklist ─────────────────────

        app.MapPost("/api/auth/logout", [Authorize] async (
            ClaimsPrincipal user,
            DbService db) =>
        {
            var jti = user.FindFirst("jti")?.Value;
            var usuarioId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var expClaim = user.FindFirst("exp")?.Value;

            if (string.IsNullOrEmpty(jti))
                return Results.BadRequest(new { error = "Token inválido." });

            DateTime fechaExpiracion = DateTime.UtcNow;
            if (long.TryParse(expClaim, out var expUnix))
            {
                fechaExpiracion = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
            }

            await db.BlacklistTokenAsync(jti, usuarioId, fechaExpiracion, "logout");

            return Results.Ok(new { message = "Sesión cerrada correctamente." });
        })
        .WithName("Logout")
        .WithTags("Auth")
        .RequireAuthorization()
        .Produces(200)
        .Produces(400);
    }
}
