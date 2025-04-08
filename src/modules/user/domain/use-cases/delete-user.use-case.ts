
import { BaseUserUseCase } from '@app/modules/user/domain/use-cases/base';
import { AppError } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';

export class DeleteUserUseCase extends BaseUserUseCase<string, boolean> {
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<boolean>> {
        try {
            const success = await this.userRepository.delete(id);
            if (!success) {
                logger.warn(`[${this.constructor.name}] User not found or deletion failed`, { id, context });
                throw AppError.notFound(`User with id '${id}' not found or could not be deleted`);
            }
            logger.info(`[${this.constructor.name}] Deleted User`, { id, context });
            return { success: true, message: 'User deleted successfully.', status: 200, data: true };
        } catch (error) {
            logger.error(`[${this.constructor.name}] Failed to delete User`, { error, id, context });
            throw error;
        }
    }
}