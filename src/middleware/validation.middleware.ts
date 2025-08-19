import { NextFunction, Response, Request } from "express";
import { ZodError, ZodObject } from "zod";

// Alternative: If you want to validate different parts of the request
export const validateRequest = (schema: ZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = await schema.parseAsync({
                body: { ...req.body },
                params: { ...req.params },
                query: { ...req.query },
            });
            if (req.body)
                Object.assign(req.body, validatedData.body);
            if (req.query)
                Object.assign(req.params, validatedData.params);
            if (req.query)
                Object.assign(req.query, validatedData.query);

            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errorMessages,
                });
            }
            console.log('❌ error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during validation',
            });
        }
    };