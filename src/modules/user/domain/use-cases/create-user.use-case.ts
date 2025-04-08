
import { CreateUserDto } from '@app/modules/user/application/dtos';
import { User } from '@app/modules/user/domain/entities';
import { BaseUserUseCase } from '@app/modules/user/domain/use-cases/base';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';
import { hash } from 'node:crypto';
export class CreateUserUseCase extends BaseUserUseCase<CreateUserDto, User> {
    async execute(input: CreateUserDto, context?: AuthContext): Promise<UsecaseResult<User>> {
        try {
            logger.todo("Perform Proper Password Hashing");
            const data = {
                ...input,
                password: await hash(input.password, 'sha256'),
                isActive: true,
            }
            const entity = await this.userRepository.create(data);
            logger.info(`[${this.constructor.name}] Created User`, { id: entity.id, context });
            return { success: true, message: 'User created successfully.', status: 201, data: entity };
        } catch (error) {
            logger.error(`[${this.constructor.name}] Failed to create User`, { error, input, context });
            throw error;
        }
    }
}