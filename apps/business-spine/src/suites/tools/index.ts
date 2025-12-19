// Tools Suite - Developer tools and utilities

// Components
export { default as UITroubleshootKit } from '../../app/tools/ui-troubleshoot/page';

// Types
export interface TroubleshootItem {
  id: string;
  problem: string;
  solutions: string[];
  code: string;
}

export interface TroubleshootCategory {
  [category: string]: TroubleshootItem[];
}
