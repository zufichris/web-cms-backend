import { z } from "zod";
import { BaseEntitySchema } from '@app/shared';

export const ImageAssetSchema = z.object({
    id: z.string(),
    url: z.string().url(),
    alt: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    caption: z.string().optional(),
});

export const LinkDataSchema = z.object({
    id: z.string(),
    text: z.string(),
    url: z.string(),
    isExternal: z.boolean(),
    ariaLabel: z.string().optional(),
});

export const SEODataSchema = z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    ogImage: ImageAssetSchema.optional(),
    canonicalUrl: z.string().url().optional(),
    noIndex: z.boolean().optional(),
    structuredData: z.record(z.any()).optional(),
});

export const TextBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("text"),
    content: z.string(),
});

export const HeadingBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("heading"),
    content: z.string(),
    level: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
    ]),
});

export const ImageBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("image"),
    image: ImageAssetSchema,
});

export const GalleryBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("gallery"),
    images: z.array(ImageAssetSchema),
});

export const VideoBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("video"),
    url: z.string({
        required_error: "video url required",
        invalid_type_error: "video url must be a string"
    }).url({
        message: "Invalid video url"
    }),
    thumbnailImage: ImageAssetSchema.optional(),
    isEmbedded: z.boolean().optional(),
});

export const CTABlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("cta"),
    heading: z.string().optional(),
    text: z.string(),
    links: z.array(LinkDataSchema),
});

export const TestimonialBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("testimonial"),
    quote: z.string(),
    author: z.string(),
    role: z.string().optional(),
    company: z.string().optional(),
    avatar: ImageAssetSchema.optional(),
});

export const FeatureItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    image: ImageAssetSchema.optional(),
});

export const FeaturesBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("features"),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(FeatureItemSchema),
});

export const FormBlockDataSchema = z.object({
    id: z.string(),
    type: z.literal("form"),
    formId: z.string(),
    heading: z.string().optional(),
    description: z.string().optional(),
});

export const CustomBlockDataSchema = z.object({
    type: z.literal("custom"),
    componentKey: z.string(),
    data: z.record(z.any()),
    id:z.string()
});

export const ContentBlockSchema = z.discriminatedUnion("type", [
    TextBlockDataSchema,
    HeadingBlockDataSchema,
    ImageBlockDataSchema,
    GalleryBlockDataSchema,
    VideoBlockDataSchema,
    CTABlockDataSchema,
    TestimonialBlockDataSchema,
    FeaturesBlockDataSchema,
    FormBlockDataSchema,
    CustomBlockDataSchema,
]);

export const SectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    blocks: z.record(z.string(), ContentBlockSchema),
    pageId: z.string()
});

export const PageStatusEnum = z.enum([
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
]);



export const PageSchema = BaseEntitySchema.extend({
    title: z.string(),
    slug: z.string(),
    path: z.string(),
    seo: SEODataSchema,
    sections: z.array(SectionSchema).optional(),
    template: z.string().optional(),
    publishedAt: z.string().datetime().optional(),
    status: PageStatusEnum,
    metadata: z.record(z.any()).optional(),
});


export type ImageAsset = z.infer<typeof ImageAssetSchema>;
export type LinkData = z.infer<typeof LinkDataSchema>;
export type SEOData = z.infer<typeof SEODataSchema>;
export type TextBlockData = z.infer<typeof TextBlockDataSchema>;
export type HeadingBlockData = z.infer<typeof HeadingBlockDataSchema>;
export type ImageBlockData = z.infer<typeof ImageBlockDataSchema>;
export type GalleryBlockData = z.infer<typeof GalleryBlockDataSchema>;
export type VideoBlockData = z.infer<typeof VideoBlockDataSchema>;
export type TestimonialBlockData = z.infer<typeof TestimonialBlockDataSchema>;
export type FeaturesBlockData = z.infer<typeof FeaturesBlockDataSchema>;
export type FormBlockData = z.infer<typeof FormBlockDataSchema>;
export type CustomBlockData = z.infer<typeof CustomBlockDataSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type PageStatus = z.infer<typeof PageStatusEnum>;
export type Page = z.infer<typeof PageSchema>;