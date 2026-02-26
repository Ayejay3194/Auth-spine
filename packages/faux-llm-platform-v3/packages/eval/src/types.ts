export interface EvalCase {
  id: string;
  prompt: string;
  mustContain?: string[];
  mustNotContain?: string[];
}

export interface EvalResult {
  id: string;
  ok: boolean;
  issues: string[];
}
