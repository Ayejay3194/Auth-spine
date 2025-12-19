import { SmartEngine, AssistantContext, SmartSuggestion } from "../../core/types.js";
import { LLMService } from "../../llm/service.js";

export const createEnhancedPredictiveSchedulingEngine = (llmService: LLMService): SmartEngine => ({
  name: 'predictive_scheduling',
  version: '2.0.0',
  run: async (ctx: AssistantContext): Promise<SmartSuggestion[]> => {
    try {
      if (!await llmService.isAvailable()) {
        return [];
      }

      const systemPrompt = `You are a predictive scheduling assistant. Analyze the booking context and provide scheduling optimization suggestions.

Focus on:
- Identifying optimal time slots
- Preventing overbooking
- Suggesting buffer times
- Optimizing practitioner schedules

Return JSON array of suggestions with: id, title, message, severity, createdAt, why, actions`;

      const userPrompt = `Context: ${JSON.stringify(ctx, null, 2)}
Generate predictive scheduling suggestions:`;

      const response = await llmService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any, i: number) => ({
          ...s,
          id: s.id || `predictive_${Date.now()}_${i}`,
          engine: 'predictive_scheduling',
          createdAt: s.createdAt || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Predictive scheduling engine failed:', error);
    }

    return [];
  }
});

export const createEnhancedClientBehaviorEngine = (llmService: LLMService): SmartEngine => ({
  name: 'client_behavior',
  version: '2.0.0',
  run: async (ctx: AssistantContext): Promise<SmartSuggestion[]> => {
    try {
      if (!await llmService.isAvailable()) {
        return [];
      }

      const systemPrompt = `You are a client behavior analysis assistant. Analyze client data and provide insights.

Focus on:
- Identifying at-risk clients
- Recognizing upsell opportunities
- Suggesting retention strategies
- Flagging unusual patterns

Return JSON array of suggestions with: id, title, message, severity, createdAt, why, actions`;

      const userPrompt = `Context: ${JSON.stringify(ctx, null, 2)}
Generate client behavior insights:`;

      const response = await llmService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any, i: number) => ({
          ...s,
          id: s.id || `behavior_${Date.now()}_${i}`,
          engine: 'client_behavior',
          createdAt: s.createdAt || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Client behavior engine failed:', error);
    }

    return [];
  }
});

export const createDynamicPricingEngine = (llmService: LLMService): SmartEngine => ({
  name: 'dynamic_pricing',
  version: '2.0.0',
  run: async (ctx: AssistantContext): Promise<SmartSuggestion[]> => {
    try {
      if (!await llmService.isAvailable()) {
        return [];
      }

      const systemPrompt = `You are a dynamic pricing assistant. Analyze booking patterns and suggest pricing optimizations.

Focus on:
- Peak/off-peak pricing opportunities
- Service bundle recommendations
- Discount strategies
- Revenue optimization

Return JSON array of suggestions with: id, title, message, severity, createdAt, why, actions`;

      const userPrompt = `Context: ${JSON.stringify(ctx, null, 2)}
Generate dynamic pricing suggestions:`;

      const response = await llmService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any, i: number) => ({
          ...s,
          id: s.id || `pricing_${Date.now()}_${i}`,
          engine: 'dynamic_pricing',
          createdAt: s.createdAt || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Dynamic pricing engine failed:', error);
    }

    return [];
  }
});

export const createSegmentationEngine = (llmService: LLMService): SmartEngine => ({
  name: 'segmentation',
  version: '2.0.0',
  run: async (ctx: AssistantContext): Promise<SmartSuggestion[]> => {
    try {
      if (!await llmService.isAvailable()) {
        return [];
      }

      const systemPrompt = `You are a customer segmentation assistant. Analyze client data and suggest segmentation strategies.

Focus on:
- Identifying customer segments
- Personalized marketing opportunities
- Targeted communication strategies
- Service customization

Return JSON array of suggestions with: id, title, message, severity, createdAt, why, actions`;

      const userPrompt = `Context: ${JSON.stringify(ctx, null, 2)}
Generate segmentation suggestions:`;

      const response = await llmService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return suggestions.map((s: any, i: number) => ({
          ...s,
          id: s.id || `segmentation_${Date.now()}_${i}`,
          engine: 'segmentation',
          createdAt: s.createdAt || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Segmentation engine failed:', error);
    }

    return [];
  }
});

// Fallback engines for when LLM is not available
export const FallbackPredictiveSchedulingEngine: SmartEngine = {
  name: 'predictive_scheduling',
  version: '1.0.0',
  run: async (ctx: AssistantContext): Promise<SmartSuggestion[]> => {
    return [{
      id: `fallback_predictive_${Date.now()}`,
      engine: 'predictive_scheduling',
      title: 'Basic Scheduling Tip',
      message: 'Consider adding 15-minute buffers between appointments to account for overruns.',
      severity: 'info',
      createdAt: new Date().toISOString(),
      why: ['Buffer times help prevent schedule cascades', 'Reduces stress for both staff and clients'],
      actions: [{ label: 'Update booking settings', intent: 'update_booking_settings' }]
    }];
  }
};

export const FallbackClientBehaviorEngine: SmartEngine = {
  name: 'client_behavior',
  version: '1.0.0',
  run: async (ctx: AssistantContext): Promise<SmartSuggestion[]> => {
    return [{
      id: `fallback_behavior_${Date.now()}`,
      engine: 'client_behavior',
      title: 'Client Engagement Reminder',
      message: 'Consider reaching out to clients who haven\'t booked in the last 30 days.',
      severity: 'info',
      createdAt: new Date().toISOString(),
      why: ['Regular contact maintains relationships', 'Inactive clients may need special offers'],
      actions: [{ label: 'Create retention campaign', intent: 'create_campaign' }]
    }];
  }
};
