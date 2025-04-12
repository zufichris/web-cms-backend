import { CreateUserValidationSchema } from "@app/modules/user";
import z from "zod";

export const RegisterSchema = CreateUserValidationSchema
export const LoginSchema = z.object({
    email: z.string({
        message: "email is required to login",
        invalid_type_error: "invalid email"
    }).email("invalid email").toLowerCase(),
    password: z.coerce.string({
        message: "password is required to login"
    })
})
export const ChangePasswordSchema = z.object({
    currentPassword: z.string({
        message: "Current Password is required",
    }),
    newPassword: RegisterSchema.shape.password
})

export type RegisterDto = z.infer<typeof RegisterSchema>
export type LoginDto = z.infer<typeof LoginSchema>
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>