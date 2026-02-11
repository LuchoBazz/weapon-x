import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ProjectController } from '../../src/controllers/project.controller';

function mockReqResNext(body = {}, params = {}) {
  const req = { body, params } as unknown as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

function createMockUseCases() {
  return {
    create: { execute: vi.fn() },
    get: { execute: vi.fn() },
    list: { execute: vi.fn() },
    update: { execute: vi.fn() },
    del: { execute: vi.fn() },
  };
}

describe('ProjectController', () => {
  let ucs: ReturnType<typeof createMockUseCases>;
  let controller: ProjectController;

  beforeEach(() => {
    ucs = createMockUseCases();
    controller = new ProjectController(ucs.create as any, ucs.get as any, ucs.list as any, ucs.update as any, ucs.del as any);
  });

  // ── create ──

  it('create should return 201 with project data', async () => {
    const project = { reference: 'PROJ', name: 'Alpha' };
    ucs.create.execute.mockResolvedValue(project);
    const { req, res, next } = mockReqResNext({ reference: 'PROJ', name: 'Alpha' });
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: project });
  });

  it('create should call next on error', async () => {
    ucs.create.execute.mockRejectedValue(new Error('conflict'));
    const { req, res, next } = mockReqResNext({});
    await controller.create(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── getOne ──

  it('getOne should return 200 with project and relations', async () => {
    const project = { reference: 'PROJ', name: 'Alpha', configurations: [], authentications: [] };
    ucs.get.execute.mockResolvedValue(project);
    const { req, res, next } = mockReqResNext({}, { reference: 'PROJ' });
    await controller.getOne(req, res, next);
    expect(ucs.get.execute).toHaveBeenCalledWith('PROJ');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: project });
  });

  it('getOne should call next on error', async () => {
    ucs.get.execute.mockRejectedValue(new Error('not found'));
    const { req, res, next } = mockReqResNext({}, { reference: 'X' });
    await controller.getOne(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── list ──

  it('list should return 200 with array', async () => {
    ucs.list.execute.mockResolvedValue([{ reference: 'A' }]);
    const { req, res, next } = mockReqResNext();
    await controller.list(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [{ reference: 'A' }] });
  });

  it('list should call next on error', async () => {
    ucs.list.execute.mockRejectedValue(new Error('db'));
    const { req, res, next } = mockReqResNext();
    await controller.list(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── update ──

  it('update should return 200 with updated project', async () => {
    const updated = { reference: 'PROJ', name: 'Beta' };
    ucs.update.execute.mockResolvedValue(updated);
    const { req, res, next } = mockReqResNext({ name: 'Beta' }, { reference: 'PROJ' });
    await controller.update(req, res, next);
    expect(ucs.update.execute).toHaveBeenCalledWith('PROJ', { name: 'Beta' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('update should call next on error', async () => {
    ucs.update.execute.mockRejectedValue(new Error('not found'));
    const { req, res, next } = mockReqResNext({}, { reference: 'X' });
    await controller.update(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── remove ──

  it('remove should return 204 with no body', async () => {
    ucs.del.execute.mockResolvedValue(undefined);
    const { req, res, next } = mockReqResNext({}, { reference: 'PROJ' });
    await controller.remove(req, res, next);
    expect(ucs.del.execute).toHaveBeenCalledWith('PROJ');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('remove should call next on error', async () => {
    ucs.del.execute.mockRejectedValue(new Error('not found'));
    const { req, res, next } = mockReqResNext({}, { reference: 'X' });
    await controller.remove(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
