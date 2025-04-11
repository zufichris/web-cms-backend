import { initUserModule } from "@app/modules/user";
import { routesV1 } from "./v1.routes";
import { Router } from "express";
import { initPageModule } from "@app/modules/page";

export function initRoutes(version: string, routes: Router): Router {
    const userRoutes = initUserModule()
    const pageRoutes = initPageModule()

    routes.use(`/${version}/users`, userRoutes)
    routes.use(`/${version}/pages`, pageRoutes)


    return routes
}

export const routes = initRoutes("v1", routesV1)