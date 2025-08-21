// auth.docs.ts
import { OpenAPIV3 } from "openapi-types";

const basePath = "/api/oauth";
const tags = ["OAuth"];

const oauthDocs: OpenAPIV3.PathsObject = {
    [`${basePath}/google`]: {
        get: {
            tags,
            summary: "Redirect to Google OAuth login",
            description:
                "This endpoint redirects the user to the Google OAuth 2.0 consent screen. " +
                "It cannot be tested directly in Swagger UI because it requires a browser redirect.",
            responses: {
                302: {
                    description: "Redirects to Google OAuth 2.0 consent screen",
                    headers: {
                        Location: {
                            schema: { type: "string", example: "https://accounts.google.com/o/oauth2/v2/auth?..." },
                            description: "The URL of the Google OAuth consent screen",
                        },
                    },
                },
            },
        },
    }, [`${basePath}/google/drive`]: {
        get: {
            tags,
            summary: "My drive",
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: "Account details fetched successfully" },
            },
        },
    },
};

export default oauthDocs;
