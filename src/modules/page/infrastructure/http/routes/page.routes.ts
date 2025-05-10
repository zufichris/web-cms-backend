
import { Router } from 'express';
import { PageController } from '@app/modules/page';
import { createAuthMiddleware } from '@app/services/auth/auth.middleware';

export function createPageRouter(controller: PageController, authMiddleware: ReturnType<typeof createAuthMiddleware>): Router {
    const router = Router();

    router.use(authMiddleware.authenticate, authMiddleware.authorizeOwnerOrAdmin("ownerId")).route('/')
        .get(controller.getAll)
        .post(controller.create);

    router.route('/:id')
        .get(controller.getById)
        .patch(authMiddleware.authenticate, authMiddleware.authorizeOwnerOrAdmin("ownerId"), controller.update)
        .delete(authMiddleware.authenticate, authMiddleware.authorizeOwnerOrAdmin("ownerId"), controller.delete);

    router.route("/:pageId/sections")
        .post(controller.addSection)
        .get(controller.getSections)

    router.route("/:pageId/sections/:sectionId")
        .delete(controller.deleteSection)
        .get(controller.getSectionById)

    router.use(authMiddleware.authenticate, authMiddleware.authorizeOwnerOrAdmin("ownerId")).route("/:pageId/sections/:sectionId/blocks")
        .post(controller.addContentBlock)

    router.use(authMiddleware.authenticate, authMiddleware.authorizeOwnerOrAdmin("ownerId")).route("/:pageId/sections/:sectionId/blocks/:blockKey")
        .patch(controller.updateContentBlock)
        .delete(controller.deleteContentBlock)

    return router;
}