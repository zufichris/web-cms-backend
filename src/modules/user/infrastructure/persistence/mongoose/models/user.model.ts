import { Schema, Document, Model,models,model } from 'mongoose';
import { User } from '@app/modules/user/domain/entities';
import { UserRole } from '@app/modules/user/domain';

type UserDocument = Document & User;

const userSchema = new Schema<UserDocument>({
    name: { type: String, required: true, trim: true, index: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    password: String,
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: {
        transform: (_, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.password;
            return ret;
        }
    },
    toJSON: { transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
        return ret;
    } }
});

export const UserModel: Model<UserDocument> = models.User || model<UserDocument>('User', userSchema);