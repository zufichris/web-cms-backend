import { AppError } from "@app/shared/application/app.error";
import { QueryParams } from "@app/shared/application/dtos/request";
import { logger } from "@app/utils";
import { FilterQuery, QueryOptions, ProjectionType, Model, Error as MongooseErrors } from "mongoose";

interface MongooseQueryParams<Doc> {
  filter?: FilterQuery<Doc>;
  projection?: ProjectionType<Doc>;
  options: QueryOptions<Doc>;
}

export abstract class MongoBaseRepository<Doc> {
  public readonly model: Model<Doc>;
  constructor(model: Model<Doc>) {
    this.model = model
  }
  protected toMongooseQuery(
    query: QueryParams<string[]>
  ): MongooseQueryParams<Doc> {
    const projection = this.buildProjection(query.fields);
    const filter = this.buildFilters(query.filters || {});
    const options = this.buildOptions(query.options);
    return { filter, projection, options };
  }

  protected buildProjection(fields?: string[]): ProjectionType<Doc> | undefined {
    if (!fields || fields.length === 0) return undefined;
    return fields.reduce((acc, field) => {
      return Object.assign({}, acc ?? {}, { [field]: 1 });
    }, {} as ProjectionType<Doc>);
  }

  protected buildFilters(filters?: Record<string, Record<string, unknown>>): FilterQuery<Doc> {
    logger.todo("Handle Mongoose Search class MongoBaseRepository")
    const filterQuery = {} as Record<string, object>;
    if (filters) {
      for (const [field, operators] of Object.entries(filters)) {
        const fieldConditions: Record<string, unknown> = {};
        for (const [operator, value] of Object.entries(operators)) {
          switch (operator) {
            case 'eq':
              fieldConditions.$eq = value;
              break;
            case 'contains':
              fieldConditions.$regex = new RegExp(value as string, 'i');
              break;
            case 'gt':
            case 'lt':
              fieldConditions[`$${operator}`] = new Date(value as string);
              break;
            case 'in':
              fieldConditions.$in = Array.isArray(value) ? value : [value];
              break;
            case 'neq':
              fieldConditions.$ne = value;
              break;
            case 'startsWith':
              fieldConditions.$regex = new RegExp(`^${value}`, 'i');
              break;
            case 'endsWith':
              fieldConditions.$regex = new RegExp(`${value}$`, 'i');
              break;
          }
        }
        if (Object.keys(fieldConditions).length > 0) {
          filterQuery[field] = { ...filterQuery[field], ...fieldConditions };
        }
      }
    }
    return filterQuery
  }

  protected buildOptions(queryOptions: {
    limit?: number;
    page?: number;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
  }): QueryOptions<Doc> {
    const options: QueryOptions<Doc> = {};
    if (queryOptions.limit) {
      options.limit = queryOptions.limit;

      if (queryOptions.page && queryOptions.page > 1) {
        options.skip = (queryOptions.page - 1) * queryOptions.limit;
      }
    }

    if (queryOptions.sortField) {
      options.sort = {
        [queryOptions.sortField]: queryOptions.sortDir === 'asc' ? 1 : -1
      } as Record<keyof Doc, 1 | -1>;
    }

    return options;
  }
  protected handleError(error: unknown): never {

    if (error instanceof MongooseErrors.CastError) {
      logger.error('Database cast error', {
        path: error.path,
        value: error.value,
        kind: error.kind
      });
      throw new AppError(
        `Invalid ${error.path}: ${error.value}`,
        400,
        { code: 'INVALID_ID_FORMAT' }
      );
    }

    if (error instanceof MongooseErrors.ValidationError) {
      const messages = Object.values(error.errors).map(err => err.message);
      logger.error('Validation failed', {
        errors: messages,
      });
      throw AppError.validationError(`Validation failed: ${messages.join(', ')}`)
    }

    if (error instanceof MongooseErrors.DocumentNotFoundError) {
      logger.warn('Document not found', { filter: error.filter });
      throw AppError.notFound('The requested resource was not found')
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      'code' in error &&
      error.name === 'MongoServerError' &&
      error.code === 11000 &&
      'keyValue' in error &&
      error.keyValue !== null &&
      typeof error.keyValue === 'object'
    ) {
      logger.error('Duplicate key violation', { keyValue: error.keyValue });
      throw AppError.conflict(`Duplicate value for unique field: ${Object.keys(error.keyValue).join(', ')}`)
    }
    logger.error('Unexpected database error', error);
    throw AppError.internal()
  }
}