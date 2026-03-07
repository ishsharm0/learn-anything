import { NextResponse } from 'next/server'
import { generateId } from '@/lib/utils'
import type { Lesson, TemplateType } from '@/lib/types'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || ''

// ============= WEB SEARCH =============
async function searchWeb(query: string): Promise<string> {
  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8&freshness=year`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY,
      },
    })
    
    if (!response.ok) return ''
    const data = await response.json()
    const results = data.web?.results?.slice(0, 5) || []
    return results.map((r: any) => `[${r.title}](${r.url})\n${r.description}`).join('\n\n')
  } catch {
    return ''
  }
}

// ============= COGNITIVE SCIENCE FRAMEWORK =============
const COGNITIVE_PRINCIPLES = `
EVIDENCE-BASED LEARNING PRINCIPLES (NON-NEGOTIABLE):

1. **PRE-TESTING EFFECT**: Start with 1-2 questions BEFORE teaching. This primes the brain and creates curiosity gaps.

2. **WORKED EXAMPLES FIRST**: Never ask learners to solve without seeing a complete solution first. Show then Guide then Independent.

3. **CONCRETE TO ABSTRACT**: Always show 2-3 specific examples BEFORE stating the general principle. Never say "variables store data" without showing actual code first.

4. **RETRIEVAL PRACTICE**: Every 2-3 sections, include active recall (quiz/flashcard). Testing IS learning, not just assessment.

5. **SPACED REPETITION**: Reference earlier sections explicitly. "Remember when we learned X? Now we'll use it for Y."

6. **COGNITIVE LOAD**: One concept at a time. Break complex procedures into numbered steps. Working memory holds ~4 items.

7. **DESIRABLE DIFFICULTIES**: Let them struggle productively. Don't make it too easy. Delayed feedback improves retention.

8. **METACOGNITION**: Include reflection prompts. "Before moving on, explain X in one sentence." "Rate your confidence: 1-5."

9. **ADDRESS MISCONCEPTIONS**: For each concept, explicitly state what learners get wrong and WHY. "Common mistake: using = instead of =="

10. **DUAL CODING**: Describe visual representations verbally. "Imagine a flowchart where..." "Picture a box labeled 'age' containing 25."

11. **ELABORATION**: Always explain WHY, not just what. Connect new concepts to prior knowledge.

12. **SPECIFICITY**: Never use vague phrases like "following examples" or "as shown below" without ACTUALLY showing them. Every claim needs evidence.

13. **GENERATIVE LEARNING**: Prompt learners to explain concepts in their own words. "Explain X as if teaching a friend."

14. **IMMEDIATE FEEDBACK**: Provide explanations immediately after answers, not at the end. Explain WHY wrong answers are wrong.

15. **PROGRESSIVE COMPLEXITY**: Each section must build on the previous. Use phrases like "Now that you know X..." to connect concepts.

16. **REAL-WORLD APPLICATION**: Every concept must have at least one practical, real-world use case. "You'll use this when..."

17. **ERROR-BASED LEARNING**: Show common mistakes FIRST, then the correction. This prevents learners from making the same errors.
`

// ============= LESSON STRUCTURE =============
const LESSON_STRUCTURE = `
MANDATORY 8-SECTION STRUCTURE WITH PROGRESSIVE DIFFICULTY:

**Section 1: Pre-Test + Hook (QUIZ) - EASY**
- 2 SIMPLE questions to gauge prior knowledge (NOT to stump them)
- Questions should be answerable with common sense or basic knowledge
- Purpose: Activate prior knowledge, NOT to intimidate
- Then: "Why this matters" - real-world relevance
- Duration: 3 min

**Section 2: Core Concept 1 with Worked Example (TEXT) - FOUNDATION**
- ONE concept only (don't overwhelm)
- 2-3 concrete examples FIRST, THEN state the principle
- Show COMPLETE worked example with step-by-step annotations
- CRITICAL: Actually WRITE OUT the examples. Never say "for example:" without showing it.
- Use markdown code blocks for any code, formulas, or structured content
- NO practice yet - let them see the full solution first
- Duration: 5 min

**Section 3: Guided Practice 1 (CODE/INTERACTIVE) - HEAVY SCAFFOLDING**
- Fill-in-the-blank style (80% done, they complete 20%)
- Provide hints that are immediately visible
- Multiple test cases with clear expected outputs
- DO NOT show the full solution - they must complete it
- Duration: 5 min

**Section 4: Core Concept 2 (TEXT) - BUILDS ON #2**
- Explicitly reference Concept 1: "Now that we know X, we can do Y"
- 2-3 more concrete examples - WRITE THEM OUT FULLY
- Slightly more complex than Concept 1
- CRITICAL: No placeholder text like "following examples" - SHOW the actual examples
- Use bullet points, numbered lists, and code blocks for clarity
- Duration: 5 min

**Section 5: Retrieval Practice (QUIZ) - MODERATE**
- 3-4 questions mixing Concepts 1 & 2 (interleaving)
- Start EASY, get progressively harder
- First question: Basic recall (80% should get right)
- Middle questions: Application (60% should get right)
- Last question: Challenge (40% should get right)
- Detailed explanations AFTER each answer
- Duration: 5 min

**Section 6: Common Mistakes + Correction (TEXT) - PREVENTIVE**
- 3 specific mistakes beginners make
- Show the WRONG code/thinking FIRST in a code block
- Explain WHY it's wrong (the mental model error)
- Show the CORRECTION in a code block
- CRITICAL: Actually write out wrong and correct versions side by side
- Duration: 4 min

**Section 7: Independent Challenge (CODE/INTERACTIVE) - FULL APPLICATION**
- Full problem with MINIMAL scaffolding (maybe just hints)
- Hints are HIDDEN until user requests them (click to reveal)
- Multiple test cases to validate
- DO NOT show solution until user has attempted at least once
- Solution button only appears AFTER first run attempt
- Duration: 8 min

**Section 8: Reflection + Next Steps (INTERACTIVE) - METACOGNITION**
- Confidence rating: 1-5 stars with personalized feedback for each level
- "Your Next Challenge": Text input for learner to describe what they want to build
- Provide 2-3 SPECIFIC resources with URLs (not generic "read the docs")
- Include a concrete project idea that combines all learned concepts
- Celebrate completion with specific achievement message
- Duration: 5 min

CRITICAL PACING RULES:
1. NEVER show a full solution before the learner has attempted
2. NEVER ask a hard question before teaching the concept
3. ALWAYS show a worked example BEFORE asking for independent work
4. Hints should be progressive (easy → medium → hard)
5. Quiz difficulty should ramp up within each quiz

TOTAL: 35-40 minutes (REALISTIC)
`

// ============= TEMPLATE-SPECIFIC PROMPTS =============
const TEMPLATE_PROMPTS: Record<TemplateType, string> = {
  coding: `
CODING LESSON REQUIREMENTS:

**LANGUAGE DETECTION:**
- Detect language from topic (Python, JavaScript, Java, C++, C, SQL, HTML, CSS)
- Use appropriate syntax in ALL examples
- Never mix languages (no Python examples for JavaScript lessons)

**CRITICAL: DO NOT SHOW SOLUTIONS TOO EARLY**
- Worked examples in TEACHING sections are OK (Section 2, 4)
- Practice challenges (Section 3, 7) must NOT show full solution
- Use TODO comments and fill-in-blanks for practice
- Solution only shown AFTER user attempts

**Worked Example Format (TEACHING sections only):**
Python:
\`\`\`python
# Step 1: Get user input
name = input("What's your name? ")

# Step 2: Process
greeting = f"Hello, {name}!"

# Step 3: Output
print(greeting)  # Output: Hello, Alice!
\`\`\`

**Practice Challenge Format (PRACTICE sections - HIDE SOLUTION):**
{
  "challenge": "Write a program that checks if a user can vote (18+)",
  "code": "age = input('Enter your age: ')\\n# TODO: Convert to integer\\n# TODO: Check if >= 18\\n# TODO: Print appropriate message",
  "expectedOutput": "Enter your age: 20\\nYou can vote!",
  "language": "python",
  "hints": [
    "Hint 1 (Easy): Use int() to convert the input",
    "Hint 2 (Medium): Use an if/else statement",
    "Hint 3 (Hard): The comparison operator is >="
  ],
  "testCases": [
    { "input": "20", "output": "You can vote!" },
    { "input": "16", "output": "You cannot vote yet" }
  ]
}

**Quiz Question Format - PROGRESSIVE DIFFICULTY:**
Easy (first question - 80% should get right):
{
  "question": "What does print('Hello') do?",
  "options": ["Shows 'Hello' on screen", "Deletes 'Hello'", "Stores 'Hello'", "Nothing"],
  "correct": 0,
  "explanation": "print() displays text on the screen."
}

Medium (middle questions - 60% should get right):
{
  "question": "What will this output?\\n\`\`\`python\\nx = 5\\nx = x + 3\\nprint(x)\\n\`\`\`",
  "options": ["5", "8", "x + 3", "Error"],
  "correct": 1,
  "explanation": "Line 2 adds 3 to x (which is 5), so x becomes 8."
}

Hard (last question - 40% should get right):
{
  "question": "What's wrong with this code?\\n\`\`\`python\\nage = input('Age: ')\\nif age >= 18:\\n    print('Adult')\\n\`\`\`",
  "options": [
      "input() returns a string, needs int() conversion",
      "Should use == instead of >=",
      "Missing else statement",
      "Nothing is wrong"
    ],
  "correct": 0,
  "explanation": "input() returns a string. You need int(input()) to compare numbers."
}

**Common Mistakes by Language:**
- Python: = vs ==, input() returns string, indentation errors
- JavaScript: == vs ===, var/let/const, async/await
- Java: semicolons, type declarations, public static void main
- C/C++: pointers, memory management, include statements

**Progressive Difficulty in Challenges:**
1. Section 3: Fill in blanks (80% provided, 20% to complete)
2. Section 5: Moderate scaffolding (50% provided)
3. Section 7: Minimal scaffolding (hints only, no code provided)

REALISTIC DURATION: 30-45 min
`,

  language: `
LANGUAGE LESSON REQUIREMENTS:

**Dialogue Format:**
\`\`\`
Person A: ¡Hola! ¿Cómo estás? (OH-lah! KOH-moh eh-STAHS?)
        Hi! How are you?

Person B: ¡Muy bien, gracias! ¿Y tú? (moy BYEN, GRAH-see-ahs! ee TOO?)
        Very well, thanks! And you?
\`\`\`

**Flashcard Format:**
- front: "How do you greet someone informally?"
- back: "¡Hola! (OH-lah) - Used with friends, family, peers"

**Quiz Format:**
- question: "You're meeting your friend's parents for the first time. Which greeting is appropriate?"
- options: ["¡Hola! ¿Qué tal?", "¡Buenos días! ¿Cómo está usted?", "¿Qué pasa, tío?", "¡Hey!"]
- correct: 1
- explanation: "With elders or in formal situations, use 'usted' form and time-appropriate greeting like 'Buenos días'."

**Cultural Notes to Include:**
- Formal vs informal (tú vs usted)
- Regional variations (Spain vs Latin America)
- Gestures and body language

REALISTIC DURATION: 25-35 min
`,

  finance: `
FINANCE LESSON REQUIREMENTS:

**Use Real Data (search web for current):**
- Real stock tickers (AAPL, TSLA, NVDA, MSFT)
- Current/recent prices
- Actual financial metrics (P/E, market cap, revenue)

**Analysis Format:**
\`\`\`
Company: Apple (AAPL)
Current Price: $175.50
Market Cap: $2.7 trillion
P/E Ratio: 28.5

Analysis: At a P/E of 28.5, Apple trades at a premium 
compared to the S&P 500 average of 21. However, this is 
justified by its strong ecosystem and services growth.
\`\`\`

**Quiz Format:**
- question: "Tesla's profit margin decreased from 15% to 12% while revenue increased 20%. What's the most likely cause?"
- options: ["Increased competition forcing price cuts", "Higher production costs from supply chain issues", "Decreased demand for EVs", "Accounting error"]
- correct: 1
- explanation: "When revenue grows but margins shrink, it typically means costs are rising faster than prices. Supply chain issues would increase production costs."

**Risk Warnings:**
- "Past performance ≠ future results"
- "Never invest money you can't afford to lose"
- "Diversification reduces risk"

REALISTIC DURATION: 30-40 min
`,

  math: `
MATH LESSON REQUIREMENTS:

**Worked Example Format:**
\`\`\`
Problem: Find the derivative of f(x) = 3x² + 2x - 5

Step 1: Apply power rule to 3x²
        d/dx(3x²) = 3 × 2x^(2-1) = 6x

Step 2: Apply power rule to 2x
        d/dx(2x) = 2 × 1x^(1-1) = 2

Step 3: Derivative of constant is 0
        d/dx(-5) = 0

Step 4: Combine
        f'(x) = 6x + 2
\`\`\`

**Visual Descriptions:**
- "Imagine the graph curving upward..."
- "Picture the slope getting steeper as x increases..."

**Common Calculation Errors:**
- Forgetting chain rule
- Sign errors
- Order of operations mistakes
- Unit conversion errors

REALISTIC DURATION: 35-45 min
`,

  science: `
SCIENCE LESSON REQUIREMENTS:

**Predict-Observe-Explain Format:**
\`\`\`
PREDICT: What happens when you drop a feather and a 
hammer on the Moon?

A) Hammer falls faster (it's heavier)
B) Feather falls faster (less air resistance)
C) Both fall at the same rate
D) Both float (no gravity on Moon)

[Let them think, then reveal...]

OBSERVE: In Apollo 15, astronaut David Scott dropped both. 
They hit the surface simultaneously.

EXPLAIN: Without air resistance, all objects fall at the 
same rate regardless of mass. Gravity accelerates everything 
at 9.8 m/s² on Earth, 1.6 m/s² on Moon.
\`\`\`

**Real Lab Data:**
- Actual experimental results
- Specific measurements
- Error margins

REALISTIC DURATION: 30-40 min
`,

  history: `
HISTORY LESSON REQUIREMENTS:

**Narrative Format:**
\`\`\`
June 28, 1914. Sarajevo, Bosnia.

Archduke Franz Ferdinand leans out of his car to speak 
to someone in the crowd. His driver, confused by wrong 
turns, has accidentally positioned the car right in front 
of Gavrilo Princip, a 19-year-old nationalist with a pistol.

Princip fires twice. The Archduke and his wife are dead.

What happens next will engulf the world in war...
\`\`\`

**Decision Points:**
- "You are President Wilson. Germany has resumed unrestricted submarine warfare. Do you: A) Declare war, B) Send ultimatum, C) Remain neutral?"

**Primary Sources:**
- Actual quotes from historical figures
- Excerpts from documents, letters, speeches

REALISTIC DURATION: 30-40 min
`,

  general: `
GENERAL LESSON REQUIREMENTS:

**Concrete Examples:**
- Every abstract concept gets 2-3 real-world examples
- Use specific numbers, names, scenarios
- Connect to learner's existing knowledge

**Quiz Format:**
- Scenario-based questions
- Plausible distractors (common mistakes)
- Detailed explanations

**Reflection Prompts:**
- "What was most surprising?"
- "How will you apply this?"
- "What questions do you still have?"

REALISTIC DURATION: 25-35 min
`,
}

// ============= QUALITY VALIDATION =============
function validateLesson(lesson: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check section count
  if (!lesson.sections || lesson.sections.length < 6) {
    errors.push('Less than 6 sections')
  }
  
  // Check each section
  lesson.sections?.forEach((s: any, i: number) => {
    if (!s.title) errors.push(`Section ${i + 1}: Missing title`)
    if (!s.type) errors.push(`Section ${i + 1}: Missing type`)
    if (!s.content && (!s.components || s.components.length === 0)) {
      errors.push(`Section ${i + 1}: No content`)
    }
    
    // CRITICAL: Text sections must have substantial content (200+ chars)
    if (s.type === 'text' && s.content && s.content.length < 200) {
      errors.push(`Section ${i + 1}: Content too short (${s.content.length} chars, need 200+)`)
    }
    
    // Check for placeholder text
    if (s.content) {
      const placeholders = ['following example', 'as shown below', 'see above', 'like this:']
      placeholders.forEach(ph => {
        if (s.content.toLowerCase().includes(ph) && !s.content.includes('```')) {
          errors.push(`Section ${i + 1}: Contains placeholder text "${ph}" without actual examples`)
        }
      })
    }
    
    // Check quiz questions have options
    if (s.type === 'quiz' && s.components) {
      s.components.forEach((q: any, j: number) => {
        if (!q.options || q.options.length < 3) {
          errors.push(`Quiz Q${j + 1}: Less than 3 options`)
        }
        if (typeof q.correct !== 'number') {
          errors.push(`Quiz Q${j + 1}: Invalid correct answer`)
        }
        if (!q.explanation || q.explanation.length < 20) {
          errors.push(`Quiz Q${j + 1}: Explanation too short`)
        }
        // Check options are substantial (not just "useState")
        q.options.forEach((opt: string, k: number) => {
          if (!opt || opt.length < 5) {
            errors.push(`Quiz Q${j + 1} Option ${k + 1}: Too short`)
          }
        })
      })
    }
    
    // Check code challenges have actual code
    if (s.type === 'code' && s.components) {
      s.components.forEach((c: any, j: number) => {
        if (!c.code || c.code.length < 30) {
          errors.push(`Code challenge ${j + 1}: Missing or too short code (need 30+ chars)`)
        }
        if (!c.testCases || !Array.isArray(c.testCases) || c.testCases.length < 2) {
          errors.push(`Code challenge ${j + 1}: Need at least 2 test cases array for validation`)
        }
        if (!c.hints || !Array.isArray(c.hints) || c.hints.length < 2) {
          errors.push(`Code challenge ${j + 1}: Need at least 2 hints in array format (easy + hard)`)
        }
        if (!c.challenge || c.challenge.length < 20) {
          errors.push(`Code challenge ${j + 1}: Challenge description too short`)
        }
        if (!c.language) {
          errors.push(`Code challenge ${j + 1}: Missing language specification`)
        }
        // Validate test cases have input/output
        if (c.testCases) {
          c.testCases.forEach((tc: any, k: number) => {
            if (!tc.input || !tc.output) {
              errors.push(`Code challenge ${j + 1} Test ${k + 1}: Missing input or output`)
            }
          })
        }
      })
    }
  })
  
  return { valid: errors.length === 0, errors }
}

// ============= FEW-SHOT EXAMPLES =============
const FEW_SHOT_EXAMPLE = `
EXAMPLE OF HIGH-QUALITY OUTPUT:

{
  "topic": "Python Variables",
  "template": "coding",
  "objective": "Write a Python program using variables and data types",
  "duration": "30 min",
  "sections": [
    {
      "title": "Pre-Test: What Do You Already Know?",
      "type": "quiz",
      "content": "Answer these before we begin (don't worry if you get them wrong!)",
      "components": [
        {
          "question": "What will this code output?\\n\\n\`\`\`python\\nx = 5\\nx = x + 3\\nprint(x)\\n\`\`\`",
          "options": ["5", "8", "x + 3", "Error"],
          "correct": 1,
          "explanation": "Line 2 adds 3 to x (which is 5), so x becomes 8."
        },
        {
          "question": "Which is the correct way to store text in a variable?",
          "options": ["name = John", "name = 'John'", "name == 'John'", "John = name"],
          "correct": 1,
          "explanation": "Use = for assignment, and quotes around text strings."
        }
      ]
    },
    {
      "title": "Core Concept: What is a Variable?",
      "type": "text",
      "content": "A variable is like a labeled box that stores information.\\n\\n**Concrete Examples:**\\n\\n\`\`\`python\\nage = 25        # Stores the number 25\\nname = 'Alice'   # Stores the text 'Alice'\\nheight = 5.7      # Stores the decimal 5.7\\n\`\`\`\\n\\n**The Principle:** Variables have a name (left of =) and a value (right of =)."
    },
    {
      "title": "Guided Practice: Create Your Own Variables",
      "type": "code",
      "content": "Fill in the blanks to create variables",
      "components": [
        {
          "code": "# Create a variable called 'favorite_color' and assign it your favorite color\\nfavorite_color = #TODO\\n\\n# Print it\\nprint(#TODO)",
          "challenge": "Create a variable and print it",
          "expectedOutput": "blue",
          "hints": ["Put your color in quotes, like 'blue'", "Use the print() function to display the value"],
          "testCases": [
            {"input": "favorite_color = 'red'\\nprint(favorite_color)", "output": "red"},
            {"input": "favorite_color = 'blue'\\nprint(favorite_color)", "output": "blue"}
          ],
          "language": "python"
        }
      ]
    }
  ]
}
`

// ============= INPUT SANITIZATION =============
function sanitizeInput(input: string): string {
  // Remove potential injection patterns
  return input
    .replace(/[<>]/g, '')  // Remove HTML brackets
    .replace(/javascript:/gi, '')  // Remove JS protocol
    .replace(/on\w+=/gi, '')  // Remove event handlers
    .trim()
    .slice(0, 500)  // Limit length
}

// ============= ADAPTIVE LEARNING =============
interface UserPerformance {
  preTestScore?: number
  quizScores?: number[]
  timeSpent?: number
  attempts?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

interface LessonDepth {
  duration: '5min' | '10min' | '20min' | '30min' | '45min'
  sections: number
  depth: 'overview' | 'fundamentals' | 'comprehensive' | 'mastery' | 'expert'
}

const DEPTH_PRESETS: Record<string, LessonDepth> = {
  '5min': { duration: '5min', sections: 4, depth: 'overview' },
  '10min': { duration: '10min', sections: 6, depth: 'fundamentals' },
  '20min': { duration: '20min', sections: 8, depth: 'comprehensive' },
  '30min': { duration: '30min', sections: 10, depth: 'mastery' },
  '45min': { duration: '45min', sections: 12, depth: 'expert' },
}

function determineDifficulty(performance?: UserPerformance): 'beginner' | 'intermediate' | 'advanced' {
  if (!performance) return 'intermediate'
  
  const preTestScore = performance.preTestScore || 0
  const avgQuizScore = performance.quizScores?.length 
    ? performance.quizScores.reduce((a, b) => a + b, 0) / performance.quizScores.length 
    : 50
  
  if (preTestScore >= 70 || avgQuizScore >= 85) return 'advanced'
  if (preTestScore >= 40 || avgQuizScore >= 60) return 'intermediate'
  return 'beginner'
}

function getDepthPrompt(depth: LessonDepth): string {
  const depthPrompts: Record<string, string> = {
    overview: `Provide a HIGH-LEVEL OVERVIEW only. Generate exactly ${depth.sections} sections. Cover just the absolute essentials. Use simple language. 1-2 examples total. Focus on "what" not "how".`,
    fundamentals: `Cover FUNDAMENTALS thoroughly. Generate exactly ${depth.sections} sections. Include core concepts with 2-3 examples each. Skip advanced edge cases. Focus on practical basics.`,
    comprehensive: `Provide COMPREHENSIVE coverage. Generate exactly ${depth.sections} sections. Include core concepts, common patterns, and some advanced topics. 3-4 examples per concept. Include common mistakes.`,
    mastery: `Deep DIVE for MASTERY. Generate exactly ${depth.sections} sections. Cover fundamentals through advanced topics. Include edge cases, optimizations, and best practices. 4-5 examples per concept.`,
    expert: `EXPERT-LEVEL depth. Generate exactly ${depth.sections} sections. Cover everything from basics to cutting-edge. Include performance considerations, architectural patterns, and real-world case studies.`,
  }
  return depthPrompts[depth.depth] || depthPrompts.fundamentals
}

function getDifficultyPrompt(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'beginner':
      return `
DIFFICULTY: BEGINNER
- Assume NO prior knowledge
- Explain EVERY term and concept
- Use simple analogies ("A variable is like a labeled box")
- Provide MORE examples (3-4 per concept)
- Break procedures into SMALLER steps
- Include MORE scaffolding (fill-in-blanks before independent work)
- Use simpler language throughout
- Duration: 35-45 min (more time for explanations)
`
    case 'intermediate':
      return `
DIFFICULTY: INTERMEDIATE
- Assume BASIC familiarity with the topic
- Explain new terms, but can reference common concepts
- Use 2-3 examples per concept
- Standard step breakdown
- Moderate scaffolding
- Duration: 30-40 min
`
    case 'advanced':
      return `
DIFFICULTY: ADVANCED
- Assume SOLID foundation in the topic
- Focus on nuanced understanding and edge cases
- Use 1-2 examples (they get it quickly)
- Challenge with complex scenarios
- MINIMAL scaffolding (jump to independent work faster)
- Include optimization considerations
- Include common pitfalls and gotchas
- Duration: 25-35 min (they learn faster)
`
  }
}

// ============= MAIN API HANDLER =============
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, performance, depth: depthPreset, preTestResults, steerPrompt } = body
    
    // DEBUG: Log incoming request
    console.log('[Lesson API] Incoming request:', { 
      topicReceived: topic, 
      topicType: typeof topic,
      depthPreset,
      hasSteerPrompt: !!steerPrompt 
    })
    
    // OPSEC: Sanitize input
    const sanitizedTopic = sanitizeInput(topic || '')
    
    if (!sanitizedTopic || sanitizedTopic.length < 2) {
      console.error('[Lesson API] Invalid topic:', sanitizedTopic)
      return NextResponse.json({ error: 'Please enter a valid topic', lesson: null }, { status: 400 })
    }
    
    console.log('[Lesson API] Sanitized topic:', sanitizedTopic)
    
    // Detect template
    const template = detectTemplate(sanitizedTopic)
    
    // Determine adaptive difficulty - preTestResults directly influences this
    let difficulty = determineDifficulty(performance)
    if (preTestResults !== undefined && typeof preTestResults === 'number') {
      // Pre-test score directly sets difficulty
      if (preTestResults >= 80) difficulty = 'advanced'
      else if (preTestResults >= 50) difficulty = 'intermediate'
      else difficulty = 'beginner'
    }
    
    // Get depth settings (5min, 10min, 20min, 30min, 45min)
    const depth = DEPTH_PRESETS[depthPreset || '20min'] || DEPTH_PRESETS['20min']
    
    // Search web for current data for ALL topics
    let webContext = ''
    try {
      console.log('[Lesson API] Searching web for:', sanitizedTopic)
      webContext = await searchWeb(`${sanitizedTopic} 2025 2026 current latest`)
      console.log('[Lesson API] Web search returned', webContext ? 'content' : 'no results')
    } catch (err) {
      console.warn('[Lesson API] Web search failed:', err)
      webContext = ''
    }
    
    // Get depth-specific prompt
    const depthPrompt = getDepthPrompt(depth)
    
    // Build comprehensive prompt with adaptive difficulty and depth
    const systemPrompt = buildSystemPrompt(template, sanitizedTopic, webContext, difficulty, depthPrompt, steerPrompt)
    
    // Call Groq with retry logic - up to 4 attempts
    let lessonPlan: any = null
    let lastError: string = ''
    let usedFallback = false
    
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(`[Lesson API] Attempt ${attempt}/4 for topic: ${sanitizedTopic}`)
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: 'Generate the complete lesson as JSON. JSON ONLY, no markdown fences.' }
            ],
            temperature: difficulty === 'advanced' ? 0.6 : 0.8,
            max_tokens: 8000,
          })
        })

        if (!response.ok) {
          const errText = await response.text().catch(() => '')
          throw new Error(`Groq API error: ${response.status} ${errText.slice(0, 200)}`)
        }

        const data = await response.json()
        let content = data.choices?.[0]?.message?.content || ''
        
        // Extract JSON (handle markdown fences)
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')
        
        lessonPlan = JSON.parse(jsonMatch[0])
        
        // Validate quality - but be less strict on retry
        const validation = validateLesson(lessonPlan)
        if (!validation.valid) {
          console.warn(`[Lesson API] Attempt ${attempt} validation errors:`, validation.errors.slice(0, 3))
          // Only retry if we have attempts left AND errors are fixable
          if (attempt < 4) continue
          // On final attempt, accept imperfect lessons
          console.warn('[Lesson API] Using lesson despite validation errors')
        }
        
        console.log(`[Lesson API] Success on attempt ${attempt}`)
        break // Success
      } catch (e: any) {
        lastError = e.message
        console.error(`[Lesson API] Attempt ${attempt} failed:`, lastError.slice(0, 150))
        if (attempt === 4) {
          console.error('[Lesson API] All 4 attempts failed, using fallback')
        }
      }
    }
    
    // Fallback if all attempts fail
    if (!lessonPlan) {
      usedFallback = true
      console.warn('[Lesson API] Using fallback lesson for:', sanitizedTopic)
      lessonPlan = generateFallbackLesson(sanitizedTopic, template, difficulty)
    }
    
    // Normalize and return
    const lesson = normalizeLesson(lessonPlan, template, difficulty)
    
    // OPSEC: Log for monitoring
    console.log('[Lesson API] Generated adaptive lesson:', {
      topic: sanitizedTopic,
      template,
      difficulty,
      sections: lesson.sections?.length,
      usedFallback,
      timestamp: new Date().toISOString(),
    })
    
    return NextResponse.json({ lesson, difficulty, usedFallback })
    
  } catch (error: any) {
    console.error('Lesson API error:', error)
    return NextResponse.json({ error: error.message, lesson: null }, { status: 500 })
  }
}

