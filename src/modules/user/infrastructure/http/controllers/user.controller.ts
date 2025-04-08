
import { Request, Response } from 'express';
import { ApiHandler, AuthContext, BaseController } from '@app/shared';
import {
    CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase, QueryUserUseCase
} from '@app/modules/user/domain/use-cases';
import { UpdateUserDto } from '@app/modules/user/application/dtos';
import { logger } from '@app/utils/logger';
export class UserController extends BaseController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserUseCase: GetUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly queryUserUseCase: QueryUserUseCase
    ) {
        super();
    }

    private getContext(req: Request): AuthContext {
        return req.validated?.user;
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.createUserUseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info(`Controller: Created User`, { id: result.data.id });
        res.json_structured(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.getUserUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info(`Controller: Retrieved User`, { id: req.params.id });
        res.status(result.success ? 200 : 404).json(result);
    });

    update = ApiHandler(async (req: Request, res: Response) => {
        const updateDto: UpdateUserDto = { id: req.params.id, ...req.body };
        const result = await this.updateUserUseCase.run(updateDto, this.getContext(req));
        if (result.success) logger.info(`Controller: Updated User`, { id: req.params.id });
        res.json_structured(result);
    });

    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.deleteUserUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info(`Controller: Deleted User`, { id: req.params.id });
        res.json_structured(result);
    });

    getAll = ApiHandler(async (req: Request, res: Response) => {
        const query = this.getQuery(['id', 'email', 'name', 'isActive', 'createdAt'])(req.validated?.query)
        logger.debug("Controller: Query", { query });
        const result = await this.queryUserUseCase.run(query, this.getContext(req));
        if (result.success) logger.info(`Controller: Queried Users`);
        res.json_structured(result);
    });
}