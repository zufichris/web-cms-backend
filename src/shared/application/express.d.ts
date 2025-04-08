import { ValidatedRequest } from "./dtos/request";
import { ApiResponse, ApiResponseTypes } from "./dtos/response";

declare global {
  namespace Express {
    interface Request {
      validated: ValidatedRequest & { user?: AuthContext };
    }

    interface Response {
      json_structured: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response: ApiResponse<unknown, any>,
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
