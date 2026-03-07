'use client'

import { CheckCircle, Circle } from 'lucide-react'
import type { Section } from '@/lib/types'

interface Props {
  sections: Section[]
  currentIndex: number
  completed: Set<string>
  onSelect: (index: number) => void
}

const TYPE_LABELS: Record<string, string> = {
  text: 'Reading',
  quiz: 'Quiz',
  flashcard: 'Flashcards',
  code: 'Code',
  reflection: 'Reflection',
  interactive: 'Interactive',
}

export function LessonSidebar({ sections, currentIndex, completed, onSelect }: Props) {
  return (
    <nav className="py-3 px-3" aria-label="Lesson sections">
      <ul className="space-y-0.5">
        {sections.map((section, idx) => {
          const isCurrent = idx === currentIndex
          const isDone = completed.has(section.id)

          return (
            <li key={section.id}>
              <button
                onClick={() => onSelect(idx)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors
                  ${isCurrent
                    ? 'bg-primary/10 text-primary font-medium'
                    : isDone
                      ? 'text-muted-foreground hover:bg-muted/50'
                      : 'text-foreground hover:bg-muted/50'
                  }
                `}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <Circle className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground/40'}`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate">{section.title}</p>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {TYPE_LABELS[section.type] || section.type}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
