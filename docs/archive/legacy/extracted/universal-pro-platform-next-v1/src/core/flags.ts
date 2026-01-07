import type { FeatureFlags } from './types';
export class SimpleFlags implements FeatureFlags { constructor(private on = new Set<string>()){} enabled(key: string){ return this.on.has(key);} }
