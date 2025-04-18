import { logger } from "@app/utils";
import { createAuthRouter } from "./auth.routes";
import { AuthControllers } from "./auth.controllers";
import { AuthService } from "./auth.service";
import { MongooseUserRepository, UserModel } from "@app/modules/user";
import { createAuthMiddleware } from "./auth.middleware";
import { Router } from "express";


export function initAuthService(): Router {
    logger.info("initializing auth service")
    const authService = new AuthService(new MongooseUserRepository(UserModel))
    const authControllers = new AuthControllers(authService)
    const authMiddleware = createAuthMiddleware(authService)
    const router = createAuthRouter(authControllers, authMiddleware)
    logger.info("auth service initialized")
    return router
}