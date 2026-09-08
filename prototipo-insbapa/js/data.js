/* ============================================================
   INSBAPA - Prototipo
   Datos quemados (sin base de datos) y credenciales de acceso
   ============================================================ */

/* ---------- Credenciales (se sobreescriben con cambios de Ajustes) ---------- */
const CREDENCIALES = {
  estudiante: {
    password: 'estudiante123',
    usuario: { id: 'USR-001', usuario: 'estudiante', nombre: 'María Fernanda López', rol: 'Estudiante', iniciales: 'ML', activo: true },
  },
  profesor: {
    password: 'profesor123',
    usuario: { id: 'USR-002', usuario: 'profesor', nombre: 'Prof. Alejandro García', rol: 'Profesor', iniciales: 'AG', activo: true },
  },
  admin: {
    password: 'admin123',
    usuario: { id: 'USR-003', usuario: 'admin', nombre: 'Administrador', rol: 'Administrador', iniciales: 'AD', activo: true },
  },
  'maria.lopez': {
    password: 'estudiante123',
    usuario: { id: 'USR-001', usuario: 'maria.lopez', nombre: 'María Fernanda López', rol: 'Estudiante', iniciales: 'ML', activo: true },
  },
  'a.garcia': {
    password: 'profesor123',
    usuario: { id: 'USR-002', usuario: 'a.garcia', nombre: 'Prof. Alejandro García', rol: 'Profesor', iniciales: 'AG', activo: true },
  },
};

/* ============================================================
   PORTAL ESTUDIANTE
   ============================================================ */

const EST_CURSOS = [
  {
    id: 'CUR-01', codigo: 'LENGUA', nombre: 'Lengua y Literatura', grado: 'Primero Básico',
    seccion: 'A', profesor: 'Prof. Martín Sosa', color: '#EAF4E8', colorText: '#3f7f35',
    progreso: 75, bloques: ['Primer Bloque', 'Segundo Bloque'],
    materiales: [
      { id: 'MAT-11', tipo: 'PDF', titulo: 'Unidad 1: Análisis literario', tam: '2.4 MB' },
      { id: 'MAT-12', tipo: 'Video', titulo: 'Clase grabada - Figuras literarias', tam: '18 min' },
      { id: 'MAT-13', tipo: 'PDF', titulo: 'Guía de lectura: Cien años de soledad', tam: '1.1 MB' },
    ],
  },
  {
    id: 'CUR-02', codigo: 'CIENCIAS', nombre: 'Ciencias Naturales', grado: 'Primero Básico',
    seccion: 'A', profesor: 'Prof. Valeria Gómez', color: '#FFFBE8', colorText: '#D97706',
    progreso: 60, bloques: ['Primer Bloque', 'Segundo Bloque'],
    materiales: [
      { id: 'MAT-21', tipo: 'PDF', titulo: 'Unidad 1: La célula', tam: '3.0 MB' },
      { id: 'MAT-22', tipo: 'Video', titulo: 'Laboratorio: Microscopía', tam: '22 min' },
    ],
  },
  {
    id: 'CUR-03', codigo: 'CALCULO', nombre: 'Cálculo Avanzado', grado: 'Segundo Básico',
    seccion: 'B', profesor: 'Prof. Luis Rivas', color: '#F3E8FF', colorText: '#7E22CE',
    progreso: 40, bloques: ['Segundo Bloque'],
    materiales: [
      { id: 'MAT-31', tipo: 'PDF', titulo: 'Unidad 2: Integrales', tam: '1.8 MB' },
    ],
  },
  {
    id: 'CUR-04', codigo: 'HISTORIA', nombre: 'Historia Moderna', grado: 'Tercero Básico',
    seccion: 'C', profesor: 'Prof. Carla Méndez', color: '#E0F2FE', colorText: '#0369A1',
    progreso: 85, bloques: ['Primer Bloque', 'Segundo Bloque'],
    materiales: [
      { id: 'MAT-41', tipo: 'PDF', titulo: 'Unidad final: Siglo XIX', tam: '2.2 MB' },
    ],
  },
];