// ============= HELPER FUNCTIONS =============
function buildSystemPrompt(
  template: TemplateType, 
  topic: string, 
  webContext: string, 
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  depthPrompt: string = '',
  steerPrompt: string = ''
): string {
  const contextNote = webContext ? `\n\nWEB SEARCH RESULTS (incorporate these facts):\n${webContext}\n` : ''
  const difficultyPrompt = getDifficultyPrompt(difficulty)
  const steerNote = steerPrompt ? `\n\nUSER CUSTOMIZATION REQUEST (MUST INCORPORATE): "${steerPrompt}"\nAdjust the lesson to specifically address this request while maintaining quality standards.` : ''
  
  return `
YOU ARE A MASTER EDUCATOR creating world-class, ADAPTIVE lessons.

${COGNITIVE_PRINCIPLES}

${LESSON_STRUCTURE}

${TEMPLATE_PROMPTS[template]}

${difficultyPrompt}

${depthPrompt ? `\nDEPTH REQUIREMENT: ${depthPrompt}\n` : ''}

${contextNote}

${steerNote}

${FEW_SHOT_EXAMPLE}

TOPIC: "${topic}"
TEMPLATE: ${template}
DIFFICULTY: ${difficulty.toUpperCase()}
${depthPrompt ? `DEPTH: ${depthPrompt.split(' ')[0].toUpperCase()}` : ''}

OUTPUT: Valid JSON matching the example structure. NO markdown fences. NO explanations. JSON ONLY.`
}

