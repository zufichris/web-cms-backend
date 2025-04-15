
import { CreateFomDto } from '@app/modules/fom/application/dtos';
import { Fom } from '@app/modules/fom/domain/entities';
import { BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils';
import { CreateFomValidationSchema } from '../../infrastructure';
import { IFomRepository } from '../repositories';

export class CreateFomUseCase extends BaseUseCase<CreateFomDto, Fom, AuthContext> {
    constructor(private readonly fomRepository: IFomRepository) {
        super();
    }
    
    async beforeExecute(input: CreateFomDto): Promise<void> {
        CreateFomValidationSchema.parse(input);
    }
    
    async execute(input: CreateFomDto, context?: AuthContext): Promise<UsecaseResult<Fom>> {
        const entity = await this.fomRepository.create(input);
        return { 
            success: true, 
            message: 'Fom created successfully.', 
            status: 201, 
            data: entity 
        };
    }
}