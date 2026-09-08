# DERCAS — INSBAPA

## Plataforma Educativa (LMS) para Instituto de Educación Secundaria — Ciclo Básico

---

# FICHA DEL PROYECTO

| Campo | Valor |
|-------|-------|
| **Fecha** | 04/09/2026 |
| **Estado** | Inicial |
| **Versión** | Final |
| **Código de Documento** | DRC-INSBAPA-001 |
| **Nombre del proyecto** | Plataforma Educativa (LMS) para un instituto de educación secundaria (Ciclo Básico) |
| **Fecha de última revisión** | 04/09/2026 |
| **Revisado por** | [Nombre del Docente/Instructor] |
| **Autores** | [Nombre del Estudiante] |
| **Empresa solicitante** | Instituto Nacional San Bartolomé de las Casas (INSBAPA) |
| **Usuario final** | Estudiantes, Profesores y Administradores del instituto |
| **Descripción General** | Este documento recopila los requerimientos para el desarrollo de una plataforma de gestión educativa (LMS) que permita a los estudiantes acceder a cursos, tareas, exámenes y notas; a los profesores gestionar sus clases, calificaciones y evaluaciones; y a los administradores administrar el ciclo escolar completo. |

---

# CONTENIDO

1. Ficha del Proyecto
2. Glosario Técnico
3. Introducción
4. Objetivo General
5. Objetivos Específicos
6. Alcance del Proyecto
7. Delimitación del Proyecto
8. Ficha de la Institución
9. Historia de la Institución
10. Estructura Organizacional
11. Mapa de Procesos
12. Procesos Críticos
13. Definición del Problema
14. Ingeniería de Requerimientos
15. Descripción de Procesos a Automatizar
16. Modelo de Datos
17. Arquitectura del Sistema
18. Stack Tecnológico
19. Factibilidad del Proyecto
20. Costos del Sistema
21. Cronograma del Proyecto
22. Anexos

---

# 1. GLOSARIO TÉCNICO

| No. | Término | Definición |
|-----|---------|------------|
| 1 | **API (Application Programming Interface)** | Conjunto de reglas y protocolos que permiten la comunicación entre diferentes sistemas o componentes de software. En INSBAPA, la API REST expone los endpoints que permiten al frontend (Angular) interactuar con el backend (.NET 8). |
| 2 | **Backend** | Capa del sistema encargada de la lógica de negocio, procesamiento de datos y comunicación con la base de datos. En INSBAPA, está implementado con ASP.NET 8 Web API y C#. |
| 3 | **Base de Datos Relacional** | Tipo de base de datos que organiza la información en tablas con filas y columnas, estableciendo relaciones entre ellas mediante claves primarias y foráneas. INSBAPA utiliza Microsoft SQL Server. |
| 4 | **BCrypt** | Algoritmo de hash de contraseñas diseñado para ser lento y resistente a ataques de fuerza bruta. INSBAPA utiliza BCrypt.Net-Next para el almacenamiento seguro de contraseñas. |
| 5 | **Caso de Uso** | Representación de una interacción entre un actor (usuario) y el sistema para lograr un objetivo específico. En INSBAPA, ejemplos incluyen "Realizar examen" o "Calificar tarea". |
| 6 | **Clave Foránea (FK)** | Campo en una tabla que establece una relación con la clave primaria de otra tabla, garantizando la integridad referencial de los datos. |
| 7 | **Clave Primaria (PK)** | Campo o combinación de campos que identifica de manera única cada registro en una tabla de la base de datos. |
| 8 | **Ciclo Básico** | Nivel de educación secundaria que comprende Primero, Segundo y Tercero Básico, equivalente a los grados 7°, 8° y 9° de la educación primaria. |
| 9 | **DER (Diagrama Entidad-Relación)** | Representación gráfica que muestra las entidades de un sistema y las relaciones entre ellas, utilizado para diseñar la estructura de la base de datos. |
| 10 | **Endpoint** | Punto de entrada en una API que permite acceder a un recurso específico. En INSBAPA, cada endpoint corresponde a una operación CRUD sobre una entidad del sistema. |
| 11 | **Entity Framework Core** | ORM (Object-Relational Mapper) de Microsoft que permite a los desarrolladores interactuar con la base de datos utilizando objetos de C# en lugar de escribir consultas SQL manualmente. |
| 12 | **Frontend** | Capa del sistema con la que el usuario interactúa directamente. En INSBAPA, está implementado con Angular 20 y TypeScript. |
| 13 | **Framework** | Conjunto de herramientas, librerías y convenciones que facilitan el desarrollo de software al proporcionar una estructura base. INSBAPA utiliza Angular para el frontend y ASP.NET 8 para el backend. |
| 14 | **IDE (Integrated Development Environment)** | Entorno de desarrollo integrado que proporciona herramientas para escribir, depurar y probar código. Visual Studio y Visual Studio Code se utilizan para desarrollar INSBAPA. |
| 15 | **JWT (JSON Web Token)** | Estándar abierto para la transmisión segura de información entre partes, utilizado en INSBAPA para la autenticación y autorización de usuarios. |
| 16 | **LMS (Learning Management System)** | Sistema de gestión del aprendizaje. INSBAPA es un LMS diseñado específicamente para instituciones de educación secundaria. |
| 17 | **Middleware** | Capa de software que actúa como puente entre diferentes aplicaciones o componentes. En INSBAPA, el middleware gestiona la autenticación, registro de solicitudes y manejo de errores. |
| 18 | **Migración** | Proceso de creación y actualización del esquema de base de datos utilizando Entity Framework Core. INSBAPA usa migraciones para mantener el esquema sincronizado con los modelos. |
| 19 | **ORM (Object-Relational Mapper)** | Herramienta que mapea objetos de programación a tablas de bases de datos relacionales. INSBAPA utiliza Entity Framework Core como ORM. |
| 20 | **REST (Representational State Transfer)** | Estilo de arquitectura para diseñar servicios web que utilizan HTTP como protocolo de comunicación. INSBAPA implementa una API RESTful. |
| 21 | **RBAC (Role-Based Access Control)** | Modelo de control de acceso basado en roles. INSBAPA implementa tres roles: Estudiante, Profesor y Administrador. |
| 22 | **SPA (Single Page Application)** | Aplicación web que carga una sola página HTML y actualiza el contenido dinámicamente sin recargar la página completa. INSBAPA utiliza Angular para construir una SPA. |
| 23 | **SQL (Structured Query Language)** | Lenguaje estándar para gestionar y consultar bases de datos relacionales. INSBAPA utiliza SQL Server como motor de base de datos. |
| 24 | **SQL Server** | Sistema de gestión de bases de datos relacional desarrollado por Microsoft, utilizado en INSBAPA para el almacenamiento persistente de la información. |
| 25 | **Stack Tecnológico** | Conjunto de tecnologías, lenguajes, frameworks y herramientas utilizadas para desarrollar un sistema. El stack de INSBAPA incluye Angular 20, ASP.NET 8, C# y SQL Server. |
| 26 | **TypeScript** | Lenguaje de programación desarrollado por Microsoft que extiende JavaScript añadiendo tipado estático, utilizado en INSBAPA para el desarrollo del frontend con Angular. |
| 27 | **Validación de Datos** | Proceso que verifica que la información ingresada por el usuario cumpla con los requisitos de formato, tipo y rango antes de ser almacenada en la base de datos. |
| 28 | **Arquitectura de Tres Capas** | Modelo de diseño de software que separa la aplicación en tres capas: presentación (frontend), lógica de negocio (backend) y datos (base de datos). INSBAPA sigue este modelo. |
| 29 | **Autenticación** | Proceso mediante el cual el sistema verifica la identidad de un usuario, generalmente a través de usuario y contraseña. INSBAPA utiliza JWT para autenticación. |
| 30 | **Autorización** | Proceso que determina los permisos y recursos a los que un usuario autenticado puede acceder. En INSBAPA, cada rol tiene un conjunto de permisos específicos. |
| 31 | **Token de Matrícula** | Código único generado por el administrador que permite a los estudiantes auto-registrarse en la plataforma. |
| 32 | **Elicitación de Requerimientos** | Proceso de obtención de necesidades y expectativas de los usuarios y partes interesadas mediante técnicas como entrevistas, observación y cuestionarios. |
| 33 | **Requerimiento Funcional** | Especificación de una función o comportamiento que el sistema debe realizar. Ejemplo: "El sistema debe permitir realizar exámenes con temporizador". |
| 34 | **Requerimiento No Funcional** | Especificación de una característica de calidad del sistema, como rendimiento, seguridad o usabilidad. Ejemplo: "El sistema debe cargar en menos de 3 segundos". |
| 35 | **UI (User Interface)** | Interfaz de usuario, la parte visual del sistema con la que el usuario interactúa. INSBAPA utiliza Angular, HTML y CSS. |
| 36 | **UX (User Experience)** | Experiencia de usuario, que abarca todos los aspectos de la interacción del usuario con el sistema. |

