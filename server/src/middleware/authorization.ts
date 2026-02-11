import { Request, Response, NextFunction } from 'express';
import { IAuthenticationRepository } from '../repository/authentication/interfaces';
import { AuthenticationEntity } from '../types';

// Extend Express Request to carry the authenticated entity
declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticationEntity;
    }
  }
}

/**
 * Creates a middleware that extracts a Bearer token from the Authorization header,
 * validates it against the Authentication repository, and checks that the
 * associated role has ALL of the required permissions.
 *
 * Usage in routes:
 *   authorize(authRepo, ['configs:write'])
 */
export function authorize(authRepo: IAuthenticationRepository, requiredPermissions: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract Bearer token
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
        });
      }

      const token = header.slice(7).trim();
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Empty bearer token.',
        });
      }

      // 2. Look up the authentication record (includes role with permissions)
      const auth = await authRepo.findBySecretKey(token);

      if (!auth) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or revoked API key.',
        });
      }

      // 3. Check active status
      if (!auth.is_active) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'API key is deactivated.',
        });
      }

      // 4. Check expiration
      if (auth.expiration_date && new Date(auth.expiration_date) < new Date()) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'API key has expired.',
        });
      }

      // 5. Check permissions
      if (requiredPermissions.length > 0) {
        const rolePermissions = auth.role?.permissions ?? [];
        const missing = requiredPermissions.filter(p => !rolePermissions.includes(p));

        if (missing.length > 0) {
          return res.status(403).json({
            error: 'Forbidden',
            message: `Missing required permissions: ${missing.join(', ')}`,
          });
        }
      }

      // 6. Attach auth to request for downstream use
      req.auth = auth;
      next();
    } catch (error) {
      next(error);
    }
  };
}
