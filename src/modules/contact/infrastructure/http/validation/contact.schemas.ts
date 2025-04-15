
import { z } from 'zod';
import { ParamIdValidationSchema } from '@app/shared';

const ContactCoreSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').trim(),
});

export const CreateContactValidationSchema = ContactCoreSchema.strict();
export const UpdateContactValidationSchemaBody = ContactCoreSchema.partial().extend({
    id: ParamIdValidationSchema
}).strict();