function detectTemplate(topic: string): TemplateType {
  const lower = topic.toLowerCase()
  if (lower.includes('spanish') || lower.includes('french') || lower.includes('language') || lower.includes('german') || lower.includes('japanese') || lower.includes('mandarin') || lower.includes('italian') || lower.includes('portuguese') || lower.includes('korean') || lower.includes('arabic')) return 'language'
  if (lower.includes('python') || lower.includes('javascript') || lower.includes('coding') || lower.includes('programming') || lower.includes('react') || lower.includes('java') || lower.includes('html') || lower.includes('css') || lower.includes('sql') || lower.includes('typescript') || lower.includes('go') || lower.includes('rust') || lower.includes('c++') || lower.includes('swift')) return 'coding'
  if (lower.includes('stock') || lower.includes('trading') || lower.includes('finance') || lower.includes('investing') || lower.includes('crypto') || lower.includes('options') || lower.includes('forex') || lower.includes('economics') || lower.includes('money')) return 'finance'
  if (lower.includes('calculus') || lower.includes('algebra') || lower.includes('math') || lower.includes('geometry') || lower.includes('statistics') || lower.includes('trigonometry') || lower.includes('probability')) return 'math'
  if (lower.includes('physics') || lower.includes('chemistry') || lower.includes('biology') || lower.includes('science') || lower.includes('astronomy') || lower.includes('geology')) return 'science'
  if (lower.includes('history') || lower.includes('war') || lower.includes('ancient') || lower.includes('civilization') || lower.includes('revolution') || lower.includes('empire') || lower.includes('medieval')) return 'history'
  return 'general'
}