const EST_TAREAS = [
  { id: 'TAR-01', curso: 'CALCULO', cursoNombre: 'Cálculo Avanzado', titulo: 'Cálculo Avanzado: Integrales', instrucciones: 'Resuelve los 10 ejercicios de integrales definidas. Muestra el procedimiento completo en cada uno. La tarea tiene carácter urgente.', fechaLimite: '2026-08-11', fecha: 'Mañana', estado: 'Pendiente', peso: 15, recursos: ['Texto Guía - Integrales.pdf', 'Plantilla de ejercicios.pdf'] },
  { id: 'TAR-02', curso: 'HISTORIA', cursoNombre: 'Historia Moderna', titulo: 'Control de lectura: Cien años de soledad', instrucciones: 'Revisa los comentarios del profesor en la pregunta de desarrollo.', fechaLimite: '2026-08-18', fecha: '12 días', estado: 'Pendiente', peso: 10, recursos: ['Guía.pdf'] },
  { id: 'TAR-03', curso: 'LENGUA', cursoNombre: 'Lengua y Literatura', titulo: 'Ensayo: figuras literarias', instrucciones: 'Escribe un ensayo de 500 palabras.', fechaLimite: '2026-08-05', fecha: 'Vencida', estado: 'Vencida', peso: 20, recursos: [] },
  { id: 'TAR-04', curso: 'CIENCIAS', cursoNombre: 'Ciencias Naturales', titulo: 'Laboratorio 3: Reacciones', instrucciones: 'Entrega el informe del laboratorio.', fechaLimite: '2026-07-30', fecha: 'Completada', estado: 'Completada', peso: 15, recursos: ['Plantilla informe.pdf'], entregaNota: 92 },
  { id: 'TAR-05', curso: 'HISTORIA', cursoNombre: 'Historia Moderna', titulo: 'Línea de tiempo: Siglo XIX', instrucciones: 'Construye la línea de tiempo.', fechaLimite: '2026-07-20', fecha: 'Completada', estado: 'Completada', peso: 10, recursos: [], entregaNota: 88 },
];

const EST_EXAMENES = [
  { id: 'EXA-01', curso: 'HISTORIA', cursoNombre: 'Historia Moderna', titulo: 'Examen: Siglo XIX', fecha: 'Vence en 2 días', estado: 'Proximo', duracion: 45, preguntas: 20, nota: null, realizadoEl: null },
  { id: 'EXA-02', curso: 'CALCULO', cursoNombre: 'Cálculo Avanzado', titulo: 'Examen Parcial: Integrales', fecha: 'Vence en 5 días', estado: 'Proximo', duracion: 60, preguntas: 15, nota: null, realizadoEl: null },
  { id: 'EXA-03', curso: 'LENGUA', cursoNombre: 'Lengua y Literatura', titulo: 'Examen: Comprensión lectora', fecha: 'Realizado', estado: 'Realizado', duracion: 45, preguntas: 20, nota: 95, realizadoEl: '2026-07-28' },
  { id: 'EXA-04', curso: 'CIENCIAS', cursoNombre: 'Ciencias Naturales', titulo: 'Examen Parcial: La célula', fecha: 'Realizado', estado: 'Realizado', duracion: 30, preguntas: 12, nota: 85, realizadoEl: '2026-07-15' },
];

/* Examen activo (para la simulación) */
const EXAMEN_ACTIVO = {
  id: 'EXA-01',
  curso: 'Historia Moderna',
  titulo: 'Examen: Siglo XIX',
  duracionMin: 45,
  preguntas: [
    { id: 'P1', tipo: 'opcion', texto: '¿Qué evento marca el inicio del siglo XIX en Europa?', opciones: ['La Revolución Francesa', 'La Primera Guerra Mundial', 'La Caída de Roma', 'El Descubrimiento de América'] },
    { id: 'P2', tipo: 'opcion', texto: '¿Cuál fue un resultado de la Revolución Industrial?', opciones: ['Expansión urbana', 'Descenso del comercio', 'Fin de la agricultura', 'Colonización de Asia'] },
    { id: 'P3', tipo: 'desarrollo', texto: 'Explica brevemente el concepto de liberalismo en el siglo XIX.' },
    { id: 'P4', tipo: 'opcion', texto: 'La independencia de Centroamérica se declaró en:', opciones: ['1821', '1800', '1850', '1901'] },
    { id: 'P5', tipo: 'opcion', texto: '¿Qué imperio dominó gran parte de Europa bajo Napoleón?', opciones: ['Imperio Francés', 'Imperio Otomano', 'Imperio Austrohúngaro', 'Imperio Ruso'] },
  ],
};

