import type { Request, Response, NextFunction } from 'express';
import type { CreateAuthenticationUseCase } from '../usecases/createAuthentication.usecase';
import type { GetAuthenticationUseCase, ListAuthenticationsByProjectUseCase } from '../usecases/getAuthentication.usecase';
import type { UpdateAuthenticationUseCase } from '../usecases/updateAuthentication.usecase';
import type { DeleteAuthenticationUseCase } from '../usecases/deleteAuthentication.usecase';
import type { IntrospectAuthenticationUseCase } from '../usecases/introspectAuthentication.usecase';

export class AuthenticationController {
  constructor(
    private createAuthUseCase: CreateAuthenticationUseCase,
    private getAuthUseCase: GetAuthenticationUseCase,
    private listAuthsByProjectUseCase: ListAuthenticationsByProjectUseCase,
    private updateAuthUseCase: UpdateAuthenticationUseCase,
    private deleteAuthUseCase: DeleteAuthenticationUseCase,
    private introspectUseCase: IntrospectAuthenticationUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = await this.createAuthUseCase.execute(req.body);
      return res.status(201).json({ data: auth });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = await this.getAuthUseCase.execute(req.params.id as string);
      return res.status(200).json({ data: auth });
    } catch (error) {
      next(error);
    }
  };

  listByProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auths = await this.listAuthsByProjectUseCase.execute(req.params.projectReference as string);
      return res.status(200).json({ data: auths });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = await this.updateAuthUseCase.execute(req.params.id as string, req.body);
      return res.status(200).json({ data: auth });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteAuthUseCase.execute(req.params.id as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  introspect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
        });
      }
      const token = header.slice(7).trim();
      const result = await this.introspectUseCase.execute(token);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
