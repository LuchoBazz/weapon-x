import type { Request, Response, NextFunction } from 'express';
import type { CreateRoleUseCase } from '../usecases/createRole.usecase';
import type { GetRoleUseCase, ListRolesUseCase } from '../usecases/getRole.usecase';
import type { UpdateRoleUseCase } from '../usecases/updateRole.usecase';
import type { DeleteRoleUseCase } from '../usecases/deleteRole.usecase';

export class RoleController {
  constructor(
    private createRoleUseCase: CreateRoleUseCase,
    private getRoleUseCase: GetRoleUseCase,
    private listRolesUseCase: ListRolesUseCase,
    private updateRoleUseCase: UpdateRoleUseCase,
    private deleteRoleUseCase: DeleteRoleUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.createRoleUseCase.execute(req.body);
      return res.status(201).json({ data: role });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.getRoleUseCase.execute(req.params.id as string);
      return res.status(200).json({ data: role });
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await this.listRolesUseCase.execute();
      return res.status(200).json({ data: roles });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.updateRoleUseCase.execute(req.params.id as string, req.body);
      return res.status(200).json({ data: role });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteRoleUseCase.execute(req.params.id as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
