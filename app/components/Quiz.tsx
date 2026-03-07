'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronRight, RotateCcw } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'
import { MarkdownRenderer } from './MarkdownRenderer'

interface Props {
  questions: QuizQuestion[]
  onComplete?: () => void
}

export function Quiz({ questions, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[currentIdx]
  const correctIdx = q?.correct ?? -1

  const handleSelect = useCallback(
    (idx: number) => {
      if (showResult) return
      setSelected(idx)
    },
    [showResult],
  )

  const handleCheck = useCallback(() => {
    if (selected === null) return
    if (selected === correctIdx) setScore(s => s + 1)
    setShowResult(true)
  }, [selected, correctIdx])

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      setFinished(true)
      onComplete?.()
    }
  }, [currentIdx, questions.length, onComplete])

  const handleRetry = useCallback(() => {
    setCurrentIdx(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
  }, [])

  // Keyboard shortcuts for quiz
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResult) return
      
      const key = e.key.toLowerCase()
      if (key >= '1' && key <= '4') {
        const idx = parseInt(key) - 1
        if (idx < q.options.length) {
          handleSelect(idx)
        }
      }
      if (key === 'enter' && selected !== null) {
        handleCheck()
      }
      if (key === ' ' || key === 'arrowright') {
        e.preventDefault()
        if (showResult) handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showResult, selected, q.options.length, handleSelect, handleCheck, handleNext])

  if (!q) return null

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 text-center mt-6"
      >
        <div className="text-4xl font-bold mb-1">{pct}%</div>
        <p className="text-muted-foreground text-sm mb-4">
          {score} / {questions.length} correct
        </p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
      </motion.div>
    )
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Progress */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {currentIdx + 1} of {questions.length}
        </span>
        <span>{score} correct</span>
      </div>

      <div className="px-5 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="mb-4">
              <MarkdownRenderer content={q.question} />
            </div>

            <div className="grid gap-2">
              {q.options.map((opt, i) => {
                const isCorrect = showResult && i === correctIdx
                const isWrong = showResult && i === selected && i !== correctIdx
                const isChosen = selected === i

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={showResult}
                    className={`
                      relative flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg border text-sm transition-all
                      ${isCorrect
                        ? 'border-success bg-success/10 text-success dark:text-green-300'
                        : isWrong
                          ? 'border-destructive bg-destructive/10 text-destructive dark:text-red-300'
                          : isChosen
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                      }
                      ${showResult ? 'cursor-default' : 'cursor-pointer'}
                    `}
                    aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-medium">
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : isWrong ? <X className="w-3.5 h-3.5" /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1"><MarkdownRenderer content={opt} /></span>
                    {isChosen && !showResult && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">{i + 1}</span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showResult && q.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground overflow-hidden"
                >
                  <MarkdownRenderer content={q.explanation} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end mt-4">
              {!showResult ? (
                <button
                  onClick={handleCheck}
                  disabled={selected === null}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Check
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {currentIdx === questions.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
