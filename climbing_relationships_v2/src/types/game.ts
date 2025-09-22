export interface Player {
  id: number;
  name: string;
  score: number;
  currentStreak: number;
  bestStreak: number;
  completedTurns: number;
}

export interface RhythmNote {
  id: string;
  key: string;
  position: number; // 0-4 for the 5 key positions
  timestamp: number;
  hit: boolean;
  perfect: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  gamePhase: 'waiting' | 'playing' | 'turnComplete' | 'gameComplete';
  notes: RhythmNote[];
  gameStartTime: number;
  turnStartTime: number;
  currentTurn: number;
  maxTurns: number;
  noteSpeed: number;
  perfectWindow: number; // milliseconds
  goodWindow: number; // milliseconds
}

export interface GameConfig {
  maxTurns: number;
  notesPerTurn: number;
  noteSpeed: number;
  perfectWindow: number;
  goodWindow: number;
}

export const GAME_CONFIG: GameConfig = {
  maxTurns: 10, // Total turns for the game (5 per player)
  notesPerTurn: 5,
  noteSpeed: 2000, // 2 seconds for note to fall
  perfectWindow: 100, // 100ms for perfect hit
  goodWindow: 200, // 200ms for good hit
};

export const GAME_KEYS = ['A', 'S', 'D', 'F', 'G'];
export const KEY_POSITIONS = [0, 1, 2, 3, 4];
