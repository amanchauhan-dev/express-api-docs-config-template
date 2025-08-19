import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TokenType } from '@prisma/client';
import { config } from '../config/config';
import { database } from 'src/config/database';

const prisma = database.prisma;

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                isActive: boolean;
            };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token required. Please provide a valid Bearer token.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT token
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired access token',
            });
        }

        // Check token type
        if (decoded.type !== TokenType.ACCESS) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type. Access token required.',
            });
        }

        // Check if token exists in database and is valid
        const storedToken = await prisma.token.findFirst({
            where: {
                token,
                type: TokenType.ACCESS,
                blacklisted: false,
                expires: { gt: new Date() },
                userId: decoded.sub as string,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: 'Token not found or has been revoked',
            });
        }

        // Check if user is still active
        if (!storedToken.user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Attach user to request
        req.user = storedToken.user;
        return next();


    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
        });
    }
};

// Role-based access control middleware
export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`,
            });
        }

        return next();
    };
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continue without user
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

            if (decoded.type === TokenType.ACCESS) {
                const storedToken = await prisma.token.findFirst({
                    where: {
                        token,
                        type: TokenType.ACCESS,
                        blacklisted: false,
                        expires: { gt: new Date() },
                        userId: decoded.sub as string,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                role: true,
                                isActive: true,
                            }
                        }
                    }
                });

                if (storedToken && storedToken.user.isActive) {
                    req.user = storedToken.user;
                }
            }
        } catch (error) {
            // Ignore token errors in optional auth
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue without user on error
    }
};