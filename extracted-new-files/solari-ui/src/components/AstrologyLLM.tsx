import React, { useEffect, useMemo, useState } from 'react'
import { Search, BookOpen, Stars, Upload, Moon, User, Clock, Zap } from 'lucide-react'

type AstroTopic =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
  | 'uranus' | 'neptune' | 'pluto'
  | 'asc' | 'ascendant' | 'mc' | 'midheaven' | 'node' | 'nodes'

export type AstroRecord = {
  id?: string
  book?: string
  topic?: AstroTopic | string
  sign?: string
  house?: number
  text: string
  keywords?: string[]
}

type ConversationEntry = {
  query: string
  response: string
  timestamp: number
  topic?: string
  sign?: string
  usedRecords: string[]
}

type UserProfile = {
  birthData: null | { date?: string; time?: string; location?: string }
  placements: Record<string, unknown>
  readingHistory: string[]
  patterns: string[]
  lastInteraction: null | number
  sessionMood: 'curious' | 'intense' | 'reflective' | 'playful'
}

type SolariState = {
  mood: 'attentive' | 'familiar'
  verbosity: 'low' | 'medium' | 'high'
  insightsGiven: string[] // record ids
  conversationDepth: number
}

const SIGNS = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces'
]

const PLANETS = [
  'sun','moon','mercury','venus','mars','jupiter',
  'saturn','uranus','neptune','pluto'
]

const SAMPLE_DB: AstroRecord[] = [
  {
    id: 'book1_scorpio_sun',
    book: 'The Inner Sky',
    topic: 'sun',
    sign: 'scorpio',
    text:
      'Scorpio Sun individuals possess extraordinary emotional depth and penetrating insight. They see beneath surface appearances instantly and are often aware of hidden motivations others miss. Their intensity can be both magnetic and overwhelming. They form deep bonds but only with those who pass their stringent authenticity tests. Scorpio refuses superficiality and demands truth, even when uncomfortable.',
    keywords: ['intensity','depth','penetrating','magnetic','authentic','truth','emotional'],
  },
  {
    id: 'book2_scorpio_traits',
    book: 'Planets in Signs',
    topic: 'sun',
    sign: 'scorpio',
    text:
      "The Scorpio native is fundamentally transformative. They experience life at extremes and are comfortable with the shadowy aspects of existence that others avoid. Control and power dynamics fascinate them. They're loyal to the death but unforgiving of betrayal. Their emotional nature is volcanic - calm surface, molten core. They choose their connections carefully and give affection on their own terms.",
    keywords: ['transformative','extremes','shadow','control','power','loyal','betrayal','volcanic'],
  },
  {
    id: 'book3_scorpio_behavior',
    book: 'Sun Sign Secrets',
    topic: 'sun',
    sign: 'scorpio',
    text:
      "Scorpio operates from a place of strategic awareness. They observe everything, forget nothing, and wait for the perfect moment. Their silence is not emptiness but calculation. They test people constantly, often without those people realizing they're being tested. Trust is earned slowly and lost instantly.",
    keywords: ['strategic','observant','calculating','testing','trust','silent'],
  },
  {
    id: 'book4_mars_aries',
    book: 'The Mars Book',
    topic: 'mars',
    sign: 'aries',
    text:
      "Mars in Aries is the warrior incarnate. Direct action, immediate response, no hesitation. These individuals lead with courage and sometimes recklessness. They're competitive, pioneering, and thrive on challenge. Patience is not their virtue. They initiate but may not always follow through. Their anger burns hot and fast, then dissipates.",
    keywords: ['warrior','direct','courage','competitive','pioneering','impatient','initiate'],
  },
  {
    id: 'book5_mars_aries_combat',
    book: 'Planetary Warfare',
    topic: 'mars',
    sign: 'aries',
    text:
      "Mars in Aries doesn't strategize, they attack. The best defense is overwhelming offense. They respect strength and have little patience for weakness or manipulation. Physical activity is essential for their wellbeing. Without an outlet, this energy turns destructive. They need to conquer something daily.",
    keywords: ['attack','aggressive','physical','conquer','strength','energy'],
  },
  {
    id: 'book6_moon_pisces',
    book: 'Moon Signs',
    topic: 'moon',
    sign: 'pisces',
    text:
      "Moon in Pisces absorbs everything. These individuals are emotional sponges, picking up on collective moods and individual pain. Boundaries blur. They need solitude to process what they've absorbed. Creative, compassionate, sometimes escapist. They feel too much and may retreat into fantasy or substances to cope. Their empathy is both gift and burden.",
    keywords: ['absorbing','empathic','boundaries','solitude','creative','escapist','sensitive'],
  },
  {
    id: 'book7_moon_pisces_psychic',
    book: 'Lunar Mysteries',
    topic: 'moon',
    sign: 'pisces',
    text:
      "Pisces Moon experiences reality as permeable. They know things they shouldn't know, feel things that aren't theirs to feel. This placement produces artists, mystics, and sometimes madness. The challenge is distinguishing their emotions from everyone else's. They dream prophetically and often dismiss their own intuition as imagination.",
    keywords: ['psychic','permeable','intuitive','mystic','prophetic','dreams','confusion'],
  },
  {
    id: 'book8_saturn_7th',
    book: 'Houses and Planets',
    topic: 'saturn',
    house: 7,
    text:
      "Saturn in the seventh house creates delays and tests in partnerships. These individuals often marry late or experience significant age differences in relationships. They take commitment seriously, perhaps too seriously. Fear of rejection can lead to choosing unavailable partners or avoiding intimacy altogether. Relationships are where they do their hardest work and greatest growth.",
    keywords: ['delays','commitment','fear','unavailable','growth','partnership','serious'],
  },
  {
    id: 'book9_venus_scorpio',
    book: 'Love and Venus',
    topic: 'venus',
    sign: 'scorpio',
    text:
      "Venus in Scorpio loves with an intensity that terrifies casual partners. They want complete fusion, total honesty, absolute loyalty. Casual dating feels pointless. They'd rather be alone than settle for surface connection. Jealousy and possessiveness are real struggles. When they love, it's all-consuming. When they're done, they're completely done.",
    keywords: ['intense','fusion','loyalty','jealousy','possessive','all-consuming','absolute'],
  },
  {
    id: 'book10_mercury_gemini',
    book: 'Mental Planets',
    topic: 'mercury',
    sign: 'gemini',
    text:
      "Mercury in Gemini is the quick-witted communicator. Their mind moves faster than most can follow. They need variety, conversation, information constantly flowing. Boredom is their enemy. They can argue any side of a debate brilliantly. Sometimes scattered, often brilliant. They connect ideas others miss but may lack follow-through.",
    keywords: ['quick','witty','communication','variety','scattered','brilliant','debate'],
  },
]

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function normalizeWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s#]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(Boolean)
}

