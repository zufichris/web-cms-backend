type ErrorResponse = {
    success: false;
    description?: string
};

type SuccessResponse<TData> = {
    success: true;
    data: TData;
};

export type ResponseData<TData> = (ErrorResponse | SuccessResponse<TData>) & {
    message: string
    status: number
};

export type ResponseDataPaginated<T> = ResponseData<T[]> & {
    limit: number;
    page: number;
    total: number;
    filterCount: number;
    sortField?: string;
    sortDirection?: string;
};

export type QueryFilter<T> = {
    options?: {
        limit?: number,
        page?: number
    }
    filters?: T,
    projection?: keyof T
}



export interface IBaseUseCase<TInput = unknown, TOutPut = unknown, TContext = void> {
    beforeExecute(input?: TInput, context?: TContext): Promise<void>
    execute(input: TInput, context?: TContext): Promise<TOutPut>
    afterExecute(input?: TInput, context?: TContext): Promise<void>
}
export interface IBaseRepository<Entity> {
    create(data: Entity): Promise<Entity>;
    findOne(filter: Partial<Entity>): Promise<Entity | null>;
    findMany(filter: Partial<Entity>, options?: QueryFilter<Partial<Entity>>): Promise<Entity[]>;
    update(id: string, data: Partial<Entity>): Promise<Entity | null>;
    delete(id: string): Promise<boolean>;
}