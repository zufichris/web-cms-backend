import { ID, QueryParams, QueryResult } from "../application";

export interface IBaseRepository<Entity> {
  create: (
    data: Omit<Entity, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Entity>;
  update: (
    id: ID,
    data: Partial<Omit<Entity, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Entity>;
  count: (filters?: QueryParams["filters"]) => Promise<number>;
  query: (query?: QueryParams) => Promise<QueryResult<Entity>>;
  findById: (
    id: ID,
    fields?: QueryParams["fields"],
    queryOptions?: QueryParams["options"],
  ) => Promise<Entity>;
  findOne: (query?: QueryParams) => Promise<Entity>;
  delete: (id: string) => Promise<boolean>;
}
