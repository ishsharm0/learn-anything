// ─── Template Types ───────────────────────────────────────
export type TemplateType = 'language' | 'coding' | 'finance' | 'math' | 'science' | 'history' | 'general'
export type SectionType = 'text' | 'quiz' | 'flashcard' | 'code' | 'reflection' | 'interactive'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

// ─── Lesson ───────────────────────────────────────────────
export interface Lesson {
  id: string
  topic: string
  template: TemplateType
  objective: string
  duration?: string
  difficulty?: Difficulty
  sections: Section[]
  createdAt: string
  progress: number
  completedSections: string[]
}

export interface Section {
  id: string
  title: string
  type: SectionType
  content: string
  components?: QuizQuestion[] | FlashcardData[] | CodeChallenge[]
  completed: boolean
}

// ─── Quiz ─────────────────────────────────────────────────
export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation?: string
}

// ─── Flashcard ────────────────────────────────────────────
export interface FlashcardData {
  front: string
  back: string
}

// ─── Code Challenge ───────────────────────────────────────
export interface CodeChallenge {
  code: string
  challenge: string
  expectedOutput?: string
  hints?: string[]
  testCases?: TestCase[]
  language?: string
}

export interface TestCase {
  input: string
  output: string
}

// ─── User Performance (for adaptive difficulty) ──────────
export interface UserPerformance {
  preTestScore?: number
  quizScores?: number[]
  timeSpent?: number
  attempts?: number
  difficulty?: Difficulty
  previousTopics?: string[]
}
