
import { z } from 'zod';
import { CreateFomValidationSchema, UpdateFomValidationSchemaBody} from '@app/modules/fom/infrastructure/http/validation';

export type CreateFomDto = z.infer<typeof CreateFomValidationSchema>;
export type UpdateFomDto = z.infer<typeof UpdateFomValidationSchemaBody> & { id: string };