import z from "zod";

export function createQuerySchema(
  allowedFields: [string, ...string[]],
  config?: {
    maxLimit?: number;
    strict?: boolean;
  },
) {
  const schema = z.object({
    limit: z.coerce.number().int().max(config?.maxLimit ?? 100).optional().default(10),
    page: z.coerce.number().optional().default(1),
    sort_by: z.coerce.string().optional().default("createdAt"),
    sort_dir: z.number().int()
      .or(z.enum(['asc', 'desc']))
      .optional()
      .default('asc')
      .transform(v => {
        if (Number(v) >= 0) {
          return 1;
        } else if (Number(v) < 0) {
          return -1;
        }

        if (v === "asc") {
          return 1;
        } else if (v === "desc") {
          return -1;
        }

        return 1;
      }),
    fields: z.array(z.string().or(z.number())).optional().default(allowedFields),
    search: z.string().or(z.number()).optional(),
  })
  return schema
}

export const ValidatedRequestSchema = z.object({
  params: z.record(z.string()).default({}),
  body: z.unknown().default({}),
  query: z.record(z.string(), z.unknown()),
  headers: z
    .object({
      "content-type": z.string().optional(),
      authorization: z.string().optional(),
    })
    .passthrough(),
});



export type ValidatedRequest = z.infer<typeof ValidatedRequestSchema>
export type QueryParams = {
  options?: {
    limit?: number,
    page?: number,
    sortDir?: number,
    sortField?: string,
  },
  fields?: string[],
  filters?: Record<string, unknown>
}

export type QueryResult<T = unknown> = {
  items: Array<T>;
  totalCount: number;
  filterCount: number;
};

export type AuthContext = {
  name: string;
  email: string;
  role: string;
};