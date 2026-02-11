import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { EvaluateController } from '../../src/controllers/evaluate.controller';
import { EvaluateUseCase } from '../../src/usecases/evaluate.usecase';

function mockReqResNext(body = {}) {
  const req = { body } as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('EvaluateController', () => {
  let useCase: { execute: ReturnType<typeof vi.fn> };
  let controller: EvaluateController;

  beforeEach(() => {
    useCase = { execute: vi.fn() };
    controller = new EvaluateController(useCase as unknown as EvaluateUseCase);
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  it('should return 200 with meta.server_time and evaluated data', async () => {
    const results = { flag: { value: true, rule_id: 'r1', reason: 'MATCH' } };
    useCase.execute.mockResolvedValue(results);
    const { req, res, next } = mockReqResNext({ filters: {}, keys: ['flag'] });

    await controller.evaluate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      meta: { server_time: 1700000000 },
      data: results,
    });
  });

  it('should call next with error when use case throws', async () => {
    const error = new Error('db error');
    useCase.execute.mockRejectedValue(error);
    const { req, res, next } = mockReqResNext({});

    await controller.evaluate(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
