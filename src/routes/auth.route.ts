import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import {
    registerRequestSchema,
    loginRequestSchema,
    refreshRequestSchema,
    forgotPasswordRequestSchema,
    resetPasswordRequestSchema,
    changePasswordRequestSchema,
    logoutRequestSchema,
    verifEmailRequestSchema
} from '../schemas/auth.schema';
import { authMiddleware } from 'src/middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', validateRequest(registerRequestSchema), AuthController.register);
router.get('/verify-email', validateRequest(verifEmailRequestSchema), AuthController.emailverify);
router.post('/login', validateRequest(loginRequestSchema), AuthController.login);
router.post('/refresh', validateRequest(refreshRequestSchema), AuthController.refresh);
router.post('/forgot-password', validateRequest(forgotPasswordRequestSchema), AuthController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordRequestSchema), AuthController.resetPassword);

// Protected routes (authentication required)
router.post('/logout', validateRequest(logoutRequestSchema), AuthController.logout);
router.post('/logout-all', validateRequest(logoutRequestSchema), authMiddleware, AuthController.logoutAll);
router.post('/change-password', authMiddleware, validateRequest(changePasswordRequestSchema), AuthController.changePassword);

router.get('/me', authMiddleware, AuthController.mydetails);
export default router;