---

# 2. INTRODUCCION

El presente documento constituye el Documento de Especificacion de Requerimientos y Criterio de Aceptacion de Software (DERCAS) para el desarrollo de la Plataforma Educativa INSBAPA, una solucion tecnologica disenada para optimizar la gestion educativa del Instituto Nacional San Bartolome de las Casas, una institucion de educacion secundaria del Ciclo Basico.

La plataforma INSBAPA surge como respuesta a la problematica identificada en la institucion, donde la dependencia de metodos manuales y fragmentados - registros en papel, control de notas en hojas de calculo, comunicacion presencial y falta de un sistema centralizado - genera ineficiencias operativas, riesgo de perdida de informacion critica y dificultades para mantener un seguimiento riguroso del progreso academico de los estudiantes.

El presente DERCAS tiene como objetivo principal definir de manera clara y estructurada todos los requerimientos funcionales y no funcionales del sistema, asi como establecer la arquitectura tecnologica, el diseno de la base de datos y los modulos que lo componen.

---

# 3. OBJETIVO GENERAL

Definir los requerimientos funcionales, no funcionales y la arquitectura tecnologica de la Plataforma Educativa INSBAPA, mediante un analisis detallado de las necesidades del Instituto Nacional San Bartolome de las Casas, para establecer las bases tecnicas que guien el desarrollo e implementacion de la solucion LMS.

---

# 4. OBJETIVOS ESPECIFICOS

1. Identificar las necesidades y procesos criticos de la institucion a traves de entrevistas, observacion directa y analisis documental, para establecer la base de requerimientos del sistema.
2. Definir los requerimientos funcionales y no funcionales del sistema, asi como los modulos que lo componen (portales de Estudiante, Profesor y Administrador), para establecer el alcance y las especificaciones tecnicas de la solucion.
3. Establecer la arquitectura tecnologica y el stack de desarrollo del sistema, definiendo las capas de presentacion, negocio y datos, para garantizar una solucion robusta y escalable.
4. Disenar el modelo de base de datos relacional que soporte el almacenamiento de la informacion academica (estudiantes, cursos, tareas, examenes, notas, anuncios), asegurando la integridad, consistencia y disponibilidad de los datos.
5. Elaborar los diagramas de casos de uso y la matriz de trazabilidad que vinculen los requerimientos con los modulos del sistema, para garantizar la cobertura completa de las necesidades identificadas.

---

# 5. ALCANCE DEL PROYECTO

El proyecto comprende el desarrollo e implementacion de la Plataforma Educativa INSBAPA, un sistema de gestion del aprendizaje (LMS) que contempla:

**Portal de Estudiantes:**
- Dashboard con resumen academico (tareas pendientes, examenes proximos, promedio general)
- Modulo de Anuncios con filtros por categoria y busqueda
- Modulo de Cursos con detalle por materia (materiales, tareas, examenes, progreso)
- Modulo de Tareas con pestanas (Pendientes/Completadas/Vencidas), detalle y entrega de archivos
- Modulo de Examenes con temporizador, mapa de preguntas, 3 tipos de pregunta (opcion multiple, desarrollo, archivo) y pantalla de resultados
- Modulo de Notas con consulta por curso, bloque y promedio general
- Modulo de Ajustes (perfil y cambio de contrasena)
- Auto-registro por codigo de matricula (token)

**Portal de Profesores:**
- Dashboard con estadisticas y acciones rapidas
- Modulo de Mis Clases con filtro por grado y detalle por seccion
- Modulo de Tareas con creacion, calificacion y estadisticas
- Modulo de Notas con tabla editable y calculo automatico de promedio
- Modulo de Examenes con editor completo de preguntas (CRUD, reordenamiento, tipos), vista previa y resultados
- Modulo de Materiales con organizacion por carpetas
- Modulo de Anuncios con creacion y seleccion de destinatarios
- Modulo de Ajustes (perfil y cambio de contrasena)

**Portal de Administradores:**
- Dashboard con metricas del sistema, actividad reciente y acciones de control
- Modulo de Cursos con administracion de cursos y secciones
- Modulo de Estudiantes con paginacion, busqueda, registro y edicion
- Modulo de Profesores con administracion y reseteo de contrasenas
- Modulo de Notas con resumen por grado/seccion y detalle por estudiante
- Modulo de Anuncios institucionales con publicacion y borradores
- Modulo de Tokens para auto-registro de estudiantes (generacion, uso, expiracion)
- Modulo de Mantenimiento con programacion de ventanas de mantenimiento
- Modulo de Ajustes (perfil y cambio de contrasena)

---

# 6. DELIMITACION DEL PROYECTO

**1. Limitaciones de integracion externa:**
El sistema no se integra con plataformas de videoconferencia (Zoom, Google Meet) ni con sistemas de gestion de bibliotecas. No incluye integracion con sistemas de facturacion electronica o plataformas de pago de matricula.

**2. Limitaciones de plataforma y dispositivos:**
No contempla el desarrollo de una aplicacion movil nativa (Android o iOS); el acceso desde dispositivos moviles se realizara exclusivamente a traves del navegador web. El sistema esta disenado para funcionar en navegadores modernos (Chrome, Edge, Firefox).

