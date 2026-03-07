'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import type { FlashcardData } from '@/lib/types'

interface Props {
  cards: FlashcardData[]
}

export function Flashcard({ cards }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = cards[index]

  const flip = useCallback(() => setFlipped(f => !f), [])
  const prev = useCallback(() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false) }, [])
  const next = useCallback(() => { setIndex(i => Math.min(cards.length - 1, i + 1)); setFlipped(false) }, [cards.length])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip() }
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    },
    [flip, prev, next],
  )

  if (!card) return null

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>Card {index + 1} of {cards.length}</span>
        <button onClick={flip} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Flip
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Showing answer. Click to see question.' : 'Showing question. Click to see answer.'}
        onClick={flip}
        onKeyDown={handleKeyDown}
        className="relative w-full min-h-[200px] cursor-pointer perspective-1000 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full min-h-[200px]"
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-xl border border-border bg-card backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <span className="text-xs text-muted-foreground mb-2 block">Question</span>
              <p className="text-base sm:text-lg font-medium">{card.front}</p>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-xl border border-primary/30 bg-primary/5 backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center">
              <span className="text-xs text-muted-foreground mb-2 block">Answer</span>
              <p className="text-base sm:text-lg font-medium">{card.back}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setFlipped(false) }}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
