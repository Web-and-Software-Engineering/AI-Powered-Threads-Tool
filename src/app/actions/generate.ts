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
}

export async function generateThreadsPost(params: GenerateParams) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey === 'your-openrouter-api-key-here') {
    // Fallback template when API key is not configured yet
    return `${params.topic.toUpperCase()} 🚀

${params.coreMessage ? params.coreMessage : 'Here is the key insight you need to know today:'}

1. High signal over noise.
2. Adapt proven patterns to your authentic voice.
3. Track engagement to refine future posts.

What is your main takeaway? Let me know below. 👇`
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
Your goal is to write a single-text Threads post (under 500 characters) that achieves maximum engagement.

FRAMEWORK RULES TO FOLLOW:
- AUTHOR PERSONA: ${params.authorPersona || 'Tech Entrepreneur & Solopreneur'}
- PERSONALITY TRAITS: ${params.personalityTraits || 'Direct, practical, warm'}
- LIKES & DISLIKES: ${params.likesDislikes || 'N/A'}
- DREAMS & GOALS: ${params.dreams || 'N/A'}
- VALUES & LIFESTYLE: ${params.lifestyle || 'N/A'}
- OUTLOOK ON LIFE: ${params.outlookOnLife || 'N/A'}
- TARGET AUDIENCE: ${params.targetAudience || 'Developers, creators, and indie hackers'}
- PREFERRED TONE: ${params.preferredTone || 'Conversational, authoritative, punchy'}
- WRITING STYLE RULES: ${params.writingStyleRules || 'Use clear line breaks, punchy hooks, and keep sentences short.'}

CRITICAL CONSTRAINTS:
- Single text post strictly under 500 characters.
- Must deliver the specified core message clearly.
- No spammy hashtags or cheesy engagement bait.
`

  const userPrompt = `
Topic: ${params.topic}
Key Message/Value to Deliver: ${params.coreMessage || 'N/A'}
${params.referencePosts ? `Reference Posts for Pattern Matching:\n${params.referencePosts}` : ''}

Generate an authentic, high-converting Threads single-text post now:
`

  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    return response.choices[0]?.message?.content?.trim() || 'Failed to generate content.'
  } catch (error: any) {
    console.error('OpenAI Generation Error:', error)
    return `[OpenAI Error: ${error.message || 'API error'}]. Falling back to template:\n\n${params.topic.toUpperCase()} 🚀\n\n${params.coreMessage}`
  }
}
