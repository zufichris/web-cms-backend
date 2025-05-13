export * from "./auth.controllers"
export * from "./auth.service"
export * from "./auth.dtos"
export * from "./auth.routes"
export * from "./auth.middleware"

import { logger } from "@app/utils";
import { createAuthRouter } from "./auth.routes";
import { AuthControllers } from "./auth.controllers";
import { AuthService } from "./auth.service";
import { MongooseUserRepository, UserModel } from "@app/modules/user";
import { createAuthMiddleware } from "./auth.middleware";
import { Router } from "express";


export function initAuthService(): Router {
    const authService = new AuthService(new MongooseUserRepository(UserModel))
    const authControllers = new AuthControllers(authService)
    const authMiddleware = createAuthMiddleware(authService)
    const router = createAuthRouter(authControllers, authMiddleware)
    logger.info("Auth service initialized")
    return router
}