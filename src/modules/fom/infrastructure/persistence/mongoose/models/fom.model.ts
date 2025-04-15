
import { Schema, Document, Model, models, model } from 'mongoose';
import { Fom } from '@app/modules/fom/domain/entities';

type FomDocument = Document & Fom;

const fomSchema = new Schema<FomDocument>({
    name: { type: String },
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

export const FomModel: Model<FomDocument> = models.Fom || model<FomDocument>('Fom', fomSchema);