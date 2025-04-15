
import { z } from 'zod';
import { CreateContactValidationSchema, UpdateContactValidationSchemaBody} from '@app/modules/contact/infrastructure/http/validation';

export type CreateContactDto = z.infer<typeof CreateContactValidationSchema>;
export type UpdateContactDto = z.infer<typeof UpdateContactValidationSchemaBody> & { id: string };