import { initUserModule } from "@app/modules/user";
import { routesV1 } from "./v1.routes";
import { Router } from "express";
import { initPageModule } from "@app/modules/page";
import { initAuthService } from "@app/services/auth";

export function initRoutes(version: string, routes: Router): Router {
    const userRoutes = initUserModule()
    const pageRoutes = initPageModule()

    const authRoutes = initAuthService()

    routes.use(`/${version}/users`, userRoutes)
    routes.use(`/${version}/pages`, pageRoutes)


    routes.use(`/${version}/auth`, authRoutes)

    return routes
}

export const routes = initRoutes("v1", routesV1)