import type { Request, Response, NextFunction } from 'express';
import type { CreateConfigUseCase } from '../usecases/createConfig.usecase';
import type { AuditService } from '../services/audit.service';

export class ConfigController {
  constructor(
    private createConfigUseCase: CreateConfigUseCase,
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
}
