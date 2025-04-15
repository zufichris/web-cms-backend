
import { UpdateFomDto } from '@app/modules/fom/application/dtos';
import { Fom } from '@app/modules/fom/domain/entities';
import { BaseUseCase } from '@app/shared';
import { UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';
import { IFomRepository } from '../repositories';
import { UpdateFomValidationSchemaBody } from '../../infrastructure';

export class UpdateFomUseCase extends BaseUseCase<UpdateFomDto, Fom, AuthContext> {
    constructor(private readonly fomRepository: IFomRepository) {
        super();
    }

    async beforeExecute(input: UpdateFomDto, context: AuthContext): Promise<void> {
        UpdateFomValidationSchemaBody.parse(input);
        await this.fomRepository.findById(input.id);
    }
    
    async execute(input: UpdateFomDto, context?: AuthContext): Promise<UsecaseResult<Fom>> {
        const { id, ...updateData } = input;
        const entity = await this.fomRepository.update(id, updateData);
        return { 
            success: true, 
            message: 'Fom updated successfully.', 
            status: 200, 
            data: entity 
        };
    }
}