const EST_ANUNCIOS = [
  { id: 'ANC-01', categoria: 'Institucional', titulo: 'Mantenimiento de la Plataforma', resumen: 'El sistema estará fuera de línea el domingo por mantenimiento programado.', fecha: 'Hoy', leido: false },
  { id: 'ANC-02', categoria: 'Académico', titulo: 'Inscripciones para Talleres', resumen: 'Se abren las inscripciones para los talleres de arte, robótica y deporte.', fecha: 'Ayer', leido: false },
  { id: 'ANC-03', categoria: 'Comunidad', titulo: 'Bienvenidos al Nuevo Ciclo Escolar', resumen: 'Estimados estudiantes, estamos emocionados de darles la bienvenida al ciclo académico 2026.', fecha: 'Hace 2 días', leido: true },
  { id: 'ANC-04', categoria: 'Deportes', titulo: 'Torreo intercolegial de fútbol', resumen: 'Inscripciones abiertas para el torneo intercolegial.', fecha: 'Hace 4 días', leido: true },
];

const EST_NOTAS = [
  { curso: 'LENGUA', cursoNombre: 'Lengua y Literatura', tarea1: 88, examen1: 92, tarea2: 95, proyecto: 90, participacion: 94, promedio: 91.8, estado: 'Aprobado' },
  { curso: 'CIENCIAS', cursoNombre: 'Ciencias Naturales', tarea1: 85, examen1: 80, tarea2: 88, proyecto: 86, participacion: 90, promedio: 85.8, estado: 'Aprobado' },
  { curso: 'CALCULO', cursoNombre: 'Cálculo Avanzado', tarea1: 78, examen1: 82, tarea2: 75, proyecto: 80, participacion: 85, promedio: 80.0, estado: 'Aprobado' },
  { curso: 'HISTORIA', cursoNombre: 'Historia Moderna', tarea1: 92, examen1: 95, tarea2: 88, proyecto: 91, participacion: 93, promedio: 91.8, estado: 'Aprobado' },
];

/* ============================================================
   PORTAL PROFESORES
   ============================================================ */

const PRO_CLASES = [
  { id: 'CLS-01', materia: 'Matemáticas I', grado: 'Primero Básico', seccion: 'A', estudiantes: 28, color: '#EAF4E8', colorText: '#3f7f35' },
  { id: 'CLS-02', materia: 'Matemáticas I', grado: 'Primero Básico', seccion: 'B', estudiantes: 24, color: '#FFFBE8', colorText: '#D97706' },
  { id: 'CLS-03', materia: 'Matemáticas II', grado: 'Segundo Básico', seccion: 'A', estudiantes: 30, color: '#F3E8FF', colorText: '#7E22CE' },
  { id: 'CLS-04', materia: 'Matemáticas III', grado: 'Tercero Básico', seccion: 'A', estudiantes: 26, color: '#E0F2FE', colorText: '#0369A1' },
];

const PRO_TAREAS = [
  { id: 'PTAR-01', titulo: 'Ecuaciones lineales', materia: 'Matemáticas I', clase: 'CLS-01', grado: 'Primero Básico', seccion: 'A', fechaLimite: '2026-08-15', estado: 'Activa', entregadas: 12, total: 28, color: 'badge-primary' },
  { id: 'PTAR-02', titulo: 'Fracciones', materia: 'Matemáticas I', clase: 'CLS-02', grado: 'Primero Básico', seccion: 'B', fechaLimite: '2026-08-18', estado: 'Activa', entregadas: 9, total: 24, color: 'badge-primary' },
  { id: 'PTAR-03', titulo: 'Trigonometría', materia: 'Matemáticas II', clase: 'CLS-03', grado: 'Segundo Básico', seccion: 'A', fechaLimite: '2026-08-10', estado: 'Por Calificar', entregadas: 24, total: 30, color: 'badge-gold' },
  { id: 'PTAR-04', titulo: 'Ecuaciones cuadráticas', materia: 'Matemáticas III', clase: 'CLS-04', grado: 'Tercero Básico', seccion: 'A', fechaLimite: '2026-08-08', estado: 'Por Calificar', entregadas: 20, total: 26, color: 'badge-gold' },
  { id: 'PTAR-05', titulo: 'Operaciones básicas', materia: 'Matemáticas I', clase: 'CLS-01', grado: 'Primero Básico', seccion: 'A', fechaLimite: '2026-08-01', estado: 'Vencida', entregadas: 26, total: 28, color: 'badge-red' },
];

