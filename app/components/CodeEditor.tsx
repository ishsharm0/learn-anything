'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Lightbulb, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import type { CodeChallenge } from '@/lib/types'

interface Props {
  challenge: CodeChallenge
}

export function CodeEditor({ challenge }: Props) {
  const [code, setCode] = useState(challenge.code || defaultCode(challenge.language))
  const [output, setOutput] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setOutput(null)
    try {
      const res = await fetch('/api/code-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          language: challenge.language || 'javascript',
          challenge: challenge.challenge 
        }),
      })
      const data = await res.json()
      if (data.success) {
        setOutput(data.output || 'No output')
      } else {
        setOutput(`Error: ${data.error || 'Failed to execute code'}\n\n${data.explanation || ''}`)
      }
    } catch (err: any) {
      setOutput(`Error running code: ${err.message}`)
    } finally {
      setIsRunning(false)
    }
  }, [code, challenge.language, challenge.challenge])

  const handleReset = useCallback(() => {
    setCode(challenge.code || defaultCode(challenge.language))
    setOutput(null)
  }, [challenge.code, challenge.language])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [code])

  const handleTab = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.currentTarget
      const start = target.selectionStart
      const end = target.selectionEnd
      const newCode = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newCode)
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2
      })
    }
  }, [code])

  return (
    <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Challenge description */}
      {challenge.challenge && (
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <p className="text-sm font-medium">{challenge.challenge}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {challenge.language || 'JavaScript'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative font-mono text-sm overflow-x-auto">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 bg-muted/30 border-r border-border select-none pointer-events-none z-10">
          <div className="pt-4 px-1 text-right">
            {code.split('\n').map((_, i) => (
              <div key={i} className="leading-6 text-xs text-muted-foreground/50">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleTab}
          spellCheck={false}
          className="w-full bg-transparent pl-12 sm:pl-14 pr-4 py-4 focus:outline-none resize-none min-h-[200px] sm:min-h-[240px] leading-6 text-foreground font-mono text-xs sm:text-sm"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success/90 disabled:opacity-50 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          {isRunning ? 'Running...' : 'Run'}
        </button>

        {challenge.hints && challenge.hints.length > 0 && (
          <button
            onClick={() => setShowHints(h => !h)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Hint
            {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Hints */}
      <AnimatePresence>
        {showHints && challenge.hints && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-5 py-3 bg-warning/5">
              <p className="text-sm">
                <Lightbulb className="w-4 h-4 inline mr-1.5 text-warning" />
                {challenge.hints[hintIndex]}
              </p>
              {challenge.hints.length > 1 && (
                <button
                  onClick={() => setHintIndex(i => Math.min(i + 1, challenge.hints!.length - 1))}
                  disabled={hintIndex >= challenge.hints.length - 1}
                  className="mt-2 text-xs text-primary hover:underline disabled:opacity-40"
                >
                  Show next hint ({hintIndex + 1}/{challenge.hints.length})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output */}
      <AnimatePresence>
        {output !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-5 py-3 bg-muted/30">
              <span className="text-xs text-muted-foreground font-medium block mb-1.5">Output</span>
              <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">{output}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function defaultCode(language?: string): string {
  switch (language?.toLowerCase()) {
    case 'python':
      return '# Write your code here\nprint("Hello, World!")\n'
    case 'javascript':
    default:
      return '// Write your code here\nconsole.log("Hello, World!");\n'
  }
}
