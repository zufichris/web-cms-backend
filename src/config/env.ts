import { logger } from "@app/utils";
import { z } from "zod";

const envValidator = z.object({
  port: z
    .number({
      invalid_type_error: "Invalid Port Number",
    })
    .optional()
    .default(5000),
  in_prod: z.boolean().optional().default(false),
  db_uri: z.string({
    required_error: "MongoDB URI is required",
  }),
});

const parsedEnv = envValidator.safeParse({
  in_prod: process.env.NODE_ENV === "prod",
  port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  db_uri: process.env.DB_URI || "mongodb://localhost:27017/web-cms",
});

if (!parsedEnv.success) {
  logger.error(
    "-Invalid environment variables:\n",
    parsedEnv.error.errors.map((error) => error.message).join("\n"),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
