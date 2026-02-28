'use client';

import { getCharStatus } from '@/lib/gameLogic';

interface SentenceDisplayProps {
  sentence: string;
  typedText: string;
  finished: boolean;
}

export function SentenceDisplay({ sentence, typedText, finished }: SentenceDisplayProps) {
  const charStatuses = getCharStatus(typedText, sentence);
  const cursorPosition = typedText.length;

  return (
    <div
      className="relative rounded-lg border border-zinc-700 bg-zinc-900/60 p-6 font-mono text-xl leading-relaxed tracking-wide"
      aria-label="Sentence to type"
    >
      {sentence.split('').map((char, i) => {
        const status = charStatuses[i];
        const isCursor = i === cursorPosition && !finished;

        return (
          <span
            key={i}
            className={[
              'relative',
              status === 'correct' && 'text-green-400',
              status === 'incorrect' && 'text-red-400 bg-red-900/40',
              status === 'pending' && 'text-zinc-500',
              isCursor && 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-violet-400 after:animate-blink',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {char === ' ' && status === 'incorrect' ? '\u00B7' : char}
          </span>
        );
      })}

      {/* Cursor at the end when all chars typed but sentence not finished */}
      {cursorPosition === sentence.length && !finished && (
        <span className="animate-blink text-violet-400">|</span>
      )}

      {finished && (
        <span className="ml-3 text-base font-semibold text-green-400 animate-pulse">
          ✓ Finished!
        </span>
      )}
    </div>
  );
}
