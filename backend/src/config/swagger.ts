import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'MediCore Hospital Management System (HMS) REST API',
      version: '1.0.0',
      description:
        'Production-grade enterprise backend API for Hospital Management System with Node.js, Express, TypeScript, Prisma, Supabase & PostgreSQL',
      contact: {
        name: 'MediCore Engineering',
        email: 'dev@medicore.hospital',
      },
    },

    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // Scan all route files, including files inside subfolders.
  apis: ['./src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
