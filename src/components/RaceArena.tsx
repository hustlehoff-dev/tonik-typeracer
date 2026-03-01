'use client';

import { Player } from '@/types/game';

interface RaceArenaProps {
  players: Player[];
  sentence: string;
  currentPlayerId?: string | null;
}

export function RaceArena({ players, sentence, currentPlayerId }: RaceArenaProps) {
  function correctPrefix(text: string) {
    let n = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === sentence[i]) n++;
      else break;
    }
    return n;
  }

  const sorted = [...players].sort(
    (a, b) => correctPrefix(b.currentText ?? '') - correctPrefix(a.currentText ?? '')
  );

  return (
    <div className="relative rounded-lg border border-zinc-700 bg-zinc-900/60 py-5">
      {/* Zone decorations — own overflow-hidden wrapper so they clip to rounded corners */}
      <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-zinc-700/40" />
        <div className="absolute left-10 top-0 bottom-0 w-1 bg-zinc-400" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 text-center text-[10px] font-bold text-zinc-300 tracking-widest rotate-[-90deg]">START</div>
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-amber-500/10" />
        <div className="absolute right-10 top-0 bottom-0 w-1 bg-amber-400" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 text-center text-lg rotate-90">🏁</div>
      </div>

      {/* Track — no overflow-hidden so nicks can render above container edge */}
      <div className="relative px-14">
        {sorted.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-4">No racers yet…</p>
        ) : (
          sorted.map((player) => {
            const typed = player.currentText ?? '';
            let prefix = 0;
            for (let i = 0; i < typed.length; i++) {
              if (typed[i] === sentence[i]) prefix++;
              else break;
            }
            const progress = sentence.length > 0 ? (prefix / sentence.length) * 100 : 0;
            const isMe = player.id === currentPlayerId;
            const avatar = player.avatar ?? '🏎️';

            return (
              <div key={player.id} className="relative h-20 flex items-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-700" />

                {/* Typed text anchored to left, grows right */}
                {typed.length > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-sm whitespace-nowrap pointer-events-none">
                    {typed.split('').map((char, i) => (
                      <span key={i} className={char === sentence[i] ? 'text-green-400' : 'text-red-400'}>
                        {char}
                      </span>
                    ))}
                  </div>
                )}

                {/* Car + nick */}
                <div
                  className="absolute flex flex-col items-center transition-all duration-300"
                  style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                >
                  <span
                    className={[
                      'relative z-20 mb-5 text-xs font-medium whitespace-nowrap px-1.5 py-0.5 rounded',
                      isMe
                        ? 'text-violet-200 bg-violet-900/70'
                        : 'text-zinc-200 bg-zinc-800/90',
                    ].join(' ')}
                  >
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
            );
          })
        )}
      </div>
    </div>
  );
}
