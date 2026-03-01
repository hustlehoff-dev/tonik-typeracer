'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from '@/lib/firebase';
import { resetGame, maybeStartNewRound } from '@/lib/roundManager';
import { useGameState } from '@/hooks/useGameState';
import { usePlayers } from '@/hooks/usePlayers';
import { useTyping } from '@/hooks/useTyping';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { SentenceDisplay } from './SentenceDisplay';
import { TypingInput } from './TypingInput';
import { RoundTimer } from './RoundTimer';
import { PlayersTable } from './PlayersTable';
import { PlayerNameModal } from './PlayerNameModal';
import { LobbyRoom } from './LobbyRoom';
import { RaceArena } from './RaceArena';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatAccuracy } from '@/lib/utils';
import { PlayerStats } from '@/types/game';

function ConfigError() {
  return (
    <div className="rounded-lg border border-amber-700 bg-amber-950/40 p-6 text-center">
      <h2 className="mb-2 text-lg font-semibold text-amber-300">
        Firebase Not Configured
      </h2>
      <p className="text-sm text-amber-200/80">
        Copy <code className="font-mono bg-amber-900/40 px-1 rounded">.env.local.example</code>{' '}
        to <code className="font-mono bg-amber-900/40 px-1 rounded">.env.local</code> and fill in
        your Firebase credentials, then restart the dev server.
      </p>
    </div>
  );
}

async function persistPlayerStats(
  playerId: string,
  name: string,
  wpm: number,
  accuracy: number
) {
  if (!isFirebaseConfigured || !firestore) return;
  try {
    const statsRef = doc(firestore, 'playerStats', playerId);
    const snapshot = await getDoc(statsRef);
    if (!snapshot.exists()) {
      await setDoc(statsRef, {
        name,
        bestWpm: wpm,
        avgAccuracy: accuracy,
        totalGames: 1,
      } satisfies PlayerStats);
    } else {
      const existing = snapshot.data() as PlayerStats;
      await updateDoc(statsRef, {
        name,
        bestWpm: Math.max(existing.bestWpm, wpm),
        avgAccuracy:
          (existing.avgAccuracy * existing.totalGames + accuracy) /
          (existing.totalGames + 1),
        totalGames: existing.totalGames + 1,
      });
    }
  } catch (err) {
    console.warn('Failed to persist player stats:', err);
  }
}

export function GameArena() {
  const { playerId, playerName, playerAvatar, registerPlayer, toggleReady, selectAvatar } = usePlayerSession();
  const { gameState, loading: gameLoading, error: gameError } = useGameState();
  const { players, loading: playersLoading } = usePlayers();
  const [resetting, setResetting] = useState(false);

  const handleReset = useCallback(async () => {
    if (!confirm('Reset the game to round 1? This clears everyone\'s progress.')) return;
    setResetting(true);
    try {
      await resetGame();
    } finally {
      setResetting(false);
    }
  }, []);

  const allFinishedTriggeredRef = useRef(false);

  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') return;
    const sentence = gameState.currentSentence;
    if (!sentence || players.length === 0) return;

    const allDone = players.every((p) => p.currentText === sentence);
    if (allDone && !allFinishedTriggeredRef.current) {
      allFinishedTriggeredRef.current = true;
      setTimeout(() => maybeStartNewRound(gameState.roundNumber, sentence), 2500);
    }
  }, [players, gameState]);

  useEffect(() => {
    allFinishedTriggeredRef.current = false;
  }, [gameState?.roundNumber]);

  const { typedText, finished, wpm, accuracy, handleChange } = useTyping({
    playerId,
    targetText: gameState?.currentSentence ?? '',
    roundNumber: gameState?.roundNumber ?? 0,
  });

  useEffect(() => {
    if (finished) {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    }
  }, [finished]);

  const handleFinish = useCallback(async () => {
    if (!playerId || !playerName || !isFirebaseConfigured) return;
    await persistPlayerStats(playerId, playerName, wpm, accuracy);
  }, [playerId, playerName, wpm, accuracy]);

  if (gameError?.message.includes('not configured')) {
    return <ConfigError />;
  }

  if (gameLoading || playerId === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <>
      <PlayerNameModal open={!playerName} onSubmit={registerPlayer} />

      {gameState?.status === 'lobby' && (
        <LobbyRoom
          players={players}
          currentPlayerId={playerId}
          currentAvatar={playerAvatar}
          onToggleReady={toggleReady}
          onSelectAvatar={selectAvatar}
        />
      )}

      {gameState?.status === 'playing' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">Round {gameState.roundNumber}</Badge>
            <div className="flex-1 ml-4">
              <RoundTimer
                roundEndTime={gameState.roundEndTime}
                roundNumber={gameState.roundNumber}
                currentSentence={gameState.currentSentence}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? 'Resetting…' : 'Reset game'}
            </Button>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Arena
            </h2>
            <RaceArena
              players={players}
              sentence={gameState.currentSentence}
              currentPlayerId={playerId}
            />
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Competitors
            </h2>
            <PlayersTable
              players={players}
              loading={playersLoading}
              currentPlayerId={playerId}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <SentenceDisplay
              sentence={gameState.currentSentence}
              typedText={typedText}
              finished={finished}
            />
            <TypingInput
              value={typedText}
              onChange={handleChange}
              disabled={!playerName}
              finished={finished}
              hasError={
                typedText.length > 0 &&
                typedText[typedText.length - 1] !==
                  gameState.currentSentence[typedText.length - 1]
              }
            />
            {playerName && (
              <div className="flex gap-4 text-sm text-zinc-400">
                <span>
                  WPM:{' '}
                  <strong className="text-amber-300 font-mono">{wpm}</strong>
                </span>
                <span>
                  Accuracy:{' '}
                  <strong className="text-zinc-200 font-mono">
                    {formatAccuracy(accuracy)}
                  </strong>
                </span>
                {finished && (
                  <span
                    className="text-green-400 font-semibold"
                    ref={(el) => { if (el) handleFinish(); }}
                  >
                    Round complete — stats saved!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!gameState && !gameLoading && (
        <p className="text-center text-zinc-500">Initializing game…</p>
      )}
    </>
  );
}
