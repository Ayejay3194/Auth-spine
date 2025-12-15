# Astrology Spine Documentation

## Overview

The Astrology Spine provides astrological chart readings, transit analysis, and compatibility reports based on the **Solari system**. Unlike traditional AI-based systems, this uses a retrieval-based approach grounded in reference material, emphasizing patterns over predictions.

## Principles (from Decans Operations Manual)

1. **Observational Only** - No prophecy or future predictions
2. **Reference Grounded** - All interpretations come from actual astrological texts
3. **No Therapy Language** - Avoids psychological diagnosis or medical claims
4. **User Control** - User has full control over their data and readings
5. **Privacy First** - No behavioral targeting or data selling
6. **Accuracy Over Engagement** - Focus on correctness, not virality

## Supported Intents

### 1. Get Chart
**Command**: `get chart`, `show chart`, `my chart`, `birth chart`

**What it does**: Calculates your natal chart based on birth data (date, time, location).

**Example**:
```
> get my birth chart

[Requires: birth date, time, and location]
```

### 2. Read Placement
**Command**: `what does my [planet] in [sign] mean?`, `explain my [planet]`

**What it does**: Interprets a specific planetary placement in your chart.

**Examples**:
```
> what does my scorpio sun mean?
Reading: "Scorpio Sun individuals possess extraordinary emotional depth and penetrating insight..."

> tell me about mars in aries
Reading: "Mars in Aries is the warrior incarnate. Direct action, immediate response..."

> explain moon in pisces
Reading: "Moon in Pisces absorbs everything. You are emotional sponges..."
```

### 3. Daily Transit
**Command**: `daily transit`, `today's forecast`, `what's happening today`

**What it does**: Shows current planetary positions and how they affect you.

**Example**:
```
> daily transit

[Shows current planetary aspects and their interpretations]
```

### 4. Compatibility
**Command**: `compatibility with [person]`, `synastry`, `relationship analysis`

**What it does**: Analyzes relationship compatibility based on both charts.

**Example**:
```
> compatibility with scorpio sun leo moon

[Analyzes synastry aspects and compatibility factors]
```

### 5. House Interpretation
**Command**: `what is [number]th house?`, `7th house meaning`

**What it does**: Explains the meaning of astrological houses (1-12).

**Examples**:
```
> what is 7th house?
Reading: "The seventh house represents partnerships and relationships. Marriage, business partnerships, and how you relate to others."

> explain 4th house
Reading: "The fourth house represents home, family, and your emotional foundation. Your roots, ancestry, and sense of security."
```

### 6. Aspect Explanation
**Command**: `explain [aspect]`, `sun trine moon`, `mars square venus`

**What it does**: Explains planetary aspects and their meanings.

**Example**:
```
> what is a trine aspect?

[Explains harmonious 120-degree aspect between planets]
```

## Technical Implementation

### Database Structure

The astrology adapter uses a record-based database:

```typescript
type AstroRecord = {
  id?: string;           // Unique identifier
  book?: string;         // Source book reference
  topic?: string;        // Planet/point (sun, moon, mars, etc.)
  sign?: string;         // Zodiac sign
  house?: number;        // House number (1-12)
  text: string;          // Interpretation text
  keywords?: string[];   // Searchable keywords
};
```

### Query Algorithm

1. **Parse user query** to extract:
   - Planet/point (sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto)
   - Sign (aries through pisces)
   - House (1-12)

2. **Score records** based on:
   - Exact planet match (+10)
   - Exact sign match (+10)
   - Exact house match (+10)
   - Keyword matches (+3 each)

3. **Return top 3 records** sorted by relevance

4. **Convert to second person**:
   - "these individuals" → "you"
   - "they are" → "you're"
   - "their" → "your"

5. **Generate reading** with:
   - Conversational opening
   - Combined insights from records
   - Source attribution

### Supported Planets

- Sun - Core identity
- Moon - Emotional nature
- Mercury - Communication style
- Venus - Love and values
- Mars - Drive and action
- Jupiter - Growth and expansion
- Saturn - Structure and discipline
- Uranus - Innovation and rebellion
- Neptune - Dreams and spirituality
- Pluto - Transformation and power
- Ascendant (Asc) - Outer personality
- Midheaven (MC) - Life direction

### Supported Signs

- Fire: Aries, Leo, Sagittarius
- Earth: Taurus, Virgo, Capricorn
- Air: Gemini, Libra, Aquarius
- Water: Cancer, Scorpio, Pisces

### House Meanings

