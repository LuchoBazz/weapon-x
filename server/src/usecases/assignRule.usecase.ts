import type { IConfigRepository } from '../repository/config/interfaces';
import type { IRuleRepository } from '../repository/rule/interfaces';
import type { RuleEntity, CreateRuleDTO } from '../types';
import { NotFoundError, ValidationError } from '../errors';
import { validateAgainstSchema } from '../utils/schema-validator';
import { encrypt } from '../utils/crypto';

export class AssignRuleUseCase {
  constructor(
    private configRepo: IConfigRepository,
    private ruleRepo: IRuleRepository
  ) {}

  async execute(configKey: string, data: CreateRuleDTO): Promise<RuleEntity> {
    const config = await this.configRepo.findByKey(configKey, data.project_reference);
    if (!config) {
      throw new NotFoundError(`Configuration with key "${configKey}" not found for project "${data.project_reference}".`);
    }

    // Validate return_value length
    const serialized = typeof data.return_value === 'string'
      ? data.return_value
      : JSON.stringify(data.return_value);
    if (serialized && serialized.length > 32768) {
      throw new ValidationError(
        'Rule return_value must not exceed 32,768 characters.',
        [{ message: `Value is ${serialized.length} characters, max is 32,768.`, path: 'return_value' }],
      );
    }

    // Validate return_value against the config's validation_schema for JSON configs
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

    // Encrypt return_value for SECRET configs before persisting
    const ruleData = config.type === 'SECRET'
      ? { ...data, return_value: encrypt(String(data.return_value)) }
      : data;

    return this.ruleRepo.create(config.id, ruleData);
  }
}
