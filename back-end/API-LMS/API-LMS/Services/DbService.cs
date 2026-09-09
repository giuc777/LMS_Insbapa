using Microsoft.Data.SqlClient;
using API_LMS.Models;

namespace API_LMS.Services;

public class DbService
{
    private readonly string _connectionString;

    public DbService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("INSBAPA")
            ?? throw new InvalidOperationException("Connection string 'INSBAPA' not found.");
    }

    private SqlConnection CreateConnection() => new(_connectionString);

    public async Task<UsuarioDto?> LoginAsync(string username)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_Login", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@Username", username);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new UsuarioDto
            {
                UsuarioId = reader.GetInt32(reader.GetOrdinal("Usuario_ID")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                Iniciales = reader.GetString(reader.GetOrdinal("Iniciales")),
                Activo = reader.GetBoolean(reader.GetOrdinal("Activo")),
                Rol = reader.GetString(reader.GetOrdinal("Rol")),
                PrimerNombre = reader.GetString(reader.GetOrdinal("PrimerNombre")),
                SegundoNombre = reader.IsDBNull(reader.GetOrdinal("SegundoNombre"))
                    ? string.Empty
                    : reader.GetString(reader.GetOrdinal("SegundoNombre")),
                PrimerApellido = reader.GetString(reader.GetOrdinal("PrimerApellido")),
                SegundoApellido = reader.IsDBNull(reader.GetOrdinal("SegundoApellido"))
                    ? string.Empty
                    : reader.GetString(reader.GetOrdinal("SegundoApellido")),
                Correo = reader.GetString(reader.GetOrdinal("Correo"))
            };
        }

        return null;
    }

    public async Task<string?> GetPasswordHashAsync(string username)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_Login", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@Username", username);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return reader.GetString(reader.GetOrdinal("Contrasena"));
        }

        return null;
    }

    public async Task<UsuarioDto?> GetUsuarioPorIdAsync(int usuarioId)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_ObtenerUsuarioPorId", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@Usuario_ID", usuarioId);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var usuario = new UsuarioDto
            {
                UsuarioId = reader.GetInt32(reader.GetOrdinal("Usuario_ID")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                Iniciales = reader.GetString(reader.GetOrdinal("Iniciales")),
                Activo = reader.GetBoolean(reader.GetOrdinal("Activo")),
                Rol = reader.GetString(reader.GetOrdinal("Rol")),
                PrimerNombre = reader.GetString(reader.GetOrdinal("PrimerNombre")),
                SegundoNombre = reader.IsDBNull(reader.GetOrdinal("SegundoNombre"))
                    ? string.Empty
                    : reader.GetString(reader.GetOrdinal("SegundoNombre")),
                PrimerApellido = reader.GetString(reader.GetOrdinal("PrimerApellido")),
                SegundoApellido = reader.IsDBNull(reader.GetOrdinal("SegundoApellido"))
                    ? string.Empty
                    : reader.GetString(reader.GetOrdinal("SegundoApellido")),
                Correo = reader.GetString(reader.GetOrdinal("Correo")),
                Telefono = reader.IsDBNull(reader.GetOrdinal("Telefono"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("Telefono")),
                FechaNacimiento = reader.IsDBNull(reader.GetOrdinal("FechaNacimiento"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("FechaNacimiento")).ToString("yyyy-MM-dd")
            };

            // Estudiante
            if (!reader.IsDBNull(reader.GetOrdinal("Estudiante_ID")))
            {
                usuario.EstudianteId = reader.GetInt32(reader.GetOrdinal("Estudiante_ID"));
                usuario.Carnet = reader.GetString(reader.GetOrdinal("Carnet"));
                usuario.GradoId = reader.GetInt32(reader.GetOrdinal("Grado_ID"));
                usuario.Grado = reader.GetString(reader.GetOrdinal("Grado"));
                usuario.SeccionId = reader.GetInt32(reader.GetOrdinal("Seccion_ID"));
                usuario.Seccion = reader.GetString(reader.GetOrdinal("Seccion"));
            }

            // Profesor
            if (!reader.IsDBNull(reader.GetOrdinal("Profesor_ID")))
            {
                usuario.ProfesorId = reader.GetInt32(reader.GetOrdinal("Profesor_ID"));
                usuario.CodigoProfesor = reader.GetString(reader.GetOrdinal("CodigoProfesor"));
            }

            return usuario;
        }

        return null;
    }

    public async Task<string?> GetPasswordHashByIdAsync(int usuarioId)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand(
            "SELECT Contrasena FROM USUARIOS WHERE Usuario_ID = @Usuario_ID AND Activo = 1", connection);
        command.Parameters.AddWithValue("@Usuario_ID", usuarioId);

        var result = await command.ExecuteScalarAsync();
        return result as string;
    }

    public async Task ActualizarPerfilAsync(
        int usuarioId,
        string primerNombre,
        string segundoNombre,
        string primerApellido,
        string segundoApellido,
        string correo,
        string? telefono,
        DateTime? fechaNacimiento)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_ActualizarPerfil", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@Usuario_ID", usuarioId);
        command.Parameters.AddWithValue("@PrimerNombre", primerNombre);
        command.Parameters.AddWithValue("@SegundoNombre", (object?)segundoNombre ?? DBNull.Value);
        command.Parameters.AddWithValue("@PrimerApellido", primerApellido);
        command.Parameters.AddWithValue("@SegundoApellido", (object?)segundoApellido ?? DBNull.Value);
        command.Parameters.AddWithValue("@Correo", correo);
        command.Parameters.AddWithValue("@Telefono", (object?)telefono ?? DBNull.Value);
        command.Parameters.AddWithValue("@FechaNacimiento", (object?)fechaNacimiento ?? DBNull.Value);

        await command.ExecuteNonQueryAsync();
    }

    public async Task CambiarContrasenaAsync(int usuarioId, string nuevaContrasenaHash)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_CambiarContrasena", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@Usuario_ID", usuarioId);
        command.Parameters.AddWithValue("@NuevaContrasena", nuevaContrasenaHash);

        await command.ExecuteNonQueryAsync();
    }

    public async Task<List<Dictionary<string, object?>>> EjecutarSpAsync(string spName, Dictionary<string, object>? parameters = null)
    {
        var results = new List<Dictionary<string, object?>>();
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand(spName, connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };

        if (parameters != null)
        {
            foreach (var param in parameters)
            {
                command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
            }
        }

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object?>();
            for (int i = 0; i < reader.FieldCount; i++)
            {
                row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            }
            results.Add(row);
        }

        return results;
    }

    public async Task<int> RegistrarEstudianteAdminAsync(
        string primerNombre, string segundoNombre,
        string primerApellido, string segundoApellido,
        string correo, string? telefono,
        string username, string contrasenaHash,
        int gradoId, int seccionId)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_RegistrarEstudianteAdmin", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@PrimerNombre", primerNombre);
        command.Parameters.AddWithValue("@SegundoNombre", (object?)segundoNombre ?? DBNull.Value);
        command.Parameters.AddWithValue("@PrimerApellido", primerApellido);
        command.Parameters.AddWithValue("@SegundoApellido", (object?)segundoApellido ?? DBNull.Value);
        command.Parameters.AddWithValue("@Correo", correo);
        command.Parameters.AddWithValue("@Telefono", (object?)telefono ?? DBNull.Value);
        command.Parameters.AddWithValue("@Username", username);
        command.Parameters.AddWithValue("@ContrasenaHash", contrasenaHash);
        command.Parameters.AddWithValue("@Grado_ID", gradoId);
        command.Parameters.AddWithValue("@Seccion_ID", seccionId);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return reader.GetInt32(reader.GetOrdinal("Usuario_ID"));
        }
        return 0;
    }

    public async Task<int> RegistrarProfesorAdminAsync(
        string primerNombre, string segundoNombre,
        string primerApellido, string segundoApellido,
        string correo, string? telefono,
        string username, string contrasenaHash,
        string? codigoProfesor)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_RegistrarProfesor", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@PrimerNombre", primerNombre);
        command.Parameters.AddWithValue("@SegundoNombre", (object?)segundoNombre ?? DBNull.Value);
        command.Parameters.AddWithValue("@PrimerApellido", primerApellido);
        command.Parameters.AddWithValue("@SegundoApellido", (object?)segundoApellido ?? DBNull.Value);
        command.Parameters.AddWithValue("@Correo", correo);
        command.Parameters.AddWithValue("@Telefono", (object?)telefono ?? DBNull.Value);
        command.Parameters.AddWithValue("@Username", username);
        command.Parameters.AddWithValue("@ContrasenaHash", contrasenaHash);
        command.Parameters.AddWithValue("@CodigoProfesor", (object?)codigoProfesor ?? DBNull.Value);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return reader.GetInt32(reader.GetOrdinal("Usuario_ID"));
        }
        return 0;
    }

    public async Task<int> RegistrarAdministradorAsync(
        string primerNombre, string segundoNombre,
        string primerApellido, string segundoApellido,
        string correo, string? telefono,
        string username, string contrasenaHash)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_RegistrarAdministrador", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@PrimerNombre", primerNombre);
        command.Parameters.AddWithValue("@SegundoNombre", (object?)segundoNombre ?? DBNull.Value);
        command.Parameters.AddWithValue("@PrimerApellido", primerApellido);
        command.Parameters.AddWithValue("@SegundoApellido", (object?)segundoApellido ?? DBNull.Value);
        command.Parameters.AddWithValue("@Correo", correo);
        command.Parameters.AddWithValue("@Telefono", (object?)telefono ?? DBNull.Value);
        command.Parameters.AddWithValue("@Username", username);
        command.Parameters.AddWithValue("@ContrasenaHash", contrasenaHash);

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return reader.GetInt32(reader.GetOrdinal("Usuario_ID"));
        }
        return 0;
    }

    public async Task<bool> AdminCambiarContrasenaAsync(int usuarioId, string nuevaContrasenaHash)
    {
        using var connection = CreateConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("SP_AdminCambiarContrasena", connection)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        command.Parameters.AddWithValue("@Usuario_ID", usuarioId);
        command.Parameters.AddWithValue("@NuevaContrasena", nuevaContrasenaHash);

        using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync();
    }
}
