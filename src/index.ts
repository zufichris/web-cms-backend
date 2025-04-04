import express, { Express } from "express"
import cors from "cors"
import { connectDB } from "@app/config/db"
import { env } from "./config/env"
import { routesV1 } from "./v1.routes"
import { errorHandler, loggerMiddleware, notfoundHandler } from "@app/middleware"
import { createServer } from "http"
import { logger } from "./utils"


class App {
    private app: Express
    private port: number
    private dbUri: string

    constructor() {
        this.app = express()
        this.port = env.port
        this.dbUri = env.db_uri

        this.initCoreMiddleware()
        this.initStaticFiles()
        this.initApiRoutes()
        this.initErrorHandlers()
        this.initDatabaseConnection()
    }

    private initCoreMiddleware(): void {
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
    }

    private initErrorHandlers(): void {
        this.app.use(notfoundHandler)
        this.app.use(errorHandler)
    }
    private initApiRoutes(): void {
        this.app.use(loggerMiddleware)
        this.app.use("/api", routesV1)
    }

    private initDatabaseConnection(): void {
        connectDB(this.dbUri)
    }

    private initStaticFiles(): void {
        this.app.use(express.static("public"))
    }

    public start(): void {
        const server = createServer(this.app);
        server.listen(this.port, () => {
            logger.info(`View At http://127.0.0.1:${this.port}`);
        })
        server.on('error', (err) => {
            logger.error(`Server error: ${err}`);
        })
    }
}

const app = new App()
app.start()