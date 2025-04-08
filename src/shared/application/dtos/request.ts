import z from "zod";

export function createQuerySchema<T extends readonly string[]>(
  allowedFields: T,
  config?: {
    maxLimit?: number;
    filterableFields?: T[number][];
    sortableFields?: T[number][];
    searchableFields?: T[number][];
    dateFields?: T[number][];
    strict?: boolean;
  },
) {
  const FieldEnum = z.enum(allowedFields as unknown as [string, ...string[]]);
  const filterableFields = [
    ...new Set(config?.filterableFields ?? allowedFields),
  ];
  const sortableFields = [...new Set(config?.sortableFields ?? allowedFields)];
  const dateFields = new Set(config?.dateFields ?? []);

  const dateValidator = (field: string) =>
    dateFields.has(field)
      ? z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: `Invalid date format for field ${field}`,
      })
      : z.unknown();

  const operatorSchema = z
    .object({
      eq: z.unknown().optional(),
      contains: z.string().optional(),
      gt: dateValidator("").or(z.number()).optional(),
      lt: dateValidator("").or(z.number()).optional(),
      in: z.array(z.unknown()).min(1).optional(),
      neq: z.unknown().optional(),
      between: z.tuple([z.unknown(), z.unknown()]).optional(),
      startsWith: z.string().optional(),
      endsWith: z.string().optional(),
    })
    .partial()
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "Filter object must contain at least one operator",
    });

  return z
    .object({
      // Filters default to an empty object
      filters: z
        .record(
          z.enum(filterableFields as [string, ...string[]]),
          z.preprocess(
            (val) => {
              if (val != null && typeof val === "object" && !Array.isArray(val)) {
                return val;
              }
              return { eq: val };
            },
            operatorSchema,
          ),
        )
        .optional()
        .default({}), // Ensures filters is {} when not provided

      // Options default to an empty object
      options: z
        .object({
          limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(config?.maxLimit ?? 100)
            .optional()
            .describe("Maximum items per page"),
          page: z.coerce
            .number()
            .int()
            .min(1)
            .max(1000)
            .optional()
            .describe("Page number (1-based)"),
          sortField: z
            .enum(sortableFields as [string, ...string[]])
            .optional()
            .describe("Field to sort by"),
          sortDir: z
            .enum(["asc", "desc"])
            .optional()
            .transform((val) =>
              val ? (val.toLowerCase() as "asc" | "desc") : undefined,
            )
            .describe("Sort direction"),
          search: z
            .string()
            .trim()
            .max(100)
            .optional()
            .describe(
              `Search query (searches in: ${config?.searchableFields?.join(", ") ?? "all fields"})`,
            ),
        })
        .partial()
        .optional()
        .default({}), // Ensures options is {} when not provided

      // Fields default to all allowed fields
      fields: z
        .union([
          z
            .array(FieldEnum)
            .max(20)
            .refine((arr) => new Set(arr).size === arr.length, {
              message: "Duplicate fields detected",
            }),
          z
            .string()
            .transform((s) => s.split(",").map((f) => f.trim()))
            .refine(
              (arr) => arr.every((f) => allowedFields.includes(f as T[number])),
              {
                message: "Invalid field(s) requested",
              },
            ),
        ])
        .optional()
        .transform((fields) => fields ?? [...allowedFields]) // Default to all fields
        .transform((fields) => [...new Set(fields)]),
    })
    .partial()
    .strict(config?.strict ? "Unknown fields are not allowed" : undefined);
}

// Rest of the code remains unchanged
export const ValidatedRequestSchema = z.object({
  params: z.record(z.string()).default({}),
  body: z.unknown().default({}),
  query: z.record(z.string()).default({}),
  headers: z
    .object({
      "content-type": z.string().optional(),
      authorization: z.string().optional(),
    })
    .passthrough(),
});

export type QueryFilters = Record<
  string,
  Partial<{
    eq: unknown;
    contains: unknown;
    gt: Date;
    lt: Date;
    in: Array<unknown>;
    neq: unknown;
    between: [unknown, unknown];
    startsWith: unknown;
    endsWith: unknown;
  }>
>;

export type ValidatedRequest = z.infer<typeof ValidatedRequestSchema>;
export type QueryParams<Fields extends readonly string[]> = z.infer<
  ReturnType<typeof createQuerySchema<Fields>>
>;

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