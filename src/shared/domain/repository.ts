import { ID, QueryParams, QueryResult } from "../application";

export interface IBaseRepository<
  Entity,
  Fields extends Array<Extract<keyof Entity, string>>,
> {
  create: (
    data: Omit<Entity, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Entity>;
  update: (
    id: ID,
    data: Partial<Omit<Entity, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Entity>;
  count: (filters?: QueryParams<Fields>["filters"]) => Promise<number>;
  query: (query?: QueryParams<Fields>) => Promise<QueryResult<Entity>>;
  findById: (
    id: ID,
    fields?: QueryParams<Fields>["fields"],
    queryOptions?: QueryParams<string[]>["options"],
  ) => Promise<Entity>;
  findOne: (query?: QueryParams<Fields>) => Promise<Entity>;
  delete: (id: string) => Promise<boolean>;
}
