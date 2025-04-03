import { logger } from "@/utils/logger";
import { z } from "zod";

const envValidator = z.object({
  port: z
    .number({
      invalid_type_error: "Invalid Port Number",
    })
    .optional()
    .default(5000),
  in_prod: z.boolean().optional().default(false),
});

export const env = {
  in_prod: process.env.NODE_ENV === "prod",
  port: process.env.PORT as number | undefined,
} as z.infer<typeof envValidator>;

const validate = envValidator.safeParse(env);

if (validate.error) {
  logger.error(validate.error.message, validate.error);
  process.exit(1);
}
