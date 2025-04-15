import { z } from 'zod';
import { ParamIdValidationSchema } from '@app/shared';
import { ContentBlockSchema, PageStatusEnum, SEODataSchema } from '@app/modules/page/domain';

const PageCoreSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    path: z.string().min(1, "Path is required")
        .startsWith("/", "Path must start with /"),
    seo: SEODataSchema,
    sections: z.array(
        z.object({
            name: z.string().min(1, "Section name is required"),
            slug: z.string().min(1, "Section slug is required")
                .regex(/^[a-z0-9-]+$/, "Section slug must contain only lowercase letters, numbers, and hyphens"),
            blocks: z.array(ContentBlockSchema),
        })
    ).nonempty("Page Requires atleast one Section"),
    template: z.string().optional(),
    status: PageStatusEnum.default("DRAFT"),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const CreatePageValidationSchema = PageCoreSchema.strict();
export const UpdatePageValidationSchemaBody = PageCoreSchema.partial().extend({
    id: ParamIdValidationSchema
}).strict();

