import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { Application } from "express";
import authDocs from "./routes/auth.docs";
import indexDocs from "./routes/index.docs";
import { config } from "../config/config";
import oauthDocs from "./routes/oauth.docs";

export const setupSwagger = (app: Application) => {
    const swaggerDocument = {
        openapi: "3.0.0",
        info: {
            title: config.docs.title,
            version: config.docs.version,
            description: config.docs.description,
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            responses: {
                Unauthorized: {
                    description: "Authentication required",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "Unauthorized" },
                                },
                            },
                        },
                    },
                },
                InternalError: {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "Internal server error" },
                                },
                            },
                        },
                    },
                },
            },
        },
        paths: {
            ...indexDocs,
            ...oauthDocs,
            ...authDocs,
        },
    };

    const swaggerOptions: SwaggerUiOptions = {
        customSiteTitle: config.docs.title,
    };

    app.use(
        config.docs.route,
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, swaggerOptions)
    );
};
