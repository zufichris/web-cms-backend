import { initUserModule } from "@app/modules/user";
import { routesV1 } from "./v1.routes";
import { Router } from "express";

export function initRoutes(version: string, routes: Router): Router {
    const userRoutes = initUserModule()
    routes.use(`/${version}/users`, userRoutes)
    return routes
}

export const routes = initRoutes("v1", routesV1)