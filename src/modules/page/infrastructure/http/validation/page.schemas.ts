import { z } from 'zod';
import { ParamIdValidationSchema } from '@app/shared';
import { ContentBlockSchema, PageStatusEnum, SectionSchema, SEODataSchema } from '@app/modules/page/domain';

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
    ).optional().default([]),
    template: z.string().optional(),
    status: PageStatusEnum.default("DRAFT"),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const CreatePageValidationSchema = PageCoreSchema.strict();
export const UpdatePageValidationSchemaBody = PageCoreSchema.partial().extend({
    id: ParamIdValidationSchema
}).strict();
export const AddPageSectionValidationSchema = SectionSchema.omit({
    id: true
}).extend({
    name: z.coerce.string({
        invalid_type_error: "Section Name must be a string",
        required_error: "Section Name is Required"
    }),
    slug: z.coerce.string({
        invalid_type_error: "Section slug must be a string",
        required_error: "Section slug is Required"
    }).toLowerCase(),
    blocks: SectionSchema.shape.blocks.optional().default({}),
    pageId: ParamIdValidationSchema
})

export const AddContentBlockValidationSchema = z.object({
    sectionId: ParamIdValidationSchema,
    block: ContentBlockSchema,
    key: z.string({
        message: "Block key is required",
        invalid_type_error: "Block key must be a string"
    })
})
