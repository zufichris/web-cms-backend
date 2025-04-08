import { z } from 'zod';
import { CreateUserValidationSchema, UpdateUserValidationSchemaBody} from '@app/modules/user/infrastructure/http/validation';

export type CreateUserDto = z.infer<typeof CreateUserValidationSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserValidationSchemaBody> & { id: string };
