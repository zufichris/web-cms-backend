import { Request, Response } from 'express';
import { ApiHandler, TContext } from '@app/shared';
import { CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase, QueryUserUseCase } from '@app/modules/user/domain/use-cases';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from '@app/modules/user/application/dtos';
import { logger } from '@app/utils/logger';

export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserUseCase: GetUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly queryUserUseCase: QueryUserUseCase
    ) {}

    private getContext(req: Request): TContext {
        return (req as any).context || {};
    }

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.createUserUseCase.run(req.body as CreateUserDto, this.getContext(req));
        if (result.success) logger.info(`Controller: Created User with id: ${result.data.id}`);
        res.status(result.success ? 201 : 400).json(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.getUserUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info(`Controller: Retrieved User with id: ${req.params.id}`);
        res.status(result.success ? 200 : 404).json(result);
    });

    update = ApiHandler(async (req: Request, res: Response) => {
        const updateDto: UpdateUserDto = { id: req.params.id, ...req.body };
        const result = await this.updateUserUseCase.run(updateDto, this.getContext(req));
        if (result.success) logger.info(`Controller: Updated User with id: ${req.params.id}`);
        res.status(result.success ? 200 : 404).json(result);
    });

    delete = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.deleteUserUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info(`Controller: Deleted User with id: ${req.params.id}`);
        res.status(result.success ? 200 : 404).json(result);
    });

    getAll = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.queryUserUseCase.run(req.query as unknown as QueryUserDto, this.getContext(req));
        if (result.success) logger.info(`Controller: Queried Users with total: ${result.meta?.total}`);
        res.status(result.success ? 200 : 400).json(result);
    });
}