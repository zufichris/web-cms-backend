import {
  createQuerySchema,
  QueryParams,
} from "@app/shared/application/dtos/request";
import { logger } from "@app/utils/logger";

export class BaseController {
  constructor() { }
  protected getQuery(
    allowedFields: string[],
    config?: {
      maxLimit?: number;
      filterableFields?: string[];
      strict?: boolean;
    },
  ) {
    logger.debug("BaseController: getQuery", { allowedFields, config });
    const schema = createQuerySchema(allowedFields, config);
    return (query: unknown) => {
      logger.debug("BaseController: getQuery", { query, schema: schema.safeParse(query) });
      return schema.parse(query) as QueryParams<string[]>;
    }
  }
}
