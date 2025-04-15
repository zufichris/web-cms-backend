
import { z } from 'zod';
import { ParamIdValidationSchema } from '@app/shared';

const FomCoreSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').trim(),
});

export const CreateFomValidationSchema = FomCoreSchema.strict();
export const UpdateFomValidationSchemaBody = FomCoreSchema.partial().extend({
    id: ParamIdValidationSchema
}).strict();