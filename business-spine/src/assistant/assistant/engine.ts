import { AssistantContext, Suggestion } from './types';
export interface Engine { name: string; run(ctx: AssistantContext): Suggestion[]; }
