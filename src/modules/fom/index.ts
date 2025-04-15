
export * from './domain';
export * from './application';
export * from './infrastructure';
import { Router } from 'express';
import { FomModel } from './infrastructure/persistence/mongoose/models';
import { MongoFomRepository } from './infrastructure/persistence/mongoose/repositories';
import { FomController } from './infrastructure/http/controllers';
import { createFomRouter } from './infrastructure/http/routes';
import { CreateFomUseCase, GetFomUseCase, UpdateFomUseCase, DeleteFomUseCase, QueryFomUseCase } from './domain/use-cases';
import { logger } from '@app/utils/logger';

export function initFomModule(): Router {
    logger.info('Initializing Fom Module...');
    const fomRepository = new MongoFomRepository(FomModel);
    const createUseCase = new CreateFomUseCase(fomRepository);
    const getUseCase = new GetFomUseCase(fomRepository);
    const updateUseCase = new UpdateFomUseCase(fomRepository);
    const deleteUseCase = new DeleteFomUseCase(fomRepository);
    const queryUseCase = new QueryFomUseCase(fomRepository);
    const controller = new FomController(createUseCase, getUseCase, updateUseCase, deleteUseCase, queryUseCase);
    const router = createFomRouter(controller);
    logger.info('Fom Module initialized successfully');
    return router;
}