1. **1st House** - Self, identity, physical body
2. **2nd House** - Values, possessions, self-worth
3. **3rd House** - Communication, siblings, local environment
4. **4th House** - Home, family, emotional foundation
5. **5th House** - Creativity, pleasure, romance
6. **6th House** - Health, work, daily routines
7. **7th House** - Partnerships, relationships, marriage
8. **8th House** - Transformation, shared resources, intimacy
9. **9th House** - Philosophy, travel, higher learning
10. **10th House** - Career, reputation, public life
11. **11th House** - Friends, community, aspirations
12. **12th House** - Subconscious, spirituality, hidden matters

## API Integration

### Tools Available

```typescript
// Get full natal chart
"getAstrologyChart": async ({ ctx, input }) => { ... }

// Read specific placement
"readAstrologyPlacement": async ({ ctx, input }) => { ... }

// Get daily transits
"getDailyTransit": async ({ ctx, input }) => { ... }

// Compatibility analysis
"getCompatibility": async ({ ctx, input }) => { ... }

// House interpretation
"interpretHouse": async ({ ctx, input }) => { ... }

// Aspect explanation
"explainAspect": async ({ ctx, input }) => { ... }
```

### Example Usage

```typescript
import { createDefaultOrchestrator } from 'no-llm-business-assistant-spine';

const orchestrator = createDefaultOrchestrator();

const result = await orchestrator.handle(
  "what does my scorpio sun mean?",
  {
    actor: { userId: "user_123", role: "owner" },
    tenantId: "tenant_1",
    nowISO: new Date().toISOString(),
    timezone: "America/New_York",
  }
);

console.log(result.final.payload.reading);
// "okay… Scorpio Sun individuals possess extraordinary emotional depth..."
```

## Extending the Database

### Adding New Records

To add more astrological interpretations, add records to the database:

```typescript
const ASTRO_DATABASE: AstroRecord[] = [
  {
    id: "unique_id",
    book: "The Inner Sky",
    topic: "sun",
    sign: "scorpio",
    text: "Your interpretation text here...",
    keywords: ["intensity", "depth", "transformation"],
  },
  // ... more records
];
```

### Supported File Format

You can load additional records from JSONL files:

```jsonl
{"topic":"sun","sign":"aries","text":"Aries Sun is...","keywords":["pioneering","direct"]}
{"topic":"moon","sign":"cancer","text":"Cancer Moon is...","keywords":["nurturing","emotional"]}
{"topic":"venus","sign":"libra","house":7,"text":"Venus in Libra in 7th...","keywords":["harmony","partnership"]}
```

## Operational Guidelines

Based on the Decans Operations Manual:

### What Astrology Spine WILL Do:
✅ Provide reference-based interpretations
✅ Explain planetary positions and meanings
✅ Cite source material
✅ Use observational language
✅ Respect user privacy
✅ Allow data export/deletion

### What Astrology Spine WILL NOT Do:
❌ Make predictions about the future
❌ Provide therapy or medical advice
❌ Make absolute statements ("you will...")
❌ Use manipulative language
❌ Create dependency or fear
❌ Sell or share user data
❌ Train external models on user queries

### Tone Guidelines

- **Observational**: "You tend to..." not "You are..."
- **Pattern-focused**: "This pattern suggests..." not "This means you must..."
- **Reference-grounded**: Always cite source material
- **Non-prescriptive**: "This might manifest as..." not "This will happen..."

## Testing

```bash
# Test astrology spine
npm run build
node dist/test-astrology.js

# Example commands to test:
"what does my scorpio sun mean"
"tell me about mars in aries"
"explain moon in pisces"
"what is 7th house"
"daily transit"
```

## Future Enhancements

1. **Ephemeris Integration** - Calculate actual planetary positions
2. **Chart Calculation** - Generate natal charts from birth data
3. **Transit Tracking** - Real-time planetary movements
4. **Aspect Calculation** - Identify current aspects
5. **Progression Analysis** - Secondary progressions and solar returns
6. **Composite Charts** - Relationship chart synthesis
7. **Additional Source Books** - Expand reference library
8. **User Birth Data Storage** - Securely store and retrieve charts

## Privacy & Ethics

Following Decans principles:

1. **Transparency** - Users know what data is stored
2. **Control** - Users can export/delete their data anytime
3. **No Manipulation** - No dark patterns or fear-based marketing
4. **Source Attribution** - All interpretations cite sources
5. **Opt-in Only** - No forced readings or notifications
6. **No Sharing** - User data never sold or shared

## Support

For questions or issues:
- Check the main [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- Review [API_REFERENCE.md](./API_REFERENCE.md)
- Test with [test-astrology.ts](./src/test-astrology.ts)

## References

- Solari System: Retrieval-based astrology interpretation
- Decans Operations Manual: Ethical guidelines for astrology platforms
- The Inner Sky (Steven Forrest): Modern psychological astrology
- Traditional astrological texts and interpretations