**3. Limitaciones de migracion de datos:**
La migracion de datos historicos (notas de ciclos anteriores) dependera de la disponibilidad de tiempo del personal administrativo. No se contempla un proceso automatico de digitalizacion de documentos fisicos.

**4. Limitaciones funcionales:**
El sistema no incluye funcionalidades de gestion financiera, facturacion, control de asistencia biometrico, videoconferencia integrada, mensajeria en tiempo real entre usuarios, o generacion automatica de documentos oficiales (certificados, constancias). Tampoco contempla modulos de inteligencia artificial para prediccion de rendimiento academico.

**5. Limitaciones de soporte:**
El proyecto no contempla la provision de soporte tecnico continuo posterior a la entrega, mas alla de la capacitacion inicial y la entrega de manuales de usuario. El mantenimiento posterior esta contemplado por un periodo de 6 meses.

---

# 7. FICHA DE LA INSTITUCION

| Campo | Valor |
|-------|-------|
| **Nombre de la institucion** | Instituto Nacional San Bartolome de las Casas |
| **Nombre comercial** | INSBAPA |
| **Direccion** | [Direccion completa del instituto] |
| **Ano de fundacion** | [Ano de fundacion] |
| **Director** | [Nombre del Director] |
| **Tipo de organizacion** | Institucion publica de educacion secundaria (Ciclo Basico) |
| **Personal docente** | [Numero] profesores |
| **Personal administrativo** | [Numero] administrativos |
| **Estudiantes matriculados** | [Numero] estudiantes |
| **Niveles que atiende** | Primero Basico, Segundo Basico, Tercero Basico |
| **Secciones por grado** | A, B (Primero y Segundo Basico); A (Tercero Basico) |
| **Mision** | [Mision de la institucion] |
| **Vision** | [Vision de la institucion] |
| **Sistemas que utiliza actualmente** | Registros en papel, hojas de calculo, comunicacion presencial |
| **Herramientas tecnologicas disponibles** | Computadoras de escritorio, conexion a internet, proyectores |

---

# 8. HISTORIA DE LA INSTITUCION

[Insertar historia de la institucion INSBAPA. Incluir: origenes, fundacion, consolidacion, logros relevantes, y la motivacion para adoptar una plataforma educativa digital.]

---

# 9. ESTRUCTURA ORGANIZACIONAL

La institucion opera bajo una estructura organizacional jerarquica compuesta por tres niveles:

**Nivel 1 - Direccion General:**
El Director es la maxima autoridad de la institucion. Es responsable de la planificacion estrategica, la toma de decisiones administrativas, la supervision del personal docente y administrativo, y la representacion de la institucion ante el Ministerio de Educacion y otras entidades.

**Nivel 2 - Coordinacion Academica:**
El Coordinador Academico supervisa el proceso de ensenanza-aprendizaje, coordina las actividades docentes, supervisa el cumplimiento del curriculo nacional, y gestiona las evaluaciones y calificaciones del ciclo escolar.

**Nivel 3 - Docentes y Personal Administrativo:**
Los profesores son responsables de la ensenanza, la evaluacion de los estudiantes, la asignacion de tareas y la calificacion. El personal administrativo apoya en la gestion de matricula, la recepcion de documentos, y las tareas operativas del instituto.

---

# 10. MAPA DE PROCESOS

**Procesos Estrategicos:**
- Planificacion del ciclo escolar
- Definicion del curriculo y programas de estudio
- Gestion de recursos humanos y materiales

**Procesos Misionales:**
- Matricula de estudiantes
- Asignacion de cursos y secciones
- Proceso de ensenanza-aprendizaje
- Evaluacion y calificacion
- Gestion de examenes
- Emision de notas y boletas de calificaciones

**Procesos de Apoyo:**
- Gestion de anuncios y comunicados
- Administracion de materiales educativos
- Gestion de tokens de auto-registro
- Mantenimiento de la plataforma

**Procesos de Control y Evaluacion:**
- Seguimiento del rendimiento academico
- Reportes estadisticos por grado/seccion
- Auditoria de cambios en el sistema

---

# 11. PROCESOS CRITICOS

**1. Gestion de Calificaciones y Notas.**
El proceso de calificacion es central en la actividad educativa. Los profesores deben registrar notas de tareas, examenes, proyectos y participacion, calcular promedios por bloque y emitir boletas de calificaciones. Un error en este proceso puede afectar directamente el progreso academico de los estudiantes.

**2. Gestion de Examenes y Evaluaciones.**
La creacion, aplicacion y calificacion de examenes es un proceso complejo que involucra diseno de preguntas, control de tiempo, multiples tipos de evaluacion (opcion multiple, desarrollo, archivo) y generacion de resultados.

**3. Comunicacion Institucional (Anuncios).**
La difusion de informacion relevante (cambios de horario, eventos, mantenimiento, inscripciones) es critica para mantener informados a estudiantes, profesores y padres.

**4. Acceso a Materiales Educativos.**
Los estudiantes necesitan acceso oportuno a los materiales de estudio (PDFs, videos, guias). La distribucion fisica de materiales consume tiempo y recursos.

**5. Seguimiento del Progreso Academico.**
La capacidad de monitorear el rendimiento de cada estudiante a lo largo del ciclo escolar es fundamental para identificar estudiantes en riesgo y tomar acciones oportunas.

---

# 12. DEFINICION DEL PROBLEMA

La gestion educativa en instituciones de educacion secundaria del Ciclo Basico en Guatemala enfrenta desafios significativos derivados de la dependencia de metodos manuales y la falta de herramientas tecnologicas adecuadas.

**En la gestion de calificaciones:**
Los profesores registran las notas en hojas de calculo o cuadernos, lo que genera riesgo de errores de calculo, perdida de informacion y dificultades para emitir boletas de calificaciones oportunamente.

**En la gestion de examenes:**
La creacion de examenes se realiza de manera manual, sin un sistema que permita disenar diferentes tipos de preguntas, controlar el tiempo de aplicacion, ni generar resultados automaticamente.

**En la comunicacion institucional:**
Los anuncios se difunden de manera presencial (carteleras, assembleas) o por medios informales (grupos de mensajeria), generando rezagos en la recepcion de la informacion.

**En el acceso a materiales:**
Los materiales educativos se distribuyen en formato fisico o se comparten de manera desorganizada, limitando la capacidad de estudio fuera del aula.

**En el seguimiento del rendimiento:**
La falta de un sistema integrado dificulta la identificacion temprana de estudiantes con bajo rendimiento academico.

**En la administracion del ciclo escolar:**
La gestion de matricula, la asignacion de cursos y secciones, la generacion de tokens de auto-registro y el mantenimiento de la plataforma se realizan de manera manual.

---

# 13. INGENIERIA DE REQUERIMIENTOS

## 13.1 Requerimientos Funcionales (RF)

