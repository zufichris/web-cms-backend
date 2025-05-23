
import { Request, Response } from 'express';
import { ApiHandler, BaseController} from '@app/shared';
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

    create = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.createUserUseCase.run(req.body, this.getContext(req));
        if (result.success) logger.info(`Controller: Created User`, { id: result.data });
        res.json_structured(result);
    });

    getById = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.getUserUseCase.run(req.params.id, this.getContext(req));
        if (result.success) logger.info(`Controller: Retrieved User`, { id: req.params.id });
        res.json_structured(result)
    });

    getLoggedInUser = ApiHandler(async (req: Request, res: Response) => {
        res.json_structured({
            success: true,
            message: "User Retrieved Successfully",
            data: this.getContext(req),
            status: 200
        })
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
        const query = this.getQuery(['id', 'email', 'name', 'isActive', 'createdAt'], {
            maxLimit: 50,
            strict: true
        })(req.validated.query)
        const result = await this.queryUserUseCase.run(query, this.getContext(req));
        res.json_structured(result);
    });
}