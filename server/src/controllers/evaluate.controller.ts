import type { Request, Response, NextFunction } from 'express';
import type { EvaluateUseCase } from '../usecases/evaluate.usecase';

export class EvaluateController {
  constructor(private evaluateUseCase: EvaluateUseCase) {}

  evaluate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await this.evaluateUseCase.execute(req.body);
      return res.status(200).json({
        meta: { server_time: Math.floor(Date.now() / 1000) },
        data: results,
      });
    } catch (error: any) {
      next(error);
    }
  };
}
