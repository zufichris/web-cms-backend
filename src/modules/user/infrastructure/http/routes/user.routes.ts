import { Router } from 'express';
import { UserController } from '@app/modules/user/infrastructure/http/controllers';
import { createAuthMiddleware } from '@app/services/auth/auth.middleware';
export function createUserRouter(controller: UserController, authMiddleware: ReturnType<typeof createAuthMiddleware>): Router {
    const router = Router();

    router.use(authMiddleware.authenticate)

    router.route('/')
        .get(authMiddleware.authorizeOwnerOrAdmin("ownerId"), controller.getAll)
        .post(authMiddleware.authorizeOwnerOrAdmin("ownerId"), controller.create);

    router.route("/me")
        .get(controller.getLoggedInUser)

    router.route('/:id')
        .get(controller.getById)
        .patch(authMiddleware.authorizeOwnerOrAdmin("ownerId"), controller.update)
        .delete(authMiddleware.authorizeOwnerOrAdmin("ownerId"), controller.delete);
    return router;
}