function guessHouse(queryLower: string): number | undefined {
  // Matches "7th", "7th house", "house 7", "7 house"
  const m1 = queryLower.match(/\b(\d{1,2})\s*(?:st|nd|rd|th)\b/)
  if (m1) return clampHouse(parseInt(m1[1], 10))
  const m2 = queryLower.match(/\bhouse\s*(\d{1,2})\b/)
  if (m2) return clampHouse(parseInt(m2[1], 10))
  return undefined
}

function clampHouse(n: number): number | undefined {
  if (!Number.isFinite(n)) return undefined
  if (n < 1 || n > 12) return undefined
  return n
}

function toSecondPerson(text: string): string {
  const rules: Array<[RegExp, string]> = [
    [/these individuals/gi, 'you'],
    [/they are/gi, "you're"],
    [/they\b/gi, 'you'],
    [/their\b/gi, 'your'],
    [/them\b/gi, 'you'],
    [/the native/gi, 'you'],
    [/such people/gi, 'you'],
    [/this person/gi, 'you'],
  ]
  let out = text
  for (const [re, repl] of rules) out = out.replace(re, repl)
  return out
}

export default function AstrologyLLM() {
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [database, setDatabase] = useState<AstroRecord[]>([])
  const [tokensUsed, setTokensUsed] = useState<number>(0)
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([])
  const [userProfile] = useState<UserProfile>({
    birthData: null,
    placements: {},
    readingHistory: [],
    patterns: [],
    lastInteraction: null,
    sessionMood: 'curious',
  })
  const [solariState, setSolariState] = useState<SolariState>({
    mood: 'attentive',
    verbosity: 'medium',
    insightsGiven: [],
    conversationDepth: 0,
  })

  useEffect(() => {
    setDatabase(SAMPLE_DB)
  }, [])

  const lastUsedIds = useMemo(() => {
    return conversationHistory
      .slice(-3)
      .flatMap(h => h.usedRecords)
  }, [conversationHistory])

  const generateContextualVariations = (depth: number) => {
    const variations = {
      openings: ['okay…','alright so…',"here's the thing…",'listen…','right so…','look…','honestly…','okay yeah…'],
      connectors: ["and here's what's interesting…",'but wait there’s more…','which brings me to…','and this is important…','now pay attention because…',"and here's where it gets real…","but here's the kicker…","and this is the part you need to hear…"],
      closers: ['you earned this conversation.',"that's what i'm seeing here.",'make of that what you will.','so yeah. there it is.','you probably already knew that though.','but you’re not ready to hear it yet.','and you know i’m right.',"that's the real talk."],
    } as const

    // Slightly bias selections as convo deepens
    const open = depth > 4 ? rand([...variations.openings, 'okay. so we’re doing this again…']) : rand(variations.openings)
    const conn = depth > 2 ? rand(variations.connectors) : rand([...variations.connectors, 'simple version:'])
    const close = depth > 5 ? rand([...variations.closers, 'you keep circling this for a reason.']) : rand(variations.closers)
    return { opening: open, connector: conn, closer: close }
  }

  const queryDb = (searchQuery: string, context: { relatedTopics: string[] }) => {
    const q = searchQuery.toLowerCase()
    const words = normalizeWords(q)
    const houseGuess = guessHouse(q)

    const results: Array<AstroRecord & { relevance: number; rid: string }> = []

    for (const record of database) {
      const rid = record.id ?? `${record.book ?? 'unknown'}:${record.topic ?? 'topic'}:${record.sign ?? ''}:${record.house ?? ''}:${record.text.slice(0, 24)}`
      let score = 0

      // anti-repeat, but don't nuke genuinely relevant hits
      if (lastUsedIds.includes(rid)) score -= 8

      if (record.sign && q.includes(record.sign.toLowerCase())) score += 12
      if (record.topic && q.includes(String(record.topic).toLowerCase())) score += 12
      if (typeof record.house === 'number' && (q.includes(`${record.house}th`) || q.includes(`house ${record.house}`) || houseGuess === record.house)) score += 12

      // keyword matching
      if (record.keywords?.length) {
        for (const kw of record.keywords) {
          if (q.includes(kw.toLowerCase())) score += 3
        }
      }

      // context bonus
      for (const t of context.relatedTopics) {
        if (!t) continue
        if (String(record.topic).toLowerCase() === t.toLowerCase()) score += 4
        if (String(record.sign).toLowerCase() === t.toLowerCase()) score += 4
      }

      // general text hits
      const textLower = record.text.toLowerCase()
      for (const w of words) {
        if (w.length <= 3) continue
        if (textLower.includes(w)) score += 1
      }

      if (score > 0) results.push({ ...record, relevance: score, rid })
    }

    results.sort((a, b) => b.relevance - a.relevance)
    return results
  }

  const generatePersonalizedObservation = (q: string, top: { topic?: string; sign?: string } | undefined) => {
    const queryLower = q.toLowerCase()
    const topic = top?.topic?.toLowerCase()
    const sign = top?.sign?.toLowerCase()

    const observations: Record<string, string[]> = {
      scorpio: [
        "the thing about scorpio is that you're a mystery wrapped in intensity. you're probably not telling me something. you're plotting something or at least thinking about it.",
        "scorpio means you see through people instantly and it's both exhausting and isolating. you know things you wish you didn't know.",
        "with scorpio energy you don't do casual anything. surface-level interaction feels like a waste of time and you'd rather be alone than fake it.",
        "scorpio gives you this volcanic quality. calm on the surface, molten core. people feel it and then pretend they don't.",
      ],
      mars: [
        "mars means you don't wait for permission and you don't apologize for taking up space. that's both your superpower and why some people find you exhausting.",
        "with mars here you need to conquer something daily or the energy turns inward and gets destructive. you already know that.",
        "mars gives you this combat-ready quality even when nothing's wrong. you're always braced for the next fight.",
        "your mars placement means you respect directness and get impatient with people who talk around things. just say it already.",
      ],
      moon: [
        "your emotional world is more complex than you let on. you feel everything but show selective pieces. people think they know you. they don't.",
        "moon placement means your emotional needs don't match what you project. there's always a gap between what you show and what you actually need.",
        "with your moon you've already decided who gets access to the real feelings. everyone else gets the curated version.",
        "moon here means you process emotions differently than most people and that's caused problems you probably don't talk about.",
      ],
      venus: [
        "venus here means your love language is intense and not everyone can handle it. you've learned that the hard way.",
        "casual dating feels pointless for you. you're either all in or you're out. there's no cute middle ground.",
        "you attract people who can't match your intensity and then you get frustrated. pattern recognition, anyone?",
        "you're loyal until someone crosses a line. then you're done completely and you don't look back.",
      ],
      sun: [
        "sun placement is core identity stuff. this is who you are when nobody’s watching and you’re not performing for anyone.",
        "you've built your personality around this energy whether you realize it or not. it's the default setting.",
        "fighting your sun is exhausting. you're going to keep being this way so you might as well own it.",
        "your sun is the part of you that doesn't apologize. it just is. people either get it or they don't.",
      ],
    }

    let obs = ''
    if (sign && observations[sign]) obs = rand(observations[sign])
    else if (topic && observations[topic]) obs = rand(observations[topic])

    if (solariState.conversationDepth > 2 && obs) {
      obs += rand([
        ' and yeah, i’m noticing a pattern in what you keep asking about.',
        ' we keep circling this theme, which tells me something.',
        ' you keep coming back to this. that’s not random.',
        ' interesting that you keep poking this exact bruise.',
      ])
    }

    // tiny nudge for certain query words
    if (!obs && queryLower.includes('meaning')) obs = "you want 'meaning' because facts aren't enough. cute."
    return obs
  }

  const generateDynamicReading = (passages: Array<AstroRecord & { rid: string }>, originalQuery: string, context: { relatedTopics: string[] }) => {
    if (!passages.length) {
      return rand([
        "okay… i'm not finding anything in the texts about that specific thing. either you're asking about something obscure or i need more books loaded. try being more specific.",
        "so here's the deal… nothing’s coming up in the database for that. ask about a specific placement or give me more to work with.",
        "look… i need an actual placement. planet + sign, or planet + house. give me something i can work with.",
        "honestly? not enough data for that. load more books or tighten the question.",
      ])
    }

    const vars = generateContextualVariations(solariState.conversationDepth)

    // Extract sentences
    const rawSentences: string[] = []
    for (const p of passages.slice(0, 4)) {
      const sents = p.text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 18)
      rawSentences.push(...sents)
    }

    let insights = rawSentences.map(s => toSecondPerson(s.toLowerCase()))

    // occasional shuffle for variety
    if (insights.length > 4 && Math.random() > 0.65) {
      for (let i = insights.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        if (Math.random() > 0.7) [insights[i], insights[j]] = [insights[j], insights[i]]
      }
    }

    const top = passages[0]
    const personal = generatePersonalizedObservation(originalQuery, { topic: String(top.topic ?? ''), sign: String(top.sign ?? '') })

    let reading = `${vars.opening} `
    reading += insights.slice(0, 3).join('. ') + '. '

    if (insights.length > 3) {
      reading += `${vars.connector} `
      reading += insights.slice(3, 6).join('. ') + '. '
    }

    if (personal) reading += personal.trim() + ' '
    reading += vars.closer

    // record ids used + advance state ONCE (avoid double increment bugs)
    setSolariState(prev => ({
      ...prev,
      insightsGiven: [...prev.insightsGiven, ...passages.map(p => p.rid)],
      conversationDepth: prev.conversationDepth + 1,
      mood: prev.conversationDepth + 1 > 5 ? 'familiar' : 'attentive',
    }))

    return reading.replace(/\s+/g, ' ').trim()
  }

  const handleQuery = async () => {
    const q = query.trim()
    if (!q) return

    setLoading(true)

    const delay = 550 + Math.random() * 450
    await new Promise<void>(resolve => setTimeout(() => resolve(), delay))

    const context = {
      relatedTopics: conversationHistory.slice(-2).flatMap(h => [h.topic, h.sign]).filter(Boolean) as string[],
    }

    const results = queryDb(q, context)

    const top = results[0]
    const used = results.slice(0, 4)

    const reading = generateDynamicReading(used.map(r => ({ ...r, rid: r.rid })), q, context)

    // "tokens" (session counter, not real tokens)
    const approxTokens = Math.floor(reading.split(/\s+/).length * 1.5) + Math.floor(Math.random() * 10)
    setTokensUsed(prev => prev + approxTokens)

    const entry: ConversationEntry = {
      query: q,
      response: reading,
      timestamp: Date.now(),
      topic: top?.topic ? String(top.topic) : undefined,
      sign: top?.sign ? String(top.sign) : undefined,
      usedRecords: used.map(r => r.rid),
    }

    setConversationHistory(prev => [...prev, entry])
    setQuery('')
    setLoading(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const raw = String(e.target?.result ?? '')
        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

        const newRecords: AstroRecord[] = []
        for (const line of lines) {
          if (!line) continue
          // support JSON array files too
          if (line.startsWith('[')) {
            const arr = JSON.parse(raw) as AstroRecord[]
            newRecords.push(...arr.filter(r => r?.text))
            break
          } else {
            const rec = JSON.parse(line) as AstroRecord
            if (rec && typeof rec.text === 'string' && rec.text.trim()) newRecords.push(rec)
          }
        }

        setDatabase(prev => [...prev, ...newRecords])
        alert(`Loaded ${newRecords.length} records from ${file.name}`)
      } catch {
        alert('Error parsing file. Use JSONL (one JSON object per line) or a JSON array of records.')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Stars className="w-8 h-8 text-purple-400 animate-pulse" />
              <h1 className="text-3xl font-bold text-purple-400">Solari</h1>
              <span className="text-xs text-gray-400 mt-2">
                {solariState.mood === 'familiar' ? '• getting to know you' : '• listening'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-purple-300">
                <Zap className="w-4 h-4" />
                <span>{solariState.conversationDepth} exchanges</span>
              </div>
            </div>
          </div>

          <p className="text-gray-300">
            astrology consultation system. no two readings alike. no sugarcoating.
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{database.length} records</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>session tokens: {tokensUsed}</span>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6 p-4 bg-gray-800/50 backdrop-blur rounded-lg border border-purple-500/20">
          <label className="flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5 text-purple-300" />
            <span className="text-gray-200">Load your astrology books (JSONL)</span>
            <input
              type="file"
              accept=".jsonl,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Each line: <span className="text-purple-300">{`{"topic":"sun","sign":"scorpio","text":"...","keywords":[...]}`}</span>
          </p>
        </div>

        {/* Query Input */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => (e.key === 'Enter' ? void handleQuery() : undefined)}
              placeholder="What does my Scorpio Sun mean?"
              className="flex-1 px-4 py-3 bg-gray-800/50 backdrop-blur border border-purple-500/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleQuery}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Reading…' : 'Ask'}
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-4">
          {conversationHistory.map((entry, index) => (
            <div key={index} className="space-y-2">
              {/* User */}
              <div className="flex justify-end">
                <div className="max-w-xl bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 mb-1 text-purple-300 text-sm">
                    <User className="w-3 h-3" />
                    <span>You</span>
                  </div>
                  <p className="text-gray-100">{entry.query}</p>
                </div>
              </div>

              {/* Solari */}
              <div className="flex justify-start">
                <div className="max-w-2xl bg-gray-800/50 backdrop-blur border border-purple-500/20 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 mb-2 text-purple-300 text-sm font-semibold">
                    <Moon className="w-3 h-3" />
                    <span>Solari</span>
                  </div>
                  <p className="text-gray-100 leading-relaxed">{entry.response}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sample Queries */}
        {conversationHistory.length === 0 && (
          <div className="mt-8 bg-gray-800/30 backdrop-blur rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">Start a conversation:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'What does my Scorpio Sun mean?',
                'Tell me about Mars in Aries',
                "What's Moon in Pisces like?",
                'Explain Venus in Scorpio',
                'How does Mercury in Gemini work?',
                'What about Saturn in 7th house?',
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(example)}
                  className="text-left px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded text-gray-200 transition-all border border-transparent hover:border-purple-500/30"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="mt-8 p-4 bg-gray-800/30 backdrop-blur rounded-lg border border-purple-500/10 text-xs text-gray-400">
          <p className="mb-2">
            <span className="text-purple-300">How this works:</span> Solari queries your loaded texts,
            pulls the best passages, then remixes them into a unique reading. The more books you add,
            the less repetitive it gets.
          </p>
          <p>
            Upload JSONL with fields: topic, sign, house, text, keywords, book. This is not an LLM,
            it’s retrieval + style, so your content quality matters.
          </p>
        </div>
      </div>
    </div>
  )
}
