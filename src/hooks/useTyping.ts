'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ref, update } from 'firebase/database';
import { database, isFirebaseConfigured } from '@/lib/firebase';
import { calculateWpm, calculateAccuracy, isFinished } from '@/lib/gameLogic';

interface UseTypingOptions {
  playerId: string | null;
  targetText: string;
  roundNumber: number;
}

export function useTyping({ playerId, targetText, roundNumber }: UseTypingOptions) {
  const [typedText, setTypedText] = useState('');
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setTypedText('');
    setFinished(false);
    startTimeRef.current = null;
    if (playerId && isFirebaseConfigured) {
      update(ref(database, `players/${playerId}`), {
        currentText: '',
        wpm: 0,
        accuracy: 1,
      });
    }
  }, [roundNumber]);

  const pushToFirebase = useCallback(
    (text: string, wpm: number, accuracy: number) => {
      if (!playerId || !isFirebaseConfigured) return;
      const playerRef = ref(database, `players/${playerId}`);
      update(playerRef, {
        currentText: text,
        wpm,
        accuracy,
        lastSeen: Date.now(),
      });
    },
    [playerId]
  );

  const handleChange = useCallback(
    (value: string) => {
      if (finished) return;
      if (value.length > targetText.length) return;

      if (startTimeRef.current === null && value.length > 0) {
        startTimeRef.current = Date.now();
      }

      setTypedText(value);

      const elapsedSeconds =
        startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;
      const wpm = calculateWpm(value, targetText, elapsedSeconds);
      const accuracy = calculateAccuracy(value, targetText);

      pushToFirebase(value, wpm, accuracy);

      if (isFinished(value, targetText)) {
        setFinished(true);
      }
    },
    [finished, targetText, pushToFirebase]
  );

  const wpm =
    startTimeRef.current && typedText.length > 0
      ? calculateWpm(typedText, targetText, (Date.now() - startTimeRef.current) / 1000)
      : 0;

  const accuracy = calculateAccuracy(typedText, targetText);

  return { typedText, finished, wpm, accuracy, handleChange };
}
