
import { Fom } from '@app/modules/fom/domain/entities';
import { BaseUseCase, ParamIdValidationSchema } from '@app/shared';
import { AuthContext } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IFomRepository } from '../repositories';

export class GetFomUseCase extends BaseUseCase<string, Fom, AuthContext> {
    constructor(private readonly fomRepository: IFomRepository) {
        super();
    }
    
    async beforeExecute(id: string): Promise<void> {
        ParamIdValidationSchema.parse(id);
    }
    
    async execute(id: string, context?: AuthContext): Promise<UsecaseResult<Fom>> {
        try {
            const entity = await this.fomRepository.findById(id);
            return { 
                success: true, 
                message: 'Fom retrieved successfully.', 
                status: 200, 
                data: entity 
            };
        } catch (error) {
            logger.error(this.constructor.name.concat(":Failed"), { error, id, context });
            throw error;
        }
    }
}