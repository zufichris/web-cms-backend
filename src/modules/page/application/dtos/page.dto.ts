
import { z } from 'zod';
import { CreatePageValidationSchema, UpdatePageValidationSchemaBody, AddPageSectionValidationSchema, AddContentBlockValidationSchema, UpdateContentBlockValidationSchema } from '@app/modules/page/infrastructure/http/validation';
import { ContentBlock } from '../../domain';

export type CreatePageDto = z.infer<typeof CreatePageValidationSchema>;
export type UpdatePageDto = z.infer<typeof UpdatePageValidationSchemaBody> & { id: string };
export type AddPageSectionDto = z.infer<typeof AddPageSectionValidationSchema>
export type AddContentBlockDto = z.infer<typeof AddContentBlockValidationSchema>
export type UpdateContentBlockDto = z.infer<typeof UpdateContentBlockValidationSchema> & {
    block: ContentBlock
}
