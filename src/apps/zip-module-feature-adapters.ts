export interface FeatureAdapterPayload {
  integration: 'database' | 'cache' | 'queue';
  operation: string;
  tenantId: string;
  userId?: string;
  input: Record<string, unknown>;
  featureTags: string[];
}

export function runFeatureAdapter(payload: FeatureAdapterPayload): Record<string, unknown> {
  const tags = new Set(payload.featureTags);

  if (tags.has('ml') || tags.has('learning')) {
    const values = Object.values(payload.input).filter(value => typeof value === 'number') as number[];
    const signal = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    return {
      adapter: 'ml-learning',
      integration: payload.integration,
      operation: payload.operation,
      score: Number((signal * 1.15 + 0.42).toFixed(4)),
      samples: values.length
    };
  }

  if (tags.has('nlp')) {
    const text = JSON.stringify(payload.input);
    return {
      adapter: 'nlp',
      integration: payload.integration,
      operation: payload.operation,
      tokensApprox: text.split(/\s+/).filter(Boolean).length,
      summary: text.slice(0, 140)
    };
  }

  if (tags.has('insight')) {
    const keys = Object.keys(payload.input);
    return {
      adapter: 'insight',
      integration: payload.integration,
      operation: payload.operation,
      dimensions: keys,
      dimensionCount: keys.length
    };
  }

  return {
    adapter: 'platform',
    integration: payload.integration,
    operation: payload.operation,
    status: 'connected',
    handledByTags: Array.from(tags)
  };
}
