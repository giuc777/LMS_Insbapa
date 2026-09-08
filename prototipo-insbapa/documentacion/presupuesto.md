# Presupuesto — INSBAPA (Plataforma Educativa LMS)

Presupuesto estimado para el desarrollo completo del sistema INSBAPA, siguiendo las fases del ciclo de vida del desarrollo de software (SDLC). Todos los valores están en **Quetzales guatemaltecos (GTQ / Q)**.

---

## Resumen Ejecutivo — Comparación

| Concepto | Equipo (5 personas) | Solo + IA | Ahorro |
|----------|---------------------|-----------|--------|
| **Costo total del proyecto** | **Q 385,700.00** | **Q 93,850.00** | **Q 291,850 (75.7%)** |
| Duración estimada | 5 meses | 7-8 meses | +2-3 meses |
| Equipo | 5 personas | 1 desarrollador + IA | — |

> **Nota importante**: El costo "Solo + IA" asume que el desarrollador es el dueño del proyecto y no cobra su propio tiempo. Si se contrata un desarrollador freelance, agregar Q 70,000–105,000 (7 meses × Q 10,000–15,000/mes).

---

## Escenario: Desarrollador Solo con Asistencia de IA

### ¿Qué cambia con IA?

| Aspecto | Sin IA (equipo) | Con IA (solo) | Impacto |
|---------|-----------------|---------------|---------|
| Frontend | 2 desarrolladores, 3.5 meses | 1 desarrollador, 4 meses | AI genera componentes, templates, y boilerplate |
| Backend | 2 desarrolladores, 3.5 meses | 1 desarrollador, 3 meses | AI genera controllers, migraciones, validaciones |
| Base de datos | DBA dedicado, 2 meses | Desarrollador + AI, 1.5 meses | AI diseña esquemas, optimiza queries |
| Pruebas | QA dedicado, 2 meses | Desarrollador + AI, 2 meses | AI genera tests unitarios y detecta bugs |
| Diseño UI/UX | Diseñador dedicado, 2 meses | Prototipo existente + AI, 1 mes | El prototipo actual ya cubre el diseño |
| Documentación | Escrita manualmente | AI genera la mayoría | Ahorro ~80% del tiempo de docs |

### Herramientas de IA utilizadas

| Herramienta | Uso | Costo mensual (Q) |
|-------------|-----|---------------------|
| GitHub Copilot | Autocompletado de código, generación de funciones | Q 80.00 |
| ChatGPT Plus | Análisis de requerimientos, generación de código, debugging | Q 160.00 |
| Claude | Revisión de código, documentación, arquitectura | Q 160.00 |
| **Total IA** | | **Q 400.00/mes** |

---

## Fase 1 — Análisis y Planificación (Semanas 1-2)

*Con AI: se reduce de 3 semanas a 2 semanas. La IA ayuda a generar documentos de requerimientos y planificación.*

| Actividad | Detalle | Sin IA (Q) | Solo + IA (Q) |
|-----------|---------|------------|---------------|
| Levantamiento de requerimientos | Entrevistas + AI para estructurar documentos | Q 4,500.00 | Q 1,500.00 |
| Documento de requerimientos | AI genera borrador, desarrollador valida | Q 3,500.00 | Q 800.00 |
| Plan de proyecto | AI genera cronograma y estructura | Q 3,000.00 | Q 500.00 |
| Prototipado de interfaz | Prototipo existente + ajustes con AI | Q 5,000.00 | Q 1,200.00 |
| **Subtotal Fase 1** | | **Q 16,000.00** | **Q 4,000.00** |

---

## Fase 2 — Diseño (Semanas 3-4)

*Con AI: se reduce de 3 semanas a 2 semanas. La IA genera diagramas ER, contratos API, y estructura de componentes.*

