import {
  createQuerySchema,
  QueryParams,
} from "@app/shared/application/dtos/request";

export class BaseController {
  protected getQuery(
    allowedFields: string[],
    config?: {
      maxLimit?: number;
      filterableFields?: string[];
      strict?: boolean;
    },
  ) {
    const schema = createQuerySchema(allowedFields, config);
    return (query: unknown) => schema.parse(query) as QueryParams<string[]>;
  }
}
