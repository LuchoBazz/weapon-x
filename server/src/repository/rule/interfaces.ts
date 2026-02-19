import type { RuleEntity, CreateRuleDTO } from '../../types';

export interface IRuleRepository {
  create(configurationId: string, data: CreateRuleDTO): Promise<RuleEntity>;
  findByConfigurationId(configurationId: string): Promise<RuleEntity[]>;
  delete(id: string): Promise<void>;
}
