import { OracleInput, OracleOutput } from "./contracts";
import { oracleStudentRender } from "./oracle_student";

interface TeacherConfig {
  useLLM: boolean;
  llmEndpoint?: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
}

/**
 * Oracle Teacher: Generates high-quality training data for the student renderer
 * 
 * Two modes:
 * 1. LLM Mode: Uses a larger language model (GPT-4, Claude, etc.) to generate
 *    sophisticated outputs from structured inputs
 * 2. Template Mode: Uses curated templates for reproducible, deterministic outputs
 * 
 * The teacher generates "gold standard" outputs that the student learns to mimic.
 */
export async function oracleTeacherGenerate(
  input: OracleInput,
  config?: TeacherConfig
): Promise<OracleOutput> {
  // Default to template mode for reproducibility
  const useLLM = config?.useLLM ?? false;
  
  if (useLLM && config?.llmEndpoint) {
    // LLM Mode: Generate sophisticated response
    return generateLLMResponse(input, config);
  } else {
    // Template Mode: Use curated templates for consistency
    return generateTemplateResponse(input);
  }
}

/**
 * Generate response using external LLM
 */
async function generateLLMResponse(
  input: OracleInput,
  config: TeacherConfig
): Promise<OracleOutput> {
  const prompt = buildOraclePrompt(input);
  
  try {
    const response = await fetch(config.llmEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey || ''}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert astrological interpreter. Generate insightful, nuanced interpretations based on the provided planetary data. Be specific, avoid generic statements, and connect the celestial mechanics to human experience.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 
                    data.content?.[0]?.text || 
                    data.response || '';
    
    return parseOracleResponse(content, input);
  } catch (error) {
    console.warn('LLM generation failed, falling back to template:', error);
    return generateTemplateResponse(input);
  }
}

/**
 * Generate response using curated templates
 */
