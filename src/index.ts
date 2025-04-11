import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { connectDB } from "@app/config/db";
import { env } from "./config/env";
import {
  errorMiddleware,
  loggerMiddleware,
  notFoundMiddleware,
  requestValidator,
  responseExtenderMiddleware,
} from "@app/middleware";
import { createServer } from "http";
import { logger } from "./utils";
import { routes } from "./shared/infrastructure/http/routes";

class App {
  private app: Express;
  private port: number;
  private dbUri: string;

  constructor() {
    this.app = express();
    this.port = env.port;
    this.dbUri = env.db_uri;

    this.initCoreMiddleware();
    this.initStaticFiles();
    this.initApiRoutes();
    this.initErrorHandlers();
    this.initDatabaseConnection()
  }

  private initCoreMiddleware(): void {
    this.app.use(loggerMiddleware);
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestValidator());
    this.app.use(responseExtenderMiddleware);
  }

  private initErrorHandlers(): void {
    this.app.use(notFoundMiddleware);
    this.app.use(errorMiddleware);
  }
  private initApiRoutes(): void {
    this.app.use("/api", routes);
  }

  private initDatabaseConnection(): void {
    connectDB(this.dbUri);
  }

  private initStaticFiles(): void {
    this.app.use(express.static("public"));
  }

  public start(): void {
    const server = createServer(this.app);
    server.listen(this.port, () => {
      logger.info(`View At http://127.0.0.1:${this.port}`);
    });
    server.on("error", (err) => {
      logger.error(`Server error: ${err}`);
    });
  }
}

const app = new App();
app.start();
