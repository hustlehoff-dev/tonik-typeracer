import { ref, runTransaction, set, get, update } from 'firebase/database';
import { database } from './firebase';
import { getRandomSentence } from './sentences';
import { GameState } from '@/types/game';

const ROUND_DURATION_MS = 60_000;

/**
 * Attempts to start a new round using a Firebase transaction.
 * The transaction ensures only one client actually starts the round even when
 * multiple clients detect the round end simultaneously.
 */
export async function maybeStartNewRound(
  currentRoundNumber: number,
  currentSentence?: string
): Promise<void> {
  const gameRef = ref(database, 'game');

  try {
    await runTransaction(gameRef, (currentData: GameState | null) => {
      if (!currentData) {
        return {
          status: 'playing',
          currentSentence: getRandomSentence(),
          roundEndTime: Date.now() + ROUND_DURATION_MS,
          roundNumber: 1,
        } satisfies GameState;
      }

      if (currentData.roundNumber !== currentRoundNumber) {
        return; // abort — another client already advanced the round
      }

      return {
        status: 'playing',
        currentSentence: getRandomSentence(currentSentence ?? currentData.currentSentence),
        roundEndTime: Date.now() + ROUND_DURATION_MS,
        roundNumber: currentRoundNumber + 1,
      } satisfies GameState;
    });
  } catch (error) {
    console.warn('maybeStartNewRound transaction failed:', error);
  }
}

export async function initLobby(): Promise<void> {
  await set(ref(database, 'game'), {
    status: 'lobby',
    currentSentence: '',
    roundEndTime: 0,
    roundNumber: 0,
  } satisfies GameState);
}

export async function startGame(): Promise<void> {
  const sentence = getRandomSentence();

  await set(ref(database, 'game'), {
    status: 'playing',
    currentSentence: sentence,
    roundEndTime: Date.now() + ROUND_DURATION_MS,
    roundNumber: 1,
  } satisfies GameState);

  const playersSnap = await get(ref(database, 'players'));
  if (playersSnap.exists()) {
    const updates: Record<string, unknown> = {};
    Object.keys(playersSnap.val() as Record<string, unknown>).forEach((id) => {
      updates[`players/${id}/currentText`] = '';
      updates[`players/${id}/wpm`] = 0;
      updates[`players/${id}/accuracy`] = 1;
      updates[`players/${id}/ready`] = false;
    });
    await update(ref(database), updates);
  }
}

export async function resetGame(): Promise<void> {
  await set(ref(database, 'game'), {
    status: 'lobby',
    currentSentence: '',
    roundEndTime: 0,
    roundNumber: 0,
  } satisfies GameState);

  const playersSnap = await get(ref(database, 'players'));
  if (playersSnap.exists()) {
    const updates: Record<string, unknown> = {};
    Object.keys(playersSnap.val() as Record<string, unknown>).forEach((id) => {
      updates[`players/${id}/currentText`] = '';
      updates[`players/${id}/wpm`] = 0;
      updates[`players/${id}/accuracy`] = 1;
      updates[`players/${id}/ready`] = false;
    });
    await update(ref(database), updates);
  }
}
