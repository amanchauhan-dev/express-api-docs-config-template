import crypto from 'crypto';
import { database } from "../config/database"
import { config } from '../config/config';
import { TokenType } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = database.prisma;

const TOKEN_CONFIG = {
    access: {
        expiresIn: `${config.jwt.token.access.expirationMinutes}m`,
        expirationMinutes: config.jwt.token.access.expirationMinutes,
    },
    refresh: {
        expiresIn: `${config.jwt.token.refresh.expirationDays}d`,
        expirationDays: config.jwt.token.refresh.expirationDays,
    },
    resetPassword: {
        expiresIn: `${config.jwt.token.resetPassword.expirationMinutes}m`,
        expirationHours: config.jwt.token.resetPassword.expirationMinutes,
    },
    verifyEmail: {
        expiresIn: `${config.jwt.token.verifyEmail.expirationMinutes}m`,
        expirationHours: config.jwt.token.verifyEmail.expirationMinutes,
    },
};

// Generate JWT token
export const generateJWTToken = (userId: string, type: TokenType): string => {
    const payload = {
        sub: userId,
        type,
        iat: Math.floor(Date.now() / 1000)
    };

    const expiresIn = type === TokenType.ACCESS
        ? TOKEN_CONFIG.access.expiresIn
        : TOKEN_CONFIG.refresh.expiresIn;

    return jwt.sign(payload, config.jwt.secret, { expiresIn: expiresIn as any });
};

// Generate random token for email verification/password reset
export const generateRandomToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Calculate expiration date
const getExpirationDate = (type: TokenType): Date => {
    const now = new Date();

    switch (type) {
        case TokenType.ACCESS:
            return new Date(now.getTime() + TOKEN_CONFIG.access.expirationMinutes * 60 * 1000);
        case TokenType.REFRESH:
            return new Date(now.getTime() + TOKEN_CONFIG.refresh.expirationDays * 24 * 60 * 60 * 1000);
        case TokenType.RESET_PASSWORD:
            return new Date(now.getTime() + TOKEN_CONFIG.resetPassword.expirationHours * 60 * 60 * 1000);
        case TokenType.VERIFY_EMAIL:
            return new Date(now.getTime() + TOKEN_CONFIG.verifyEmail.expirationHours * 60 * 60 * 1000); //1h
        default:
            return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour default
    }
};

// Save token to database
export const saveTokenToDatabase = async (userId: string, token: string, type: TokenType) => {
    const expires = getExpirationDate(type);

    return await prisma.token.create({
        data: {
            userId,
            token,
            type,
            expires,
        },
    });
};

// Clean up expired tokens
export const cleanupExpiredTokens = async () => {
    await prisma.token.deleteMany({
        where: {
            OR: [
                { expires: { lt: new Date() } },
                { blacklisted: true }
            ]
        }
    });
};

// Revoke all user tokens of specific type
export const revokeUserTokens = async (userId: string, type?: TokenType) => {
    const where: any = { userId };
    if (type) where.type = type;

    await prisma.token.updateMany({
        where,
        data: { blacklisted: true }
    });
};



export const hashPassword = (password: string) => {
    return bcrypt.hash(password, config.bcrypt.saltRounds)
}


export const verifyPassword = (plain: string, hash: string) => {
    return bcrypt.compare(plain, hash)
}