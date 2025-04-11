
import { Schema, Document, Model, models, model } from 'mongoose';
import { Page, PageStatusEnum, SEOData } from '@app/modules/page/domain/entities';

type PageDocument = Page & Document;


const seoSchema = new Schema<SEOData>({
    title: { type: String, required: true, unique: true },
    description: String,
    noIndex: Boolean,
    keywords: [String],
    canonicalUrl: String,
    ogImage: {
        url: String,
        alt: String,
        height: String,
        width: String,
        caption: String,
    }
}, {
    _id: false,
    versionKey: false
})

const pageSchema = new Schema<PageDocument>({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    path: {
        type: String,
        unique: true,
        required: true
    },
    seo: {
        type: seoSchema
    },
    status: {
        type: String,
        enum: Object.values(PageStatusEnum.Enum),
        default: PageStatusEnum.Enum.DRAFT
    },
    template: String,
    publishedAt: {
        type: Date
    },
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true,
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

export const PageModel: Model<PageDocument> = models.Page || model<PageDocument>('Page', pageSchema);