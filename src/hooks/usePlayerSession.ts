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
const STORAGE_KEY_AVATAR = 'typeracer_player_avatar';
const DEFAULT_AVATAR = '🏎️';

function generatePlayerId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `player_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

async function writePlayerToRTDB(id: string, name: string, avatar: string) {
  if (!isFirebaseConfigured) return;
  const playerRef = ref(database, `players/${id}`);
  await set(playerRef, {
    name,
    avatar,
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
}

export function usePlayerSession() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerAvatar, setPlayerAvatar] = useState<string>(DEFAULT_AVATAR);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY_ID);
    if (!id) {
      id = generatePlayerId();
      localStorage.setItem(STORAGE_KEY_ID, id);
    }
    setPlayerId(id);

    const savedName = localStorage.getItem(STORAGE_KEY_NAME);
    const savedAvatar = localStorage.getItem(STORAGE_KEY_AVATAR) ?? DEFAULT_AVATAR;
    setPlayerAvatar(savedAvatar);

    if (savedName) {
      setPlayerName(savedName);
      writePlayerToRTDB(id, savedName, savedAvatar);
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
      if (!playerId) return;
      await writePlayerToRTDB(playerId, name, playerAvatar);
      localStorage.setItem(STORAGE_KEY_NAME, name);
      setPlayerName(name);
    },
    [playerId, playerAvatar]
  );

  const toggleReady = useCallback(
    async (currentReady: boolean) => {
      if (!playerId || !isFirebaseConfigured) return;
      await update(ref(database, `players/${playerId}`), { ready: !currentReady });
    },
    [playerId]
  );

  const selectAvatar = useCallback(
    async (avatar: string) => {
      setPlayerAvatar(avatar);
      localStorage.setItem(STORAGE_KEY_AVATAR, avatar);
      if (!playerId || !isFirebaseConfigured) return;
      await update(ref(database, `players/${playerId}`), { avatar });
    },
    [playerId]
  );

  return { playerId, playerName, playerAvatar, registerPlayer, toggleReady, selectAvatar };
}
