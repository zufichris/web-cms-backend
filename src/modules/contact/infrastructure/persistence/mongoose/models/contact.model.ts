
import { Schema, Document, Model, models, model } from 'mongoose';
import { Contact } from '@app/modules/contact/domain/entities';

type ContactDocument = Document & Contact;

const contactSchema = new Schema<ContactDocument>({
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

export const ContactModel: Model<ContactDocument> = models.Contact || model<ContactDocument>('Contact', contactSchema);