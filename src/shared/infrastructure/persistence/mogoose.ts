import { AppError, IBaseRepository, ID } from "@app/shared/";
import { QueryParams, QueryResult } from "@app/shared";
import { logger } from "@app/utils";
import {
  QueryOptions,
  ProjectionType,
  Model,
  Error as MongooseErrors,
  RootFilterQuery,
  Document,
} from "mongoose";

interface MongooseQueryParams<Entity> {
  filter?: RootFilterQuery<Entity>;
  projection?: ProjectionType<Entity>;
  options: QueryOptions<Entity>;
}

export abstract class MongoBaseRepository<Entity> implements IBaseRepository<Entity> {
  public readonly model: Model<Entity & Document>;
  constructor(model: Model<Entity & Document>) {
    this.model = model;
  }
  protected toMongooseQuery(
    query?: QueryParams,
  ): MongooseQueryParams<Entity> {
    const {
      fields: QFields,
      filters: QFilters,
      options: QOptions,
    } = query ?? {};

    const projection = this.buildProjection(QFields);
    const filter = this.buildFilters(QFilters);
    const options = this.buildOptions(QOptions);
    logger.debug("Mongoose Query", { filter, projection, options });
    return { filter, projection, options };
  }

  protected buildProjection(
    fields?: QueryParams['fields'],
  ): ProjectionType<Entity> | undefined {
    if (!fields || fields.length === 0) return undefined;
    return fields.reduce((acc, field) => {
      return Object.assign({}, acc ?? {}, { [field]: 1 });
    }, {} as ProjectionType<Entity>);
  }

  protected buildFilters(
    filters?: QueryParams['filters'],
  ): RootFilterQuery<Entity> {
    const filterQuery = {} as Record<string, object>;
    if (filters) {
      for (const [field, value] of Object.entries(filters)) {
        if (value) {
          filterQuery[field] = value
        }
      }
    }
    return filterQuery;
  }

  protected buildOptions(queryOptions: QueryParams['options']): QueryOptions<Entity> {
    const options: QueryOptions<Entity> = {};
    if (queryOptions?.limit) {
      options.limit = queryOptions.limit;

      if (queryOptions.page && queryOptions.page > 1) {
        options.skip = (queryOptions.page - 1) * queryOptions.limit;
      }
    }

    if (queryOptions?.sortField) {
      options.sort = {
        [queryOptions.sortField]: queryOptions?.sortDir ?? -1,
      } as Record<keyof Entity, 1 | -1>;
    }

    return options;
  }
  protected handleError(error: unknown): never {
    if (error instanceof MongooseErrors.CastError) {
      logger.error("Database cast error", {
        path: error.path,
        value: error.value,
        kind: error.kind,
      });
      throw new AppError(`Invalid ${error.path}: ${error.value}`, 400, {
        code: "INVALID_ID_FORMAT",
      });
    }

    if (error instanceof MongooseErrors.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      logger.error("Validation failed", {
        errors: messages,
      });
      throw AppError.validationError(
        `Validation failed: ${messages.join(", ")}`,
      );
    }

    if (error instanceof MongooseErrors.DocumentNotFoundError) {
      logger.warn("Document not found", { filter: error.filter });
      throw AppError.notFound("The requested resource was not found");
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      "code" in error &&
      error.name === "MongoServerError" &&
      error.code === 11000 &&
      "keyValue" in error &&
      error.keyValue !== null &&
      typeof error.keyValue === "object"
    ) {
      logger.error("Duplicate key violation", { keyValue: error.keyValue });
      throw AppError.conflict(
        `Duplicate value for unique field: ${Object.keys(error.keyValue).join(", ")}`,
      );
    }
    if (error instanceof AppError) {
      throw error
    }
    logger.error("Unexpected database error", error);
    throw AppError.internal();
  }

  async findById(
    id: string,
    fields?: QueryParams['fields'],
    queryOptions?: QueryParams['options'],
  ): Promise<Entity> {
    try {
      const projection = this.buildProjection(fields);
      const options = this.buildOptions(queryOptions ?? {});
      const res = await this.model.findById(id, projection, options);
      if (!res) {
        throw AppError.notFound(`Item with id ${id} not found`);
      }
      return res.toObject() as Entity;
    } catch (error) {
      this.handleError(error);
    }
  }
  async findOne(query?: QueryParams): Promise<Entity> {
    try {
      const { options, filter, projection } = this.toMongooseQuery(query);
      const res = await this.model.findOne(filter, projection, options);
      if (!res) {
        throw AppError.notFound("Item Not Found");
      }
      return res.toObject() as Entity;
    } catch (error) {
      this.handleError(error);
    }
  }
  async query(query?: QueryParams): Promise<QueryResult<Entity>> {
    try {
      const { options, filter, projection } = this.toMongooseQuery(query);
      const [totalCount, filterCount, items] = await Promise.all([
        this.count(),
        this.count(query?.filters),
        this.model
          .find(filter as RootFilterQuery<Entity>, projection, options)
          .then((docs) => docs.map((doc) => doc.toObject() as Entity)),
      ]);
      return { totalCount, filterCount, items };
    } catch (error) {
      this.handleError(error);
    }
  }
  async count(filters?: QueryParams["filters"]): Promise<number> {
    try {
      const query = this.buildFilters(filters);
      const count = await this.model.countDocuments(query);
      if (typeof count !== "number") {
        throw new AppError("Error Counting Items");
      }
      return count;
    } catch (error) {
      this.handleError(error);
    }
  }
  async create(
    data: Omit<Entity, "id" | "createdAt" | "updatedAt">,
  ): Promise<Entity> {
    try {
      const newItem = await this.model.create(data);
      return newItem.toObject() as Entity;
    } catch (error) {
      this.handleError(error);
    }
  }
  async update(
    id: ID,
    newData: Partial<Omit<Entity, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Entity> {
    try {
      const item = await this.findById(id);
      if (!item) {
        throw AppError.notFound(`Item With ID ${id} Notfound`);
      }
      const data = {
        ...item,
        ...newData,
      };
      const updated = await this.model.findByIdAndUpdate(id, data, {
        new: true,
      });
      return updated?.toObject() as Entity;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      await this.model.findByIdAndDelete(id);
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }
}
