
import { Request, Response } from 'express';
import { ApiHandler, BaseController } from '@app/shared';
import {
    CreatePageUseCase,
    GetPageUseCase,
    UpdatePageUseCase,
    DeletePageUseCase,
    QueryPageUseCase,
    AddBlockContentUseCase,
    GetPageSectionsUseCase,
    DeletePageSectionUseCase,
    DeleteBlockContentUseCase,
    UpdateBlockContentUseCase,
    AddPageSectionUseCase,
    GetPageSectionByIdUseCase
} from '@app/modules/page/domain/';
import { logger } from '@app/utils/logger';
import { AddContentBlockDto, AddPageSectionDto } from '@app/modules/page/application';

export class PageController extends BaseController {
    constructor(
        private readonly createPageUseCase: CreatePageUseCase,
        private readonly getPageUseCase: GetPageUseCase,
        private readonly updatePageUseCase: UpdatePageUseCase,
        private readonly deletePageUseCase: DeletePageUseCase,
        private readonly queryPageUseCase: QueryPageUseCase,
        private readonly addSectionUseCase: AddPageSectionUseCase,
        private readonly getSectionsUseCase: GetPageSectionsUseCase,
        private readonly getSectionByIdUseCase:GetPageSectionByIdUseCase,
        private readonly deleteSectionUseCase: DeletePageSectionUseCase,
        private readonly addContentBlockUseCase: AddBlockContentUseCase,
        private readonly deleteContentBlockUseCase: DeleteBlockContentUseCase,
        private readonly updateContentBlockUseCase: UpdateBlockContentUseCase
    ) {
        super();
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.createPageUseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info('Controller: Created Page', { id: result.data });
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

    addSection = ApiHandler(async (req: Request, res: Response) => {
        const pageId = req.params.pageId
        const data = {
            pageId,
            ...(req.validated.body as Record<string, unknown>)
        } as AddPageSectionDto
        const result = await this.addSectionUseCase.run(data, this.getContext(req));
        if (result.success) logger.info('Controller: Added section', { id: result.data });
        res.json_structured(result);
    });

    getSections = ApiHandler(async (req: Request, res: Response) => {
        const pageId = req.params.pageId

        const result = await this.getSectionsUseCase.run({
            pageId
        }, this.getContext(req));
        if (result.success) logger.info('Controller: Retrieved sections', { id: result.data });
        res.json_structured(result);
    })

    getSectionById= ApiHandler(async (req: Request, res: Response) => {
        const pageId = req.params.pageId
        const sectionId = req.params.sectionId

        const result = await this.getSectionByIdUseCase.run({
            pageId,
            sectionId
        }, this.getContext(req));
        res.json_structured(result);
    })

    deleteSection = ApiHandler(async (req: Request, res: Response) => {
        const sectionId = req.params.sectionId

        const result = await this.deleteSectionUseCase.run({
            sectionId
        }, this.getContext(req));
        if (result.success) logger.info('Controller: Deleted section', { id: result.data });
        res.json_structured(result);
    });

    addContentBlock = ApiHandler(async (req: Request, res: Response) => {
        const sectionId = req.params.sectionId
        const data = {
            sectionId,
            ...(req.validated.body as Record<string, unknown>),
        } as AddContentBlockDto
        const result = await this.addContentBlockUseCase.run(data, this.getContext(req));
        if (result.success) logger.info('Controller: Added block', { id: result.data });
        res.json_structured(result);
    });

    updateContentBlock = ApiHandler(async (req: Request, res: Response) => {
        const data = {
            block: req.body,
            key: req.params.blockKey,
            sectionId: req.params.sectionId
        }
        const result = await this.updateContentBlockUseCase.run(data, this.getContext(req));
        if (result.success) logger.info('Controller: Updated block', { id: result.data });
        res.json_structured(result);
    });

    deleteContentBlock = ApiHandler(async (req: Request, res: Response) => {
        const sectionId = req.params.sectionId
        const blockKey = req.params.blockKey
        const result = await this.deleteContentBlockUseCase.run({
            sectionId,
            key: blockKey
        }, this.getContext(req));
        if (result.success) logger.info('Controller: Deleted block', { id: result.data });
        res.json_structured(result);
    });

}