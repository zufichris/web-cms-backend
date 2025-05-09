import { ApiHandler } from "@app/shared/infrastructure/http/api-handler";
import { logger } from "@app/utils";

export const loggerMiddleware = ApiHandler(async (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;

  logger.info(`Incoming ${method.toUpperCase()} ${url} from ${ip}`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    logger.info(`${method} ${url} returned ${statusCode} in ${duration}ms`);
  });

  next();
});
