import { ref, runTransaction, set, get, update } from 'firebase/database';
import { database } from './firebase';
import { getRandomSentence } from './sentences';
import { GameState } from '@/types/game';

const ROUND_DURATION_MS = 60_000; // 60 seconds

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
          currentSentence: getRandomSentence(),
          roundEndTime: Date.now() + ROUND_DURATION_MS,
          roundNumber: 1,
        } satisfies GameState;
      }

      if (currentData.roundNumber !== currentRoundNumber) {
        return; // abort — another client already advanced the round
      }

      return {
        currentSentence: getRandomSentence(currentSentence ?? currentData.currentSentence),
        roundEndTime: Date.now() + ROUND_DURATION_MS,
        roundNumber: currentRoundNumber + 1,
      } satisfies GameState;
    });
  } catch (error) {
    console.warn('maybeStartNewRound transaction failed:', error);
  }
}

/**
 * Hard-reset the game back to round 1 with a fresh sentence and timer.
 * Also clears progress (currentText, wpm, accuracy) for all active players.
 */
export async function resetGame(): Promise<void> {
  const newGame: GameState = {
    currentSentence: getRandomSentence(),
    roundEndTime: Date.now() + ROUND_DURATION_MS,
    roundNumber: 1,
  };

  await set(ref(database, 'game'), newGame);

  const playersSnap = await get(ref(database, 'players'));
  if (playersSnap.exists()) {
    const updates: Record<string, unknown> = {};
    Object.keys(playersSnap.val() as Record<string, unknown>).forEach((id) => {
      updates[`players/${id}/currentText`] = '';
      updates[`players/${id}/wpm`] = 0;
      updates[`players/${id}/accuracy`] = 1;
    });
    await update(ref(database), updates);
  }
}