function detectCodingLanguage(topic: string): string {
  const lower = topic.toLowerCase()
  if (lower.includes('python')) return 'python'
  if (lower.includes('typescript')) return 'typescript'
  if (lower.includes('javascript') || lower.includes('react') || lower.includes('node')) return 'javascript'
  if (lower.includes('java')) return 'java'
  if (lower.includes('c++')) return 'cpp'
  if (lower.includes('c ')) return 'c'
  if (lower.includes('sql')) return 'sql'
  if (lower.includes('html')) return 'html'
  if (lower.includes('css')) return 'css'
  if (lower.includes('swift')) return 'swift'
  return 'python'
}

function buildResourceLinks(topic: string): string[] {
  const encoded = encodeURIComponent(topic)
  return [
    `- Wikipedia overview: https://en.wikipedia.org/wiki/Special:Search?search=${encoded}`,
    `- Khan Academy / guided learning search: https://www.khanacademy.org/search?page_search_query=${encoded}`,
    `- Recent talks and walkthroughs: https://www.youtube.com/results?search_query=${encoded}`,
  ]
}

function buildCodingFallbackLesson(topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced') {
  const language = detectCodingLanguage(topic)
  
  // Generate topic-specific examples based on the actual topic
  const topicLower = topic.toLowerCase()
  let examples: { code: string; explanation: string }[] = []
  
  if (topicLower.includes('react') || topicLower.includes('hook')) {
    examples = [
      {
        code: "function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}",
        explanation: "useState hook manages component state"
      },
      {
        code: "useEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);",
        explanation: "useEffect runs side effects when count changes"
      }
    ]
  } else if (topicLower.includes('variable')) {
    examples = [
      { code: "user_name = 'Ava'\nprint(f'Hello, {user_name}!')", explanation: "Store and use a string value" },
      { code: "score = 10\nscore = score + 5\nprint(score)", explanation: "Update a numeric value" }
    ]
  } else if (topicLower.includes('function')) {
    examples = [
      { code: "def greet(name):\n  return f'Hello, {name}!'\n\nprint(greet('Ava'))", explanation: "Define and call a function" },
      { code: "def add(a, b):\n  return a + b", explanation: "Function with parameters" }
    ]
  } else if (topicLower.includes('loop') || topicLower.includes('for') || topicLower.includes('while')) {
    examples = [
      { code: "for i in range(5):\n  print(f'Count: {i}')", explanation: "Loop through numbers" },
      { code: "names = ['Ava', 'Bob', 'Cara']\nfor name in names:\n  print(name)", explanation: "Loop through a list" }
    ]
  } else {
    // Generic coding examples
    examples = [
      { code: "value = 42\nprint(f'The answer is {value}')", explanation: "Store and display a value" },
      { code: "result = 10 + 5\nprint(result)", explanation: "Perform a calculation" }
    ]
  }

  return {
    topic,
    template: 'coding',
    objective: `Learn and practice ${topic} through hands-on coding examples`,
    duration: difficulty === 'beginner' ? '40 min' : difficulty === 'advanced' ? '30 min' : '35 min',
    sections: [
      {
        title: `Pre-Test: ${topic} Basics`,
        type: 'quiz',
        content: `Quick check: what do you already know about **${topic}**?`,
        components: [
          {
            question: `What does ${topic} help you do in code?`,
            options: [`Solve specific programming tasks`, 'Only store text', 'Only work with websites', 'Only for advanced programmers'],
            correct: 0,
            explanation: `${topic} is a fundamental programming concept used to build functional code.`
          },
          {
            question: `Which best describes how ${topic} is used?`,
            options: ['As part of a larger program structure', 'Only in isolation', 'Only for testing', 'Only for debugging'],
            correct: 0,
            explanation: `${topic} integrates with other code to create working programs.`
          },
        ],
      },
      {
        title: `Worked Example: ${topic} in Action`,
        type: 'text',
        content: `Let's see **${topic}** in action with real code.\n\n**Example 1:**\n\`\`\`${language}\n${examples[0].code}\n\`\`\`\n${examples[0].explanation}\n\n**Example 2:**\n\`\`\`${language}\n${examples[1].code}\n\`\`\`\n${examples[1].explanation}\n\n**Key Pattern:** These examples show the core structure you'll use repeatedly. Notice how the syntax is consistent and the logic flows from input to output.`,
      },
      {
        title: `Guided Practice: Try ${topic}`,
        type: 'code',
        content: `Fill in the TODO to complete this ${topic} example.`,
        components: [
          {
            language,
            challenge: `Modify the ${topic} example to do something new`,
            code: examples[0].code.split('\\n').join('\n') + '\n\n# TODO: Modify this to change the output\n# TODO: Test your changes',
            expectedOutput: 'Modified code output',
            hints: [
              'Follow the pattern from the worked example',
              'Change one value or add one feature',
              'Test after each change',
            ],
            testCases: [],
          },
        ],
      },
      {
        title: `Core Concept: ${topic} Patterns`,
        type: 'text',
        content: `Now that you've seen **${topic}** in action, let's understand the pattern.\n\n**Key Principles:**\n1. **Syntax matters**: Follow the exact structure shown in examples\n2. **Logic flows**: Input → Processing → Output\n3. **Reusability**: Write once, use many times\n\n**When to use ${topic}:**\n- When you need to ${topicLower.includes('react') ? 'manage component state or side effects' : 'organize and manipulate data'}\n- When you want to ${topicLower.includes('react') ? 'make components interactive' : 'make code maintainable'}\n- When you need to ${topicLower.includes('react') ? 'respond to user actions' : 'process information dynamically'}`,
      },
      {
        title: `Retrieval Practice: ${topic} Quiz`,
        type: 'quiz',
        content: `Test your understanding of **${topic}** without scrolling back.`,
        components: [
          {
            question: `What is the main purpose of ${topic}?`,
            options: [`Solve specific programming problems`, 'Make code longer', 'Only work in certain languages', 'Only for experts'],
            correct: 0,
            explanation: `${topic} is a fundamental tool for building functional programs.`
          },
          {
            question: `Which syntax pattern does ${topic} typically follow?`,
            options: ['Consistent, language-specific structure', 'Random patterns', 'Only numbers', 'Only text'],
            correct: 0,
            explanation: `Every language has specific syntax rules for ${topic}.`
          },
        ],
      },
      {
        title: 'Common Mistakes and Corrections',
        type: 'text',
        content: `**Mistake 1: Syntax errors**\n\nWrong:\n\`\`\`${language}\n${examples[0].code.replace(/[()]/g, '')}  # Missing important characters\n\`\`\`\n\nCorrect:\n\`\`\`${language}\n${examples[0].code}\n\`\`\`\n\n**Mistake 2: Using something before it's defined**\n\nWrong:\n\`\`\`${language}\nresult = unknown_value + 5  # unknown_value doesn't exist yet\n\`\`\`\n\nCorrect:\n\`\`\`${language}\nvalue = 10\nresult = value + 5  # Define first, then use\n\`\`\`\n\n**Mistake 3: Not testing incrementally**\n\nWrong: Write 50 lines, then test\n\nCorrect: Write 5 lines, test, repeat`,
      },
      {
        title: 'Independent Challenge',
        type: 'code',
        content: `Build something with **${topic}** from scratch. Apply what you've learned.`,
        components: [
          {
            language,
            challenge: `Create a working example using ${topic}`,
            code: `# Your ${topic} challenge:\n# 1. Create a variable with a meaningful name\n# 2. Assign it a value\n# 3. Print a message using that variable\n\n`,
            expectedOutput: 'Working code that demonstrates the concept',
            hints: [
              'Start from the worked examples above',
              'Make one change at a time',
              'Test after each change',
            ],
            testCases: [],
          },
        ],
      },
      {
        title: 'Reflection and Next Steps',
        type: 'text',
        content: `**Quick Reflection:**\n1. What was the clearest example of ${topic}?\n2. What part still feels unclear?\n3. What would you build with this?\n\n**Next Resources:**\n${buildResourceLinks(topic).join('\n')}\n\n**Your Challenge:** Build a small project using ${topic} today. Even 10 lines of code will reinforce what you learned.`,
      },
    ],
  }
}

