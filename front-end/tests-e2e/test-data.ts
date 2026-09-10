export const TEST_USERS = {
  student: {
    username: 'estudiante',
    password: 'estudiante123',
    role: 'Estudiante',
    rolRadio: 'estudiante' as const,
  },
  teacher: {
    username: 'profesor',
    password: 'profesor123',
    role: 'Profesor',
    rolRadio: 'profesor' as const,
  },
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'Administrador',
    rolRadio: 'administrador' as const,
  },
} as const;

export const BASE_URL = 'http://localhost:4200';
export const API_URL = 'http://localhost:5275';
