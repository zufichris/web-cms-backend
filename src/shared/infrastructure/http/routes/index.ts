import { initUserModule } from "@app/modules/user";
import { routesV1 } from "./v1.routes";
import { Router } from "express";
import { initPageModule } from "@app/modules/page";
import { initAuthService } from "@app/services/auth";
import { initEmailService } from "@app/services/email";

export function initRoutes(version: string, router: Router): Router {
    const userRoutes = initUserModule()
    const pageRoutes = initPageModule()
    const authRoutes = initAuthService()
    const emailServiceRoutes = initEmailService()

    router.use(`/${version}/users`, userRoutes)
    router.use(`/${version}/pages`, pageRoutes)
    router.use(`/${version}/auth`, authRoutes)
    router.use(`/${version}/email`, emailServiceRoutes)

    return router
}

export const routes = initRoutes("v1", routesV1)