function buildTemplateFallbackLesson(topic: string, template: TemplateType, difficulty: 'beginner' | 'intermediate' | 'advanced') {
  const resourceLinks = buildResourceLinks(topic).join('\n')
  const contexts: Record<TemplateType, { hook: string; examples: string[]; mistakes: string[]; challenge: string }> = {
    language: {
      hook: `Language learning works best when you can connect vocabulary to situations you might actually encounter. For **${topic}**, think about greetings, asking for help, and responding naturally instead of memorizing isolated words.`,
      examples: ['A greeting for a new person', 'A polite way to ask for help', 'A short response that keeps the conversation moving'],
      mistakes: ['translating word-for-word from English', 'ignoring formality', 'memorizing without speaking out loud'],
      challenge: 'Hold a four-line exchange using one greeting, one question, and one closing phrase.',
    },
    finance: {
      hook: `Finance becomes clearer when every concept answers a practical question: how money moves, what creates risk, and what information actually changes decisions. **${topic}** should always tie back to trade-offs, incentives, and uncertainty.`,
      examples: ['Comparing two investment choices', 'Reading one metric in context', 'Explaining a risk in plain language'],
      mistakes: ['focusing on one metric in isolation', 'confusing price with value', 'ignoring downside scenarios'],
      challenge: 'Compare two realistic choices and explain which one fits a cautious learner better.',
    },
    math: {
      hook: `Math gets easier when every symbol is tied to a concrete action. For **${topic}**, the goal is to name what each quantity means, walk one step at a time, and check whether the answer makes sense before moving on.`,
      examples: ['A numeric worked example', 'A visual interpretation of the idea', 'A quick estimation check'],
      mistakes: ['skipping units', 'jumping steps mentally', 'using a rule without checking when it applies'],
      challenge: 'Solve one fresh problem and explain each step in a full sentence.',
    },
    science: {
      hook: `Science becomes memorable when you alternate between prediction, observation, and explanation. For **${topic}**, ask what you expect to happen, what evidence would confirm it, and what mechanism explains the result.`,
      examples: ['A prediction before the result', 'A real-world observation', 'A mechanism that explains the pattern'],
      mistakes: ['memorizing terms without mechanisms', 'treating one example as a law', 'confusing correlation with cause'],
      challenge: 'Describe a simple experiment or observation and explain what result would support the core idea.',
    },
    history: {
      hook: `History is easier to retain when you track people, pressures, and consequences rather than isolated dates. For **${topic}**, ask who had power, what constraint they faced, and what changed next.`,
      examples: ['One turning point', 'One actor with a clear motive', 'One consequence that lasted beyond the event itself'],
      mistakes: ['treating events as inevitable', 'memorizing dates without causality', 'ignoring ordinary people affected by the event'],
      challenge: 'Summarize one turning point and explain why a different choice might have changed the outcome.',
    },
    general: {
      hook: `A strong lesson on **${topic}** starts with familiar examples, then extracts the pattern underneath them, then asks you to use that pattern in a slightly new situation. That sequence is what turns information into usable understanding.`,
      examples: ['A daily-life example', 'A slightly more technical example', 'A comparison that highlights the key difference'],
      mistakes: ['memorizing definitions alone', 'moving on before checking understanding', 'failing to explain why an answer makes sense'],
      challenge: 'Teach the idea back in simple language, then apply it to one new example.',
    },
    coding: {
      hook: '',
      examples: [],
      mistakes: [],
      challenge: '',
    },
  }

  const context = contexts[template]

  return {
    topic,
    template,
    objective: `Build working understanding of ${topic} through examples, retrieval, and reflection`,
    duration: difficulty === 'beginner' ? '40 min' : difficulty === 'advanced' ? '30 min' : '35 min',
    sections: [
      {
        title: 'Pre-Test and Hook',
        type: 'quiz',
        content: context.hook,
        components: [
          {
            question: `Which statement best matches the core goal of learning ${topic}?`,
            options: ['Recognize patterns and use them in context', 'Memorize isolated facts only', 'Avoid examples', 'Skip reflection'],
            correct: 0,
            explanation: 'Useful learning comes from recognizing the pattern and applying it, not just repeating isolated facts.'
          },
          {
            question: `What should you do when something in ${topic} feels abstract?`,
            options: ['Anchor it to a concrete example', 'Ignore it and keep going', 'Memorize the wording only', 'Assume it will make sense later without practice'],
            correct: 0,
            explanation: 'Concrete examples reduce cognitive load and make later abstraction much easier to understand.'
          },
        ],
      },
      {
        title: 'Core Concept 1',
        type: 'text',
        content: `Start with three concrete anchors for **${topic}**:\n- ${context.examples[0]}\n- ${context.examples[1]}\n- ${context.examples[2]}\n\nThese examples matter because they give the concept boundaries. Instead of asking “what is the perfect definition?”, ask “what stays true across all three examples?” That question exposes the underlying rule. Once you can explain the common structure in simple language, you are already moving from recognition to mastery.\n\nThe practical rule for this section is: describe the example first, then name the pattern, then explain why the pattern matters.`,
      },
      {
        title: 'Guided Practice',
        type: template === 'language' ? 'flashcard' : 'quiz',
        content: `Practice with high support before you try anything independent.`,
        components: template === 'language'
          ? [
              { front: `Key phrase or idea in ${topic}`, back: 'State it in plain language and say when you would use it.' },
              { front: 'Formal vs informal usage', back: 'Choose the version that matches the situation, not just the literal translation.' },
              { front: 'Memory check', back: 'Say it aloud, then use it in one tiny example.' },
            ]
          : [
              {
                question: `Which of these is the most useful first step when practicing ${topic}?`,
                options: ['Start from a worked example and explain it', 'Jump straight to the hardest problem', 'Avoid checking your reasoning', 'Skip concrete examples'],
                correct: 0,
                explanation: 'A worked example gives you the structure needed to attempt the next task with confidence.'
              },
            ],
      },
      {
        title: 'Core Concept 2',
        type: 'text',
        content: `Build on the first idea by asking a deeper question: what changes when the context changes? In ${topic}, the same surface fact can behave differently depending on the audience, constraints, data, or historical setting.\n\nA good learner move here is to compare two cases side by side. What stays the same? What changes? Which difference actually matters? That habit produces durable understanding because it forces you to distinguish core structure from surface detail.\n\nIf you can explain one “same”, one “different”, and one “why it matters”, you are doing higher-quality learning than simple memorization.`,
      },
      {
        title: 'Retrieval Practice',
        type: 'quiz',
        content: `Now retrieve the key ideas without leaning on the earlier explanations.`,
        components: [
          {
            question: `What is the main value of comparing multiple examples in ${topic}?`,
            options: ['It helps reveal the underlying pattern', 'It removes the need for reflection', 'It guarantees instant mastery', 'It makes mistakes impossible'],
            correct: 0,
            explanation: 'Comparisons help you see structure, not just isolated facts.'
          },
          {
            question: `Which learning move is strongest after finishing one section?`,
            options: ['Summarize the idea in your own words', 'Immediately forget the example', 'Skip all review', 'Assume recognition means mastery'],
            correct: 0,
            explanation: 'Self-explanation is one of the fastest ways to test whether understanding is real.'
          },
          {
            question: `Why do common mistakes matter in a lesson?`,
            options: ['They show where the mental model can fail', 'They should always be ignored', 'They prove the topic is impossible', 'They are only useful for experts'],
            correct: 0,
            explanation: 'Seeing mistakes clearly helps you correct the mental model before it hardens.'
          },
        ],
      },
      {
        title: 'Common Mistakes',
        type: 'text',
        content: `Three predictable mistakes in **${topic}** are:\n- ${context.mistakes[0]}\n- ${context.mistakes[1]}\n- ${context.mistakes[2]}\n\nFor each one, ask what assumption created the mistake. That is the useful part. Surface errors disappear once the underlying assumption is corrected.\n\nA strong correction loop looks like this:\n1. Name the mistaken assumption.\n2. Replace it with the more accurate rule.\n3. Test the new rule on a fresh example.\n\nThat third step matters most because it proves the correction actually transfers.`,
      },
      {
        title: 'Independent Challenge',
        type: 'reflection',
        content: `${context.challenge}\n\nWhen you answer, force yourself to include:\n- one concrete example\n- one explanation of why it works\n- one note about what might go wrong\n\nThat combination gives you evidence that the knowledge is becoming usable rather than staying passive.`,
      },
      {
        title: 'Reflection and Next Steps',
        type: 'text',
        content: `Before you finish, answer these briefly:\n1. What was the clearest example in this lesson, and why?\n2. What part still feels fuzzy?\n3. What would a strong learner do next to remove that fuzziness?\n\nResources:\n${resourceLinks}\n\nYour next challenge: revisit ${topic} tomorrow and explain it again from memory before reopening the lesson. If your explanation is thinner than today, that is normal. Use that gap to decide what needs another round of practice.`,
      },
    ],
  }
}

