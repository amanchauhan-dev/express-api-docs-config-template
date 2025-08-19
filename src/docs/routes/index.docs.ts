import { OpenAPIV3 } from "openapi-types";
import { config } from "../../config/config"

const basePath = '';
const tags = ["Home"]
const indexDocs: OpenAPIV3.PathsObject = {
    [`${basePath}/health`]: {
        get: {
            tags: tags,
            summary: 'Health Check',
            responses: {
                200: {
                    description: 'Successful login',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: "boolean" },
                                    message: { type: "string", example: "Server is healthy" },
                                    timestamp: { type: "string", example: "2025-08-17T06:53:55.686Z" },
                                    uptime: { type: "number", example: 31.765062 },
                                    environment: { type: "string", example: "development" },
                                    database: { type: "string", example: "connected" }
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    [`${basePath}/test-email`]: {
        post: {
            tags: tags,
            summary: 'Health Check',
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: { type: "string", example: config.email.address }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Successful login'
                },
            },
        },
    },

};

export default indexDocs;
