
import { Request, Response } from 'express';
import { ApiHandler, BaseController } from '@app/shared';
import {
    CreateFomUseCase,
    GetFomUseCase,
    UpdateFomUseCase,
    DeleteFomUseCase,
    QueryFomUseCase
} from '@app/modules/fom/domain/use-cases';
import { logger } from '@app/utils/logger';

export class FomController extends BaseController {
    constructor(
        private readonly createFomUseCase: CreateFomUseCase,
        private readonly getFomUseCase: GetFomUseCase,
        private readonly updateFomUseCase: UpdateFomUseCase,
        private readonly deleteFomUseCase: DeleteFomUseCase,
        private readonly queryFomUseCase: QueryFomUseCase
    ) {
        super();
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.createFomUseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info('Controller: Created Fom', { id: result.data.id });
        res.json_structured(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.getFomUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Retrieved Fom', { id: req.params.id });
        res.json_structured(result);
    });

    update = ApiHandler(async (req: Request, res: Response) => {
        const updateDto = { id: req.params.id, ...req.body };
        const result = await this.updateFomUseCase.run(updateDto, this.getContext(req));
        if (result.success) logger.info('Controller: Updated Fom', { id: req.params.id });
        res.json_structured(result);
    });

    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.deleteFomUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Deleted Fom', { id: req.params.id });
        res.json_structured(result);
    });

    getAll = ApiHandler(async (req: Request, res: Response) => {
        const query = this.getQuery(['id', 'name', 'createdAt'], {
            maxLimit: 50,
            strict: true
        })(req.validated.query);
        const result = await this.queryFomUseCase.run(query, this.getContext(req));
        res.json_structured(result);
    });
}