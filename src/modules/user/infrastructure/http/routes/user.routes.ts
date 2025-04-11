import { Router } from 'express';
import { UserController } from '@app/modules/user/infrastructure/http/controllers';
export function createUserRouter(controller: UserController): Router {
    const router = Router();
    router.route('/')
        .get(controller.getAll)
        .post(controller.create);
    router.route("/me")
        .get(controller.getLoggedInUser)
    router.route('/:id')
        .get(controller.getById)
        .patch(controller.update)
        .delete(controller.delete);
    return router;
}