const PRO_ENTREGAS = [
  { estudiante: 'Juan Pérez', estado: 'Entregado', archivo: 'ecuaciones_juan.pdf', puntaje: 95 },
  { estudiante: 'Ana Castillo', estado: 'Entregado', archivo: 'ecuaciones_ana.pdf', puntaje: 88 },
  { estudiante: 'Luis Herrera', estado: 'Entregado', archivo: 'ecuaciones_luis.pdf', puntaje: null },
  { estudiante: 'María Fernanda López', estado: 'Entregado', archivo: 'ecuaciones_maria.pdf', puntaje: 90 },
  { estudiante: 'Pedro Ramírez', estado: 'Pendiente', archivo: null, puntaje: null },
  { estudiante: 'Sofía Morales', estado: 'Entregado', archivo: 'ecuaciones_sofia.pdf', puntaje: null },
];

const PRO_MATERIALES = [
  { carpeta: 'Unidad 1', items: ['Guía tema 1.pdf', 'Presentación tema 1.pptx', 'Video explicativo.mp4'] },
  { carpeta: 'Unidad 2', items: ['Guía tema 2.pdf', 'Taller de ejercicios.pdf'] },
  { carpeta: 'Exámenes', items: ['Examen parcial 1.pdf', 'Examen bimestral.pdf'] },
];

const PRO_EXAMENES = [
  { id: 'PEX-01', titulo: 'Examen Parcial: Ecuaciones', grado: 'Primero Básico', seccion: 'A', materia: 'Matemáticas I', duracion: 45, fecha: '2026-08-20', estado: 'Próximo', preguntas: 15, tipo: 'Mixto', puntaje: 100 },
  { id: 'PEX-02', titulo: 'Examen: Fracciones', grado: 'Primero Básico', seccion: 'B', materia: 'Matemáticas I', duracion: 30, fecha: '2026-08-18', estado: 'Próximo', preguntas: 10, tipo: 'Opción múltiple', puntaje: 100 },
  { id: 'PEX-03', titulo: 'Examen Parcial: Trigonometría', grado: 'Segundo Básico', seccion: 'A', materia: 'Matemáticas II', duracion: 60, fecha: '2026-07-25', estado: 'Finalizado', preguntas: 20, tipo: 'Mixto', puntaje: 100, promedio: 81.5, aprobados: 25, reprobados: 5 },
  { id: 'PEX-04', titulo: 'Examen: Ecuaciones cuadráticas', grado: 'Tercero Básico', seccion: 'A', materia: 'Matemáticas III', duracion: 45, fecha: '2026-07-20', estado: 'Finalizado', preguntas: 15, tipo: 'Desarrollo', puntaje: 100, promedio: 76.3, aprobados: 20, reprobados: 6 },
];