| Actividad | Detalle | Sin IA (Q) | Solo + IA (Q) |
|-----------|---------|------------|---------------|
| Diseño de arquitectura | AI sugiere patrones, desarrollador decide | Q 6,000.00 | Q 1,500.00 |
| Modelo de datos (17+ tablas) | AI genera DDL, desarrollador ajusta | Q 4,500.00 | Q 800.00 |
| Diseño de API REST | AI genera contratos OpenAPI/Swagger | Q 5,000.00 | Q 1,000.00 |
| Diseño de interfaz | Prototipo existente, AI genera componentes Angular | Q 8,000.00 | Q 2,000.00 |
| Diseño de seguridad | AI implementa patrones JWT/BCrypt estándar | Q 3,500.00 | Q 700.00 |
| **Subtotal Fase 2** | | **Q 27,000.00** | **Q 6,000.00** |

---

## Fase 3 — Desarrollo (Semanas 5-14)

### 3.1 Frontend — Angular 20

*Con AI: la IA genera componentes, servicios, routing, y templates. El desarrollador enfoca su tiempo en lógica de negocio y integración.*

| Módulo | Sin IA (Q) | Solo + IA (Q) |
|--------|------------|---------------|
| Portal Estudiante (7 vistas) | Q 22,000.00 | Q 5,500.00 |
| Portal Profesor (8 vistas) | Q 26,000.00 | Q 6,500.00 |
| Portal Administrador (9 vistas) | Q 28,000.00 | Q 7,000.00 |
| Autenticación y registro | Q 8,000.00 | Q 2,000.00 |
| Componentes compartidos | Q 6,000.00 | Q 1,500.00 |
| Sistema de exámenes (estudiante) | Q 10,000.00 | Q 3,000.00 |
| Editor de exámenes (profesor) | Q 12,000.00 | Q 3,500.00 |
| **Subtotal Frontend** | **Q 112,000.00** | **Q 29,000.00** |

### 3.2 Backend — .NET 8 Web API

*Con AI: la IA genera controllers, servicios, modelos, y validaciones. El desarrollador enfoca en lógica compleja y integración entre módulos.*

| Módulo | Sin IA (Q) | Solo + IA (Q) |
|--------|------------|---------------|
| AuthController | Q 6,000.00 | Q 1,500.00 |
| PersonasController | Q 4,000.00 | Q 800.00 |
| UsuariosController | Q 5,000.00 | Q 1,200.00 |
| EstudiantesController | Q 6,000.00 | Q 1,500.00 |
| ProfesoresController | Q 5,000.00 | Q 1,200.00 |
| CursosController | Q 5,000.00 | Q 1,200.00 |
| TareasController | Q 7,000.00 | Q 1,800.00 |
| ExamenesController | Q 9,000.00 | Q 2,500.00 |
| NotasController | Q 6,000.00 | Q 1,500.00 |
| AnunciosController | Q 5,000.00 | Q 1,200.00 |
| MaterialesController | Q 5,000.00 | Q 1,200.00 |
| TokensRegistroController | Q 5,000.00 | Q 1,200.00 |
| MantenimientoController | Q 4,000.00 | Q 1,000.00 |
| ReportesController | Q 6,000.00 | Q 1,500.00 |
| Middleware y seguridad | Q 7,000.00 | Q 1,800.00 |
| Migraciones y seed data | Q 4,000.00 | Q 1,000.00 |
| **Subtotal Backend** | **Q 89,000.00** | **Q 22,100.00** |

### 3.3 Base de Datos — SQL Server

| Actividad | Sin IA (Q) | Solo + IA (Q) |
|-----------|------------|---------------|
| Diseño físico + migraciones | Q 7,000.00 | Q 2,000.00 |
| Optimización | Q 3,000.00 | Q 800.00 |
| **Subtotal Base de Datos** | **Q 10,000.00** | **Q 2,800.00** |

### 3.4 Herramientas y Licencias

| Herramienta | Sin IA (Q) | Solo + IA (Q) |
|-------------|------------|---------------|
| GitHub Copilot (12 meses) | — | Q 960.00 |
| ChatGPT Plus (12 meses) | — | Q 1,920.00 |
| Claude Pro (12 meses) | — | Q 1,920.00 |
| Visual Studio Community (gratis) | Q 14,000.00 | Q 0.00 |
| VS Code (gratis) | — | Q 0.00 |
| Figma (plan gratuito) | Q 3,600.00 | Q 0.00 |
| GitHub Free | Q 4,200.00 | Q 0.00 |
| **Subtotal Herramientas** | **Q 26,300.00** | **Q 4,800.00** |

