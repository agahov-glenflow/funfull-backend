// api/src/utils/prepareSwaggerOptions.js

const prepareSwaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Example API',
            version: '1.0.0',
            description: 'Backend API Documentation',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            responses: {
                NotFound: {
                    description: "Route not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    error: { type: "string", example: "Route not found" }
                                }
                            }
                        }
                    }
                }
            },
            schemas: {}
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./api/src/routers/*.js'], // path to routers
};

export default prepareSwaggerOptions;