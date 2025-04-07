interface BaseResponse {
  message: string;
  status: number;
}

export interface ErrorResponse extends BaseResponse {
  success?: false;
  error: {
    type?: string;
    detail?: string;
    instance?: string;
    timestamp?: string;
    code?: string;
    stack?: string;
  };
  data?: undefined;
}

export interface ResponsePaginated<T> extends BaseResponse {
  meta: {
    limit: number;
    page: number;
    total: number;
    filterCount: number;
    sortField?: string;
    sortDirection?: string;
  };
  data: T;
  success?: true;
}

export interface ResponseDefault<T> extends BaseResponse {
  data: T;
  success?: true;
}

export enum ApiResponseTypes {
  Default,
  Error,
  Paginated,
}

export type ApiResponse<
  T,
  Type extends ApiResponseTypes = ApiResponseTypes.Default,
> =
  | (Type extends ApiResponseTypes.Default ? ResponseDefault<T> : never)
  | (Type extends ApiResponseTypes.Error ? ErrorResponse : never)
  | (Type extends ApiResponseTypes.Paginated ? ResponsePaginated<T> : never);
