import { ParamIdValidationSchema } from '@app/shared';
import { z } from 'zod';
const UserCoreSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').trim(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const CreateUserValidationSchema = UserCoreSchema.strict();
export const UpdateUserValidationSchemaBody = UserCoreSchema.partial().extend({
    id: ParamIdValidationSchema
}).strict();