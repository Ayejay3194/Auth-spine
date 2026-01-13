import type { PromptContext, Message, NLUIntent } from "../core/types.js";

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: string;
}

export interface PromptExample {
  input: string;
  output: string;
  context?: Partial<PromptContext>;
  category?: string;
}

export class PromptBuilder {
  private templates: Map<string, PromptTemplate> = new Map();
  private examples: PromptExample[] = [];
  private systemPrompts: Map<string, string> = new Map();

  addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  addExample(example: PromptExample): void {
    this.examples.push(example);
  }

  addSystemPrompt(category: string, prompt: string): void {
    this.systemPrompts.set(category, prompt);
  }

  buildPrompt(
    context: PromptContext,
    templateId?: string,
    includeExamples: boolean = true,
    maxExamples: number = 3
  ): string {
    const template = templateId ? this.templates.get(templateId) : this.getDefaultTemplate(context);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let prompt = "";

    // Add system prompt
    const systemPrompt = this.getSystemPrompt(context);
    if (systemPrompt) {
      prompt += `System: ${systemPrompt}\n\n`;
    }

    // Add context information
    prompt += this.buildContextSection(context);

    // Add examples if requested
    if (includeExamples && this.examples.length > 0) {
      prompt += this.buildExamplesSection(context, maxExamples);
    }

    // Add the main template
    prompt += this.fillTemplate(template, context);

    return prompt;
  }

  private getDefaultTemplate(context: PromptContext): PromptTemplate | null {
    // Default template based on intent
    if (context.intent?.intent === "book_appointment") {
      return this.templates.get("booking_response");
    } else if (context.intent?.intent === "pricing_inquiry") {
      return this.templates.get("pricing_response");
    } else if (context.intent?.intent === "service_inquiry") {
      return this.templates.get("service_response");
    }
    
    return this.templates.get("general_response");
  }

  private getSystemPrompt(context: PromptContext): string {
    const category = context.vertical || "general";
    return this.systemPrompts.get(category) || this.systemPrompts.get("general") || "";
  }

  private buildContextSection(context: PromptContext): string {
    let section = "Context:\n";
    
    if (context.vertical) {
      section += `- Industry: ${context.vertical}\n`;
    }
    
    if (context.clientId) {
      section += `- Client ID: ${context.clientId}\n`;
    }
    
    if (context.professionalId) {
      section += `- Professional ID: ${context.professionalId}\n`;
    }

    if (context.intent) {
      section += `- Detected Intent: ${context.intent.intent} (confidence: ${context.intent.confidence})\n`;
      
      if (context.intent.entities.length > 0) {
        section += `- Entities: ${context.intent.entities.map(e => `${e.type}: ${e.value}`).join(", ")}\n`;
      }
    }

    if (context.conversationHistory.length > 0) {
      section += "\nRecent Messages:\n";
      const recentMessages = context.conversationHistory.slice(-5); // Last 5 messages
      for (const msg of recentMessages) {
        const role = msg.fromId === context.clientId ? "Client" : "Professional";
        section += `${role}: ${msg.content}\n`;
      }
    }

    section += "\n";
    return section;
  }

  private buildExamplesSection(context: PromptContext, maxExamples: number): string {
    let section = "Examples:\n";
    
    // Filter examples by context
    let relevantExamples = this.examples;
    
    if (context.intent) {
      relevantExamples = this.examples.filter(ex => 
        ex.context?.intent === context.intent?.intent
      );
    }
    
    if (context.vertical) {
      relevantExamples = relevantExamples.filter(ex => 
        ex.category === context.vertical || !ex.category
      );
    }

    // Take the most relevant examples
    const selectedExamples = relevantExamples.slice(0, maxExamples);
    
    for (const example of selectedExamples) {
      section += `Input: ${example.input}\n`;
      section += `Output: ${example.output}\n\n`;
    }

    return section;
  }

  private fillTemplate(template: PromptTemplate, context: PromptContext): string {
    let filled = template.template;
    
    // Replace template variables
    for (const variable of template.variables) {
      const value = this.getVariableValue(variable, context);
      filled = filled.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
    }

    return filled;
  }

  private getVariableValue(variable: string, context: PromptContext): string {
    switch (variable) {
      case "clientName":
        return "Client"; // Would be resolved from client data
      case "professionalName":
        return context.professionalId ? "Professional" : "";
      case "vertical":
        return context.vertical || "general";
      case "intent":
        return context.intent?.intent || "general";
      case "lastMessage":
        const lastMsg = context.conversationHistory[context.conversationHistory.length - 1];
        return lastMsg?.content || "";
      case "entities":
        if (context.intent?.entities.length) {
          return context.intent.entities.map(e => `${e.type}: ${e.value}`).join(", ");
        }
        return "";
      default:
        return "";
    }
  }

  // Initialize default templates
  initializeDefaultTemplates(): void {
    this.addTemplate({
      id: "general_response",
      name: "General Response",
      template: "Please provide a helpful and professional response to the client's message: {lastMessage}",
      variables: ["lastMessage"],
      category: "general"
    });

    this.addTemplate({
      id: "booking_response",
      name: "Booking Response",
      template: "The client wants to {intent}. Please help them with booking. Entities detected: {entities}. Respond with available options or ask for clarification.",
      variables: ["intent", "entities"],
      category: "booking"
    });

    this.addTemplate({
      id: "pricing_response",
      name: "Pricing Response",
      template: "The client is asking about pricing for {vertical}. Provide clear pricing information and options.",
      variables: ["vertical"],
      category: "pricing"
    });

    this.addTemplate({
      id: "service_response",
      name: "Service Response",
      template: "The client is interested in services for {vertical}. Describe available services and help them choose the right option.",
      variables: ["vertical"],
      category: "services"
    });

    // Add system prompts
    this.addSystemPrompt("general", "You are a helpful assistant for a professional services platform. Be polite, clear, and professional.");
    this.addSystemPrompt("beauty", "You are a beauty and wellness specialist. Provide expert advice on beauty treatments and services.");
    this.addSystemPrompt("fitness", "You are a fitness professional. Provide helpful guidance on fitness programs and training.");
    this.addSystemPrompt("consulting", "You are a business consultant. Provide professional advice and guidance for business needs.");
  }

  // Initialize default examples
  initializeDefaultExamples(): void {
    this.addExample({
      input: "I'd like to book an appointment for tomorrow",
      output: "I'd be happy to help you book an appointment for tomorrow! What time works best for you? I have openings at 10:00 AM, 2:00 PM, and 4:00 PM.",
      context: { intent: { intent: "book_appointment", confidence: 0.9, entities: [] } },
      category: "booking"
    });

    this.addExample({
      input: "How much does a haircut cost?",
      output: "Our haircuts start at $45 for a basic cut and style. We also offer premium services starting at $75. Would you like to see our full menu and availability?",
      context: { intent: { intent: "pricing_inquiry", confidence: 0.8, entities: [] } },
      category: "pricing"
    });

    this.addExample({
      input: "What services do you offer?",
      output: "We offer a full range of beauty services including haircuts, coloring, styling, treatments, and more. Here's what's popular: haircuts ($45+), color treatments ($80+), and deep conditioning ($40+). What interests you most?",
      context: { intent: { intent: "service_inquiry", confidence: 0.9, entities: [] } },
      category: "services"
    });
  }

  getTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  getExamples(): PromptExample[] {
    return [...this.examples];
  }

  getSystemPrompts(): Record<string, string> {
    return Object.fromEntries(this.systemPrompts);
  }
}
