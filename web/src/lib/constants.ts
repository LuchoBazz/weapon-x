export const PROJECT_REFS = [];
export const OPS = ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'REGEX'] as const;

export const DEFAULT_BOOLEAN_SCHEMA = {
  type: "boolean",
  default: false
};

export const DEFAULT_JSON_SCHEMA = {
  type: "object",
  required: [] as string[],
  properties: {}
};

export const DEFAULT_STRING_SCHEMA = {
  type: "string",
  default: ""
};

export const DEFAULT_SECRET_SCHEMA = {
  type: "string",
  default: ""
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
