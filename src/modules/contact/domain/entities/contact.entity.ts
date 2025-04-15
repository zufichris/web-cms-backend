
import { BaseEntitySchema } from '@app/shared';
import { z } from 'zod';

export const ContactEntitySchema = BaseEntitySchema.extend({
    name: z.string()
    // Add other properties here
});

export type Contact = z.infer<typeof ContactEntitySchema>;