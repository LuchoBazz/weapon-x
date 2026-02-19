import type { CreateEnvironmentUseCase } from '@/usecases/createEnvironment.usecase';
import type { DeleteEnvironmentUseCase } from '@/usecases/deleteEnvironment.usecase';
import type { GetEnvironmentUseCase, ListEnvironmentsUseCase } from '@/usecases/getEnvironment.usecase';
import type { UpdateEnvironmentUseCase } from '@/usecases/updateEnvironment.usecase';
import type { Request, Response, NextFunction } from 'express';


export class EnvironmentController {
  constructor(
    private createUseCase: CreateEnvironmentUseCase,
    private getUseCase: GetEnvironmentUseCase,
    private listUseCase: ListEnvironmentsUseCase,
    private updateUseCase: UpdateEnvironmentUseCase,
    private deleteUseCase: DeleteEnvironmentUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const env = await this.createUseCase.execute(req.body);
      return res.status(201).json({ data: env });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const env = await this.getUseCase.execute(req.params.id as string);
      return res.status(200).json({ data: env });
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const envs = await this.listUseCase.execute();
      return res.status(200).json({ data: envs });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const env = await this.updateUseCase.execute(req.params.id as string, req.body);
      return res.status(200).json({ data: env });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteUseCase.execute(req.params.id as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