| ID | Nombre | Descripcion | Modulo | Prioridad |
|----|--------|-------------|--------|-----------|
| RF-001 | Inicio de sesion | El sistema debe permitir el acceso mediante usuario, contrasena y selector de rol (Estudiante/Profesor/Administrador) | Autenticacion | Alta |
| RF-002 | Auto-registro de estudiantes | El sistema debe permitir el auto-registro de estudiantes mediante un codigo de matricula (token) valido | Registro | Alta |
| RF-003 | Dashboard de estudiantes | El sistema debe mostrar un resumen con tareas pendientes, examenes proximos, promedio general y cursos inscritos | Estudiante | Alta |
| RF-004 | Anuncios (estudiante) | El sistema debe mostrar anuncios filtrables por categoria con opcion de busqueda | Estudiante | Media |
| RF-005 | Cursos (estudiante) | El sistema debe mostrar los cursos inscritos con progreso, materiales, tareas y examenes | Estudiante | Alta |
| RF-006 | Tareas (estudiante) | El sistema debe mostrar tareas en pestanas (Pendientes/Completadas/Vencidas) con detalle y entrega de archivos | Estudiante | Alta |
| RF-007 | Realizar examen | El sistema debe permitir realizar examenes con temporizador, mapa de preguntas, 3 tipos de pregunta y envio automatico al vencer | Estudiante | Alta |
| RF-008 | Resultados de examen | El sistema debe mostrar los resultados del examen con desglose por pregunta, nota y estado (aprobado/reprobado) | Estudiante | Alta |
| RF-009 | Notas (estudiante) | El sistema debe mostrar las notas por curso con tabs de bloque y promedio general | Estudiante | Alta |
| RF-010 | Ajustes (estudiante) | El sistema debe permitir editar perfil y cambiar contrasena | Estudiante | Media |
| RF-011 | Dashboard de profesores | El sistema debe mostrar estadisticas (tareas por calificar, examenes activos, estudiantes a cargo) y acciones rapidas | Profesor | Alta |
| RF-012 | Mis Clases | El sistema debe mostrar las clases asignadas con filtro por grado y detalle por seccion | Profesor | Alta |
| RF-013 | Crear tarea | El sistema debe permitir crear tareas con titulo, instrucciones, clase, materia, fecha limite y puntaje | Profesor | Alta |
| RF-014 | Calificar tareas | El sistema debe permitir calificar entregas de estudiantes con puntaje individual | Profesor | Alta |
| RF-015 | Notas (profesor) | El sistema debe permitir editar notas con calculo automatico de promedio en tiempo real | Profesor | Alta |
| RF-016 | Crear examen | El sistema debe permitir crear examenes con metadata (titulo, grado, materia, duracion, fecha, tipo, puntaje total) | Profesor | Alta |
| RF-017 | Editor de preguntas | El sistema debe permitir agregar, editar, eliminar y reordenar preguntas de 3 tipos (opcion multiple, desarrollo, archivo) | Profesor | Alta |
| RF-018 | Vista previa de examen | El sistema debe permitir previsualizar el examen tal como lo veran los estudiantes | Profesor | Media |
| RF-019 | Resultados de examen (profesor) | El sistema debe mostrar resultados por estudiante con notas editables | Profesor | Alta |
| RF-020 | Materiales | El sistema debe mostrar materiales organizados por carpetas con opcion de descarga | Profesor | Media |
| RF-021 | Anuncios (profesor) | El sistema debe permitir crear anuncios con titulo, cuerpo, archivo adjunto y seleccion de destinatarios | Profesor | Media |
| RF-022 | Dashboard de administradores | El sistema debe mostrar metricas del sistema, actividad reciente, acciones de control e historial completo | Admin | Alta |
| RF-023 | Gestion de cursos | El sistema debe permitir ver, editar y desactivar cursos con detalle de tareas asignadas | Admin | Alta |
| RF-024 | Gestion de estudiantes | El sistema debe permitir buscar, paginar, registrar, editar y ver perfil de estudiantes | Admin | Alta |
| RF-025 | Gestion de profesores | El sistema debe permitir buscar, registrar, editar y resetear contrasenas de profesores | Admin | Alta |
| RF-026 | Notas (admin) | El sistema debe mostrar resumen de notas por grado/seccion con estadisticas y detalle por estudiante | Admin | Alta |
| RF-027 | Anuncios institucionales | El sistema debe permitir crear anuncios con publicacion o borrador y seleccion de destinatarios | Admin | Media |
| RF-028 | Gestion de tokens | El sistema debe permitir generar, listar y desactivar tokens de matricula con descripcion, maximo de usos y expiracion | Admin | Alta |
| RF-029 | Mantenimiento | El sistema debe permitir programar y administrar ventanas de mantenimiento | Admin | Baja |
| RF-030 | Auditoria de cambios | El sistema debe registrar quien, cuando y que se modifico en el sistema | Seguridad | Media |

## 13.2 Requerimientos No Funcionales (RNF)

| ID | Nombre | Descripcion | Modulo | Prioridad |
|----|--------|-------------|--------|-----------|
| RNF-001 | Tiempo de respuesta | El sistema debe cargar las pantallas en menos de 3 segundos | General | Alta |
| RNF-002 | Usuarios concurrentes | El sistema debe soportar al menos 200 usuarios simultaneos | General | Alta |
| RNF-003 | Seguridad de contrasenas | Las contrasenas deben almacenarse con hash BCrypt | Autenticacion | Alta |
| RNF-004 | Cierre de sesion | El sistema debe cerrar sesion tras 30 minutos de inactividad | Autenticacion | Media |
| RNF-005 | Responsividad | La interfaz debe adaptarse a moviles, tablets y escritorio | General | Alta |
| RNF-006 | Consistencia de colores | El diseno debe usar la paleta #52A344 (primario), #F6F7F6 (fondo), Lexend (fuente) | General | Alta |
| RNF-007 | Intuitividad | La interfaz debe ser facil de usar para personal no tecnico | General | Alta |
| RNF-008 | Disponibilidad | El sistema debe estar disponible 24/7 | General | Alta |
| RNF-009 | Respaldo de datos | El sistema debe realizar respaldos automaticos diarios de la base de datos | General | Media |
| RNF-010 | Compatibilidad | El sistema debe funcionar en Chrome, Edge y Firefox | General | Alta |
| RNF-011 | CORS configurado | El backend debe permitir peticiones desde el dominio del frontend | Backend | Alta |
| RNF-012 | Validacion de entrada | Todos los inputs deben ser validados tanto en frontend como en backend | Seguridad | Alta |

---

# 14. DESCRIPCION DE PROCESOS A AUTOMATIZAR

## 14.1 Proceso de Auto-Registro de Estudiantes

| No. | Pasos Actuales (Manual) | Decision / Justificacion |
|-----|------------------------|--------------------------|
| 1 | El estudiante llega a la institucion con su codigo de matricula proporcionado por el administrador. | El administrador verifica que el token sea valido y tenga usos disponibles. |
| 2 | El estudiante ingresa al portal de registro y produce el codigo de matricula. | El sistema valida el token: estado activo, usos disponibles y fecha de expiracion. |
| 3 | El estudiante completa sus datos personales (nombre, email, grado, seccion, usuario, contrasena). | El sistema valida que el email no este registrado, que la contrasena tenga minimo 6 caracteres, y que los datos sean coherentes con el grado/seccion disponible. |
| 4 | El estudiante envia el formulario y el sistema crea la cuenta. | El sistema incrementa el contador de usos del token y, si alcanza el maximo, lo desactiva automaticamente. |

