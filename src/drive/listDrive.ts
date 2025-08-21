import { google } from "googleapis";
import { Request, Response } from "express";
import { config } from "../config/config";
export const listDriveFiles = async (req: Request, res: Response) => {
    try {
        const user = req.user; // assuming you attach user after auth middleware
        const oauth2Client = new google.auth.OAuth2(
            config.oauth.clientId,
            config.oauth.secret,
            `${config.oauth.clientUrl}/api/oauth/google/callback`
        );

        oauth2Client.setCredentials({
            access_token: user?.googleAccessToken,
            refresh_token: user?.googleRefreshToken,
        });

        const drive = google.drive({ version: "v3", auth: oauth2Client });

        const response = await drive.files.list({
            pageSize: 10,
            fields: "files(id, name)",
        });

        return res.send({ success: true, data: response?.data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch Drive files" });
    }
};
