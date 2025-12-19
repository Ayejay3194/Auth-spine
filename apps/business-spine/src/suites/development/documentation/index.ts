// Documentation Suite - Documentation Tools
// Exports documentation-related functionality

// Documentation Components
// export { default as DocGenerator } from './components/DocGenerator';
// export { default as DocViewer } from './components/DocViewer';
// export { default as DocEditor } from './components/DocEditor';

// Documentation Hooks
// export { default as useDocumentation } from './hooks/useDocumentation';
// export { default as useDocGenerator } from './hooks/useDocGenerator';

// Documentation Services
// export { default as documentationService } from './services/documentationService';

// Documentation Types
export interface DocumentationPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  lastUpdated: Date;
  version: string;
}

export interface DocumentationCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  pages: string[];
}

export interface DocumentationTemplate {
  id: string;
  name: string;
  type: 'api' | 'guide' | 'tutorial' | 'reference';
  template: string;
  variables: string[];
}

// Documentation Constants
export const DOC_TYPES = {
  API: 'api',
  GUIDE: 'guide',
  TUTORIAL: 'tutorial',
  REFERENCE: 'reference'
} as const;
