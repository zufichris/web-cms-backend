
import { BaseEntitySchema } from '@app/shared';
import { z } from 'zod';

export const FomEntitySchema = BaseEntitySchema.extend({
    name: z.string()
    // Add other properties here
});

export type Fom = z.infer<typeof FomEntitySchema>;