'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ref,
  set,
  update,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database';
import { database, isFirebaseConfigured } from '@/lib/firebase';

const STORAGE_KEY_ID = 'typeracer_player_id';
const STORAGE_KEY_NAME = 'typeracer_player_name';

function generatePlayerId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `player_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function usePlayerSession() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY_ID);
    if (!id) {
      id = generatePlayerId();
      localStorage.setItem(STORAGE_KEY_ID, id);
    }
    setPlayerId(id);

    const savedName = localStorage.getItem(STORAGE_KEY_NAME);
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  useEffect(() => {
    if (!playerId || !playerName || !isFirebaseConfigured) return;

    const playerRef = ref(database, `players/${playerId}`);
    const interval = setInterval(() => {
      update(playerRef, { lastSeen: Date.now() });
    }, 30_000);

    return () => clearInterval(interval);
  }, [playerId, playerName]);

  const registerPlayer = useCallback(
    async (name: string) => {
      if (!playerId || !isFirebaseConfigured) return;

      const playerRef = ref(database, `players/${playerId}`);

      await set(playerRef, {
        name,
        currentText: '',
        wpm: 0,
        accuracy: 1,
        isActive: true,
        lastSeen: Date.now(),
      });

      onDisconnect(playerRef).update({
        isActive: false,
        lastSeen: serverTimestamp(),
      });

      localStorage.setItem(STORAGE_KEY_NAME, name);
      setPlayerName(name);
    },
    [playerId]
  );

  return { playerId, playerName, registerPlayer };
}
