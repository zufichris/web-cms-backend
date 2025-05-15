import z from "zod";

export const S3FileSchema = z.object({
  key: z.string({
    message: "provide a valid key",
  }),
  contentType: z
    .string({
      message: "invalid type",
    })
    .optional()
    .default("image/png"),
  url: z.string().url().optional(),
  lastModified: z.coerce
    .date({
      message: "Invalid date",
    })
    .optional()
    .default(new Date(Date.now())),
  size: z.number().or(z.string()).optional(),
});

export type S3File = z.infer<typeof S3FileSchema> & {
  content?: Buffer;
};
