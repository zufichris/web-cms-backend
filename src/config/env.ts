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
    message: "missing database uri",
    required_error: "MongoDB URI is required",
  }),
  jwt_secret: z.string({
    required_error: "missing jwt secret",
  }),
  url_dev: z.string({
    message: "missing dev url"
  }),
  url_prod: z.string({
    message: "missing prod url"
  }),
  s3Config: z.object({
    accessKeyId: z.string({
      required_error: "missing aws s3 access key",
    }),
    bucketName: z.string({
      required_error: "missing aws s3 bucket",
    }),
    region: z.string({
      required_error: "missing aws s3 region",
    }),
    secretAccessKey: z.string({
      required_error: "missing aws s3 secret",
    })
  })
});

const parsedEnv = envValidator.safeParse({
  in_prod: process.env.NODE_ENV === "prod",
  port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  db_uri: process.env.DB_URI,
  jwt_secret: process.env.JWT_SECRET,
  url_dev: process.env.URL_DEV,
  url_prod: process.env.URL_PROD,
  s3Config: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    bucketName: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_S3_REGION,
    secretAccessKey: process.env.AWS_S3_SECRET
  }
});

if (!parsedEnv.success) {
  logger.error(
    "-Invalid environment variables:",
    { error: parsedEnv.error.errors.map((error) => error.message).join("\n") },
  );
  process.exit(1);
}

export const env = parsedEnv.data;
