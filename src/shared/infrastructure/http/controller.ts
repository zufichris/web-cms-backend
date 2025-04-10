import {
  createQuerySchema,
  QueryParams,
} from "@app/shared/application/dtos/request";

export class BaseController {
  constructor() { }
  protected getQuery(
    allowedFields: [string, ...string[]],
    config?: {
      maxLimit?: number;
      strict?: boolean;
    },
  ): (query: Record<string, unknown>) => QueryParams {
    const schema = createQuerySchema(allowedFields, config);
    return (query: Record<string, unknown>) => {
      query.fields = Array.isArray(query.fields) ? query.fields : query.fields ? [query.fields] : [];
      const validData = schema.passthrough().parse(query);

      const filtersArray = Object.entries(validData ?? {}).map(([key, value]) => {
        const validKey = allowedFields.find(f => f.toLowerCase() === key.toLowerCase());
        if (validKey && value) {
          return ({ [validKey]: value });
        } else {
          return ({});
        }
      });

      const filters = filtersArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      return ({
        fields: validData.fields.length ? validData.fields.map(x => x.toString()).filter(f => allowedFields.includes(f)) : allowedFields,
        options: {
          limit: validData.limit,
          page: validData.page,
          sortDir: validData.sort_dir,
          sortField: validData.sort_by
        },
        filters: filters
      });
    };
  }
}
