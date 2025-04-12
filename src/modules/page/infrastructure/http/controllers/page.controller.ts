
import { Request, Response } from 'express';
import { ApiHandler, BaseController } from '@app/shared';
import {
    CreatePageUseCase,
    GetPageUseCase,
    UpdatePageUseCase,
    DeletePageUseCase,
    QueryPageUseCase
} from '@app/modules/page/domain/use-cases';
import { logger } from '@app/utils/logger';

export class PageController extends BaseController {
    constructor(
        private readonly createPageUseCase: CreatePageUseCase,
        private readonly getPageUseCase: GetPageUseCase,
        private readonly updatePageUseCase: UpdatePageUseCase,
        private readonly deletePageUseCase: DeletePageUseCase,
        private readonly queryPageUseCase: QueryPageUseCase
    ) {
        super();
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.createPageUseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info('Controller: Created Page', { id: result.data.id });
        res.json_structured(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.getPageUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Retrieved Page', { id: req.params.id });
        res.json_structured(result);
    });

    update = ApiHandler(async (req: Request, res: Response) => {
        const updateDto = { id: req.params.id, ...req.body };
        const result = await this.updatePageUseCase.run(updateDto, this.getContext(req));
        if (result.success) logger.info('Controller: Updated Page', { id: req.params.id });
        res.json_structured(result);
    });

    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.deletePageUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info('Controller: Deleted Page', { id: req.params.id });
        res.json_structured(result);
    });

    getAll = ApiHandler(async (req: Request, res: Response) => {
        const query = this.getQuery(['id', 'title', 'publishedAt', 'status', 'createdAt', 'slug', 'path'], {
            maxLimit: 50,
            strict: true
        })(req.validated.query);
        const result = await this.queryPageUseCase.run(query, this.getContext(req));
        res.json_structured(result);
    });
}