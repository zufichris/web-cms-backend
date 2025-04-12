
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

    return router;
}