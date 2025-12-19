/**
 * Template exports for Vibe Coding Disasters Kit
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface Template {
  name: string;
  content: string;
  description: string;
}

export class TemplateManager {
  private templatesDir: string;

  constructor() {
    this.templatesDir = join(__dirname, '.');
  }

  /**
   * Get PR checklist template
   */
  getPRChecklistTemplate(): Template {
    const content = readFileSync(
      join(this.templatesDir, 'PR_CHECKLIST.md'),
      'utf-8'
    );

    return {
      name: 'PR Checklist',
      content,
      description: 'Pull request checklist for preventing vibe coding disasters'
    };
  }

  /**
   * Get release checklist template
   */
  getReleaseChecklistTemplate(): Template {
    const content = readFileSync(
      join(this.templatesDir, 'RELEASE_CHECKLIST.md'),
      'utf-8'
    );

    return {
      name: 'Release Checklist',
      content,
      description: 'Release checklist for deployment safety'
    };
  }

  /**
   * Get CI guardrails template
   */
  getCIGuardrailsTemplate(): Template {
    const content = readFileSync(
      join(this.templatesDir, 'CI_GUARDRAILS.md'),
      'utf-8'
    );

    return {
      name: 'CI Guardrails',
      content,
      description: 'CI/CD pipeline guardrails to prevent disasters'
    };
  }

  /**
   * Get all templates
   */
  getAllTemplates(): Template[] {
    return [
      this.getPRChecklistTemplate(),
      this.getReleaseChecklistTemplate(),
      this.getCIGuardrailsTemplate()
    ];
  }
}

// Export singleton instance
export const templateManager = new TemplateManager();
