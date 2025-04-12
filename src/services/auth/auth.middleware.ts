import { UserRole } from '@app/modules/user';
import { AuthService } from './auth.service';
import { ApiHandler, AppError } from '@app/shared';

export class AuthMiddleware {
    constructor(private readonly authService: AuthService) { }

    authenticate = ApiHandler(async (req, _res, next) => {
        try {
            const authHeader = req.validated.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw AppError.unauthorized('Authentication required');
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                throw AppError.unauthorized('Authentication required');
            }

            const payload = await this.authService.verifyToken(token);

            req.validated.user = {
                id: payload.id,
                email: payload.email,
                name: payload.name,
                role: payload.role
            };

            next();
        } catch (error) {
            next(error);
        }
    })

    authorize = (allowedRoles: UserRole[]) => {
        return ApiHandler((req, _res, next) => {
            try {
                if (!req.validated.user) {
                    throw AppError.unauthorized('Authentication required');
                }

                if (!allowedRoles.includes(req.validated.user.role)) {
                    throw AppError.forbidden('You do not have permission to access this resource');
                }

                next();
            } catch (error) {
                next(error);
            }
        })
    };

    authorizeOwnerOrAdmin = (paramIdField: string = 'ownerId') => {
        return ApiHandler((req, _res, next) => {
            try {
                if (!req.validated.user) {
                    throw AppError.unauthorized('Authentication required');
                }
                const resourceId = req.validated.params[paramIdField];
                if (req.validated.user.role === UserRole.ADMIN || req.validated.user.id === resourceId) {
                    return next();
                }
                throw AppError.forbidden('You do not have permission to access this resource');
            } catch (error) {
                next(error);
            }
        })
    };
}

export function createAuthMiddleware(authService: AuthService) {
    const middleware = new AuthMiddleware(authService);
    return {
        authenticate: middleware.authenticate,
        authorize: middleware.authorize,
        authorizeOwnerOrAdmin: middleware.authorizeOwnerOrAdmin,
    };
}