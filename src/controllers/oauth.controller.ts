import { Request, Response } from "express";
import { database } from "../config/database";
import { generateJWTToken, saveTokenToDatabase } from "../helpers/auth.helpers";
import { TokenType } from "@prisma/client";

const prisma = database.prisma

export const oauthCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user) return res.status(401).json({ message: "Authentication failed" });

        // Issue JWT tokens like your normal login
        const accessTokenValue = generateJWTToken(user.id, TokenType.ACCESS);
        const refreshTokenValue = generateJWTToken(user.id, TokenType.REFRESH);

        // Save new tokens to database
        await Promise.all([
            saveTokenToDatabase(user.id, accessTokenValue, TokenType.ACCESS),
            saveTokenToDatabase(user.id, refreshTokenValue, TokenType.REFRESH),
        ]);

        // Send to frontend (could redirect instead)
        return res.send({ accessTokenValue, refreshTokenValue })
    } catch (error: any) {
        return res.status(500).json({ message: "OAuth error", error: error?.message });
    }
};
