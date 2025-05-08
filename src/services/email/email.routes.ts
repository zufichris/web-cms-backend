import { Router } from 'express';
import { EmailServiceControllers } from './email.controllers';


export function createEmailServiceRouter(controller: EmailServiceControllers): Router {
    const router = Router();
    router.post('/send-mail', controller.sendMail);
    router.get('/get-templates', controller.sendMail);
    return router;
}