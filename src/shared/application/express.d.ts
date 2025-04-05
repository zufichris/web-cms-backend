import { ValidatedRequest } from "./dtos/request";
import { ApiResponse, ApiResponseTypes } from "./dtos/response";

declare global {
    namespace Express {
        interface Request {
            validated?: ValidatedRequest;
        }

        interface Response {
            json_structured: <T, Type extends Omit<ApiResponseTypes, ApiResponseTypes.Error> = ApiResponseTypes.Default>(
                data: ApiResponse<T, Type>
            ) => Response;
            error: (error: ApiResponse<void, ApiResponseTypes.Error>) => Response;
        }

        namespace Application {
            interface Locals {
                version: string;
                env: "development" | "production" | "test";
            }
        }
    }
}

export { };