## 14.2 Proceso de Realizacion de Examen

| No. | Pasos Actuales (Manual) | Decision / Justificacion |
|-----|------------------------|--------------------------|
| 1 | El profesor crea el examen con metadata (titulo, grado, materia, duracion, fecha). | El sistema genera un ID unico y crea el examen en estado Proximo. |
| 2 | El profesor agrega preguntas de 3 tipos: opcion multiple, desarrollo y archivo. | Para opcion multiple, marca la respuesta correcta y define puntos. Para desarrollo y archivo, solo define el texto y puntos. |
| 3 | El estudiante accede al examen y confirma inicio. | El sistema inicia el temporizador y muestra el mapa de preguntas. |
| 4 | El estudiante responde cada pregunta navegando por el mapa. | El sistema guarda el progreso y marca las preguntas respondidas/pendientes. |
| 5 | Al vencer el tiempo o al enviar, el sistema calcula la nota. | Para opcion multiple, compara con la respuesta correcta. Para desarrollo y archivo, asigna nota pendiente de calificacion manual. |
| 6 | El estudiante ve los resultados con desglose por pregunta. | El sistema muestra nota total, estado (aprobado/reprobado >= 60) y detalle de cada respuesta. |

## 14.3 Proceso de Calificacion de Tareas

| No. | Pasos Actuales (Manual) | Decision / Justificacion |
|-----|------------------------|--------------------------|
| 1 | El estudiante entrega la tarea adjuntando un archivo. | El sistema registra la entrega con estado Entregado y almacena el nombre del archivo. |
| 2 | El profesor accede a la vista de calificacion de la tarea. | El sistema muestra la lista de estudiantes con sus entregas y campo de puntaje. |
| 3 | El profesor ingresa el puntaje para cada estudiante. | El sistema valida que el puntaje este en el rango permitido (0-100). |
| 4 | El profesor guarda las calificaciones. | El sistema actualiza el estado de la tarea a Calificada y el estudiante puede ver su nota. |

---

# 15. MODELO DE DATOS

## 15.1 Convenciones de Nomenclatura

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Tablas | Singular, mayusculas | PERSONA, USUARIO, ESTUDIANTE |
| Campos | PascalCase | NombreCompleto, FechaVencimiento |
| Claves Primarias | ID | ID |
| Claves Foraneas | Entidad_ID | Persona_ID, Curso_ID |
| Fechas | DATETIME o DATE | FechaCreacion, FechaModificacion |
| Booleanos | BIT con prefijo | Activo, Prioritario |

## 15.2 Tablas por Categoria

| Categoria | Tablas | Cantidad |
|-----------|--------|----------|
| Base y Herencia | PERSONA, USUARIO | 2 |
| Catalogos | GRADO, SECCION, ESTADO_TAREA, ESTADO_EXAMEN, TIPO_PREGUNTA, ESTADO_ANUNCIO, ROL | 7 |
| Academicos | CURSO, CLASE, MATRICULA, BLOQUE | 4 |
| Transaccionales | TAREA, ENTREGA, EXAMEN, PREGUNTA, NOTA | 5 |
| Contenido | MATERIAL, ANUNCIO | 2 |
| Seguridad | TOKEN_REGISTRO, AUDITORIA_CAMBIO | 2 |
| Mantenimiento | MANTENIMIENTO, CONFIGURACION | 2 |
| **TOTAL** | | **24 TABLAS** |

## 15.3 Diccionario de Datos

### 15.3.1 PERSONA
Proposito: Datos personales comunes de todos los usuarios del sistema.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| NombreCompleto | NVARCHAR(100) | NO | Nombre completo | Maria Fernanda Lopez |
| Email | NVARCHAR(100) | NO | Correo institucional (unico) | maria.lopez@insbapa.edu |
| Telefono | NVARCHAR(20) | SI | Telefono de contacto | +502 5555-1234 |
| FechaNacimiento | DATE | SI | Fecha de nacimiento | 2008-05-15 |
| Direccion | NVARCHAR(200) | SI | Direccion de residencia | [Direccion] |
| Activo | BIT | NO | Activo? | 1 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |
| FechaModificacion | DATETIME | SI | Ultima modificacion | NULL |

Restricciones: Email unico.

### 15.3.2 USUARIO
Proposito: Cuentas de acceso al sistema. Referencia PERSONA (1:1).

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Persona_ID | INT | NO | FK a PERSONA (1:1) | 1 |
| Username | NVARCHAR(50) | NO | Nombre de usuario (unico) | estudiante |
| Contrasena | NVARCHAR(200) | NO | Hash BCrypt de la contrasena | \\\$... |
| Rol | NVARCHAR(20) | NO | Rol: Estudiante/Profesor/Administrador | Estudiante |
| Iniciales | NVARCHAR(5) | NO | Iniciales para avatar | ML |
| Activo | BIT | NO | Activo? | 1 |
| TokenRegistro_ID | INT | SI | FK a TOKEN_REGISTRO (si se auto-registro) | NULL |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

Restricciones: Username unico, Persona_ID unico.

### 15.3.3 CURSO
Proposito: Materias academicas.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Codigo | NVARCHAR(20) | NO | Codigo corto (unico) | LENGUA |
| Nombre | NVARCHAR(100) | NO | Nombre de la materia | Lengua y Literatura |
| Color | NVARCHAR(7) | SI | Color de identificacion | #EAF4E8 |
| ColorText | NVARCHAR(7) | SI | Color de texto | #3f7f35 |
| Activo | BIT | NO | Activo? | 1 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.4 CLASE
Proposito: Asignacion de un curso a un grado, seccion y profesor.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Curso_ID | INT | NO | FK a CURSO | 1 |
| Grado_ID | INT | NO | FK a GRADO | 1 |
| Seccion_ID | INT | NO | FK a SECCION | 1 |
| Profesor_ID | INT | NO | FK a USUARIO (profesor) | 2 |
| AnioEscolar | INT | NO | Ano escolar | 2026 |
| Activo | BIT | NO | Activo? | 1 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

Restriccion: (Curso_ID, Grado_ID, Seccion_ID, AnioEscolar) unico.

### 15.3.5 MATRICULA
Proposito: Inscripcion de un estudiante en una clase.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Estudiante_ID | INT | NO | FK a USUARIO (estudiante) | 1 |
| Clase_ID | INT | NO | FK a CLASE | 1 |
| Activo | BIT | NO | Activo? | 1 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.6 TAREA
Proposito: Tareas asignadas por clase y bloque.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Clase_ID | INT | NO | FK a CLASE | 1 |
| Bloque_ID | INT | SI | FK a BLOQUE | 1 |
| Titulo | NVARCHAR(200) | NO | Titulo de la tarea | Ecuaciones lineales |
| Instrucciones | NVARCHAR(MAX) | SI | Indicaciones detalladas | Resuelve los 10 ejercicios... |
| FechaLimite | DATE | NO | Fecha limite de entrega | 2026-08-15 |
| Peso | INT | NO | Puntos/porcentaje (0-100) | 15 |
| Estado | NVARCHAR(30) | NO | FK a ESTADO_TAREA | Activa |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |
| FechaModificacion | DATETIME | SI | Ultima modificacion | NULL |

