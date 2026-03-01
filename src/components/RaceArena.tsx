'use client';

import { Player } from '@/types/game';

interface RaceArenaProps {
  players: Player[];
  sentence: string;
  currentPlayerId?: string | null;
}

export function RaceArena({ players, sentence, currentPlayerId }: RaceArenaProps) {
  const sorted = [...players].sort((a, b) => {
    const pa = sentence.length > 0 ? (a.currentText?.length ?? 0) / sentence.length : 0;
    const pb = sentence.length > 0 ? (b.currentText?.length ?? 0) / sentence.length : 0;
    return pb - pa;
  });

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-6 py-5 space-y-1">
      <div className="flex justify-between text-xs text-zinc-500 mb-3 px-1">
        <span>START</span>
        <span>FINISH 🏁</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm py-4">No racers yet…</p>
      ) : (
        sorted.map((player) => {
          const progress =
            sentence.length > 0
              ? Math.min(100, ((player.currentText?.length ?? 0) / sentence.length) * 100)
              : 0;
          const isMe = player.id === currentPlayerId;
          const avatar = player.avatar ?? '🏎️';

          return (
            <div key={player.id} className="relative h-12 flex items-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-700" />
              <div
                className="absolute transition-all duration-300"
                style={{ left: `${progress}%` }}
              >
                <div className="relative">
                  <span
                    className={[
                      'absolute right-full top-1/2 -translate-y-1/2 pr-1.5 text-xs font-medium whitespace-nowrap',
                      isMe ? 'text-violet-300' : 'text-zinc-400',
                    ].join(' ')}
                  >
                    {isMe && <span className="mr-1 text-violet-500">(you)</span>}
                    {player.name}
                  </span>
                  <span
                    className="text-4xl leading-none select-none"
                    style={{ display: 'inline-block', transform: 'scaleX(-1) translateY(-0.5em)' }}
                  >
                    {avatar}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
