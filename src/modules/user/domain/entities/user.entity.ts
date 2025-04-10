import { BaseEntitySchema } from '@app/shared';
import { z } from 'zod';
import { UserRole } from '../enums';

export const UserEntitySchema = BaseEntitySchema.extend({
    name: z.string().min(1, 'User name cannot be empty'),
    role: z.nativeEnum(UserRole),
    isActive: z.boolean().default(true),
    lastLoginAt: z.date().optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type User = z.infer<typeof UserEntitySchema>;