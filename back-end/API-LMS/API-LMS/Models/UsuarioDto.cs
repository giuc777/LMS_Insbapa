namespace API_LMS.Models;

public class UsuarioDto
{
    public int UsuarioId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Iniciales { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public string PrimerNombre { get; set; } = string.Empty;
    public string SegundoNombre { get; set; } = string.Empty;
    public string PrimerApellido { get; set; } = string.Empty;
    public string SegundoApellido { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? FechaNacimiento { get; set; }
    public bool Activo { get; set; }

    // Estudiante
    public int? EstudianteId { get; set; }
    public string? Carnet { get; set; }
    public int? GradoId { get; set; }
    public string? Grado { get; set; }
    public int? SeccionId { get; set; }
    public string? Seccion { get; set; }

    // Profesor
    public int? ProfesorId { get; set; }
    public string? CodigoProfesor { get; set; }
}
