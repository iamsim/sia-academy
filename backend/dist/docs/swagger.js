import swaggerJsdoc from 'swagger-jsdoc';
export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SIA Academy API',
            version: '1.0.0',
            description: 'Backend APIs for SIA Academy frontend modules',
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
            },
        },
        paths: {
            '/health': {
                get: {
                    summary: 'Health check',
                    responses: { '200': { description: 'OK' } },
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
            '/api/attendance/summary': {
                get: {
                    summary: 'Attendance summary and daily counts',
                    parameters: [
                        { in: 'query', name: 'from', schema: { type: 'string' } },
                        { in: 'query', name: 'to', schema: { type: 'string' } },
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
});
