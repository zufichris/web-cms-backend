import { Router } from 'express';
import { AuthControllers } from './auth.controllers';
import { createAuthMiddleware } from './auth.middleware';

export function createAuthRouter(controller: AuthControllers, authMiddleware: ReturnType<typeof createAuthMiddleware>): Router {
    const router = Router();
    router.post('/register', controller.register);
    router.post('/login', controller.login);
    router.post('/refresh-token', controller.refreshToken);
    router.get('/me', authMiddleware.authenticate, controller.getCurrentUser);
    router.post('/change-password', authMiddleware.authenticate, controller.changePassword);
    return router;
}