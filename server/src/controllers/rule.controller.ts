import { Request, Response, NextFunction } from 'express';
import { AssignRuleUseCase } from '../usecases/assignRule.usecase';
import { AuditService } from '../services/audit.service';

export class RuleController {
  constructor(
    private assignRuleUseCase: AssignRuleUseCase,
    private auditService: AuditService,
  ) {}

  assign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key } = req.params as { key: string };
      const rule = await this.assignRuleUseCase.execute(key, req.body);

      if (req.auth) {
        this.auditService.log(
          { auth: req.auth, projectReference: req.body.project_reference },
          'CREATE',
          'RULE',
          rule.id,
          {},
          rule,
        );
      }

      return res.status(201).json({ data: rule });
    } catch (error: any) {
      next(error);
    }
  };
}
