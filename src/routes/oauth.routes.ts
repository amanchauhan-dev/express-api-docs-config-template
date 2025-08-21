import { Router } from "express";
import passport from "../strategies/google.strategy";
import { oauthCallback } from "../controllers/oauth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { listDriveFiles } from "../drive/listDrive";

const router = Router();

router.get(
    "/google",
    passport.authenticate("google", {
        scope: [
            "profile",
            "email",
            "https://www.googleapis.com/auth/drive"
        ],
        accessType: "offline",
        prompt: "consent",
    }),
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    oauthCallback
);

router.get("/google/drive", authMiddleware, listDriveFiles);


export default router;
