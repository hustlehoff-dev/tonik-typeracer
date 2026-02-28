'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  finished?: boolean;
  hasError?: boolean;
}

export function TypingInput({
  value,
  onChange,
  disabled = false,
  finished = false,
  hasError = false,
}: TypingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && !finished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, finished]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || finished}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={finished ? 'Round complete!' : 'Start typing…'}
        aria-label="Type the sentence here"
        // Prevent paste — fairness rule
        onPaste={(e) => e.preventDefault()}
        // Prevent drag-and-drop text insertion
        onDrop={(e) => e.preventDefault()}
        className={cn(
          'w-full rounded-lg border px-4 py-3 font-mono text-lg text-zinc-100 bg-zinc-900 shadow-sm transition-colors placeholder:text-zinc-600 focus:outline-none focus:ring-2',
          hasError
            ? 'border-red-500 focus:ring-red-500/50'
            : 'border-zinc-600 focus:ring-violet-500/50',
          finished && 'border-green-600 bg-green-950/30 text-green-300',
          (disabled || finished) && 'cursor-not-allowed opacity-70'
        )}
      />
      {finished && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-xl">
          ✓
        </span>
      )}
    </div>
  );
}
