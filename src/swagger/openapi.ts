export const swaggerSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Hotel Management Backend',
    version: '1.0.0',
    description: 'Backend foundation and health documentation',
  },
  servers: [
    {
      url: '/api/v1',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: {
          200: {
            description: 'Health status',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new customer account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login and receive tokens',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate refresh token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RefreshTokenRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token rotated',
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout current device',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out',
          },
        },
      },
    },
    '/auth/logout-all': {
      post: {
        summary: 'Logout all devices',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out from all devices',
          },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'Request password reset',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ForgotPasswordRequest',
              },
            },
          },
        },
        responses: {
          202: {
            description: 'Reset request accepted',
          },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Reset password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ResetPasswordRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successful',
          },
        },
      },
    },
    '/auth/change-password': {
      post: {
        summary: 'Change password',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChangePasswordRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password changed',
          },
        },
      },
    },
    '/auth/email-verification/verify': {
      post: {
        summary: 'Verify email',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VerifyEmailRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email verified',
          },
        },
      },
    },
    '/auth/email-verification/resend': {
      post: {
        summary: 'Resend verification email',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Verification email resent',
          },
        },
      },
    },
    '/customers': { get: { tags: ['Customers'], summary: 'List customers', responses: { 200: { description: 'Success' } } } },
    '/bookings': { get: { tags: ['Bookings'], summary: 'List bookings', responses: { 200: { description: 'Success' } } } },
    '/booking-guests': { get: { tags: ['Booking Guests'], summary: 'List booking guests', responses: { 200: { description: 'Success' } } } },
    '/check-in': { get: { tags: ['Check-In'], summary: 'List check-ins', responses: { 200: { description: 'Success' } } } },
    '/check-out': { get: { tags: ['Check-Out'], summary: 'List check-outs', responses: { 200: { description: 'Success' } } } },
    '/housekeeping': { get: { tags: ['Housekeeping'], summary: 'List housekeeping tasks', responses: { 200: { description: 'Success' } } } },
    '/invoices': { get: { tags: ['Invoices'], summary: 'List invoices', responses: { 200: { description: 'Success' } } } },
    '/invoice-items': { get: { tags: ['Invoice Items'], summary: 'List invoice items', responses: { 200: { description: 'Success' } } } },
    '/payments': { get: { tags: ['Payments'], summary: 'List payments', responses: { 200: { description: 'Success' } } } },
    '/payment-allocations': { get: { tags: ['Payment Allocations'], summary: 'List payment allocations', responses: { 200: { description: 'Success' } } } },
    '/refunds': { get: { tags: ['Refunds'], summary: 'List refunds', responses: { 200: { description: 'Success' } } } },
    '/reports/revenue': { get: { tags: ['Reports'], summary: 'Get revenue summary', responses: { 200: { description: 'Success' } } } },
    '/reports/outstanding-invoices': { get: { tags: ['Reports'], summary: 'Get outstanding invoices', responses: { 200: { description: 'Success' } } } },
    '/reports/payment-history': { get: { tags: ['Reports'], summary: 'Get payment history', responses: { 200: { description: 'Success' } } } },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'displayName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          displayName: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
        },
      },
      VerifyEmailRequest: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
    },
  },
};
