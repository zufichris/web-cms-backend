import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserRepository, User, UserRole } from "@app/modules/user";
import { LoginDto, RegisterDto, RegisterSchema, LoginSchema, ChangePasswordDto, ChangePasswordSchema } from "./auth.dtos";
import { AppError } from "@app/shared";
import { env } from "@app/config/env";
import { logger } from "@app/utils";

type Payload = {
    id: string,
    email: string,
    name: string,
    role: UserRole
}

export class AuthService {
    private readonly jwtSecret: string;

    constructor(private readonly userRepository: IUserRepository) {
        this.jwtSecret = env.jwt_secret;
    }

    async register(data: RegisterDto) {
        const valid = RegisterSchema.parse(data);
        const exists = await this.userRepository.findByEmail(data.email).catch(_err => { })

        if (exists) {
            throw AppError.conflict(`user with ${data.email} already exists`);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.userRepository.create({ ...valid, password: hashedPassword } as User);

        if (!user) {
            throw AppError.internal("Error Creating Account");
        }

        const accessToken = this.signJWT({
            email: user.email,
            id: user.id,
            name: user.name,
            role: user.role
        }, "access_token");

        const refreshToken = this.signJWT({
            email: user.email,
            id: user.id,
            name: user.name,
            role: user.role
        }, 'refresh_token');

        return { user, refreshToken, accessToken };
    }

    async login(data: LoginDto) {
        const valid = LoginSchema.parse(data);
        const user = await this.userRepository.findByEmail(valid.email).catch(_err => { })
        logger.debug("valid", valid)

        if (!user) {
            throw AppError.unauthorized("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(valid.password, user.password);

        if (!isPasswordValid) {
            throw AppError.unauthorized(`${valid.password}Incorrect email or password:`);
        }

        const accessToken = this.signJWT({
            email: user.email,
            id: user.id,
            name: user.name,
            role: user.role
        }, "access_token");

        const refreshToken = this.signJWT({
            email: user.email,
            id: user.id,
            name: user.name,
            role: user.role
        }, 'refresh_token');
        return { user, accessToken, refreshToken };
    }

    async refreshToken(token: string) {
        const decoded = jwt.verify(token, this.jwtSecret) as Payload;
        const user = await this.userRepository.findById(decoded.id);

        if (!user) {
            throw AppError.unauthorized("Invalid refresh token");
        }

        const accessToken = this.signJWT({
            email: user.email,
            id: user.id,
            name: user.name,
            role: user.role
        }, "access_token");

        return { accessToken };
    }

    async verifyToken(token: string): Promise<Payload> {
        return jwt.verify(token, this.jwtSecret) as Payload;
    }

    async changePassword(userId: string, data: ChangePasswordDto) {

        const { currentPassword, newPassword } = ChangePasswordSchema.parse(data)

        const user = await this.userRepository.findById(userId).catch(_err => { })
        logger.todo("Add getPassword(userId) in userRepository")
        if (!user) {
            throw AppError.notFound("User not found");
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw AppError.unauthorized("Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(userId, { password: hashedPassword });

        return { success: true };
    }

    signJWT(payload: Payload, type: "access_token" | "refresh_token"): string {
        const expiresIn = type === 'refresh_token' ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        const token = jwt.sign(payload, this.jwtSecret, {
            expiresIn
        });
        return token;
    }
}