'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles, Brain, Target, Zap, CheckCircle } from 'lucide-react'
import type { Lesson, UserPerformance } from '@/lib/types'
import { InteractiveLesson } from './components/InteractiveLesson'
import { LessonSkeleton } from './components/LessonSkeleton'
import { ThemeToggle } from './components/ThemeToggle'
import { ToastProvider, toast } from './components/Toast'

const EXAMPLE_TOPICS = [
  { emoji: '\u{1F40D}', label: 'Python', topic: 'Python programming fundamentals' },
  { emoji: '\u{1F1EA}\u{1F1F8}', label: 'Spanish', topic: 'Spanish for travel' },
  { emoji: '\u{1F4C8}', label: 'Finance', topic: 'Stock market analysis' },
  { emoji: '\u{1F4D0}', label: 'Calculus', topic: 'Calculus fundamentals' },
  { emoji: '\u{2694}\u{FE0F}', label: 'History', topic: 'World War II' },
  { emoji: '\u{1F916}', label: 'AI/ML', topic: 'Machine learning basics' },
  { emoji: '\u{1F310}', label: 'Web Dev', topic: 'React and modern web development' },
  { emoji: '\u{1F4CA}', label: 'Data', topic: 'Data science with Python' },
  { emoji: '\u{1F512}', label: 'Security', topic: 'Cybersecurity fundamentals' },
  { emoji: '\u{1F4B0}', label: 'Crypto', topic: 'Blockchain and cryptocurrency' },
  { emoji: '\u{1F3A8}', label: 'Design', topic: 'UI/UX design principles' },
  { emoji: '\u{1F4AA}', label: 'Fitness', topic: 'Personal training basics' },
  { emoji: '\u{1F373}', label: 'Cooking', topic: 'Essential cooking techniques' },
  { emoji: '\u{1F3B8}', label: 'Music', topic: 'Guitar for beginners' },
  { emoji: '\u{1F680}', label: 'Startup', topic: 'How to start a business' },
  { emoji: '\u{1F4DD}', label: 'Writing', topic: 'Creative writing skills' },
]

const FEATURES = [
  { icon: Brain,       title: 'Adaptive',      desc: 'Adjusts to your level in real-time' },
  { icon: Target,      title: 'Goal-Oriented',  desc: 'Clear objectives & progress tracking' },
  { icon: Zap,         title: 'Interactive',    desc: 'Quizzes, code challenges & flashcards' },
  { icon: CheckCircle, title: 'Mastery-Based',  desc: 'Practice until you truly understand' },
]

const DEPTH_OPTIONS = [
  { value: '5min', label: 'Quick', desc: '5 min - Overview' },
  { value: '10min', label: 'Short', desc: '10 min - Basics' },
  { value: '20min', label: 'Standard', desc: '20 min - Full' },
  { value: '30min', label: 'Deep', desc: '30 min - Mastery' },
  { value: '45min', label: 'Expert', desc: '45 min - Complete' },
]

export default function Home() {
  const [input, setInput] = useState('')
  const [depth, setDepth] = useState('20min')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [userPerformance, setUserPerformance] = useState<UserPerformance | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const topic = input.trim()
    if (!topic || isGenerating) return

    console.log('[Home] Submitting lesson request:', { topic, depth })
    setIsGenerating(true)

    try {
      const res = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          performance: userPerformance,
          depth: depth,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.lesson) {
        throw new Error(data.error || 'Failed to generate lesson')
      }

      setCurrentLesson(data.lesson)
    } catch (err: any) {
      toast(err.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTopicClick = (topic: string) => {
    setInput(topic)
    inputRef.current?.focus()
  }

  const handleBack = () => {
    setCurrentLesson(null)
    setInput('')
  }

  if (isGenerating) {
    return (
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-background">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-base">Learn Anything</span>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Loading State */}
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Generating your lesson...</h2>
              <p className="text-muted-foreground text-sm mb-6">Analyzing topic, creating examples, and building interactive challenges</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span>Searching expert sources</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100"></div>
                  <span>Creating examples & explanations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-200"></div>
                  <span>Building interactive challenges</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ToastProvider>
    )
  }

  if (currentLesson) {
    return <ToastProvider><InteractiveLesson lesson={currentLesson} onBack={handleBack} /></ToastProvider>
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-base">Learn Anything</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-2xl mx-auto w-full"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Learning
            </div>

            <h1 className="mb-4">
              <span className="gradient-text">Master any skill</span>
              <br />
              <span className="text-foreground">with personalized lessons</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto">
              Type a topic, get an interactive lesson with quizzes, flashcards, and code challenges &mdash; tailored to you.
            </p>

            {/* Input */}
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-blue-500/40 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex gap-2 bg-card border border-border rounded-xl p-1.5 shadow-sm">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="What do you want to learn?"
                    className="flex-1 bg-transparent px-3 py-2.5 text-base focus:outline-none placeholder:text-muted-foreground min-w-0"
                    aria-label="Learning topic"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    Start
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Depth Slider */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lesson Length</span>
                <span className="text-xs text-primary font-medium">{DEPTH_OPTIONS.find(d => d.value === depth)?.desc}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={DEPTH_OPTIONS.findIndex(d => d.value === depth)}
                  onChange={(e) => setDepth(DEPTH_OPTIONS[parseInt(e.target.value)].value)}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  aria-label="Lesson duration"
                />
                <div className="flex justify-between mt-2">
                  {DEPTH_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.value}
                      onClick={() => setDepth(opt.value)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        depth === opt.value 
                          ? 'bg-primary text-primary-foreground font-medium' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick topics carousel with auto-scroll */}
            <div className="w-full max-w-xl relative group">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity opacity-60 group-hover:opacity-80" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity opacity-60 group-hover:opacity-80" />
              
              {/* Scrolling carousel */}
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 py-2 scroll-smooth">
                <div className="flex gap-2 w-max animate-carousel-scroll">
                  {EXAMPLE_TOPICS.map(t => (
                    <button
                      key={t.label}
                      onClick={() => handleTopicClick(t.topic)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all hover:scale-105 active:scale-95 text-sm whitespace-nowrap flex-shrink-0"
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-16 w-full"
          >
            {FEATURES.map(f => (
              <div key={f.title} className="p-4 rounded-xl border border-border bg-card/60 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learn Anything</span>
            </div>
            <span>Built with AI</span>
          </div>
        </footer>
      </div>
    </ToastProvider>
  )
}
