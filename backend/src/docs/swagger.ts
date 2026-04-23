import swaggerJsdoc from 'swagger-jsdoc'

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SIA Academy API',
      version: '1.0.0',
      description:
        'Backend APIs for SIA Academy. Each route is served both under `/api/...` (default for the Vite app) and without the prefix (e.g. `/students` and `/api/students`).',
    },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      schemas: {
        Student: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            age: { type: 'number' },
            belt: { type: 'string' },
            fatherName: { type: 'string' },
            motherName: { type: 'string' },
            address: { type: 'string' },
            primaryContactNumber: { type: 'string' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            eventName: { type: 'string' },
            place: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Member: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['Admin', 'Instructor', 'Member'] },
            isActive: { type: 'boolean' },
          },
        },
        MemberListResponse: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Member' } },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Member login (email must exist in members table)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: { type: 'string' },
                      displayName: { type: 'string' },
                    },
                  },
                },
              },
            },
            '401': { description: 'Invalid credentials or inactive member' },
          },
        },
      },
      '/api/members': {
        get: {
          summary: 'List members (paginated, searchable)',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'pageSize', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            {
              in: 'query',
              name: 'role',
              schema: { type: 'string', enum: ['All', 'Admin', 'Instructor', 'Member'], default: 'All' },
            },
          ],
          responses: {
            '200': {
              description: 'Paged member list',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/MemberListResponse' } },
              },
            },
          },
        },
        post: {
          summary: 'Create member',
          responses: {
            '201': { description: 'Created' },
            '409': { description: 'Email already in use' },
          },
        },
      },
      '/api/members/{id}': {
        put: {
          summary: 'Update member',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Updated' },
            '404': { description: 'Not found' },
            '409': { description: 'Email already in use' },
          },
        },
      },
      '/api/students': {
        get: {
          summary: 'List students',
          responses: {
            '200': {
              description: 'List of students',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } } } },
            },
          },
        },
        post: {
          summary: 'Create student',
          responses: { '201': { description: 'Student created' } },
        },
      },
      '/api/students/{id}': {
        put: {
          summary: 'Update student',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Updated student' },
            '404': { description: 'Not found' },
          },
        },
        delete: {
          summary: 'Delete student',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            '204': { description: 'Deleted' },
            '404': { description: 'Not found' },
          },
        },
      },
      '/api/payments': {
        get: { summary: 'List payments', responses: { '200': { description: 'OK' } } },
        post: { summary: 'Create payment', responses: { '201': { description: 'Created' } } },
      },
      '/api/events': {
        get: {
          summary: 'List events',
          responses: {
            '200': {
              description: 'List of events',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Event' } } } },
            },
          },
        },
        post: { summary: 'Create event', responses: { '201': { description: 'Created' } } },
      },
      '/api/events/{id}': {
        get: {
          summary: 'Get one event',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Event' },
            '404': { description: 'Not found' },
          },
        },
        put: {
          summary: 'Update event',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Updated' },
            '404': { description: 'Not found' },
          },
        },
        delete: {
          summary: 'Delete event',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: {
            '204': { description: 'Deleted' },
            '404': { description: 'Not found' },
          },
        },
      },
      '/api/attendance/summary': {
        get: {
          summary: 'Attendance summary and daily counts',
          parameters: [
            { in: 'query', name: 'from', schema: { type: 'string' } },
            { in: 'query', name: 'to', schema: { type: 'string' } },
            {
              in: 'query',
              name: 'today',
              schema: { type: 'string', format: 'date' },
              description: 'Which calendar day counts as "today" for todayCount (YYYY-MM-DD). Defaults to server local date.',
            },
          ],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/attendance/{date}': {
        get: {
          summary: 'Attendance entries for a date',
          parameters: [{ in: 'path', name: 'date', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
        put: {
          summary: 'Save attendance entries for a date',
          parameters: [{ in: 'path', name: 'date', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Saved' } },
        },
      },
    },
  },
  apis: [],
})