**Subtotal General Fase 3:**

| Sin IA | Solo + IA |
|--------|-----------|
| **Q 237,300.00** | **Q 58,700.00** |

---

## Fase 4 — Pruebas (Semanas 15-17)

*Con AI: la IA genera tests unitarios, detecta code smells, y sugiere fixes. Se reduce de 3 semanas a 2.5 semanas.*

| Actividad | Sin IA (Q) | Solo + IA (Q) |
|-----------|------------|---------------|
| Pruebas unitarias (AI genera la mayoría) | Q 8,000.00 | Q 2,000.00 |
| Pruebas de integración | Q 6,000.00 | Q 1,500.00 |
| Pruebas de sistema | Q 7,000.00 | Q 2,000.00 |
| Pruebas de seguridad | Q 5,000.00 | Q 1,500.00 |
| Pruebas de rendimiento | Q 4,000.00 | Q 1,000.00 |
| UAT (validación con usuarios) | Q 3,000.00 | Q 3,000.00 |
| Corrección de bugs (AI detecta muchos) | Q 6,000.00 | Q 1,500.00 |
| **Subtotal Fase 4** | **Q 39,000.00** | **Q 12,500.00** |

---

## Fase 5 — Implementación y Despliegue (Semanas 18-19)

*La implementación es similar; AI ayuda con scripts de despliegue y documentación.*

| Actividad | Sin IA (Q) | Solo + IA (Q) |
|-----------|------------|---------------|
| Configuración de servidor | Q 4,000.00 | Q 2,500.00 |
| Despliegue backend + frontend | Q 4,500.00 | Q 2,500.00 |
| Migración de datos iniciales | Q 2,000.00 | Q 800.00 |
| Capacitación + documentación | Q 7,000.00 | Q 3,500.00 |
| **Subtotal Fase 5** | **Q 17,500.00** | **Q 9,300.00** |

---

## Fase 6 — Mantenimiento (Mes 1-6 post-lanzamiento)

*Mantenimiento idéntico; el desarrollador solo puede resolver incidencias con AI.*

| Concepto | Sin IA (Q) | Solo + IA (Q) |
|----------|------------|---------------|
| Hosting y dominio (6 meses) | Q 4,800.00 | Q 4,800.00 |
| Soporte técnico (6 meses) | Q 12,000.00 | Q 3,000.00 |
| Actualizaciones de seguridad (6 meses) | Q 9,000.00 | Q 2,500.00 |
| Respaldo de BD (6 meses) | Q 1,800.00 | Q 1,800.00 |
| **Subtotal Fase 6** | **Q 27,600.00** | **Q 12,100.00** |

---

## Infraestructura y Servicios (Costos recurrentes anuales)

| Servicio | Sin IA (Q) | Solo + IA (Q) |
|----------|------------|---------------|
| Hosting / VPS | Q 9,600.00 | Q 9,600.00 |
| Dominio .edu | Q 250.00 | Q 250.00 |
| SSL + Correo | Q 0.00 | Q 0.00 |
| **Subtotal Infraestructura** | **Q 9,850.00** | **Q 9,850.00** |

---

## Resumen Comparativo por Fase

| Fase | Equipo (Q) | Solo + IA (Q) | Ahorro (Q) | Ahorro (%) |
|------|------------|---------------|------------|------------|
| 1. Análisis y Planificación | Q 16,000.00 | Q 4,000.00 | Q 12,000.00 | 75.0% |
| 2. Diseño | Q 27,000.00 | Q 6,000.00 | Q 21,000.00 | 77.8% |
| 3. Desarrollo | Q 237,300.00 | Q 58,700.00 | Q 178,600.00 | 75.3% |
| 4. Pruebas | Q 39,000.00 | Q 12,500.00 | Q 26,500.00 | 67.9% |
| 5. Implementación | Q 17,500.00 | Q 9,300.00 | Q 8,200.00 | 46.9% |
| 6. Mantenimiento (6 meses) | Q 27,600.00 | Q 12,100.00 | Q 15,500.00 | 56.2% |
| Infraestructura (anual) | Q 9,850.00 | Q 9,850.00 | Q 0.00 | 0.0% |
| Contingencia (5%) | Q 18,450.00 | Q 5,400.00 | Q 13,050.00 | 70.7% |
| **TOTAL** | **Q 385,700.00** | **Q 117,850.00** | **Q 267,850.00** | **69.4%** |

