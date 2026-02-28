'use client';

import { useEffect, useState, useRef } from 'react';
import { formatDuration } from '@/lib/utils';
import { maybeStartNewRound } from '@/lib/roundManager';

interface RoundTimerProps {
  roundEndTime: number;
  roundNumber: number;
  currentSentence?: string;
}

export function RoundTimer({ roundEndTime, roundNumber, currentSentence }: RoundTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [roundNumber]);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.ceil((roundEndTime - Date.now()) / 1000);
      setSecondsLeft(Math.max(0, remaining));

      if (remaining <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        maybeStartNewRound(roundNumber, currentSentence);
      }
    };

    tick(); // run immediately
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [roundEndTime, roundNumber, currentSentence]);

  const isUrgent = secondsLeft <= 10 && secondsLeft > 0;
  const isDone = secondsLeft === 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-400">Next round in</span>
      <span
        className={[
          'tabular-nums font-mono text-2xl font-bold',
          isDone && 'text-zinc-400',
          isUrgent && 'text-red-400 animate-pulse',
          !isUrgent && !isDone && 'text-violet-300',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-live="polite"
        aria-label={`${secondsLeft} seconds remaining`}
      >
        {formatDuration(secondsLeft)}
      </span>

      {/* Progress bar */}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={[
            'h-full rounded-full transition-all duration-500',
            isUrgent ? 'bg-red-500' : 'bg-violet-500',
          ].join(' ')}
          style={{
            width: `${(secondsLeft / 60) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
