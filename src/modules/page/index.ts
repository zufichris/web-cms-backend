
export * from './domain';
export * from './application';
export * from './infrastructure';

import { Router } from 'express';
import {
    PageController, createPageRouter, PageModel, SectionModel, MongoPageRepository
} from './infrastructure';
import {
    CreatePageUseCase, GetPageUseCase, UpdatePageUseCase, DeletePageUseCase, QueryPageUseCase, AddPageSectionUseCase, GetPageSectionsUseCase, DeletePageSectionUseCase, AddBlockContentUseCase, DeleteBlockContentUseCase, UpdateBlockContentUseCase,
    GetPageSectionByIdUseCase
} from './domain/use-cases';
import { logger } from '@app/utils/logger';

export function initPageModule(): Router {
    const pageRepository = new MongoPageRepository(PageModel, SectionModel);

    const controller = new PageController(
        new CreatePageUseCase(pageRepository),
        new GetPageUseCase(pageRepository),
        new UpdatePageUseCase(pageRepository),
        new DeletePageUseCase(pageRepository),
        new QueryPageUseCase(pageRepository),
        new AddPageSectionUseCase(pageRepository),
        new GetPageSectionsUseCase(pageRepository),
        new GetPageSectionByIdUseCase(pageRepository),
        new DeletePageSectionUseCase(pageRepository),
        new AddBlockContentUseCase(pageRepository),
        new DeleteBlockContentUseCase(pageRepository),
        new UpdateBlockContentUseCase(pageRepository),
    )

    const router = createPageRouter(controller);
    logger.info('Page Module initialized successfully');
    return router;
}