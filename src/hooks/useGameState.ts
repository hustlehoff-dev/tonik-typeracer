'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database, isFirebaseConfigured } from '@/lib/firebase';
import { GameState } from '@/types/game';
import { initLobby } from '@/lib/roundManager';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setError(
        new Error(
          'Firebase is not configured. Copy .env.local.example to .env.local and fill in your credentials.'
        )
      );
      setLoading(false);
      return;
    }

    const gameRef = ref(database, 'game');

    const unsubscribe = onValue(
      gameRef,
      (snapshot) => {
        const data = snapshot.val() as GameState | null;
        if (data) {
          setGameState(data);
        } else {
          initLobby();
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { gameState, loading, error };
}
