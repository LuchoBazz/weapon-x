import React, { useState, useRef } from 'react';
import { Save, Trash2, Plus, XCircle, AlertCircle, GripVertical, Eye, EyeOff, Lock } from 'lucide-react';
import { Config } from '@/lib/types';
import { PROJECT_REFS, OPS, DEFAULT_BOOLEAN_SCHEMA, DEFAULT_JSON_SCHEMA, DEFAULT_STRING_SCHEMA, DEFAULT_SECRET_SCHEMA, generateId } from '@/lib/constants';
import StatusBadge from './StatusBadge';
import ToggleSwitch from './ToggleSwitch';
import ProgressBar from './ProgressBar';

interface EditorProps {
  config?: Config;
  onSave: (c: Config) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

const Editor: React.FC<EditorProps> = ({ config: initialConfig, onSave, onCancel, onDelete }) => {
  const [config, setConfig] = useState<Config>(initialConfig || {
    project_reference: PROJECT_REFS[0],
    key: "",
    description: "",
    type: "BOOLEAN",
    is_active: true,
    default_value: false,
    validation_schema: DEFAULT_BOOLEAN_SCHEMA,
    rules: []
  });

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [ruleValueErrors, setRuleValueErrors] = useState<Record<number, string | null>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'rules' | 'schema'>('general');
  const [showSecretDefault, setShowSecretDefault] = useState(false);
  const [showSecretRules, setShowSecretRules] = useState<Record<number, boolean>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragNodeRef.current = index;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragNodeRef.current === null || dragNodeRef.current === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = dragNodeRef.current;
    if (fromIndex === null || fromIndex === dropIndex) return;
    const newRules = [...config.rules];
    const [moved] = newRules.splice(fromIndex, 1);
    newRules.splice(dropIndex, 0, moved);
    setConfig({ ...config, rules: newRules });
    setDragIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  };

  const handleJsonChange = (field: 'default_value' | 'validation_schema', value: string) => {
    try {
      const parsed = JSON.parse(value);
      setConfig({ ...config, [field]: parsed });
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError(`Invalid JSON in ${field}: ${(e as Error).message}`);
    }
  };

  const handleAddRule = () => {
    const newRule = {
      id: `rule_${generateId()}`,
      name: "New Target Rule",
      conditions: [{ attribute: "", operator: "EQUALS", value: "" }],
      return_value: config.type === 'BOOLEAN' ? true : (config.type === 'STRING' || config.type === 'SECRET') ? '' : {},
      rollout_percentage: 100
    };
    setConfig({ ...config, rules: [...config.rules, newRule] });
  };

