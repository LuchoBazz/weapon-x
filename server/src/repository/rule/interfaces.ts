import type { RuleEntity, CreateRuleDTO, UpdateRuleDTO } from '../../types';

export interface IRuleRepository {
  create(configurationId: string, data: CreateRuleDTO): Promise<RuleEntity>;
  findById(id: string): Promise<RuleEntity | null>;
  findByConfigurationId(configurationId: string): Promise<RuleEntity[]>;
  update(id: string, data: UpdateRuleDTO): Promise<RuleEntity>;
  delete(id: string): Promise<void>;
}
