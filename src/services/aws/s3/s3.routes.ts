import { createAuthMiddleware } from '@app/services/auth/auth.middleware';
import { Router } from 'express';
import { S3Controllers } from './s3.controllers';

export function createS3Router(controller: S3Controllers, authMiddleware: ReturnType<typeof createAuthMiddleware>): Router {
    const router = Router();
    router.route("/")
        .post(authMiddleware.authenticate, controller.uploadFile)
        .get(controller.listFiles)

    router.route("/:folder/:key")
        .get(controller.sendFile)
        .delete(authMiddleware.authenticate, controller.deleteFile)
    return router;
}