/* Preguntas de ejemplo por examen (el profesor las edita en el editor) */
const PRO_EXAMEN_PREGUNTAS = {
  'PEX-03': [
    { id: 1, tipo: 'opcion', texto: '¿Cuál es el seno de 30°?', opciones: ['0.5', '0.707', '1', '0.866'], correcta: 0, puntos: 10 },
    { id: 2, tipo: 'opcion', texto: 'En un triángulo rectángulo, la hipotenusa se calcula con:', opciones: ['Teorema de Pitágoras', 'Ley de Senos', 'Ley de Cosenos', 'Semejanza de triángulos'], correcta: 0, puntos: 10 },
    { id: 3, tipo: 'desarrollo', texto: 'Demuestra que sen²(x) + cos²(x) = 1 utilizando las definiciones en un triángulo rectángulo.', opciones: [], correcta: null, puntos: 20 },
    { id: 4, tipo: 'opcion', texto: '¿Cuál es el valor de tan(45°)?', opciones: ['0', '1', '1.414', '1.732'], correcta: 1, puntos: 10 },
    { id: 5, tipo: 'archivo', texto: 'Resuelve los 5 ejercicios de la guía de trigonometría y sube el archivo PDF con tu procedimiento completo.', opciones: [], correcta: null, puntos: 50 },
  ],
  'PEX-04': [
    { id: 1, tipo: 'opcion', texto: '¿Cuántas soluciones tiene una ecuación cuadrática con discriminante positivo?', opciones: ['Ninguna', 'Una', 'Dos', 'Infinitas'], correcta: 2, puntos: 15 },
    { id: 2, tipo: 'desarrollo', texto: 'Resuelve por completión de cuadrados: x² + 6x + 5 = 0', opciones: [], correcta: null, puntos: 25 },
    { id: 3, tipo: 'opcion', texto: '¿Cuál es la fórmula general para resolver ecuaciones cuadráticas?', opciones: ['x = -b ± √(b²-4ac) / 2a', 'x = b ± √(b²+4ac) / 2a', 'x = -b ± √(b²-4ac) / a', 'x = -b ± √(b²-2ac) / 2a'], correcta: 0, puntos: 15 },
    { id: 4, tipo: 'archivo', texto: 'Elabora un ensayo de 1 página sobre las aplicaciones de las ecuaciones cuadráticas en la vida cotidiana. Adjunta como PDF.', opciones: [], correcta: null, puntos: 45 },
  ],
  'PEX-01': [
    { id: 1, tipo: 'opcion', texto: '¿Cuál es el valor de x en 2x + 5 = 15?', opciones: ['5', '10', '7.5', '12'], correcta: 0, puntos: 10 },
    { id: 2, tipo: 'opcion', texto: '¿Qué tipo de ecuación es 3x - 7 = 2x + 1?', opciones: ['Cuadrática', 'Lineal', 'Cúbica', 'Exponencial'], correcta: 1, puntos: 10 },
    { id: 3, tipo: 'desarrollo', texto: 'Resuelve el sistema de ecuaciones: 2x + y = 10 y x - y = 2', opciones: [], correcta: null, puntos: 20 },
    { id: 4, tipo: 'opcion', texto: 'Si f(x) = 2x² - 3x + 1, ¿cuál es f(2)?', opciones: ['3', '7', '11', '15'], correcta: 0, puntos: 10 },
    { id: 5, tipo: 'archivo', texto: 'Sube una foto de tu procedimiento para los ejercicios del libro página 45.', opciones: [], correcta: null, puntos: 50 },
  ],
  'PEX-02': [
    { id: 1, tipo: 'opcion', texto: '¿Cuánto es 3/4 + 1/2?', opciones: ['5/4', '4/6', '5/8', '3/8'], correcta: 0, puntos: 10 },
    { id: 2, tipo: 'opcion', texto: '¿Cuál es el resultado de 2/3 × 3/5?', opciones: ['6/15', '5/8', '2/5', '1/2'], correcta: 0, puntos: 10 },
    { id: 3, tipo: 'desarrollo', texto: 'Explica con un ejemplo cotidiano por qué dividir por una fracción es multiplicar por su inverso.', opciones: [], correcta: null, puntos: 20 },
    { id: 4, tipo: 'opcion', texto: '¿Cuál es 1/2 ÷ 1/4?', opciones: ['1/8', '4/2', '2', '0.5'], correcta: 2, puntos: 10 },
    { id: 5, tipo: 'archivo', texto: 'Resuelve las 10 operaciones con fracciones de la hoja de trabajo y adjunta el archivo escaneado.', opciones: [], correcta: null, puntos: 50 },
  ],
};

const PRO_ANUNCIOS = [
  { id: 'PAN-01', titulo: 'Entrega de notas parciales', cuerpo: 'Favor completar las notas parciales antes del viernes.', destinatarios: '1ro Básico A, B', fecha: 'Hoy', estado: 'Publicado' },
  { id: 'PAN-02', titulo: 'Laboratorio 3', cuerpo: 'Laboratorio 3 por mantenimiento del Lab 2.', destinatarios: '3ro Básico A', fecha: 'Ayer', estado: 'Publicado' },
];

/* ============================================================
   PORTAL ADMINISTRADOR
   ============================================================ */

const ADMIN_CAMBIOS = [
  { evento: 'Prof. Mendez actualizó notas', responsable: 'A. Mendez', fecha: 'Hace 15 min', estado: 'COMPLETADO' },
  { evento: 'Nuevo anuncio institucional publicado', responsable: 'Coordinación', fecha: 'Hace 2 horas', estado: 'PÚBLICO' },
  { evento: 'Registro de 15 nuevos alumnos', responsable: 'Sistema', fecha: 'Ayer, 18:30', estado: 'SYNC' },
  { evento: 'Actualización de parches de seguridad', responsable: 'TI Admin', fecha: 'Ayer, 12:00', estado: 'EXITOSO' },
];

