'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, X, Sparkles, ArrowRight } from 'lucide-react'

interface Props {
  lessonId: string
  currentSection: number
  onSteer: (prompt: string) => Promise<void>
}

export function SteerPanel({ lessonId, currentSection, onSteer }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isSteering, setIsSteering] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isSteering) return
    
    setIsSteering(true)
    try {
      await onSteer(prompt.trim())
      setPrompt('')
      setIsOpen(false)
    } catch (err) {
      console.error('Steer failed:', err)
    } finally {
      setIsSteering(false)
    }
  }, [prompt, isSteering, onSteer])

  const suggestions = [
    "Make this more beginner-friendly",
    "Add more code examples",
    "Skip to advanced topics",
    "Focus on practical applications",
    "Include more quizzes",
    "Explain like I'm 5",
  ]

  return (
    <>
      {/* Steer Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        aria-label="Customize lesson"
      >
        <Wand2 className="w-5 h-5" />
        <span className="hidden sm:inline">Customize</span>
      </button>

      {/* Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Customize Lesson</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Current Section Info */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Currently on section</p>
                  <p className="text-sm font-medium text-foreground">Section {currentSection + 1}</p>
                </div>

                {/* Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What would you like to change?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Add more examples about X', 'Make this simpler', 'Focus on Y'..."
                    className="w-full min-h-[100px] p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Quick Suggestions */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Or try:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setPrompt(suggestion)}
                        className="px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isSteering}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isSteering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Regenerate Lesson
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Info */}
                <p className="text-xs text-muted-foreground text-center">
                  This will regenerate the lesson based on your request while maintaining quality standards.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
