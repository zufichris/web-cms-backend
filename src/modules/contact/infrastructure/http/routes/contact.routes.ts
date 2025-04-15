
import { Router } from 'express';
import { ContactController } from '@app/modules/contact';

export function createContactRouter(controller: ContactController): Router {
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