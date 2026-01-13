import { Intent, AssistantContext } from './types.js';
export type Pattern = {
    spine: string;
    intent: string;
    re: string;
    baseConfidence: number;
    hint: string;
};
export declare function detectByPatterns(patterns: Pattern[], text: string, ctx: AssistantContext): Intent[];
//# sourceMappingURL=intent.d.ts.map