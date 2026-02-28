export interface Player {
  id: string;
  name: string;
  currentText: string;
  wpm: number;
  accuracy: number;
  isActive: boolean;
  lastSeen: number;
}

export interface GameState {
  currentSentence: string;
  roundEndTime: number;
  roundNumber: number;
}

export interface PlayerStats {
  name: string;
  bestWpm: number;
  avgAccuracy: number;
  totalGames: number;
}

export type RawPlayer = Omit<Player, 'id'>;
