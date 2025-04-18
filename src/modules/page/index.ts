
export * from './domain';
export * from './application';
export * from './infrastructure';
import { Router } from 'express';
import { PageModel } from './infrastructure/persistence/mongoose/models';
import { MongoPageRepository } from './infrastructure/persistence/mongoose/repositories';
import { PageController } from './infrastructure/http/controllers';
import { createPageRouter } from './infrastructure/http/routes';
import { CreatePageUseCase, GetPageUseCase, UpdatePageUseCase, DeletePageUseCase, QueryPageUseCase } from './domain/use-cases';
import { logger } from '@app/utils/logger';
import { SectionModel } from './infrastructure/persistence/mongoose/models/page-sections.model';

export function initPageModule(): Router {
    logger.info('Initializing Page Module...');
    const pageRepository = new MongoPageRepository(PageModel,SectionModel);
    const createUseCase = new CreatePageUseCase(pageRepository);
    const getUseCase = new GetPageUseCase(pageRepository);
    const updateUseCase = new UpdatePageUseCase(pageRepository);
    const deleteUseCase = new DeletePageUseCase(pageRepository);
    const queryUseCase = new QueryPageUseCase(pageRepository);
    const controller = new PageController(createUseCase, getUseCase, updateUseCase, deleteUseCase, queryUseCase);
    const router = createPageRouter(controller);
    logger.info('Page Module initialized successfully');
    return router;
}