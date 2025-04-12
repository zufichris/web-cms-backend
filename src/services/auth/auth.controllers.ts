import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ChangePasswordDto, LoginDto, RegisterDto } from "./auth.dtos";
import { ApiHandler, AppError } from "@app/shared";
import { logger } from "@app/utils";
import { env } from "@app/config/env";

export class AuthControllers {
    constructor(private readonly authService: AuthService) { }


    register = ApiHandler(async (req: Request, res: Response) => {
        const registerDto: RegisterDto = req.body;
        const result = await this.authService.register(registerDto);

        logger.info(`Controller: User registered successfully`, { id: result.user.id });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: env.in_prod,
            sameSite: "lax"
        }).json_structured({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                },
                accessToken: result.accessToken,
            },
            status: 201
        });
    });

    login = ApiHandler(async (req: Request, res: Response) => {

        const result = await this.authService.login(req.validated.body as LoginDto);

        logger.info(`Controller: User logged in successfully`, { id: result.user.id });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: env.in_prod,
            sameSite: "lax"
        }).json_structured({
            success: true,
            message: "User logged in successfully",
            data: {
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                },
                accessToken: result.accessToken,
            },
            status: 200
        });
    });

    refreshToken = ApiHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.json_structured({
                success: false,
                message: "Refresh token is required",
                status: 400,
                error: AppError.validationError("Refresh token is required")
            });
            return
        }

        const result = await this.authService.refreshToken(refreshToken);

        logger.info(`Controller: Access token refreshed successfully`);

        res.json_structured({
            success: true,
            message: "Access token refreshed successfully",
            data: result,
            status: 200
        });
    });

    getCurrentUser = ApiHandler(async (req: Request, res: Response) => {
        const user = req.validated.user;

        if (!user) {
            res.json_structured({
                success: false,
                message: "User not authenticated",
                status: 401,
                error: AppError.unauthorized("User not authenticated")
            });
        }

        logger.info(`Controller: Retrieved current user`, { id: user.id });

        res.json_structured({
            success: true,
            message: "User retrieved successfully",
            data: user,
            status: 200
        });
    });
    changePassword = ApiHandler(async (req: Request, res: Response) => {
        const userId = req.validated.user.id;

        const result = await this.authService.changePassword(userId,req.validated.body as ChangePasswordDto);

        logger.info(`Controller: Password changed successfully`, { id: userId });

        res.json_structured({
            success: true,
            message: "Password changed successfully",
            data: result,
            status: 200
        });
    });
}