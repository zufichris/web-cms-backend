export * from './domain';
export * from './application';
export * from './infrastructure';
import { Router } from 'express';
import { UserModel } from './infrastructure/persistence/mongoose/models';
import { MongooseUserRepository } from './infrastructure/persistence/mongoose/repositories';
import { UserController } from './infrastructure/http/controllers';
import { createUserRouter } from './infrastructure/http/routes';
import { CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase, QueryUserUseCase } from './domain/use-cases';
import { logger } from '@app/utils/logger';

export function initUserModule(): Router {
    logger.info(`Initializing User Module...`);
    const userRepository = new MongooseUserRepository(UserModel);
    const createUseCase = new CreateUserUseCase(userRepository);
    const getUseCase = new GetUserUseCase(userRepository);
    const updateUseCase = new UpdateUserUseCase(userRepository);
    const deleteUseCase = new DeleteUserUseCase(userRepository);
    const queryUseCase = new QueryUserUseCase(userRepository);
    const controller = new UserController(createUseCase, getUseCase, updateUseCase, deleteUseCase, queryUseCase);
    const router = createUserRouter(controller);
    logger.info(`User Module initialized successfully`);
    return router;
}