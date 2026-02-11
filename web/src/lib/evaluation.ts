export const evaluateCondition = (contextValue: unknown, operator: string, conditionValue: string): boolean => {
  const cv = String(contextValue || "").toLowerCase();
  const list = String(conditionValue).split(',').map(s => s.trim().toLowerCase());
  const scalarVal = String(conditionValue).toLowerCase();

  switch (operator) {
    case 'EQUALS': return cv === scalarVal;
    case 'NOT_EQUALS': return cv !== scalarVal;
    case 'IN': return list.includes(cv);
    case 'NOT_IN': return !list.includes(cv);
    case 'CONTAINS': return cv.includes(scalarVal);
    case 'GREATER_THAN': return parseFloat(cv) > parseFloat(scalarVal);
    case 'LESS_THAN': return parseFloat(cv) < parseFloat(scalarVal);
    case 'REGEX':
      try { return new RegExp(conditionValue).test(String(contextValue)); }
      catch { return false; }
    default: return false;
  }
};
