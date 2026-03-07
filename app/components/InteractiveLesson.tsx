'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Menu,
  X,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Trophy,
  Star,
  RotateCcw,
} from 'lucide-react'
import type { Lesson, Section } from '@/lib/types'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Quiz } from './Quiz'
import { Flashcard } from './Flashcard'
import { CodeEditor } from './CodeEditor'
import { Reflection } from './Reflection'
import { SteerPanel } from './SteerPanel'
import { LessonSidebar } from './LessonSidebar'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  lesson: Lesson
  onBack: () => void
}

export function InteractiveLesson({ lesson, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [showSidebar, setShowSidebar] = useState(false)
  const [sectionUnderstood, setSectionUnderstood] = useState<Set<string>>(new Set())

  const section = lesson.sections[currentIndex]
  const progress = Math.round((completed.size / lesson.sections.length) * 100)
  const isComplete = completed.size === lesson.sections.length

  const markDone = useCallback(
    (id: string) => {
      setCompleted(prev => new Set(prev).add(id))
      setSectionUnderstood(prev => new Set(prev).add(id))
    },
    [],
  )

  const markUnderstood = useCallback(
    (id: string) => {
      setSectionUnderstood(prev => new Set(prev).add(id))
    },
    [],
  )

  const goTo = useCallback(
    (idx: number) => {
      setCurrentIndex(idx)
      setShowSidebar(false)
    },
    [],
  )

  const handleNext = useCallback(() => {
    markDone(section.id)
    if (currentIndex < lesson.sections.length - 1) {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, lesson.sections.length, section.id, markDone])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1)
  }, [currentIndex])

  // Steer functionality - regenerate lesson with modifications
  const handleSteer = useCallback(async (prompt: string) => {
    try {
      const res = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: lesson.topic,
          steerPrompt: prompt,
          depth: '20min', // Keep same depth
        }),
      })
      const data = await res.json()
      if (data.lesson) {
        // Replace current lesson with steered version
        window.location.reload() // Simple approach - reload with new params
      }
    } catch (err) {
      console.error('Steer failed:', err)
      throw err
    }
  }, [lesson.topic])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key.toLowerCase()) {
        case 'j':
        case 'arrowdown':
          if (currentIndex < lesson.sections.length - 1) {
            handleNext()
          }
          break
        case 'k':
        case 'arrowup':
          if (currentIndex > 0) {
            handlePrev()
          }
          break
        case 'enter':
          if (section.type === 'text' && !sectionUnderstood.has(section.id)) {
            markUnderstood(section.id)
          }
          break
        case '1':
        case '2':
        case '3':
        case '4':
          // Handle quiz option selection (will be implemented in Quiz component)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, lesson.sections.length, section, sectionUnderstood, handleNext, handlePrev, markUnderstood])

  if (isComplete) {
    return <CompletionScreen lesson={lesson} completed={completed} onBack={onBack} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">{lesson.topic}</h1>
              <p className="text-xs text-muted-foreground">
                {currentIndex + 1} / {lesson.sections.length} &middot; {progress}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-border">
          <div className="h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
            <LessonSidebar
              sections={lesson.sections}
              currentIndex={currentIndex}
              completed={completed}
              onSelect={goTo}
            />
          </div>
        </aside>

        {/* Sidebar — mobile overlay */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setShowSidebar(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background border-l border-border z-50 overflow-y-auto lg:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-semibold text-sm">Sections</span>
                  <button onClick={() => setShowSidebar(false)} className="p-1 rounded-lg hover:bg-muted" aria-label="Close sidebar">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <LessonSidebar
                  sections={lesson.sections}
                  currentIndex={currentIndex}
                  completed={completed}
                  onSelect={goTo}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 w-full"
            >
              <SectionContent section={section} onComplete={() => markDone(section.id)} />

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Previous
                </button>
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {currentIndex === lesson.sections.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Steer Panel - allows lesson customization */}
      <SteerPanel 
        lessonId={lesson.id} 
        currentSection={currentIndex} 
        onSteer={handleSteer} 
      />
    </div>
  )
}

/* ─── Section Renderer ──────────────────────────────── */

function SectionContent({ section, onComplete }: { section: Section; onComplete: () => void }) {
  // Add section title header for better UX
  const Title = () => (
    <h2 className="text-xl font-bold mb-4 text-foreground">{section.title}</h2>
  )

  switch (section.type) {
    case 'quiz':
      return (
        <div className="space-y-4">
          <Title />
          {section.content && <MarkdownRenderer content={section.content} />}
          {section.components?.length ? (
            <Quiz questions={section.components as any} onComplete={onComplete} />
          ) : (
            <p className="text-muted-foreground text-sm">No quiz questions available</p>
          )}
        </div>
      )
    case 'flashcard':
      return (
        <div className="space-y-4">
          <Title />
          {section.content && <MarkdownRenderer content={section.content} />}
          {section.components?.length ? (
            <Flashcard cards={section.components as any} />
          ) : (
            <p className="text-muted-foreground text-sm">No flashcards available</p>
          )}
        </div>
      )
    case 'code':
      return (
        <div className="space-y-4">
          <Title />
          {section.content && <MarkdownRenderer content={section.content} />}
          {section.components?.length ? (
            <CodeEditor challenge={section.components[0] as any} />
          ) : (
            <p className="text-muted-foreground text-sm">No code challenge available</p>
          )}
        </div>
      )
    case 'text':
      return (
        <div className="space-y-4">
          <Title />
          {section.content ? (
            <MarkdownRenderer content={section.content} />
          ) : (
            <p className="text-muted-foreground text-sm">No content available for this section</p>
          )}
          <div className="pt-4 border-t border-border">
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg text-sm font-medium hover:bg-success/20 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Got it! Continue
            </button>
          </div>
        </div>
      )
    case 'reflection':
      return (
        <div className="space-y-4">
          <Title />
          <Reflection content={section.content} onComplete={onComplete} />
        </div>
      )
    case 'interactive':
    default:
      return (
        <div className="space-y-4">
          <Title />
          {section.content ? (
            <MarkdownRenderer content={section.content} />
          ) : (
            <p className="text-muted-foreground text-sm">No content available for this section</p>
          )}
        </div>
      )
  }
}

/* ─── Completion Screen ─────────────────────────────── */

function CompletionScreen({
  lesson,
  completed,
  onBack,
}: {
  lesson: Lesson
  completed: Set<string>
  onBack: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-success" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
        <p className="text-muted-foreground mb-8">
          You finished all {lesson.sections.length} sections of <strong>{lesson.topic}</strong>.
        </p>

        <div className="flex items-center justify-center gap-1 mb-8">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-warning fill-warning" />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Learn Something New
          </button>
        </div>
      </motion.div>
    </div>
  )
}
