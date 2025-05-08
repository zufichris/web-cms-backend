import { z } from 'zod';

export const EmailFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    projectDescription: z.string().min(20, 'Project description must be at least 20 characters')
});

export type EmailFormDto = z.infer<typeof EmailFormSchema>;

export type EmailTemplateDto = {
    id: string;
    name: string;
    subject: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    html: (data: EmailFormDto) => string;
};