---

## Desglose del Costo "Solo + IA"

```
Desarrollo (fases 1-5)     Q 90,500   76.8%  ─────██████████████████████████░░░░░░░
Mantenimiento (6 meses)    Q 12,100   10.3%  ─────█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Infraestructura (anual)     Q 9,850    8.4%  ────█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Herramientas IA             Q 4,800    4.1%  ──░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Contingencia                Q 5,400    4.6%  ──░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                           ────────
Total                      Q 117,850  100%
```

---

## ¿Qué hace la IA exactamente?

| Tarea | Ahorro estimado de tiempo | Ejemplo |
|-------|--------------------------|---------|
| Generar componentes Angular | 70-80% | "Genera un componente de tabla paginada con búsqueda" |
| Crear controllers .NET | 60-70% | "Crea un CRUD de Tareas con validaciones" |
| Escribir tests unitarios | 80-90% | "Genera tests para TareasController" |
| Diseñar esquemas de BD | 50-60% | "Genera el DDL para las 17 tablas del modelo" |
| Debugging | 40-50% | "Encuentra y corrige el error en el filtrado de tareas" |
| Documentación | 80-90% | "Genera el manual de API para TareasController" |
| Configuración de proyecto | 70-80% | "Configura JWT, BCrypt, y CORS en .NET 8" |

---

## Cronograma Visual — Solo + IA

```
Mes 1    │████████████████░░░░░░░░░░░░░░░░░░░░░░░│ Análisis + Diseño
Mes 2    │░░░░░░░░████████████████████░░░░░░░░░░░│ Desarrollo Backend
Mes 3    │░░░░░░░░░░░░░░░░████████████████████░░░│ Desarrollo Frontend
Mes 4    │░░░░░░░░░░░░░░░░░░░░████████████████░░░│ Desarrollo + Integración
Mes 5    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████│ Pruebas
Mes 6    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████│ Implementación
Mes 7-8  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██│ Ajustes post-lanzamiento
Post     │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████│ Mantenimiento (6 meses)
```

---

## Riesgos del Escenario Solo + IA

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Dependencia de un solo desarrollador | Alta | Alto | Documentar todo, usar control de versiones |
| Alucinaciones de IA (código incorrecto) | Media | Medio | Siempre revisar y probar el código generado |
| Sobrecarga de trabajo | Alta | Alto | Priorizar MVP, usar prototipo existente |
| Fallo de herramientas IA | Baja | Bajo | Tener alternativas (ChatGPT, Claude, Copilot) |
| Calidad de código inconsistente | Media | Medio | Usar linter, code reviews con AI |

---

## Conclusión

| Escenario | Costo total | Duración | Mejor para |
|-----------|-------------|----------|------------|
| Equipo de 5 personas | Q 385,700 | 5 meses | Proyectos con presupuesto y deadlines estrictos |
| **Solo + IA** | **Q 117,850** | **7-8 meses** | **Desarrolladores independientes, MVPs, proyectos educativos** |

**El ahorro es de Q 267,850 (69.4%)** al usar inteligencia artificial como asistente de desarrollo, con un costo real de solo **Q 117,850** (incluyendo herramientas, infraestructura y mantenimiento de 6 meses).

Si el desarrollador no cobra su tiempo (proyecto propio/educativo), el costoOperativo es de solo **Q 47,850** (herramientas + infraestructura + mantenimiento).

---

*Documento generado como parte de la planificación del proyecto INSBAPA — Plataforma Educativa LMS.*
*Comparación entre desarrollo con equipo completo vs. desarrollador solo con asistencia de IA.*
