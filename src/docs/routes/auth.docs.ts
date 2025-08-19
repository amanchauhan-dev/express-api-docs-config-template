// auth.docs.ts
import { OpenAPIV3 } from "openapi-types";

const basePath = "/api/auth";
const tags = ["Auth"];

// 👇 now typed as OpenAPI PathsObject
const authDocs: OpenAPIV3.PathsObject = {
    [`${basePath}/register`]: {
        post: {
            tags,
            summary: "Register a new user",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                firstName: { type: "string", example: "John" },
                                lastName: { type: "string", example: "Doe" },
                                email: { type: "string", example: "john@example.com" },
                                password: { type: "string", example: "Pass@123" },
                            },
                            required: ["firstName", "lastName", "email", "password"],
                        } as OpenAPIV3.SchemaObject, // 👈 ensures IntelliSense
                    },
                },
            },
            responses: {
                201: { description: "User registered successfully" },
            },
        },
    },
    [`${basePath}/verify-email`]: {
        get: {
            tags,
            summary: "Verify a registered user email",
            description: "Verifies the user's email using the provided token",
            parameters: [
                {
                    name: "token",
                    in: "query", // <-- Important
                    required: true,
                    description: "The email verification token sent to the user",
                    schema: {
                        type: "string",
                    },
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
            ] as OpenAPIV3.ParameterObject[],
            responses: {
                200: {
                    description: "Email verified successfully",
                },
                400: {
                    description: "Invalid or expired token",
                },
            },
        },
    },
    [`${basePath}/login`]: {
        post: {
            tags,
            summary: "Login user",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: { type: "string", example: "john@example.com" },
                                password: { type: "string", example: "Pass2@123" },
                                rememberMe: { type: "boolean", example: false },
                            },
                            required: ["email", "password"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "Login successful" },
            },
        },
    },
    [`${basePath}/refresh`]: {
        post: {
            tags,
            summary: "Refresh access token",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                refreshToken: { type: "string", example: "token" },
                            },
                            required: ["refreshToken"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "Token refreshed successfully" },
            },
        },
    },
    [`${basePath}/forgot-password`]: {
        post: {
            tags,
            summary: "Get forgot passsword token",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: { type: "string", example: "john@example.com" },
                            },
                            required: ["email"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "If an account with that email exists, a password reset link has been sent." },
            },
        },
    },
    [`${basePath}/reset-password`]: {
        post: {
            tags,
            summary: "Change password with token",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                token: { type: "string", example: "df839ccdc1b7018d70f11d410b1279d4c11288c040809370f35252dbc42afba4" },
                                newPassword: { type: "string", example: "Pass2@123" },
                                confirmPassword: { type: "string", example: "Pass2@123" },
                            },
                            required: ["token", "newPassword", "confirmPassword"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "If an account with that email exists, a password reset link has been sent." },
            },
        },
    },
    [`${basePath}/logout`]: {
        post: {
            tags,
            summary: "Logout",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                refreshToken: { type: "string", example: "token" },
                            },
                            required: ["refreshToken"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "Logout successfully" },
            },
        },
    },
    [`${basePath}/logout-all`]: {
        post: {
            tags,
            summary: "Logout all",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                refreshToken: { type: "string", example: "token" },
                            },
                            required: ["refreshToken"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "Logout successfully" },
            },
        },
    },
    [`${basePath}/change-password`]: {
        post: {
            tags,
            summary: "Change password with old password",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                currentPassword: { type: "string", example: "pass@123" },
                                newPassword: { type: "string", example: "pass2@123" },
                                confirmPassword: { type: "string", example: "pass2@123" },
                            },
                            required: ["currentPassword", "newPassword", "confirmPassword"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "Password changed successfully" },
            },
        },
    },
};

export default authDocs;