function generateFallbackLesson(topic: string, template: TemplateType, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): any {
  if (template === 'coding') {
    return buildCodingFallbackLesson(topic, difficulty)
  }

  return buildTemplateFallbackLesson(topic, template, difficulty)
}

function normalizeLesson(lessonPlan: any, template: TemplateType, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): any {
  return {
    id: generateId(),
    topic: lessonPlan.topic || 'Untitled Lesson',
    template: lessonPlan.template || template,
    objective: lessonPlan.objective || 'Master this topic',
    duration: lessonPlan.duration || '25 min',
    difficulty,
    sections: lessonPlan.sections?.map((s: any) => ({
      id: generateId(),
      title: s.title || 'Section',
      type: s.type || 'text',
      content: s.content || '',
      completed: false,
      components: normalizeComponents(s),
    })) || [],
    createdAt: new Date().toISOString(),
    progress: 0,
    completedSections: [],
  }
}

function getDefaultCode(language: string): string {
  const defaults: Record<string, string> = {
    python: '# Write your Python code here\n',
    javascript: '// Write your JavaScript code here\n',
    java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n',
    cpp: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
    c: '// Write your C code here\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n',
    sql: '-- Write your SQL query here\nSELECT * FROM table_name;\n',
    html: '<!-- Write your HTML here -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Page</title>\n</head>\n<body>\n    \n</body>\n</html>\n',
    css: '/* Write your CSS here */\n.selector {\n    property: value;\n}\n',
  }
  return defaults[language] || '// Write your code here\n'
}

