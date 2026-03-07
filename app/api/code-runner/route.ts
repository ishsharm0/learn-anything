import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { code, language, challenge } = await request.json()
    
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    
    // Use LLM to simulate code execution
    // This is more reliable than hosting actual compilers for all languages
    const prompt = `You are a ${language || 'JavaScript'} interpreter. Execute this code and provide the EXACT output.

CODE:
\`\`\`${language || 'javascript'}
${code}
\`\`\`

${challenge ? `CHALLENGE: ${challenge}\n` : ''}

INSTRUCTIONS:
1. Simulate running this code step by step
2. Consider all edge cases and potential errors
3. If the code has bugs or will error, explain what error and why
4. If the code is incomplete (has TODOs), explain what needs to be filled in
5. Provide the EXACT output that would appear in the console

OUTPUT FORMAT (JSON):
{
  "output": "the exact console output",
  "error": null or "error message if code would fail",
  "explanation": "brief explanation of what the code does",
  "success": true/false
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert code interpreter. You simulate code execution accurately for any programming language. You provide exact output as if the code was actually run.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    const result = JSON.parse(content)

    return NextResponse.json({
      output: result.output || 'No output',
      error: result.error,
      explanation: result.explanation,
      success: result.success !== false,
    })

  } catch (error: any) {
    console.error('Code runner error:', error)
    return NextResponse.json({ 
      error: error.message, 
      output: 'Error executing code',
      success: false 
    }, { status: 500 })
  }
}
