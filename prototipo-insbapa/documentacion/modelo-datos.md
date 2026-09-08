# Modelo de Datos — INSBAPA (LMS Secundaria)

Documento del modelo reducido de base de datos para la plataforma educativa INSBAPA,
basado en las estructuras de datos del prototipo (`js/data.js`).

---

## 1. Modelo conceptual

Entidades esenciales del prototipo (modelo reducido):

```
PERSONAS  ──►  USUARIOS  ────►  ESTUDIANTES  (carnet)
   │              │            PROFESORES   (materia principal)
   │              └──► ADMINISTRADOR (rol)
   ▼
CATALOGOS          CURSOS ──► CLASES ──► MATRICULAS
                      ▲          │            │
                 PROFESORES      │            ▼
                                 ├──► TAREAS ──► ENTREGAS
                                 ├──► EXAMENES ─► PREGUNTAS
                                 ├──► NOTAS
                                 ├──► MATERIALES
   ANUNCIOS  (independiente, autor = usuario)
   MANTENIMIENTO  (independiente, administrado por admin)
   BLOQUES  (catálogo de periodos del ciclo)
```

---

## 2. Tablas (17)

### PERSONAS — Datos personales comunes
| Campo | Tipo | Descripción |
|---|---|---|
| Persona_ID | INT PK | Identificador |
| Nombre | NVARCHAR | Nombre completo (ej. `Ana López`) |
| Correo | NVARCHAR | Correo institucional |
| Telefono | NVARCHAR | Teléfono de contacto |
| FechaNacimiento | DATE | Fecha de nacimiento |

### USUARIOS — Autenticación y roles
| Campo | Tipo | Descripción |
|---|---|---|
| Usuario | NVARCHAR PK | Nombre de usuario (ej. `admin`) |
| Contrasena | NVARCHAR | Contraseña (hash en producción) |
| Rol | NVARCHAR | `Estudiante`, `Profesor`, `Administrador` |
| Iniciales | NVARCHAR | Iniciales para el avatar |
| Activo | BIT | Estado de la cuenta |
| FechaRegistro | DATETIME | Alta del usuario |
| Persona_ID | INT FK | Datos personales en PERSONAS |

### CATALOGOS — Valores predefinidos
| Campo | Tipo | Descripción |
|---|---|---|
| Tipo | NVARCHAR | `Grado`, `Seccion`, `EstadoTarea`, `CategoriaAnuncio`, `TipoMantenimiento` |
| Nombre | NVARCHAR | Valor (ej. `Primero Básico`, `A`, `Pendiente`) |

### ESTUDIANTES — Datos específicos de estudiantes
| Campo | Tipo | Descripción |
|---|---|---|
| Estudiante_ID | INT PK | Identificador |
| Carnet | NVARCHAR UNIQUE | Carnet institucional (ej. `20260001`) |
| Persona_ID | INT FK | Datos personales en PERSONAS |
| Usuario | NVARCHAR FK | Cuenta en USUARIOS |

### PROFESORES — Datos específicos de docentes
| Campo | Tipo | Descripción |
|---|---|---|
| Profesor_ID | INT PK | Identificador |
| MateriaPrincipal | NVARCHAR | Materia principal |
| Persona_ID | INT FK | Datos personales en PERSONAS |
| Usuario | NVARCHAR FK | Cuenta en USUARIOS |

### CURSOS — Materias académicas
| Campo | Tipo | Descripción |
|---|---|---|
| Curso_ID | INT PK | Identificador |
| Codigo | NVARCHAR | Código corto (ej. `LENGUA`, `CALCULO`) |
| Nombre | NVARCHAR | Nombre de la materia (ej. `Matemáticas I`) |

### CLASES — Curso en un grado/sección con profesor
| Campo | Tipo | Descripción |
|---|---|---|
| Clase_ID | INT PK | Identificador |
| Curso_ID | INT FK | Materia |
| Grado | NVARCHAR | Del catálogo (ej. `Primero Básico`) |
| Seccion | NVARCHAR | Del catálogo (ej. `A`) |
| Profesor_ID | INT FK | Docente a cargo |

### MATRICULAS — Estudiante inscrito en una clase
| Campo | Tipo | Descripción |
|---|---|---|
| Matricula_ID | INT PK | Identificador |
| Estudiante_ID | INT FK | Estudiante |
| Clase_ID | INT FK | Clase |
| Activo | BIT | Matrícula vigente |

### BLOQUES — Periodos del ciclo
| Campo | Tipo | Descripción |
|---|---|---|
| Bloque_ID | INT PK | Identificador |
| Nombre | NVARCHAR | `Primer Bloque`, `Segundo Bloque`, etc. |
| Ciclo | NVARCHAR | Año lectivo (ej. `2024`) |

### TAREAS — Tareas asignadas por clase y bloque
| Campo | Tipo | Descripción |
|---|---|---|
| Tarea_ID | INT PK | Identificador |
| Clase_ID | INT FK | Clase |
| Bloque_ID | INT FK | Bloque |
| Titulo | NVARCHAR | Título de la tarea |
| Instrucciones | NVARCHAR | Indicaciones |
| FechaLimite | DATE | Fecha límite |
| Peso | INT | Puntos/porcentaje |
| Estado | NVARCHAR | `Activa`, `Por Calificar`, `Vencida` |

