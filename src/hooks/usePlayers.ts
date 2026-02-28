'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database, isFirebaseConfigured } from '@/lib/firebase';
import { Player, RawPlayer } from '@/types/game';

const INACTIVE_THRESHOLD_MS = 90_000; // 90 seconds

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const playersRef = ref(database, 'players');

    const unsubscribe = onValue(
      playersRef,
      (snapshot) => {
        const data = snapshot.val() as Record<string, RawPlayer> | null;

        if (data) {
          const now = Date.now();
          const activePlayers: Player[] = Object.entries(data)
            .map(([id, playerData]) => ({ id, ...playerData }))
            .filter(
              (player) =>
                player.isActive && player.lastSeen > now - INACTIVE_THRESHOLD_MS
            );

          setPlayers(activePlayers);
        } else {
          setPlayers([]);
        }

        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { players, loading };
}
