
import { Router } from 'express';
import { FomController } from '@app/modules/fom';

export function createFomRouter(controller: FomController): Router {
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