Restriccion CHECK: Peso BETWEEN 0 AND 100.

### 15.3.7 ENTREGA
Proposito: Entregas de estudiantes a una tarea.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Tarea_ID | INT | NO | FK a TAREA | 1 |
| Estudiante_ID | INT | NO | FK a USUARIO (estudiante) | 1 |
| ArchivoNombre | NVARCHAR(200) | SI | Nombre del archivo adjunto | ecuaciones_juan.pdf |
| Puntaje | INT | SI | Calificacion (NULL si pendiente) | 95 |
| Estado | NVARCHAR(30) | NO | Entregado/Pendiente/Calificada | Entregado |
| FechaEntrega | DATETIME | NO | Fecha de entrega | GETDATE() |
| FechaCalificacion | DATETIME | SI | Fecha de calificacion | NULL |

### 15.3.8 EXAMEN
Proposito: Evaluaciones programadas por clase.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Clase_ID | INT | NO | FK a CLASE | 1 |
| Titulo | NVARCHAR(200) | NO | Titulo del examen | Examen Parcial: Ecuaciones |
| Duracion | INT | NO | Duracion en minutos | 45 |
| Fecha | DATE | NO | Fecha programada | 2026-08-20 |
| Estado | NVARCHAR(30) | NO | FK a ESTADO_EXAMEN | Proximo |
| Tipo | NVARCHAR(30) | NO | Tipo de preguntas | Mixto |
| Puntaje | INT | NO | Puntaje total | 100 |
| Promedio | DECIMAL(5,1) | SI | Promedio general (calculado) | 81.5 |
| Aprobados | INT | SI | Cantidad de aprobados | 25 |
| Reprobados | INT | SI | Cantidad de reprobados | 5 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.9 PREGUNTA
Proposito: Preguntas de un examen.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Examen_ID | INT | NO | FK a EXAMEN | 1 |
| Tipo | NVARCHAR(20) | NO | FK a TIPO_PREGUNTA | opcion |
| Texto | NVARCHAR(MAX) | NO | Enunciado de la pregunta | Cual es el seno de 30? |
| Opciones | NVARCHAR(MAX) | SI | Opciones separadas por delimitador | 0.5\|0.707\|1\|0.866 |
| Correcta | INT | SI | Indice de la respuesta correcta | 0 |
| Puntos | INT | NO | Puntos de la pregunta | 10 |
| Orden | INT | NO | Posicion en el examen | 1 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.10 NOTA
Proposito: Calificaciones por estudiante, clase y bloque.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Estudiante_ID | INT | NO | FK a USUARIO (estudiante) | 1 |
| Clase_ID | INT | NO | FK a CLASE | 1 |
| Bloque_ID | INT | NO | FK a BLOQUE | 1 |
| Tarea1 | INT | SI | Nota de tarea 1 | 88 |
| Examen1 | INT | SI | Nota de examen 1 | 92 |
| Tarea2 | INT | SI | Nota de tarea 2 | 95 |
| Proyecto | INT | SI | Nota de proyecto | 90 |
| Participacion | INT | SI | Nota de participacion | 94 |
| Promedio | DECIMAL(5,1) | SI | Promedio calculado | 91.8 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |
| FechaModificacion | DATETIME | SI | Ultima modificacion | NULL |

### 15.3.11 MATERIAL
Proposito: Recursos educativos por clase.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Clase_ID | INT | NO | FK a CLASE | 1 |
| Tipo | NVARCHAR(20) | NO | Tipo de archivo | PDF |
| Titulo | NVARCHAR(200) | NO | Nombre del recurso | Unidad 1: Analisis literario |
| Tamano | NVARCHAR(20) | SI | Tamano/duracion | 2.4 MB |
| Carpeta | NVARCHAR(100) | SI | Carpeta de organizacion | Unidad 1 |
| RutaArchivo | NVARCHAR(500) | SI | Ruta de almacenamiento | /docs/material_1.pdf |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.12 ANUNCIO
Proposito: Comunicados institucionales o por clase.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Titulo | NVARCHAR(200) | NO | Titulo del anuncio | Mantenimiento de la Plataforma |
| Cuerpo | NVARCHAR(MAX) | NO | Contenido del anuncio | El sistema estara fuera de linea... |
| Autor_ID | INT | NO | FK a USUARIO (quien publica) | 3 |
| Destinatarios | NVARCHAR(100) | NO | Todos/Estudiantes/Profesores/grado-seccion | Todos |
| Estado | NVARCHAR(20) | NO | FK a ESTADO_ANUNCIO | Publicado |
| Categoria | NVARCHAR(50) | SI | Categoria del anuncio | Institucional |
| ArchivoRuta | NVARCHAR(500) | SI | Ruta de archivo adjunto | NULL |
| FechaPublicacion | DATETIME | NO | Fecha de publicacion | GETDATE() |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.13 TOKEN_REGISTRO
Proposito: Codigos de matricula para auto-registro de estudiantes.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Token | NVARCHAR(50) | NO | Codigo de matricula (unico) | REG-DEMO2026 |
| Descripcion | NVARCHAR(200) | SI | Descripcion del token | Matricula 2026 |
| MaximoUsos | INT | NO | Numero maximo de usos | 40 |
| UsosActuales | INT | NO | Usos realizados | 0 |
| FechaExpiracion | DATETIME | NO | Fecha y hora de expiracion | 2026-12-31T23:59:59 |
| Activo | BIT | NO | Activo? | 1 |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.14 MANTENIMIENTO
Proposito: Ventanas de mantenimiento programadas.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Tipo | NVARCHAR(100) | NO | Tipo de mantenimiento | Mantenimiento programado |
| Descripcion | NVARCHAR(500) | SI | Descripcion de las tareas | Actualizacion de parches... |
| Fecha | DATE | NO | Fecha programada | 2026-08-16 |
| HoraInicio | TIME | NO | Hora de inicio | 02:00 |
| HoraFin | TIME | NO | Hora de fin | 04:00 |
| Estado | NVARCHAR(30) | NO | Programado/Completado/En Proceso | Programado |
| FechaCreacion | DATETIME | NO | Fecha de registro | GETDATE() |

### 15.3.15 AUDITORIA_CAMBIO
Proposito: Registro de cambios en el sistema.

