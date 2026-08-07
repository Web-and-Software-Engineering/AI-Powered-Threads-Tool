'use server'

import OpenAI from 'openai'

interface GenerateParams {
  topic: string
  coreMessage: string
  referencePosts?: string
  authorPersona?: string
  personalityTraits?: string
  likesDislikes?: string
  values?: string
  lifestyle?: string
  dreams?: string
  outlookOnLife?: string
  targetAudience?: string
  preferredTone?: string
  writingStyleRules?: string
  language?: 'en' | 'jp'
}

function fallbackVariations(params: GenerateParams): string[] {
  if (params.language === 'jp') {
    return [
      `${params.topic.toUpperCase()} 🚀

${params.coreMessage ? params.coreMessage : '今日知っておくべき重要なインサイトはこちらです：'}

1. ノイズを排し、シグナルを最大化する。
2. 実証済みのパターンを自分自身の声に適応させる。
3. エンゲージメントを追跡して今後の投稿を改善する。

あなたの最大の学びは何ですか？ぜひ以下で教えてください。👇`,
      `知っていましたか？${params.topic}について、多くの人が見落としているポイントがあります。

${params.coreMessage ? params.coreMessage : ''}

これを実践するだけで、結果は大きく変わります。`,
      `${params.topic}について、率直に話しましょう。

${params.coreMessage ? params.coreMessage : ''}

あなたはどう思いますか？コメントで教えてください。`,
    ]
  }

  return [
    `${params.topic.toUpperCase()} 🚀

${params.coreMessage ? params.coreMessage : 'Here is the key insight you need to know today:'}

1. High signal over noise.
2. Adapt proven patterns to your authentic voice.
3. Track engagement to refine future posts.

What is your main takeaway? Let me know below. 👇`,
    `Unpopular opinion about ${params.topic}:

${params.coreMessage ? params.coreMessage : ''}

Most people get this wrong. Here's the fix.`,
    `Let's talk about ${params.topic}.

${params.coreMessage ? params.coreMessage : ''}

What's your take? Drop it below. 👇`,
  ]
}

export async function generateThreadsPost(params: GenerateParams): Promise<{ variations: string[] } | { error: string }> {
  let resolvedReferences = params.referencePosts
  if (params.referencePosts) {
    resolvedReferences = await resolveReferenceUrls(params.referencePosts)
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey === 'your-openrouter-api-key-here') {
    return { variations: fallbackVariations(params) }
  }

  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-OpenRouter-Title': 'ThreadCraft AI',
    },
  })

  const systemPrompt = `You are a high-performing social media content creator specializing in Threads posts.
Your goal is to write THREE single-text Threads posts (each under 500 characters) that achieve maximum engagement.

The three posts MUST take genuinely different angles or hooks on the same topic and core message (e.g. a bold claim, a personal story/anecdote, a listicle/framework breakdown, a contrarian take, a question hook) — do not just reword the same post three times.

FRAMEWORK RULES TO FOLLOW:
- POCKET PERSONA & BACKGROUND (Casual background, personality notes, values, lifestyle, dreams, or life views):
${
  [
    params.authorPersona,
    params.personalityTraits,
    params.likesDislikes,
    params.values,
    params.lifestyle,
    params.dreams,
    params.outlookOnLife
  ].filter((s): s is string => !!s).map(s => s.trim()).filter(s => s.length > 0).join('\n\n') || 'N/A'
}
- TARGET AUDIENCE: ${params.targetAudience || 'Developers, creators, and indie hackers'}
- PREFERRED TONE: ${params.preferredTone || 'Conversational, authoritative, punchy'}
- WRITING STYLE RULES: ${params.writingStyleRules || 'Use clear line breaks, punchy hooks, and keep sentences short.'}

CRITICAL CONSTRAINTS:
- Each post strictly under 500 characters.
- Each must deliver the specified core message clearly, from its own distinct angle.
- No spammy hashtags or cheesy engagement bait.
- Strictly write in PLAIN TEXT. Never use Markdown formatting (do NOT use **bold**, *italics*, _italics_, or headings). Threads does not support rich text or markdown formatting and will display them as raw characters.
${params.language === 'jp' ? '- Write the final output posts in Japanese (日本語).' : '- Write the final output posts in English.'}

RESPONSE FORMAT: Respond with ONLY a JSON object of the exact shape {"variations": ["post one text", "post two text", "post three text"]}. No other text, no markdown code fences.
`

  const userPrompt = `
Topic: ${params.topic}
Key Message/Value to Deliver: ${params.coreMessage || 'N/A'}
${resolvedReferences ? `Reference Posts for Pattern Matching:\n${resolvedReferences}` : ''}

Generate three authentic, high-converting Threads single-text post variations now:
`

  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0]?.message?.content?.trim() || ''
    const variations = parseVariations(raw)

    if (variations.length === 0) {
      console.error('[Generate Action] Could not parse variations from model response:', raw)
      return { error: 'Failed to parse AI-generated variations. Please try again.' }
    }

    // Always surface exactly 3 (pad with fallback templates if the model returned fewer)
    while (variations.length < 3) {
      variations.push(fallbackVariations(params)[variations.length] || fallbackVariations(params)[0])
    }

    return { variations: variations.slice(0, 3) }
  } catch (error: any) {
    console.error('OpenAI Generation Error:', error)
    return { error: error.message || 'AI generation failed. Please try again.' }
  }
}

function parseVariations(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.variations)) {
      return parsed.variations.filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
    }
  } catch {
    // Fall through to regex extraction below
  }

  // Fallback: try to extract a JSON object embedded in extra prose/markdown fences
  const match = raw.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed?.variations)) {
        return parsed.variations.filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
      }
    } catch {
      // Give up on structured parsing
    }
  }

  return []
}

async function resolveReferenceUrls(referencePosts: string): Promise<string> {
  const lines = referencePosts.split('\n')
  const resolvedLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      console.log(`[Generate Action] Attempting to resolve URL reference: ${trimmed}`)
      const resolved = await fetchAndParseThreadsPost(trimmed)
      resolvedLines.push(resolved)
    } else {
      resolvedLines.push(line)
    }
  }

  return resolvedLines.join('\n')
}

async function fetchAndParseThreadsPost(url: string): Promise<string> {
  try {
    let fetchUrl = url
    if (url.includes('threads.net')) {
      const urlObj = new URL(url)
      // Normalize pathname to ensure it points to the public embed endpoint
      if (!urlObj.pathname.endsWith('/embed')) {
        urlObj.pathname = urlObj.pathname.replace(/\/$/, '') + '/embed'
      }
      fetchUrl = urlObj.toString()
    }

    console.log(`[Generate Action] Fetching public embed reference: ${fetchUrl}`)
    const res = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!res.ok) {
      return `[Reference URL: ${url}] (Note: The server failed to fetch this link. Please write the output based on the theme & metadata in the URL if possible: ${url})`
    }

    const html = await res.text()
    
    // Attempt to match og:description or name description meta tags
    const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i) ||
                      html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)

    if (descMatch && descMatch[1]) {
      let content = descMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")

      // Catch fallback pages (such as redirect login gates)
      if (content.includes('Join Threads to share ideas') || content.includes('Log in with your Instagram')) {
        return `[Reference URL: ${url}] (Note: Meta restricted browser scraping on this page. Please write the output post using pattern matching guided by the URL context: ${url})`
      }

      return `[Reference Post Content from ${url}]:\n${content}`
    }

    return `[Reference URL: ${url}]`
  } catch (err: any) {
    console.error(`[Generate Action] Failed to resolve URL ${url}:`, err)
    return `[Reference URL: ${url}]`
  }
}
