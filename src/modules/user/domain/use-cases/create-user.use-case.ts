
import { CreateUserDto } from '@app/modules/user/application/dtos';
import { User } from '@app/modules/user/domain/entities';
import { AppError, BaseUseCase, UsecaseResult } from '@app/shared';
import { AuthContext } from '@app/shared';
import { logger } from '@app/utils/logger';
import bcrypt from "bcrypt"
import { CreateUserValidationSchema } from '../../infrastructure';
import { UserRole } from '../enums';
import { IUserRepository } from '../repositories';

export class CreateUserUseCase extends BaseUseCase<CreateUserDto, User, AuthContext> {
    constructor(private readonly userRepository: IUserRepository) {
        super()
    }
    async beforeExecute(input: User): Promise<void> {
        CreateUserValidationSchema.parse(input)
    }

    async execute(input: CreateUserDto, context?: AuthContext): Promise<UsecaseResult<User>> {
        const hashedPassword = await bcrypt.hash(input.password, 10)
        const data = {
            ...input,
            role: UserRole.USER,
            password: hashedPassword,
            isActive: true,
        }
        const exists = await this.userRepository.findByEmail(input.email).catch(_ => { })
        if (exists) {
            throw AppError.conflict("email taken, please try another email")
        }
        const entity = await this.userRepository.create(data);
        logger.info(`[${this.constructor.name}] Created User`, { id: entity.id, context });
        return { success: true, message: 'User created successfully.', status: 201, data: entity };
    }

}
