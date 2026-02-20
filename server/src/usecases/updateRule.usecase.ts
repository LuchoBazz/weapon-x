import type { IRuleRepository } from '../repository/rule/interfaces';
import type { IConfigRepository } from '../repository/config/interfaces';
import type { RuleEntity, UpdateRuleDTO } from '../types';
import { NotFoundError, ValidationError } from '../errors';
import { validateAgainstSchema } from '../utils/schema-validator';
import { encrypt } from '../utils/crypto';

export class UpdateRuleUseCase {
  constructor(
    private configRepo: IConfigRepository,
    private ruleRepo: IRuleRepository
  ) {}

  async execute(id: string, data: UpdateRuleDTO): Promise<RuleEntity> {
    const rule = await this.ruleRepo.findById(id);
    if (!rule) {
      throw new NotFoundError(`Rule with ID "${id}" not found.`);
    }

    const config = await this.configRepo.findById(rule.configuration_id);
    if (!config) {
      throw new NotFoundError(`Configuration for rule "${id}" not found.`);
    }

    if (data.return_value !== undefined) {
      const serialized = typeof data.return_value === 'string'
        ? data.return_value
        : JSON.stringify(data.return_value);
      if (serialized && serialized.length > 32768) {
        throw new ValidationError(
          'Rule return_value must not exceed 32,768 characters.',
          [{ message: `Value is ${serialized.length} characters, max is 32,768.`, path: 'return_value' }],
        );
      }

      if (
        config.type === 'JSON' &&
        config.validation_schema &&
        Object.keys(config.validation_schema).length > 0
      ) {
        const result = validateAgainstSchema(config.validation_schema, data.return_value);
        if (!result.valid) {
          throw new ValidationError(
            `Rule return_value does not match the configuration's validation schema.`,
            result.errors,
          );
        }
      }
    }

    let ruleData = data;
    if (data.return_value !== undefined && config.type === 'SECRET') {
      ruleData = { ...data, return_value: encrypt(String(data.return_value)) };
    }

    return this.ruleRepo.update(id, ruleData);
  }
}
