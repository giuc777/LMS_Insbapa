using System.Security.Claims;
using API_LMS.Services;

namespace API_LMS.Middleware;

public class TokenBlacklistMiddleware
{
    private readonly RequestDelegate _next;

    public TokenBlacklistMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, DbService db)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var jti = context.User.FindFirstValue(ClaimTypes.NameIdentifier) is not null
                ? context.User.FindFirst("jti")?.Value
                : null;

            if (!string.IsNullOrEmpty(jti))
            {
                var result = await db.EjecutarSpAsync("SP_TokenBlacklist_Existe",
                    new Dictionary<string, object> { { "@JTI", jti } });

                var total = result.FirstOrDefault()?["Total"];
                if (total is int count && count > 0)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { error = "Sesión revocada." });
                    return;
                }
            }
        }

        await _next(context);
    }
}
