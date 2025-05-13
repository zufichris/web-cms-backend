import { logger } from "@app/utils";
import { Router } from "express";
import { createS3Router, S3Controllers, S3Service } from "./s3";
import { AuthService, createAuthMiddleware } from "../auth";
import { MongooseUserRepository, UserModel } from "@app/modules/user";
import { env } from "@app/config/env";


export function initAWSService(): Router {

    const s3Controllers = new S3Controllers(new S3Service(env.s3Config))

    const authMDW = createAuthMiddleware(new AuthService(new MongooseUserRepository(UserModel)))

    const router = createS3Router(s3Controllers, authMDW)
    logger.info("AWS service initialized")
    return router
}