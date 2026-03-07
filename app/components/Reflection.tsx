'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Send, CheckCircle } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'

interface Props {
  content: string
  onComplete: () => void
}

export function Reflection({ content, onComplete }: Props) {
  const [rating, setRating] = useState<number | null>(null)
  const [challenge, setChallenge] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = useCallback(() => {
    if (rating && challenge.trim()) {
      setSubmitted(true)
      setTimeout(() => {
        onComplete()
      }, 1500)
    }
  }, [rating, challenge, onComplete])

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-success bg-success/10 p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-success mb-2">Reflection Saved!</h3>
        <p className="text-muted-foreground text-sm">Great job completing this lesson!</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {content && <MarkdownRenderer content={content} />}

      {/* Confidence Rating */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4 text-foreground">How confident do you feel about this topic?</h3>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  rating && star <= rating
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        {rating && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            {rating === 1 && "Keep practicing - you'll get there!"}
            {rating === 2 && "Making progress! Review the material again."}
            {rating === 3 && "Good understanding! A bit more practice will help."}
            {rating === 4 && "Great job! You've got a solid grasp."}
            {rating === 5 && "Excellent! You're ready to apply this knowledge."}
          </p>
        )}
      </div>

      {/* Next Challenge Input */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4 text-foreground">What is your next challenge?</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Describe what you want to build or learn next using this knowledge
        </p>
        <textarea
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          placeholder="I want to build a... I want to understand how to..."
          className="w-full min-h-[120px] p-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!rating || !challenge.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          Save & Complete Lesson
        </button>
      </div>
    </div>
  )
}
