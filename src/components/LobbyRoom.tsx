'use client';

import { useState, useCallback } from 'react';
import { Player } from '@/types/game';
import { startGame } from '@/lib/roundManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LobbyRoomProps {
  players: Player[];
  currentPlayerId: string | null;
  onToggleReady: (currentReady: boolean) => Promise<void>;
}

export function LobbyRoom({ players, currentPlayerId, onToggleReady }: LobbyRoomProps) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const allReady = players.length > 0 && players.every((p) => p.ready);

  const handleStartGame = useCallback(async () => {
    setStarting(true);
    try {
      await startGame();
    } finally {
      setStarting(false);
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Waiting Room</h2>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? 'Copied!' : 'Copy invite link'}
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-700 divide-y divide-zinc-800">
        {players.length === 0 ? (
          <p className="px-4 py-6 text-center text-zinc-500 text-sm">
            No players yet — share the invite link to get started.
          </p>
        ) : (
          players.map((player) => (
            <div key={player.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-zinc-200">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="ml-2 text-xs text-violet-400">(you)</span>
                )}
              </span>
              <Badge
                variant={player.ready ? 'default' : 'secondary'}
                className={player.ready ? 'bg-green-700 text-green-100' : ''}
              >
                {player.ready ? 'Ready' : 'Not ready'}
              </Badge>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => onToggleReady(currentPlayer?.ready ?? false)}
          disabled={!currentPlayer}
          className={currentPlayer?.ready ? 'border-green-600 text-green-400 hover:text-green-300' : ''}
        >
          {currentPlayer?.ready ? 'Unready' : 'Ready up'}
        </Button>
        <Button onClick={handleStartGame} disabled={!allReady || starting}>
          {starting ? 'Starting…' : 'Start Game'}
        </Button>
        {players.length > 0 && !allReady && (
          <span className="text-sm text-zinc-500">
            Waiting for all players to ready up…
          </span>
        )}
      </div>
    </div>
  );
}
