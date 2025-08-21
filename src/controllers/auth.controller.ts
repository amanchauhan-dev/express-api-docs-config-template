import { Request, Response } from 'express';
import { Role, TokenType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/config';
import { database } from "../config/database"
import { cleanupExpiredTokens, generateJWTToken, generateRandomToken, hashPassword, revokeUserTokens, saveTokenToDatabase, verifyPassword } from '../helpers/auth.helpers';
import { registerEmail } from '../emails/register.email';
import { success } from 'zod';

const prisma = database.prisma;

// Token configuration

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
                errors: [{ field: 'email', message: 'Email already registered' }]
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`.trim(),
                email,
                password: hashedPassword,
                role: Role.USER,
                isActive: false,
            },
        });

        if (config.email.activate) {
            const token = generateJWTToken(user.id, "VERIFY_EMAIL");
            await saveTokenToDatabase(user.id, token, "VERIFY_EMAIL")
            // send verification email 
            await registerEmail({
                to: user.email,
                url: `${config.server.url}/api/auth/verify-email?token=${token}`
            })
            return res.status(201).json({
                success: true,
                message: "Please check your email inbox and verify your email",
            });
        }
        else {
            const newuser = await prisma.user.update({
                data: { isActive: true },
                where: { id: user.id }
            })
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: newuser
            });
        }


    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
        });
    }
};

export const emailverify = async (req: Request, res: Response) => {
    try {
        const { token } = req.query
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verify token is required',
            });
        }
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token.toString(), config.jwt.secret) as JwtPayload;
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }
        // check verify token
        if (decoded.type !== TokenType.VERIFY_EMAIL) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type',
            });
        }
        // Check if token exists in database and is valid
        const storedToken = await prisma.token.findFirst({
            where: {
                token: token.toString(),
                type: TokenType.VERIFY_EMAIL,
                blacklisted: false,
                expires: { gt: new Date() },
                userId: decoded.sub as string,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }
        // make active and blacklist this token
        await Promise.all([
            prisma.user.update({
                data: {
                    isActive: true
                }, where: {
                    id: storedToken.user.id
                }
            }),
            prisma.token.update({
                where: { id: storedToken.id },
                data: { blacklisted: true }
            })
        ])
        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        });
    } catch (error) {
        console.error('Email verify error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during verifying email',
        });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, rememberMe = false } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                tokens: {
                    where: {
                        blacklisted: false,
                        expires: { gt: new Date() }
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.',
            });
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Revoke old tokens if not remember me
        if (!rememberMe) {
            await revokeUserTokens(user.id);
        }

        // Generate new tokens
        const accessTokenValue = generateJWTToken(user.id, TokenType.ACCESS);
        const refreshTokenValue = generateJWTToken(user.id, TokenType.REFRESH);

        // Save new tokens to database
        await Promise.all([
            saveTokenToDatabase(user.id, accessTokenValue, TokenType.ACCESS),
            saveTokenToDatabase(user.id, refreshTokenValue, TokenType.REFRESH),
        ]);

        // Clean up expired tokens
        cleanupExpiredTokens();

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                },
                tokens: {
                    accessToken: accessTokenValue,
                    refreshToken: refreshTokenValue,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login',
        });
    }
};

export const mydetails = async (req: Request, res: Response) => {
    if (req.user) {
        return res.send({
            success: true,
            message: "Account details fetched successfully",
            data: req.user
        })
    }
    return res.status(400).send({
        success: false,
        message: "Failed to fetch account details",
    })
}

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        // Verify JWT token
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
        }

        // Check token type
        if (decoded.type !== TokenType.REFRESH) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type',
            });
        }

        // Check if token exists in database and is valid
        const storedToken = await prisma.token.findFirst({
            where: {
                token: refreshToken,
                type: TokenType.REFRESH,
                blacklisted: false,
                expires: { gt: new Date() },
                userId: decoded.sub as string,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                    }
                }
            }
        });

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
        }

        // Check if user is still active
        if (!storedToken.user.isActive) {
            // Revoke all tokens for inactive user
            await revokeUserTokens(storedToken.user.id);
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Generate new access token
        const newAccessToken = generateJWTToken(storedToken.user.id, TokenType.ACCESS);

        // Save new access token to database
        await saveTokenToDatabase(storedToken.user.id, newAccessToken, TokenType.ACCESS);

        // Clean up expired tokens
        cleanupExpiredTokens();

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                user: storedToken.user,
            },
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh',
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(' ')[1]; // Bearer token

        if (!refreshToken && !accessToken) {
            return res.status(400).json({
                success: false,
                message: 'No tokens provided for logout',
            });
        }

        // Get user ID from access token if available
        let userId: string | null = null;
        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, config.jwt.secret) as JwtPayload;
                userId = decoded.sub as string;
            } catch (error) {
                // Token might be expired, try refresh token
            }
        }

        // If no userId from access token, try refresh token
        if (!userId && refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;
                userId = decoded.sub as string;
            } catch (error) {
                // Both tokens invalid
            }
        }

        if (userId) {
            // Blacklist specific tokens
            const tokensToBlacklist = [];
            if (accessToken) tokensToBlacklist.push(accessToken);
            if (refreshToken) tokensToBlacklist.push(refreshToken);

            if (tokensToBlacklist.length > 0) {
                await prisma.token.updateMany({
                    where: {
                        token: { in: tokensToBlacklist },
                        userId,
                    },
                    data: { blacklisted: true }
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
        });
    }
};

export const logoutAll = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(' ')[1];

        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Access token required',
            });
        }

        // Get user ID from access token
        const decoded = jwt.verify(accessToken, config.jwt.secret) as JwtPayload;
        const userId = decoded.sub as string;

        // Blacklist all user tokens
        await revokeUserTokens(userId);

        return res.status(200).json({
            success: true,
            message: 'Logged out from all devices successfully',
        });
    } catch (error) {
        console.error('Logout all error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during logout all',
        });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
        }

        // Generate password reset token
        const resetToken = generateRandomToken();

        // Save reset token to database
        await saveTokenToDatabase(user.id, resetToken, TokenType.RESET_PASSWORD);

        // In production, send this via email
        if (config.email.activate) {

            await registerEmail({
                to: user.email,
                url: `${resetToken}`
            })
        } else {
            console.warn('Reset Token:' + resetToken);
        }
        return res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            // Remove this in production
            resetToken,
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during password reset request',
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        // Find valid reset token
        const resetToken = await prisma.token.findFirst({
            where: {
                token,
                type: TokenType.RESET_PASSWORD,
                blacklisted: false,
                expires: { gt: new Date() },
            },
            include: {
                user: true,
            }
        });

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

        // Update user password and blacklist reset token
        await Promise.all([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword }
            }),
            prisma.token.update({
                where: { id: resetToken.id },
                data: { blacklisted: true }
            }),
            // Revoke all existing tokens for security
            revokeUserTokens(resetToken.userId)
        ]);

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during password reset',
        });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const { currentPassword, newPassword } = req.body;
        const accessToken = authHeader?.split(' ')[1];

        const userId = req.user?.id as string;

        // Find user and verify current password
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        // Optionally revoke all tokens except current one for security
        await prisma.token.updateMany({
            where: {
                userId,
                NOT: { token: accessToken }
            },
            data: { blacklisted: true }
        });

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during password change',
        });
    }
};