### ENTREGAS — Entregas de estudiantes a una tarea
| Campo | Tipo | Descripción |
|---|---|---|
| Entrega_ID | INT PK | Identificador |
| Tarea_ID | INT FK | Tarea |
| Estudiante_ID | INT FK | Estudiante |
| Archivo | NVARCHAR | Nombre del archivo |
| Puntaje | INT | Calificación (NULL si pendiente) |
| Estado | NVARCHAR | `Entregado`, `Pendiente` |

### EXAMENES — Evaluaciones por clase y bloque
| Campo | Tipo | Descripción |
|---|---|---|
| Examen_ID | INT PK | Identificador |
| Clase_ID | INT FK | Clase |
| Bloque_ID | INT FK | Bloque |
| Titulo | NVARCHAR | Título del examen |
| Duracion | INT | Minutos |
| Estado | NVARCHAR | `Proximo`, `Realizado` |

### PREGUNTAS — Preguntas de un examen
| Campo | Tipo | Descripción |
|---|---|---|
| Pregunta_ID | INT PK | Identificador |
| Examen_ID | INT FK | Examen |
| Tipo | NVARCHAR | `opcion`, `desarrollo`, `archivo` |
| Texto | NVARCHAR | Enunciado |
| Opciones | NVARCHAR | Opciones separadas (opción múltiple) |
| Orden | INT | Posición en el examen |

### NOTAS — Calificaciones por estudiante, clase y bloque
| Campo | Tipo | Descripción |
|---|---|---|
| Nota_ID | INT PK | Identificador |
| Estudiante_ID | INT FK | Estudiante |
| Clase_ID | INT FK | Clase |
| Bloque_ID | INT FK | Bloque |
| Tarea1 | INT | Nota de tarea |
| Examen1 | INT | Nota de examen |
| Tarea2 | INT | Nota de tarea |
| Proyecto | INT | Nota de proyecto |
| Participacion | INT | Nota de participación |

### ANUNCIOS — Comunicados (institucionales o de clase)
| Campo | Tipo | Descripción |
|---|---|---|
| Anuncio_ID | INT PK | Identificador |
| Titulo | NVARCHAR | Título |
| Cuerpo | NVARCHAR | Contenido |
| Autor | NVARCHAR FK | Usuario que publica |
| Destinatarios | NVARCHAR | `Todos`, `Estudiantes`, `Profesores`, o grado/sección |
| Estado | NVARCHAR | `PÚBLICO`, `BORRADOR` |
| Fecha | DATETIME | Publicación |

### MATERIALES — Recursos por clase
| Campo | Tipo | Descripción |
|---|---|---|
| Material_ID | INT PK | Identificador |
| Clase_ID | INT FK | Clase |
| Tipo | NVARCHAR | `PDF`, `Video` |
| Titulo | NVARCHAR | Nombre del recurso |
| Tamano | NVARCHAR | Tamaño/duración (ej. `2.4 MB`) |
| Carpeta | NVARCHAR | Carpeta de organización |

### MANTENIMIENTO — Ventanas de mantenimiento
| Campo | Tipo | Descripción |
|---|---|---|
| Mantenimiento_ID | INT PK | Identificador |
| Tipo | NVARCHAR | Ej. `Mantenimiento programado`, `Actualización de plataforma` |
| Descripcion | NVARCHAR | Tareas a realizar |
| Fecha | DATE | Día programado |
| Inicio | TIME | Hora de inicio |
| Fin | TIME | Hora de fin |
| Estado | NVARCHAR | `Programado`, `Completado`, `En Proceso` |

---

## 3. Relaciones principales

- `PERSONAS` (1) → (1) `USUARIOS` ; `PERSONAS` (1) → (1) `ESTUDIANTES` / `PROFESORES`
- `USUARIOS` (1) → (1) `ESTUDIANTES` / `PROFESORES`
- `CURSOS` (1) → (N) `CLASES` ; `PROFESORES` (1) → (N) `CLASES`
- `CLASES` (1) → (N) `MATRICULAS` ← (1) `ESTUDIANTES`
- `CLASES` (1) → (N) `TAREAS` (1) → (N) `ENTREGAS`
- `CLASES` (1) → (N) `EXAMENES` (1) → (N) `PREGUNTAS`
- `CLASES` (1) → (N) `NOTAS` (estudiante + bloque)
- `CLASES` (1) → (N) `MATERIALES`
- `BLOQUES` (1) → (N) `TAREAS` / `EXAMENES` / `NOTAS`

---

## 4. Reglas

- Nombres de tablas y campos en mayúsculas (estilo LexControl).
- Contenido en español (mensajes, valores de catálogo, estados).
- IDs numéricos autoincrementales con sufijo `*_ID`; `USUARIOS` usa `Usuario` como clave.
- Datos personales centralizados en `PERSONAS`; `ESTUDIANTES` y `PROFESORES` solo guardan lo específico del rol (evita duplicar Nombre/Correo).
- Valores predefinidos (grados, secciones, estados) viven en `CATALOGOS`, no como cadenas dispersas.
- Las opciones de preguntas se guardan como texto separado en `PREGUNTAS.Opciones`.

---

## 5. Fuera del modelo reducido (futura extensión)

- `ALERTAS` — tareas por vencer y exámenes próximos automáticos.
- `AGENDA` — calendario unificado (exámenes, tareas, eventos).
- `CAMBIOS_SISTEMA` — bitácora de actividad para el dashboard admin.
- `CONFIGURACION` — parámetros del sistema (ciclo actual, ventana de mantenimiento).
- `EXAMEN_ESTUDIANTE` — registro de intentos/resultados por estudiante.
