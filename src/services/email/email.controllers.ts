import { Request, Response } from "express";
import { EmailService } from "./email.service";
import { ApiHandler } from "@app/shared";
import { EmailFormDto } from "./email.dtos";

export class EmailServiceControllers {
    constructor(private readonly emailService: EmailService) { }


    sendMail = ApiHandler(async (req: Request, res: Response) => {
        const result = await this.emailService.sendEmail("modern", req.validated.body as EmailFormDto)

        res.json_structured({
            success: true,
            message: "email sent successfully",
            data: result,
            status: 201
        });
    });

    getTemplates = ApiHandler(async (_req: Request, res: Response) => {
        res.json_structured({
            success: true,
            message: "Email Templates retrieved successfully ",
            data: this.emailService.getTemplates(),
            status: 200
        });
    });
}