| Campo | Tipo | Nulo | Descripcion | Ejemplo |
|-------|------|------|-------------|---------|
| ID | INT | NO | Identificador unico (PK) | 1 |
| Usuario_ID | INT | NO | FK a USUARIO | 3 |
| Tabla | NVARCHAR(50) | NO | Tabla modificada | USUARIOS |
| Registro_ID | INT | NO | ID del registro modificado | 1 |
| Accion | NVARCHAR(20) | NO | INSERT/UPDATE/DELETE | UPDATE |
| Detalle | NVARCHAR(MAX) | SI | Descripcion del cambio | Cambio de contrasena |
| FechaCreacion | DATETIME | NO | Fecha del cambio | GETDATE() |

---

# 16. ARQUITECTURA DEL SISTEMA

## 16.1 Descripcion General

La Plataforma Educativa INSBAPA se desarrolla bajo una arquitectura de tres capas (Three-Tier Architecture), que organiza los componentes del sistema en tres niveles claramente diferenciados:

### Capa de Presentacion (Frontend)
Implementada con Angular 20, una plataforma de desarrollo frontend de codigo abierto mantenida por Google. Angular permite construir aplicaciones de tipo SPA (Single Page Application), donde el contenido se actualiza dinamicamente sin necesidad de recargar la pagina completa.

Caracteristicas del Frontend:
- Desarrollo con TypeScript, un lenguaje que extiende JavaScript anadiendo tipado estatico.
- Organizacion del codigo en componentes reutilizables por modulo.
- Uso de HTML y CSS con la paleta de colores definida: #52A344 (primario), #F6F7F6 (fondo), Lexend (fuente).
- Diseno responsivo que se adapta a dispositivos moviles, tablets y computadoras de escritorio.
- Enrutado por modulos con lazy loading.
- Servicios para comunicacion con la API REST.

### Capa de Logica de Negocio (Backend)
Implementada con ASP.NET 8 Web API y C#, proporcionando una API RESTful que expone los endpoints necesarios para el funcionamiento del sistema.

Caracteristicas del Backend:
- Autenticacion JWT (JSON Web Token) con roles (Estudiante, Profesor, Administrador).
- Autorizacion basada en roles para control de acceso.
- Validacion de datos en el lado del servidor.
- Manejo de errores centralizado con middleware.
- Migraciones de Entity Framework Core para el esquema de base de datos.
- Hash BCrypt para contrasenas.
- Configuracion CORS para permitir peticiones del frontend.

### Capa de Datos (Base de Datos)
Implementada con Microsoft SQL Server, proporcionando almacenamiento persistente y consulta eficiente de la informacion.

Caracteristicas de la Base de Datos:
- Modelo relacional con tablas normalizadas que garantizan la integridad y consistencia de los datos.
- Uso de claves primarias y foraneas para establecer relaciones entre las entidades.
- Implementacion de propiedades ACID (atomicidad, consistencia, aislamiento, durabilidad) para asegurar transacciones seguras.
- Indices unicos en campos de busqueda frecuente (Username, Email, Token).
- Migraciones de Entity Framework Core como fuente de verdad del esquema.

---

# 17. STACK TECNOLOGICO

## 17.1 Frontend

| Tecnologia | Informacion |
|------------|-------------|
| **Angular 20** | Framework de desarrollo frontend de Google basado en TypeScript que facilita crear aplicaciones web modernas, escalables y de gran tamano mediante componentes reutilizables y data binding. |
| **TypeScript** | Lenguaje de programacion desarrollado por Microsoft que extiende JavaScript anadiendo tipado estatico y caracteristicas orientadas a objetos. |
| **HTML5** | Define la estructura semantica de la interfaz: encabezados, secciones, formularios y tablas que dan significado al contenido. |
| **CSS3** | Controla la presentacion: tipografias, colores y layout responsive con Flexbox y Grid. Paleta: #52A344 (primario), #F6F7F6 (fondo). |
| **Lexend** | Fuente tipografica principal del sistema, disenada para maximizar la legibilidad. |

## 17.2 Backend

| Tecnologia | Informacion |
|------------|-------------|
| **C#** | Lenguaje de programacion moderno, orientado a objetos, utilizado para construir el backend de INSBAPA en la plataforma .NET. |
| **ASP.NET 8** | Framework de Microsoft que proporciona un entorno completo para ejecutar aplicaciones. Ofrece herramientas para crear APIs, servicios web y aplicaciones escalables. |
| **Entity Framework Core** | ORM que permite a los desarrolladores interactuar con la base de datos utilizando objetos de C#. |
| **BCrypt.Net-Next** | Libreria para hash de contrasenas, proporcionando almacenamiento seguro de credenciales. |

## 17.3 Base de Datos

| Tecnologia | Informacion |
|------------|-------------|
| **SQL Server** | Sistema de gestion de bases de datos relacional de Microsoft. Escalabilidad para proyectos pequenos y grandes, herramientas graficas (SSMS), soporte para transacciones y compatibilidad con Azure. |

## 17.4 Despliegue

| Componente | Proveedor | Tecnologia | Notas |
|------------|-----------|------------|-------|
| Frontend (Angular) | Servidor estatico / Nginx | Hosting estatico + CDN | Build de Angular optimizado |
| Backend (ASP.NET 8) | IIS / Kestrel | Web Service (API REST) | Perfil http del launchSettings.json |
| Base de Datos (SQL Server) | SQL Server local / Azure SQL | SQL Server | Connection string en appsettings.json |
| Dominio con SSL | Proveedor local / Let's Encrypt | Certificados HTTPS | Dominio personalizado |

---

# 18. FACTIBILIDAD DEL PROYECTO

## 18.1 Factibilidad Operativa

La factibilidad operativa evalua la capacidad del personal de la institucion para adoptar y utilizar la plataforma INSBAPA.

**Perfil del Personal:**

| Puesto | Perfil | Competencias Tecnologicas |
|--------|--------|---------------------------|
| Director | Licenciado en Educacion / Administracion | Uso basico de herramientas informaticas, consulta de documentos digitales |
| Coordinador Academico | Licenciado en Educacion | Manejo de hojas de calculo, uso de plataformas educativas |
| Profesor | Licenciado en diversas areas | Manejo basico de computadora, uso de correo electronico |
| Administrativo | Personal con experiencia en gestion institucional | Manejo de procesadores de texto, hojas de calculo |

**Capacidad de Adopcion:**
El personal demuestra actitud favorable hacia la incorporacion de nuevas herramientas tecnologicas, evidenciada por:
1. Uso cotidiano de plataformas de mensajeria para comunicacion institucional.
2. Consulta de documentos digitales en formato electronico.
3. Identificacion clara de necesidades: el personal ha manifestado interes en funcionalidades especificas como reportes automaticos de rendimiento academico.
4. Disposicion al cambio: la direccion ha expresado su voluntad de modernizar la gestion del instituto.

**Plan de Capacitacion:**

| Actividad | Descripcion | Duracion Estimada |
|-----------|-------------|-------------------|
| Capacitacion inicial | Sesion practica de 3 horas donde se explica el funcionamiento general del sistema y se recorren todos los modulos principales. | 3 horas |
| Manual de usuario | Documento escrito con instrucciones paso a paso para cada funcionalidad del sistema. | Entregable |
| Guias rapidas | Tarjetas de referencia con los procedimientos mas comunes (realizar examen, calificar tarea, publicar anuncio). | Entregable |
| Acompanamiento inicial | Seguimiento durante los primeros 5 dias habiles de uso para resolver dudas y ajustar el sistema segun sea necesario. | 5 dias |