/* ---------- Cursos (admin) ---------- */
const ADMIN_CURSOS = [
  { id: 'AC-01', materia: 'Matemáticas I', grado: 'Primero Básico', seccion: 'A', profesor: 'Prof. Alejandro García', estudiantes: 28, color: '#EAF4E8', colorText: '#3f7f35' },
  { id: 'AC-02', materia: 'Matemáticas I', grado: 'Primero Básico', seccion: 'B', profesor: 'Prof. Laura Fernández', estudiantes: 24, color: '#FFFBE8', colorText: '#D97706' },
  { id: 'AC-03', materia: 'Matemáticas II', grado: 'Segundo Básico', seccion: 'A', profesor: 'Prof. Alejandro García', estudiantes: 30, color: '#F3E8FF', colorText: '#7E22CE' },
  { id: 'AC-04', materia: 'Matemáticas III', grado: 'Tercero Básico', seccion: 'A', profesor: 'Prof. Luis Rivas', estudiantes: 26, color: '#E0F2FE', colorText: '#0369A1' },
  { id: 'AC-05', materia: 'Lengua y Literatura', grado: 'Primero Básico', seccion: 'A', profesor: 'Prof. Martín Sosa', estudiantes: 28, color: '#EAF4E8', colorText: '#3f7f35' },
  { id: 'AC-06', materia: 'Ciencias Naturales', grado: 'Primero Básico', seccion: 'A', profesor: 'Prof. Valeria Gómez', estudiantes: 28, color: '#FEF3C7', colorText: '#B45309' },
];

/* ---------- Estudiantes (admin) ---------- */
const ADMIN_ESTUDIANTES = [
  { id: 'ES-001', carnet: '20260001', nombre: 'Juan Pérez', grado: 'Primero Básico', seccion: 'A', activo: true },
  { id: 'ES-002', carnet: '20260002', nombre: 'Ana Castillo', grado: 'Primero Básico', seccion: 'A', activo: true },
  { id: 'ES-003', carnet: '20260003', nombre: 'Luis Herrera', grado: 'Primero Básico', seccion: 'B', activo: true },
  { id: 'ES-004', carnet: '20250014', nombre: 'María Fernanda López', grado: 'Segundo Básico', seccion: 'A', activo: true },
  { id: 'ES-005', carnet: '20250015', nombre: 'Pedro Ramírez', grado: 'Segundo Básico', seccion: 'A', activo: false },
  { id: 'ES-006', carnet: '20240027', nombre: 'Sofía Morales', grado: 'Tercero Básico', seccion: 'A', activo: true },
  { id: 'ES-007', carnet: '20260007', nombre: 'Diego Fuentes', grado: 'Primero Básico', seccion: 'B', activo: true },
  { id: 'ES-008', carnet: '20250019', nombre: 'Valeria Roldán', grado: 'Segundo Básico', seccion: 'B', activo: true },
];

/* ---------- Profesores (admin) ---------- */
const ADMIN_PROFESORES = [
  { id: 'PR-01', nombre: 'Prof. Alejandro García', materia: 'Matemáticas I y II', cursos: 3, activo: true, correo: 'a.garcia@institute.edu' },
  { id: 'PR-02', nombre: 'Prof. Laura Fernández', materia: 'Matemáticas I', cursos: 2, activo: true, correo: 'l.fernandez@institute.edu' },
  { id: 'PR-03', nombre: 'Prof. Martín Sosa', materia: 'Lengua y Literatura', cursos: 4, activo: true, correo: 'm.sosa@institute.edu' },
  { id: 'PR-04', nombre: 'Prof. Valeria Gómez', materia: 'Ciencias Naturales', cursos: 3, activo: true, correo: 'v.gomez@institute.edu' },
  { id: 'PR-05', nombre: 'Prof. Luis Rivas', materia: 'Matemáticas III', cursos: 2, activo: true, correo: 'l.rivas@institute.edu' },
  { id: 'PR-06', nombre: 'Prof. Carla Méndez', materia: 'Historia Moderna', cursos: 2, activo: false, correo: 'c.mendez@institute.edu' },
];

