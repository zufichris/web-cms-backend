
import { User } from '@app/modules/user/domain/entities';
import { AppError, BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IUserRepository } from '../repositories';

export class GetUserUseCase extends BaseUseCase<string, User, AuthContext> {
    constructor(private readonly userRepository: IUserRepository) {
        super()
    }
    async beforeExecute(id: string): Promise<void> {
            ParamIdValidationSchema.parse(id)
        }
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<User>> {
        try {
            const entity = await this.userRepository.findById(id).catch(_error => { })
            if (!entity) {
                logger.warn(`[${this.constructor.name}] User not found`, { id, context });
                throw AppError.notFound(`User with id '${id}' not found`);
            }
            logger.info(`[${this.constructor.name}] Retrieved User`, { id, context });
            return { success: true, message: 'User retrieved successfully.', status: 200, data: entity };
        } catch (error) {
            logger.error(`[${this.constructor.name}] Failed to get User`, { error, id, context });
            throw error;
        }
    }
}