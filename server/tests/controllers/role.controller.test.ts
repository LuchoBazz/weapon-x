import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { RoleController } from '../../src/controllers/role.controller';

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

describe('RoleController', () => {
  let ucs: ReturnType<typeof createMockUseCases>;
  let controller: RoleController;

  beforeEach(() => {
    ucs = createMockUseCases();
    controller = new RoleController(ucs.create as any, ucs.get as any, ucs.list as any, ucs.update as any, ucs.del as any);
  });

  // ── create ──
  it('create should return 201 with role data', async () => {
    const role = { id: 'r1', name: 'admin', permissions: ['read'] };
    ucs.create.execute.mockResolvedValue(role);
    const { req, res, next } = mockReqResNext({ name: 'admin', permissions: ['read'] });
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: role });
  });

  it('create should call next on error', async () => {
    ucs.create.execute.mockRejectedValue(new Error('conflict'));
    const { req, res, next } = mockReqResNext({});
    await controller.create(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── getOne ──
  it('getOne should return 200 with role', async () => {
    const role = { id: 'r1', name: 'admin', permissions: ['read'] };
    ucs.get.execute.mockResolvedValue(role);
    const { req, res, next } = mockReqResNext({}, { id: 'r1' });
    await controller.getOne(req, res, next);
    expect(ucs.get.execute).toHaveBeenCalledWith('r1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: role });
  });

  it('getOne should call next on error', async () => {
    ucs.get.execute.mockRejectedValue(new Error('not found'));
    const { req, res, next } = mockReqResNext({}, { id: 'x' });
    await controller.getOne(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── list ──
  it('list should return 200 with array', async () => {
    ucs.list.execute.mockResolvedValue([{ id: 'r1' }]);
    const { req, res, next } = mockReqResNext();
    await controller.list(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: 'r1' }] });
  });

  it('list should call next on error', async () => {
    ucs.list.execute.mockRejectedValue(new Error('db'));
    const { req, res, next } = mockReqResNext();
    await controller.list(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── update ──
  it('update should return 200 with updated role', async () => {
    const updated = { id: 'r1', name: 'editor', permissions: ['read', 'write'] };
    ucs.update.execute.mockResolvedValue(updated);
    const { req, res, next } = mockReqResNext({ name: 'editor' }, { id: 'r1' });
    await controller.update(req, res, next);
    expect(ucs.update.execute).toHaveBeenCalledWith('r1', { name: 'editor' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('update should call next on error', async () => {
    ucs.update.execute.mockRejectedValue(new Error('not found'));
    const { req, res, next } = mockReqResNext({}, { id: 'x' });
    await controller.update(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ── remove ──
  it('remove should return 204 with no body', async () => {
    ucs.del.execute.mockResolvedValue(undefined);
    const { req, res, next } = mockReqResNext({}, { id: 'r1' });
    await controller.remove(req, res, next);
    expect(ucs.del.execute).toHaveBeenCalledWith('r1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('remove should call next on error', async () => {
    ucs.del.execute.mockRejectedValue(new Error('not found'));
    const { req, res, next } = mockReqResNext({}, { id: 'x' });
    await controller.remove(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
