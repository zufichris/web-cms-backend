
import { Request, Response } from 'express';
import { ApiHandler, BaseController } from '@app/shared';
import {
    CreateContactUseCase,
    GetContactUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    QueryContactUseCase
} from '@app/modules/contact/domain/use-cases';
import { logger } from '@app/utils/logger';

export class ContactController extends BaseController {
    constructor(
        private readonly createContactUseCase: CreateContactUseCase,
        private readonly getContactUseCase: GetContactUseCase,
        private readonly updateContactUseCase: UpdateContactUseCase,
        private readonly deleteContactUseCase: DeleteContactUseCase,
        private readonly queryContactUseCase: QueryContactUseCase
    ) {
        super();
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.createContactUseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info('Controller: Created Contact', { id: result.data.id });
        res.json_structured(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.getContactUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Retrieved Contact', { id: req.params.id });
        res.json_structured(result);
    });

    update = ApiHandler(async (req: Request, res: Response) => {
        const updateDto = { id: req.params.id, ...req.body };
        const result = await this.updateContactUseCase.run(updateDto, this.getContext(req));
        if (result.success) logger.info('Controller: Updated Contact', { id: req.params.id });
        res.json_structured(result);
    });

    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.deleteContactUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Deleted Contact', { id: req.params.id });
        res.json_structured(result);
    });

    getAll = ApiHandler(async (req: Request, res: Response) => {
        const query = this.getQuery(['id', 'name', 'createdAt'], {
            maxLimit: 50,
            strict: true
        })(req.validated.query);
        const result = await this.queryContactUseCase.run(query, this.getContext(req));
        res.json_structured(result);
    });
}