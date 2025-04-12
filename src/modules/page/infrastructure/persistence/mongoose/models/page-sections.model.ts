import { Section } from "@app/modules/page/domain";
import { Model, model } from "mongoose";
import { Document, models, Schema } from "mongoose";

const imageAssetSchema = new Schema({
    url: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    caption: { type: String },
}, { _id: false });

const linkDataSchema = new Schema({
    text: { type: String, required: true },
    url: { type: String, required: true },
    isExternal: { type: Boolean, required: true },
    ariaLabel: { type: String },
}, { _id: false });


const contentBlockSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
}, { discriminatorKey: 'type', _id: false });

const textBlockSchema = new Schema({
    content: { type: String, required: true },
}, { _id: false });

const headingBlockSchema = new Schema({
    content: { type: String, required: true },
    level: { type: Number, enum: [1, 2, 3, 4, 5, 6], required: true },
}, { _id: false });

const imageBlockSchema = new Schema({
    image: imageAssetSchema,
}, { _id: false });

const galleryBlockSchema = new Schema({
    images: [imageAssetSchema],
}, { _id: false });

const videoBlockSchema = new Schema({
    url: { type: String, required: true },
    thumbnailImage: imageAssetSchema,
    isEmbedded: { type: Boolean },
}, { _id: false });

const ctaBlockSchema = new Schema({
    heading: { type: String },
    text: { type: String, required: true },
    links: [linkDataSchema],
}, { _id: false });

const testimonialBlockSchema = new Schema({
    quote: { type: String, required: true },
    author: { type: String, required: true },
    role: { type: String },
    company: { type: String },
    avatar: imageAssetSchema,
}, { _id: false });

const featureItemSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    image: imageAssetSchema,
}, { _id: false });

const featuresBlockSchema = new Schema({
    heading: { type: String },
    description: { type: String },
    items: [featureItemSchema],
}, { _id: false });

const formBlockSchema = new Schema({
    formId: { type: String, required: true },
    heading: { type: String },
    description: { type: String },
}, { _id: false });

const customBlockSchema = new Schema({
    componentKey: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
}, { _id: false });

contentBlockSchema.discriminator('text', textBlockSchema);
contentBlockSchema.discriminator('heading', headingBlockSchema);
contentBlockSchema.discriminator('image', imageBlockSchema);
contentBlockSchema.discriminator('gallery', galleryBlockSchema);
contentBlockSchema.discriminator('video', videoBlockSchema);
contentBlockSchema.discriminator('cta', ctaBlockSchema);
contentBlockSchema.discriminator('testimonial', testimonialBlockSchema);
contentBlockSchema.discriminator('features', featuresBlockSchema);
contentBlockSchema.discriminator('form', formBlockSchema);
contentBlockSchema.discriminator('custom', customBlockSchema);

type SectionDoc = Section & Document

const sectionSchema = new Schema<SectionDoc>({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    blocks: [contentBlockSchema],
    pageId: {
        type: String,
        ref: "Page",
        required: true
    }
},
    {
        versionKey: false,
        toObject: {
            transform: (_, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            }
        },
        toJSON: {
            transform: (_, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            }
        }
    });


export const SectionModel: Model<SectionDoc> = models.Section || model('Section', sectionSchema)