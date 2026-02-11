import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaConfigRepository } from '../../src/repository/config/prisma/config.repository';
import { CreateConfigDTO } from '../../src/types';
import { encrypt } from '../../src/utils/crypto';

function createMockPrisma() {
  return {
    configuration: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  } as any;
}

const NOW = new Date('2025-01-01T00:00:00Z');

describe('PrismaConfigRepository – SECRET type', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaConfigRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaConfigRepository(prisma);
  });

  // ── Create ──

  it('should encrypt default_value when creating a SECRET config', async () => {
    const plaintext = 'sk_live_abc123';
    const encrypted = encrypt(plaintext);

    prisma.configuration.create.mockResolvedValue({
      id: 'cfg-s1',
      project_reference: 'PROJ_A',
      key: 'api_key',
      description: '',
      type: 'SECRET',
      is_active: true,
      default_value: encrypted,
      validation_schema: {},
      created_at: NOW,
      updated_at: NOW,
    });

    const dto: CreateConfigDTO = {
      project_reference: 'PROJ_A',
      key: 'api_key',
      type: 'SECRET',
      is_active: true,
      default_value: plaintext,
    };

    const result = await repo.create(dto);

    // Verify ciphertext was sent to DB
    expect(prisma.configuration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          default_value: encrypted,
        }),
      }),
    );

    // Verify plaintext is returned from entity
    expect(result.default_value).toBe(plaintext);
  });

  it('should NOT encrypt default_value for non-SECRET configs', async () => {
    const value = 'hello';
    prisma.configuration.create.mockResolvedValue({
      id: 'cfg-1',
      project_reference: 'PROJ_A',
      key: 'greeting',
      description: '',
      type: 'STRING',
      is_active: true,
      default_value: value,
      validation_schema: {},
      created_at: NOW,
      updated_at: NOW,
    });

    const dto: CreateConfigDTO = {
      project_reference: 'PROJ_A',
      key: 'greeting',
      type: 'STRING',
      is_active: true,
      default_value: value,
    };

    await repo.create(dto);

    expect(prisma.configuration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          default_value: value,
        }),
      }),
    );
  });

  // ── Read / toEntity ──

  it('should decrypt default_value when reading a SECRET config', async () => {
    const plaintext = 'my-secret-token';
    const ciphertext = encrypt(plaintext);

    prisma.configuration.findFirst.mockResolvedValue({
      id: 'cfg-s1',
      project_reference: 'PROJ_A',
      key: 'token',
      description: '',
      type: 'SECRET',
      is_active: true,
      default_value: ciphertext,
      validation_schema: {},
      created_at: NOW,
      updated_at: NOW,
    });

    const result = await repo.findByKey('token', 'PROJ_A');
    expect(result!.default_value).toBe(plaintext);
  });

  it('should decrypt rule return_values when reading a SECRET config with rules', async () => {
    const plainRuleValue = 'secret-rule-value';
    const encryptedRuleValue = encrypt(plainRuleValue);

    prisma.configuration.findFirst.mockResolvedValue({
      id: 'cfg-s1',
      project_reference: 'PROJ_A',
      key: 'token',
      description: '',
      type: 'SECRET',
      is_active: true,
      default_value: encrypt('default-secret'),
      validation_schema: {},
      created_at: NOW,
      updated_at: NOW,
      rules: [
        {
          id: 'rule-1',
          configuration_id: 'cfg-s1',
          name: 'VIP rule',
          conditions: [],
          return_value: encryptedRuleValue,
          priority: 0,
          created_at: NOW,
          updated_at: NOW,
        },
      ],
    });

    const result = await repo.findByKeyWithRules('token', 'PROJ_A');
    expect(result!.rules![0].return_value).toBe(plainRuleValue);
  });

  // ── Update ──

  it('should encrypt default_value when updating a SECRET config', async () => {
    const newPlaintext = 'new-secret-value';
    const newEncrypted = encrypt(newPlaintext);

    prisma.configuration.findUnique.mockResolvedValue({ type: 'SECRET' });
    prisma.configuration.update.mockResolvedValue({
      id: 'cfg-s1',
      project_reference: 'PROJ_A',
      key: 'api_key',
      description: '',
      type: 'SECRET',
      is_active: true,
      default_value: newEncrypted,
      validation_schema: {},
      created_at: NOW,
      updated_at: NOW,
    });

    const result = await repo.update('cfg-s1', { default_value: newPlaintext });

    expect(prisma.configuration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          default_value: newEncrypted,
        }),
      }),
    );

    // Returned entity should have decrypted value
    expect(result.default_value).toBe(newPlaintext);
  });
});
