'use client'

import { motion } from 'framer-motion'
import { Sparkles, BookOpen, Brain, Code, Lightbulb, Target, Zap } from 'lucide-react'

const steps = [
  { icon: Brain, label: 'Analyzing your level', delay: 0 },
  { icon: Target, label: 'Designing lesson structure', delay: 1.2 },
  { icon: Code, label: 'Building interactive exercises', delay: 2.4 },
  { icon: Lightbulb, label: 'Creating quizzes & flashcards', delay: 3.6 },
  { icon: Zap, label: 'Finalizing your lesson', delay: 4.8 },
]

export function LessonSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        {/* Animated icon */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>

        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Creating your lesson</h2>
        <p className="text-sm text-muted-foreground mb-8">This usually takes 5–10 seconds</p>

        {/* Progress steps */}
        <div className="space-y-3 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm">{step.label}</span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: step.delay }}
                className="ml-auto text-xs text-muted-foreground"
              >
                •••
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Skeleton cards preview */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2 p-3 rounded-lg border border-border bg-card">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
