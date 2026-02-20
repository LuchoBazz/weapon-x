import type { Request, Response, NextFunction } from 'express';
import type { CreateConfigUseCase } from '../usecases/createConfig.usecase';
import type { UpdateConfigUseCase } from '../usecases/updateConfig.usecase';
import type { AuditService } from '../services/audit.service';

export class ConfigController {
  constructor(
    private createConfigUseCase: CreateConfigUseCase,
    private updateConfigUseCase: UpdateConfigUseCase,
    private auditService: AuditService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.createConfigUseCase.execute(req.body);

      if (req.auth) {
        this.auditService.log(
          { auth: req.auth, projectReference: config.project_reference },
          'CREATE',
          'CONFIGURATION',
          config.id,
          {},
          config,
        );
      }

      return res.status(201).json({ data: config });
    } catch (error: any) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const config = await this.updateConfigUseCase.execute(id as string, req.body);

      if (req.auth) {
        this.auditService.log(
          { auth: req.auth, projectReference: config.project_reference },
          'UPDATE',
          'CONFIGURATION',
          config.id,
          {},
          config,
        );
      }

      return res.json({ data: config });
    } catch (error: any) {
      next(error);
    }
  };
}