/* ---------- Notas globales (admin) ---------- */
const ADMIN_NOTAS = [
  { grado: 'Primero Básico', promedio: 82.4, aprobados: 74, reprobados: 6, estudiantes: 80 },
  { grado: 'Segundo Básico', promedio: 78.9, aprobados: 68, reprobados: 12, estudiantes: 80 },
  { grado: 'Tercero Básico', promedio: 84.2, aprobados: 75, reprobados: 5, estudiantes: 80 },
];

/* ---------- Notas detalladas por grado y sección (admin) ---------- */
const ADMIN_NOTAS_DETALLE = [
  {
    grado: 'Primero Básico', seccion: 'A', aprobados: 38, reprobados: 2, promedio: 83.1,
    estudiantes: [
      { nombre: 'Juan Pérez', carnet: '20260001', tarea1: 88, examen1: 92, tarea2: 85, proyecto: 90, participacion: 88, promedio: 88.6 },
      { nombre: 'Ana Castillo', carnet: '20260002', tarea1: 85, examen1: 80, tarea2: 90, proyecto: 86, participacion: 82, promedio: 84.6 },
      { nombre: 'Carlos Méndez', carnet: '20260009', tarea1: 72, examen1: 68, tarea2: 70, proyecto: 75, participacion: 78, promedio: 72.6 },
      { nombre: 'Laura Gutiérrez', carnet: '20260010', tarea1: 95, examen1: 98, tarea2: 92, proyecto: 96, participacion: 94, promedio: 95.0 },
      { nombre: 'Roberto Díaz', carnet: '20260011', tarea1: 80, examen1: 75, tarea2: 82, proyecto: 78, participacion: 80, promedio: 79.0 },
    ],
  },
  {
    grado: 'Primero Básico', seccion: 'B', aprobados: 36, reprobados: 4, promedio: 80.7,
    estudiantes: [
      { nombre: 'Luis Herrera', carnet: '20260003', tarea1: 78, examen1: 82, tarea2: 75, proyecto: 80, participacion: 76, promedio: 78.2 },
      { nombre: 'Diego Fuentes', carnet: '20260007', tarea1: 90, examen1: 88, tarea2: 92, proyecto: 85, participacion: 90, promedio: 89.0 },
      { nombre: 'Sandra Rivas', carnet: '20260012', tarea1: 65, examen1: 60, tarea2: 68, proyecto: 70, participacion: 72, promedio: 67.0 },
      { nombre: 'Fernando López', carnet: '20260013', tarea1: 82, examen1: 85, tarea2: 80, proyecto: 88, participacion: 84, promedio: 83.8 },
      { nombre: 'Patricia Solís', carnet: '20260014', tarea1: 70, examen1: 72, tarea2: 68, proyecto: 74, participacion: 70, promedio: 70.8 },
    ],
  },
  {
    grado: 'Segundo Básico', seccion: 'A', aprobados: 34, reprobados: 6, promedio: 78.9,
    estudiantes: [
      { nombre: 'María Fernanda López', carnet: '20250014', tarea1: 92, examen1: 95, tarea2: 88, proyecto: 91, participacion: 93, promedio: 91.8 },
      { nombre: 'Pedro Ramírez', carnet: '20250015', tarea1: 70, examen1: 65, tarea2: 72, proyecto: 68, participacion: 70, promedio: 69.0 },
      { nombre: 'Andrea Castillo', carnet: '20250016', tarea1: 85, examen1: 88, tarea2: 82, proyecto: 90, participacion: 86, promedio: 86.2 },
      { nombre: 'Miguel Torres', carnet: '20250017', tarea1: 55, examen1: 50, tarea2: 58, proyecto: 60, participacion: 62, promedio: 57.0 },
      { nombre: 'Gabriela Ruiz', carnet: '20250018', tarea1: 88, examen1: 90, tarea2: 85, proyecto: 92, participacion: 88, promedio: 88.6 },
    ],
  },
  {
    grado: 'Segundo Básico', seccion: 'B', aprobados: 34, reprobados: 6, promedio: 79.2,
    estudiantes: [
      { nombre: 'Valeria Roldán', carnet: '20250019', tarea1: 80, examen1: 82, tarea2: 78, proyecto: 85, participacion: 80, promedio: 81.0 },
      { nombre: 'Jorge Méndez', carnet: '20250020', tarea1: 75, examen1: 70, tarea2: 72, proyecto: 78, participacion: 74, promedio: 73.8 },
      { nombre: 'Claudia Herrera', carnet: '20250021', tarea1: 90, examen1: 92, tarea2: 88, proyecto: 94, participacion: 90, promedio: 90.8 },
      { nombre: 'Raúl Vargas', carnet: '20250022', tarea1: 60, examen1: 55, tarea2: 62, proyecto: 58, participacion: 60, promedio: 59.0 },
      { nombre: 'Isabel Flores', carnet: '20250023', tarea1: 86, examen1: 88, tarea2: 84, proyecto: 90, participacion: 86, promedio: 86.8 },
    ],
  },
  {
    grado: 'Tercero Básico', seccion: 'A', aprobados: 38, reprobados: 2, promedio: 84.2,
    estudiantes: [
      { nombre: 'Sofía Morales', carnet: '20240027', tarea1: 90, examen1: 92, tarea2: 88, proyecto: 94, participacion: 90, promedio: 90.8 },
      { nombre: 'Alejandro Ruiz', carnet: '20240028', tarea1: 82, examen1: 85, tarea2: 80, proyecto: 86, participacion: 82, promedio: 83.0 },
      { nombre: 'Daniela Castro', carnet: '20240029', tarea1: 95, examen1: 98, tarea2: 92, proyecto: 96, participacion: 94, promedio: 95.0 },
      { nombre: 'Emilio Santos', carnet: '20240030', tarea1: 70, examen1: 65, tarea2: 68, proyecto: 72, participacion: 70, promedio: 69.0 },
      { nombre: 'Karla Pérez', carnet: '20240031', tarea1: 88, examen1: 90, tarea2: 86, proyecto: 92, participacion: 88, promedio: 88.8 },
    ],
  },
];