function generateTemplateResponse(input: OracleInput): OracleOutput {
  const { body, position, aspects, houses } = input;
  
  // Build contextual interpretation
  const themes = extractThemes(body, position, aspects);
  const intensity = calculateIntensity(position, aspects);
  const timing = estimateTiming(position);
  
  return {
    id: `oracle-${Date.now()}`,
    body,
    interpretation: generateInterpretation(body, themes, intensity),
    themes,
    intensity,
    timing,
    advice: generateAdvice(themes, intensity),
    confidence: 0.85,
    metadata: {
      source: 'template',
      version: '1.0',
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Build structured prompt for LLM
 */
function buildOraclePrompt(input: OracleInput): string {
  return `Generate an astrological interpretation based on the following data:

Planet: ${input.body}
Position: ${JSON.stringify(input.position)}
Aspects: ${JSON.stringify(input.aspects || [])}
Houses: ${JSON.stringify(input.houses || {})}
User Context: ${input.context || 'General inquiry'}

Provide:
1. A nuanced 2-3 sentence interpretation
2. Key themes (array of 3-5 strings)
3. Intensity level (0.0-1.0)
4. Timing estimate (immediate/short-term/long-term)
5. Practical advice (1-2 sentences)

Format as JSON with keys: interpretation, themes, intensity, timing, advice`;
}

/**
 * Parse LLM response into structured output
 */
function parseOracleResponse(content: string, input: OracleInput): OracleOutput {
  try {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    return {
      id: `oracle-${Date.now()}`,
      body: input.body,
      interpretation: parsed.interpretation || content.substring(0, 500),
      themes: parsed.themes || extractThemes(input.body, input.position, input.aspects),
      intensity: Math.max(0, Math.min(1, parsed.intensity || 0.5)),
      timing: parsed.timing || 'short-term',
      advice: parsed.advice || generateAdvice(parsed.themes || [], parsed.intensity || 0.5),
      confidence: 0.9,
      metadata: {
        source: 'llm',
        model: 'gpt-4',
        generatedAt: new Date().toISOString(),
        rawResponse: content
      }
    };
  } catch (error) {
    // Fallback to raw text if JSON parsing fails
    return {
      id: `oracle-${Date.now()}`,
      body: input.body,
      interpretation: content.substring(0, 500),
      themes: extractThemes(input.body, input.position, input.aspects),
      intensity: 0.5,
      timing: 'short-term',
      advice: 'Reflect on this information and trust your intuition.',
      confidence: 0.6,
      metadata: {
        source: 'llm-fallback',
        error: String(error),
        generatedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Extract themes from planetary data
 */
function extractThemes(
  body: string,
  position: { longitude: number; latitude: number; house?: number },
  aspects?: Array<{ planet: string; angle: number; orb: number }>
): string[] {
  const themes: string[] = [];
  
  // Body-specific themes
  const bodyThemes: Record<string, string[]> = {
    'Sun': ['identity', 'vitality', 'purpose'],
    'Moon': ['emotions', 'instincts', 'nurturing'],
    'Mercury': ['communication', 'intellect', 'learning'],
    'Venus': ['relationships', 'values', 'harmony'],
    'Mars': ['action', 'desire', 'courage'],
    'Jupiter': ['expansion', 'opportunity', 'wisdom'],
    'Saturn': ['structure', 'responsibility', 'mastery']
  };
  
  themes.push(...(bodyThemes[body] || ['transformation', 'growth']));
  
  // House-based themes
  if (position.house) {
    const houseThemes: Record<number, string[]> = {
      1: ['self', 'appearance', 'initiative'],
      2: ['resources', 'values', 'security'],
      3: ['communication', 'siblings', 'learning'],
      4: ['home', 'family', 'roots'],
      5: ['creativity', 'romance', 'self-expression'],
      6: ['work', 'health', 'service'],
      7: ['partnerships', 'contracts', 'others'],
      8: ['transformation', 'shared resources', 'depth'],
      9: ['philosophy', 'travel', 'higher learning'],
      10: ['career', 'status', 'achievement'],
      11: ['community', 'friends', 'future'],
      12: ['spirituality', 'hidden matters', 'release']
    };
    themes.push(...(houseThemes[position.house] || []));
  }
  
  // Aspect-based themes
  if (aspects) {
    for (const aspect of aspects) {
      if (aspect.orb < 5) { // Only tight aspects
        if (aspect.angle === 0) themes.push('conjunction', 'intensity');
        if (aspect.angle === 60) themes.push('opportunity', 'flow');
        if (aspect.angle === 90) themes.push('tension', 'growth');
        if (aspect.angle === 120) themes.push('harmony', 'ease');
        if (aspect.angle === 180) themes.push('balance', 'polarity');
      }
    }
  }
  
  return [...new Set(themes)].slice(0, 5); // Deduplicate and limit
}

/**
 * Calculate intensity from position and aspects
 */
function calculateIntensity(
  position: { longitude: number; latitude: number; speed?: number },
  aspects?: Array<{ planet: string; angle: number; orb: number }>
): number {
  let intensity = 0.5;
  
  // Speed factor (retrograde = higher intensity)
  if (position.speed !== undefined) {
    if (position.speed < 0) intensity += 0.1;
    if (Math.abs(position.speed) < 0.5) intensity += 0.1; // Slow movement
  }
  
  // Aspect intensity
  if (aspects) {
    for (const aspect of aspects) {
      if (aspect.orb < 2) intensity += 0.15;
      else if (aspect.orb < 5) intensity += 0.08;
      
      if (aspect.angle === 90 || aspect.angle === 180) intensity += 0.1;
    }
  }
  
  return Math.min(1.0, intensity);
}

/**
 * Estimate timing from position
 */
function estimateTiming(position: { longitude: number; house?: number }): string {
  if (position.house) {
    if (position.house <= 3) return 'immediate';
    if (position.house <= 6) return 'short-term';
    if (position.house <= 9) return 'medium-term';
    return 'long-term';
  }
  return 'short-term';
}

/**
 * Generate interpretation text
 */
function generateInterpretation(
  body: string,
  themes: string[],
  intensity: number
): string {
  const intensityWords = intensity > 0.7 ? 'powerfully' : intensity > 0.4 ? 'noticeably' : 'subtly';
  const themeStr = themes.slice(0, 3).join(', ');
  
  return `${body} ${intensityWords} activates themes of ${themeStr}. ` +
    `This placement suggests a period where these energies ${intensity > 0.6 ? 'demand' : 'invite'} attention and conscious engagement.`;
}

/**
 * Generate practical advice
 */
function generateAdvice(themes: string[], intensity: number): string {
  if (intensity > 0.8) {
    return `With strong ${themes[0] || 'transformational'} energy present, focus on grounding practices. ` +
      `Channel this intensity into structured activities rather than reacting impulsively.`;
  } else if (intensity > 0.5) {
    return `Work consciously with ${themes.slice(0, 2).join(' and ') || 'these themes'}. ` +
      `This is an opportune time for growth through intentional engagement.`;
  } else {
    return `Notice subtle shifts around ${themes[0] || 'inner development'}. ` +
      `Small adjustments now can yield significant results over time.`;
  }
}
