
import { z } from 'zod';
import { CreatePageValidationSchema, UpdatePageValidationSchemaBody} from '@app/modules/page/infrastructure/http/validation';

export type CreatePageDto = z.infer<typeof CreatePageValidationSchema>;
export type UpdatePageDto = z.infer<typeof UpdatePageValidationSchemaBody> & { id: string };