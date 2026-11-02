// A validator inspects a request body and returns error messages (empty when valid).
export type Validator = (body: Record<string, unknown>) => string[];
