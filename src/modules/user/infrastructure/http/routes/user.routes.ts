import { Router } from 'express';
import { UserController } from '@app/modules/user/infrastructure/http/controllers';
import { QueryUserUseCase, UpdateUserUseCase, GetUserUseCase, DeleteUserUseCase } from '@app/modules/user/domain/use-cases';
import { CreateUserUseCase } from '@app/modules/user/domain/use-cases';
import { MongooseUserRepository, UserModel } from '@app/modules/user';

export function createUserRouter(controller: UserController): Router {
    const router = Router();
    router.route('/')
        .get(controller.getAll)
        .post(controller.create);
    router.route("/me")
        .get(controller.getLoggedInUser)
    router.route('/:id')
        .get(controller.getById)
        .patch(controller.update)
        .delete(controller.delete);
    return router;
}


const userController = new UserController(
    new CreateUserUseCase(new MongooseUserRepository(UserModel)),
    new GetUserUseCase(new MongooseUserRepository(UserModel)),
    new UpdateUserUseCase(new MongooseUserRepository(UserModel)),
    new DeleteUserUseCase(new MongooseUserRepository(UserModel)),
    new QueryUserUseCase(new MongooseUserRepository(UserModel)),
);

export const userRoutes = createUserRouter(userController);