## 18.2 Factibilidad Tecnica

La factibilidad tecnica evalua si la institucion cuenta con los recursos tecnologicos necesarios para implementar y operar el sistema.

**Infraestructura Hardware:**

| Recurso | Especificacion | Disponibilidad |
|---------|----------------|----------------|
| Computadoras de escritorio | Procesador Intel Core i5 o superior, 8 GB de RAM | Disponible |
| Conexion a Internet | 10 Mbps minimo | Disponible |
| Dispositivos moviles | Telefonos inteligentes y tablets con acceso a navegador web | Disponible |
| Proyector | Para capacitaciones y presentaciones | Disponible |

**Infraestructura de Software:**

| Componente | Ubicacion | Tecnologia | Notas |
|------------|-----------|------------|-------|
| Frontend (Angular) | Servidor estatico | Hosting estatico + CDN | Build optimizado |
| Backend (ASP.NET 8) | Servidor web | Web Service (API REST) | Kestrel / IIS |
| Base de Datos (SQL Server) | SQL Server local | SQL Server Express / Developer | Sin costo adicional |
| Dominio con SSL | Proveedor DNS | Certificados HTTPS | Let's Encrypt (gratuito) |

**Plataforma de Desarrollo:**
El sistema INSBAPA se desarrolla utilizando OpenCode, un agente de inteligencia artificial de codigo abierto que permite construir aplicaciones web sin costos de licenciamiento. Sus principales ventajas tecnicas incluyen:
- Codigo abierto: elimina los costos de licenciamiento asociados a plataformas propietarias.
- Flexibilidad: soporta multiples proveedores de modelos de lenguaje y entornos de desarrollo.
- Comunidad activa: documentacion y soporte tecnico disponible.
- Accesibilidad: disponible como interfaz de terminal, aplicacion de escritorio y extension de IDE.

## 18.3 Factibilidad Economica

La factibilidad economica analiza los costos asociados al desarrollo e implementacion del sistema, determinando si el proyecto es financieramente viable para la institucion.

**Costo del Sistema - Recursos Humanos:**

| Concepto | Costos |
|----------|--------|
| Recursos Humanos (capacitaciones) | Q 1,600.00 |
| 10% Imprevistos | Q 160.00 |
| 5% Gastos Operacionales | Q 80.00 |
| **Total** | **Q 1,840.00** |

**Hardware y Servicios:**

| Componente | Ubicacion | Tecnologia | Costo Anual (GTQ) |
|------------|-----------|------------|-------------------|
| Frontend (Angular) | Netlify / Vercel | Hosting estatico + CDN | Q 60.00 |
| Backend (ASP.NET 8) | Render / Azure | Web Service (API REST) | Q 200.00 |
| Base de Datos (SQL Server) | Azure SQL Database | SQL Server en la nube (Free Tier) | Q 200.00 |
| Dominio con SSL | Namecheap / GoDaddy | Certificados HTTPS | Q 60.00 |
| **Total** | | | **Q 520.00** |

**Costo Total Hardware y Servicios:**

| Concepto | Costos |
|----------|--------|
| Servicios requeridos | Q 520.00 |
| Subtotal | Q 520.00 |
| 10% imprevistos | Q 52.00 |
| **Total** | **Q 572.00** |

**Software (Desarrollo):**

| Etapa | Costo |
|-------|-------|
| Identificacion | Q 4,300.00 |
| Determinacion | Q 6,700.00 |
| Analisis | Q 5,300.00 |
| Diseno | Q 6,700.00 |
| Desarrollo | Q 16,500.00 |
| Pruebas | Q 8,800.00 |
| Implementacion | Q 5,500.00 |
| **Total Software** | **Q 53,800.00** |

**Resumen y Costo Total:**

| Concepto | Costo |
|----------|-------|
| Recursos Humanos | Q 1,840.00 |
| Hardware y servicios | Q 572.00 |
| Software | Q 53,800.00 |
| **Total** | **Q 56,212.00** |

---

# 19. CRONOGRAMA DEL PROYECTO

| Etapa | Duracion (semanas) | Semanas 1-2 | Semanas 3-4 | Semanas 5-6 | Semanas 7-8 | Semanas 9-10 | Semanas 11-12 |
|-------|-------------------|-------------|-------------|-------------|-------------|--------------|---------------|
| Identificacion | 2 | XXXX | | | | | |
| Determinacion | 2 | | XXXX | | | | |
| Analisis | 2 | | | XXXX | | | |
| Diseno | 2 | | | | XXXX | | |
| Desarrollo | 2 | | | | | XXXX | |
| Pruebas e Implementacion | 2 | | | | | | XXXX |

---

# 20. ANEXOS

## 20.1 Diagramas de Casos de Uso

[Insertar diagramas de casos de uso para cada portal: Estudiante, Profesor y Administrador]

### Caso de Uso: Gestion de Estudiantes (Admin)
- Registrar estudiante
- Editar estudiante
- Buscar estudiante
- Ver perfil de estudiante
- Desactivar estudiante

### Caso de Uso: Gestion de Tareas (Profesor)
- Crear tarea
- Editar tarea
- Calificar tarea
- Ver entregas
- Cerrar tarea

### Caso de Uso: Realizar Examen (Estudiante)
- Ver lista de examenes
- Iniciar examen
- Responder preguntas
- Enviar examen
- Ver resultados

### Caso de Uso: Gestion de Tokens (Admin)
- Generar token
- Listar tokens
- Desactivar token
- Ver uso de token

## 20.2 Diagramas de Secuencia

[Insertar diagramas de secuencia para los procesos criticos:
1. Auto-registro de estudiante
2. Realizacion de examen
3. Calificacion de tarea
4. Publicacion de anuncio]

## 20.3 Diagrama de Colaboracion

[Insertar diagrama de colaboracion que muestre la interaccion entre los actores del sistema]

## 20.4 Diagrama de Actividades

[Insertar diagrama de actividades para los procesos principales:
1. Flujo de login por rol
2. Flujo de examen con temporizador
3. Flujo de calificacion de tareas]

## 20.5 Entrevistas

[Insertar entrevistas realizadas al personal de la institucion:
- Director del instituto
- Coordinador Academico
- Profesores (muestra representativa)
- Personal administrativo]

## 20.6 Prototipo

El prototipo esta desplegado y funcional. Para iniciar sesion existen tres usuarios demo:

| Portal | Usuario | Contrasena |
|--------|---------|------------|
| Estudiante | estudiante | estudiante123 |
| Profesor | profesor | profesor123 |
| Administrador | admin | admin123 |

Codigo de matricula demo (auto-registro): REG-DEMO2026 (40 usos disponibles).

---

*Documento generado como parte de la planificacion del proyecto INSBAPA - Plataforma Educativa LMS.*
*Basado en la estructura del DERCAS de LexControl y adaptado al dominio educativo.*
