'use client';

import { Player } from '@/types/game';

const CAR_EMOJIS = ['🏎️', '🚗', '🚙', '🚕'];

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
        <span>FINISH</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm py-4">No racers yet…</p>
      ) : (
        sorted.map((player, i) => {
          const progress =
            sentence.length > 0
              ? Math.min(100, ((player.currentText?.length ?? 0) / sentence.length) * 100)
              : 0;
          const isMe = player.id === currentPlayerId;
          const car = isMe ? '🏎️' : CAR_EMOJIS[(i % (CAR_EMOJIS.length - 1)) + 1];

          return (
            <div key={player.id} className="relative h-9 flex items-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-700" />
              <div
                className="absolute flex items-center gap-1 transition-all duration-300"
                style={{ left: `calc(${progress}% - ${progress > 5 ? '2rem' : '0px'})` }}
              >
                <span className="text-xl leading-none">{car}</span>
                <span
                  className={[
                    'text-xs font-medium whitespace-nowrap',
                    isMe ? 'text-violet-300' : 'text-zinc-400',
                  ].join(' ')}
                >
                  {player.name}
                  {isMe && <span className="ml-1 text-violet-500">(you)</span>}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
