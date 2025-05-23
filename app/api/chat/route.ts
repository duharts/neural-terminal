import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, model, history, settings } = await request.json()
    
    let apiKey = ''
    let apiUrl = ''
    let requestBody = {}

    if (model === 'perplexity') {
      apiKey = settings.perplexityApiKey || process.env.PERPLEXITY_API_KEY
      apiUrl = 'https://api.perplexity.ai/chat/completions'
      requestBody = {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          ...history.map((msg: any) => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: message }
        ],
        max_tokens: settings.maxTokens || 2000,
        temperature: settings.temperature || 0.2,
      }
    } else {
      apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY
      apiUrl = 'https://api.openai.com/v1/chat/completions'
      requestBody = {
        model: model === 'gpt-4' ? 'gpt-4' : 'gpt-3.5-turbo',
        messages: [
          ...history.map((msg: any) => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: message }
        ],
        max_tokens: settings.maxTokens || 1000,
        temperature: settings.temperature || 0.7,
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 })
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    const reply = data.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
