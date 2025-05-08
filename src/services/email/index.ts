import { logger } from "@app/utils";
import { createEmailServiceRouter } from "./email.routes";
import { EmailServiceControllers } from "./email.controllers";
import { EmailService } from "./email.service";
import { Router } from "express";


export function initEmailService(): Router {
    logger.info("initializing email service")
    const emailService = new EmailService()
    const authControllers = new EmailServiceControllers(emailService)
    const router = createEmailServiceRouter(authControllers)
    logger.info("Email service initialized")
    return router
}