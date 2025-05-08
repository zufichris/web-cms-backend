
import { Router } from 'express';
import { PageController } from '@app/modules/page';

export function createPageRouter(controller: PageController): Router {
    const router = Router();

    router.route('/')
        .get(controller.getAll)
        .post(controller.create);

    router.route('/:id')
        .get(controller.getById)
        .patch(controller.update)
        .delete(controller.delete);

    router.route("/:pageId/sections")
        .post(controller.addSection)

    router.route("/:pageId/sections/:sectionId/blocks")
        .post(controller.addContentBlock)

    return router;
}