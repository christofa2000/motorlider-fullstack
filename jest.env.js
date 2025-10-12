// Configuración de variables de entorno para tests
// Este archivo se ejecuta antes de cada test suite

// Configurar variables de entorno para tests
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.ADMIN_TOKEN = "test-admin-token";

// Configurar Prisma para tests
process.env.PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION = "true";
