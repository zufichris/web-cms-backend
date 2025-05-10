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
import { createAuthMiddleware } from '@app/services/auth/auth.middleware';
import { AuthService } from '@app/services/auth/auth.service';

export function initUserModule(): Router {
    const userRepository = new MongooseUserRepository(UserModel);

    const controller = new UserController(
        new CreateUserUseCase(userRepository),
        new GetUserUseCase(userRepository),
        new UpdateUserUseCase(userRepository),
        new DeleteUserUseCase(userRepository),
        new QueryUserUseCase(userRepository),
    );

    const authMiddleware = createAuthMiddleware(new AuthService(userRepository))

    const router = createUserRouter(controller, authMiddleware);
    logger.info(`User Module initialized successfully`);
    return router;
}