function detectLanguageFromCode(code: string): string | null {
  if (!code) return null
  const lower = code.toLowerCase()
  if (lower.includes('print(') && !lower.includes('console.log') && !lower.includes('system.out')) return 'python'
  if (lower.includes('console.log') || lower.includes('function') || lower.includes('const ') || lower.includes('let ') || lower.includes('=>')) return 'javascript'
  if (lower.includes('public static void main') || lower.includes('system.out')) return 'java'
  if (lower.includes('#include') && (lower.includes('std::') || lower.includes('cout') || lower.includes('cin'))) return 'cpp'
  if (lower.includes('#include') && lower.includes('printf')) return 'c'
  if (lower.includes('select') && lower.includes('from')) return 'sql'
  if (lower.includes('<div') || lower.includes('<html') || lower.includes('<!doctype')) return 'html'
  if (lower.includes('{') && lower.includes(':') && lower.includes('}') && !lower.includes('function')) return 'css'
  return null
}

function normalizeComponents(section: any): any[] {
  if (!section.components) return []
  
  if (section.type === 'code') {
    return section.components.map((c: any) => ({
      code: c.code || c.starterCode || c.initialCode || getDefaultCode(c.language || 'python'),
      challenge: c.challenge || c.description || c.task || 'Complete this code',
      expectedOutput: c.expectedOutput || c.output || '',
      hints: c.hints || (c.hint ? [c.hint] : []),
      testCases: c.testCases || [],
      language: detectLanguageFromCode(c.code || c.starterCode || '') || c.language || 'python',
    }))
  }
  
  if (section.type === 'quiz') {
    return section.components.map((q: any) => ({
      question: q.question || q.prompt || 'Question',
      options: q.options && q.options.length >= 2 ? q.options : ['Yes', 'No', 'Maybe', 'Not sure'],
      correct: typeof q.correct === 'number' ? q.correct : 0,
      explanation: q.explanation || q.feedback || 'Review the lesson content.',
    }))
  }
  
  if (section.type === 'flashcard') {
    return section.components.map((f: any) => ({
      front: f.front || f.question || f.term || 'Term',
      back: f.back || f.answer || f.definition || f.explanation || 'Definition',
    }))
  }
  
  return section.components
}
