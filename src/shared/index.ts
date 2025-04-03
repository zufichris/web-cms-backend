type TErrorResponse = {
    success: false;
    description?: string
};

type TSuccessResponse<TData> = {
    success: true;
    data: TData;
};

export type TResponseData<TData> = (TErrorResponse | TSuccessResponse<TData>) & {
    message: string
    status: number
};

export type ResponseDataPaginated<T> = TResponseData<T[]> & {
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