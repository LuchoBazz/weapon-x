import type { Request, Response, NextFunction } from 'express';
import type { CreateProjectUseCase } from '../usecases/createProject.usecase';
import type { GetProjectUseCase, ListProjectsUseCase } from '../usecases/getProject.usecase';
import type { UpdateProjectUseCase } from '../usecases/updateProject.usecase';
import type { DeleteProjectUseCase } from '../usecases/deleteProject.usecase';

export class ProjectController {
  constructor(
    private createProjectUseCase: CreateProjectUseCase,
    private getProjectUseCase: GetProjectUseCase,
    private listProjectsUseCase: ListProjectsUseCase,
    private updateProjectUseCase: UpdateProjectUseCase,
    private deleteProjectUseCase: DeleteProjectUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.createProjectUseCase.execute(req.body);
      return res.status(201).json({ data: project });
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.getProjectUseCase.execute(req.params.reference as string);
      return res.status(200).json({ data: project });
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.listProjectsUseCase.execute();
      return res.status(200).json({ data: projects });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.updateProjectUseCase.execute(req.params.reference as string, req.body);
      return res.status(200).json({ data: project });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteProjectUseCase.execute(req.params.reference as string);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