  const updateRule = (index: number, field: string, value: unknown) => {
    const newRules = [...config.rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setConfig({ ...config, rules: newRules });
  };

  const removeRule = (index: number) => {
    setConfig({ ...config, rules: config.rules.filter((_, i) => i !== index) });
  };

  const updateCondition = (rIndex: number, cIndex: number, field: string, value: string) => {
    const newRules = [...config.rules];
    newRules[rIndex] = {
      ...newRules[rIndex],
      conditions: newRules[rIndex].conditions.map((c, i) => i === cIndex ? { ...c, [field]: value } : c)
    };
    setConfig({ ...config, rules: newRules });
  };

  const addCondition = (rIndex: number) => {
    const newRules = [...config.rules];
    newRules[rIndex] = {
      ...newRules[rIndex],
      conditions: [...newRules[rIndex].conditions, { attribute: "", operator: "EQUALS", value: "" }]
    };
    setConfig({ ...config, rules: newRules });
  };

  const removeCondition = (rIndex: number, cIndex: number) => {
    const newRules = [...config.rules];
    newRules[rIndex] = {
      ...newRules[rIndex],
      conditions: newRules[rIndex].conditions.filter((_, i) => i !== cIndex)
    };
    setConfig({ ...config, rules: newRules });
  };

  const tabs: Array<'general' | 'rules' | 'schema'> = ['general', 'rules', 'schema'];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {initialConfig ? `Edit: ${config.key}` : 'Create Feature Flag'}
          </h2>
          <p className="text-sm text-muted-foreground">Configure settings and targeting rules.</p>
        </div>
        <div className="flex gap-2">
          {initialConfig && (
            <button
              onClick={() => onDelete(config.id!)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-badge-red-bg text-badge-red-fg border border-badge-red-border hover:opacity-90 transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-card text-foreground border border-input hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!!jsonError || !config.key || Object.values(ruleValueErrors).some(e => !!e)}
            onClick={() => onSave(config)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-40"
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 bg-card border-b border-border flex gap-6 text-sm font-medium">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1 max-w-5xl mx-auto w-full">
        {jsonError && (
          <div className="mb-4 p-3 bg-badge-red-bg border border-badge-red-border text-badge-red-fg rounded-md flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {jsonError}
          </div>
        )}

        {activeTab === 'general' && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Reference</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md bg-card text-foreground focus:ring-2 focus:ring-ring"
                  value={config.project_reference}
                  onChange={e => setConfig({ ...config, project_reference: e.target.value })}
                >
                  {PROJECT_REFS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md bg-card text-foreground focus:ring-2 focus:ring-ring"
                  value={config.type}
                  disabled={!!initialConfig}
                  onChange={e => {
                    const newType = e.target.value as 'BOOLEAN' | 'JSON' | 'STRING' | 'SECRET';
                    const defaults: Record<string, { value: boolean | string | Record<string, unknown>; schema: Record<string, unknown> }> = {
                      BOOLEAN: { value: false, schema: DEFAULT_BOOLEAN_SCHEMA },
                      JSON: { value: {}, schema: DEFAULT_JSON_SCHEMA },
                      STRING: { value: '', schema: DEFAULT_STRING_SCHEMA },
                      SECRET: { value: '', schema: DEFAULT_SECRET_SCHEMA },
                    };
                    const d = defaults[newType];
                    setConfig({
                      ...config,
                      type: newType,
                      default_value: d.value,
                      validation_schema: d.schema,
                    });
                  }}
                >
                  <option value="BOOLEAN">Boolean (Toggle)</option>
                  <option value="JSON">JSON Configuration</option>
                  <option value="STRING">String Value</option>
                  <option value="SECRET">🔒 Secret (Encrypted)</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Key <span className="text-xs text-muted-foreground">(Unique identifier)</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-card text-foreground focus:ring-2 focus:ring-ring"
                  placeholder="e.g. new_feature_v2"
                  value={config.key}
                  onChange={e => setConfig({ ...config, key: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card text-foreground focus:ring-2 focus:ring-ring"
                  rows={2}
                  value={config.description}
                  onChange={e => setConfig({ ...config, description: e.target.value })}
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Default Value <StatusBadge color="blue">Fallback</StatusBadge>
                </label>
                <div className="p-4 bg-surface-raised border border-border rounded-md">
                  {config.type === 'BOOLEAN' ? (
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${!config.default_value ? 'text-foreground' : 'text-muted-foreground'}`}>OFF</span>
                      <ToggleSwitch checked={!!config.default_value} onChange={() => setConfig({ ...config, default_value: !config.default_value })} />
                      <span className={`text-sm font-medium ${config.default_value ? 'text-foreground' : 'text-muted-foreground'}`}>ON</span>
                    </div>
                  ) : config.type === 'SECRET' ? (
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showSecretDefault ? 'text' : 'password'}
                        className="w-full pl-9 pr-10 py-2 border border-input rounded font-mono text-sm bg-card text-foreground focus:ring-2 focus:ring-ring"
                        placeholder="Enter secret value…"
                        value={String(config.default_value ?? '')}
                        onChange={(e) => setConfig({ ...config, default_value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretDefault(!showSecretDefault)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        title={showSecretDefault ? 'Hide value' : 'Show value'}
                      >
                        {showSecretDefault ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  ) : config.type === 'STRING' ? (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-input rounded font-mono text-sm bg-card text-foreground focus:ring-2 focus:ring-ring"
                      placeholder="Enter default string value…"
                      value={String(config.default_value ?? '')}
                      onChange={(e) => setConfig({ ...config, default_value: e.target.value })}
                    />
                  ) : (
                    <textarea
                      className="w-full h-32 font-mono text-xs p-3 border border-input rounded bg-card text-foreground focus:ring-2 focus:ring-ring"
                      defaultValue={JSON.stringify(config.default_value, null, 2)}
                      onChange={(e) => handleJsonChange('default_value', e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-foreground">Targeting Rules</h3>
                {config.rules.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">Drag rules to reorder. Priority 0 (top) is evaluated first.</p>
                )}
              </div>
              <button
                onClick={handleAddRule}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-card text-foreground border border-input hover:bg-accent transition-colors"
              >
                <Plus size={16} /> Add Rule
              </button>
            </div>

            {config.rules.length === 0 && (
              <div className="text-center py-12 bg-card rounded-lg border border-dashed border-primary/30 text-muted-foreground">
                No rules defined. Everyone will receive the Default Value.
              </div>
            )}

            {config.rules.map((rule, rIndex) => (
              <div
                key={rule.id || rIndex}
                draggable
                onDragStart={() => handleDragStart(rIndex)}
                onDragOver={(e) => handleDragOver(e, rIndex)}
                onDrop={(e) => handleDrop(e, rIndex)}
                onDragEnd={handleDragEnd}
                className={`bg-card border border-border rounded-lg p-4 border-l-4 border-l-rule-accent shadow-sm transition-all duration-200 ${
                  dragIndex === rIndex ? 'opacity-40 scale-[0.98]' : ''
                } ${dragOverIndex === rIndex && dragIndex !== rIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors" title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0">
                      {rIndex}
                    </span>
                    <input
                      type="text"
                      className="font-medium text-foreground border border-transparent hover:border-input focus:border-input focus:ring-2 focus:ring-ring rounded px-2 py-1 bg-transparent placeholder-muted-foreground flex-1 outline-none transition-colors"
                      placeholder="Rule Name (e.g. VIP Users)"
                      value={rule.name}
                      onChange={(e) => updateRule(rIndex, 'name', e.target.value)}
                    />
                  </div>
                  <button onClick={() => removeRule(rIndex)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3 bg-accent/50 p-3 rounded-md border border-border">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Conditions (ALL match)</div>
                  {rule.conditions.map((cond, cIndex) => (
                    <div key={cIndex} className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                      <input
                        placeholder="Attribute (e.g. email)"
                        className="flex-1 w-full px-2 py-1 text-sm border border-input rounded bg-card text-foreground focus:ring-ring"
                        value={cond.attribute}
                        onChange={(e) => updateCondition(rIndex, cIndex, 'attribute', e.target.value)}
                      />
                      <select
                        className="w-full md:w-32 px-2 py-1 text-sm border border-input rounded bg-card text-foreground focus:ring-ring"
                        value={cond.operator}
                        onChange={(e) => updateCondition(rIndex, cIndex, 'operator', e.target.value)}
                      >
                        {OPS.map(op => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <input
                        placeholder="Value (e.g. @company.com)"
                        className="flex-1 w-full px-2 py-1 text-sm border border-input rounded bg-card text-foreground focus:ring-ring"
                        value={cond.value}
                        onChange={(e) => updateCondition(rIndex, cIndex, 'value', e.target.value)}
                      />
                      <button onClick={() => removeCondition(rIndex, cIndex)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addCondition(rIndex)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-2">
                    <Plus size={12} /> Add Condition
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Return Value</label>
                  {config.type === 'BOOLEAN' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">Value if matched:</span>
                      <ToggleSwitch
                        checked={!!rule.return_value}
                        onChange={() => updateRule(rIndex, 'return_value', !rule.return_value)}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-foreground">{rule.return_value ? 'TRUE' : 'FALSE'}</span>
                    </div>
                  ) : config.type === 'SECRET' ? (
                    <>
                      <div className="relative">
                        <Lock size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showSecretRules[rIndex] ? 'text' : 'password'}
                          className={`w-full pl-8 pr-10 py-1 text-sm font-mono border rounded bg-card text-foreground focus:ring-ring ${ruleValueErrors[rIndex] ? 'border-destructive' : 'border-input'}`}
                          placeholder="Return secret value…"
                          maxLength={32768}
                          value={String(rule.return_value ?? '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateRule(rIndex, 'return_value', val);
                            setRuleValueErrors(prev => ({
                              ...prev,
                              [rIndex]: val.length > 32768 ? 'Return value must not exceed 32,768 characters.' : null,
                            }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecretRules(prev => ({ ...prev, [rIndex]: !prev[rIndex] }))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSecretRules[rIndex] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {ruleValueErrors[rIndex] && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle size={12} />{ruleValueErrors[rIndex]}</p>
                      )}
                    </>
                  ) : config.type === 'STRING' ? (
                    <>
                      <input
                        type="text"
                        className={`w-full px-2 py-1 text-sm font-mono border rounded bg-card text-foreground focus:ring-ring ${ruleValueErrors[rIndex] ? 'border-destructive' : 'border-input'}`}
                        placeholder="Return string value…"
                        maxLength={32768}
                        value={String(rule.return_value ?? '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateRule(rIndex, 'return_value', val);
                          setRuleValueErrors(prev => ({
                            ...prev,
                            [rIndex]: val.length > 32768 ? 'Return value must not exceed 32,768 characters.' : null,
                          }));
                        }}
                      />
                      {ruleValueErrors[rIndex] && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle size={12} />{ruleValueErrors[rIndex]}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <textarea
                        className={`w-full h-24 font-mono text-xs p-2 border rounded bg-card text-foreground focus:ring-ring ${ruleValueErrors[rIndex] ? 'border-destructive' : 'border-input'}`}
                        defaultValue={JSON.stringify(rule.return_value, null, 2)}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val.length > 32768) {
                            setRuleValueErrors(prev => ({ ...prev, [rIndex]: 'Return value must not exceed 32,768 characters.' }));
                            return;
                          }
                          try {
                            updateRule(rIndex, 'return_value', JSON.parse(val));
                            setJsonError(null);
                            setRuleValueErrors(prev => ({ ...prev, [rIndex]: null }));
                          } catch {
                            setJsonError(`Invalid JSON in rule ${rIndex + 1} return value`);
                          }
                        }}
                      />
                      {ruleValueErrors[rIndex] && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle size={12} />{ruleValueErrors[rIndex]}</p>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Rollout Percentage</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-20 px-2 py-1 text-sm border border-input rounded bg-card text-foreground focus:ring-2 focus:ring-ring"
                        value={rule.rollout_percentage ?? 100}
                        onChange={(e) => {
                          const raw = parseInt(e.target.value, 10);
                          const clamped = isNaN(raw) ? 100 : Math.max(0, Math.min(100, raw));
                          updateRule(rIndex, 'rollout_percentage', clamped);
                        }}
                      />
                      <span className="text-sm font-medium text-muted-foreground">%</span>
                    </div>
                    <div className="flex-1">
                      <ProgressBar
                        value={rule.rollout_percentage ?? 100}
                        size="md"
                        onChange={(val) => updateRule(rIndex, 'rollout_percentage', val)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage of users who will receive this rule's value when conditions match.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col shadow-sm">
            <div className="mb-4">
              <h3 className="font-medium text-foreground">Validation Schema</h3>
              <p className="text-sm text-muted-foreground">Define the expected structure using JSON Schema draft.</p>
            </div>
            <textarea
              className="w-full flex-1 min-h-[300px] font-mono text-xs p-3 border border-input rounded bg-surface-code text-foreground focus:ring-2 focus:ring-ring"
              defaultValue={JSON.stringify(config.validation_schema, null, 2)}
              onChange={(e) => handleJsonChange('validation_schema', e.target.value)}
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