/* ---------- Anuncios institucionales (admin) ---------- */
const ADMIN_ANUNCIOS = [
  { id: 'AN-01', titulo: 'Bienvenidos al Nuevo Ciclo Escolar', cuerpo: 'Estimados estudiantes, estamos emocionados de darles la bienvenida al ciclo académico 2026.', destinatarios: 'Todos', fecha: 'Hace 2 días', estado: 'PÚBLICO' },
  { id: 'AN-02', titulo: 'Mantenimiento de la Plataforma', cuerpo: 'El sistema estará fuera de línea el domingo por mantenimiento programado.', destinatarios: 'Todos', fecha: 'Ayer', estado: 'PÚBLICO' },
  { id: 'AN-03', titulo: 'Inscripciones para Talleres', cuerpo: 'Se abren las inscripciones para los talleres de arte, robótica y deporte.', destinatarios: 'Estudiantes', fecha: 'Hoy', estado: 'BORRADOR' },
];

/* ---------- Mantenimiento (admin) ---------- */
const ADMIN_MANTENIMIENTO = [
  { id: 'MT-01', tipo: 'Mantenimiento programado', fecha: '2026-08-16', inicio: '02:00', fin: '04:00', estado: 'Programado', descripcion: 'Actualización de parches de seguridad del sistema.' },
  { id: 'MT-02', tipo: 'Respaldo de base de datos', fecha: '2026-08-20', inicio: '23:00', fin: '00:30', estado: 'Programado', descripcion: 'Respaldo semanal completo de la información académica.' },
  { id: 'MT-03', tipo: 'Actualización de plataforma', fecha: '2026-07-28', inicio: '02:00', fin: '04:00', estado: 'Completado', descripcion: 'Actualización de versión del LMS.' },
];

/* ============================================================
   AUTO-REGISTRO POR TOKEN (estudiantes)
   ============================================================ */

/* Grados y secciones disponibles (usados en registro.html y Tokens admin) */
const GRADOS_SECCIONES = [
  { grado: 'Primero Básico', secciones: ['A', 'B'] },
  { grado: 'Segundo Básico', secciones: ['A', 'B'] },
  { grado: 'Tercero Básico', secciones: ['A'] },
];

/* Tokens de matrícula (los cambios de usos/estado persisten en localStorage) */
const TOKENS_REGISTRO = [
  {
    id: 'TKN-001',
    token: 'REG-DEMO2026',
    descripcion: 'Matrícula 2026',
    rol: 'Estudiante',
    maximoUsos: 40,
    usosActual: 0,
    fechaExpiracion: '2026-12-31T23:59:59',
    activo: true,
  },
];