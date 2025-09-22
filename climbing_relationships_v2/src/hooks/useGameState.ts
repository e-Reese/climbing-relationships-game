import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, RhythmNote, GameConfig, GAME_CONFIG, GAME_KEYS, KEY_POSITIONS } from '@/types/game';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    players: [
      { id: 1, name: 'Player 1', score: 0, currentStreak: 0, bestStreak: 0, completedTurns: 0 },
      { id: 2, name: 'Player 2', score: 0, currentStreak: 0, bestStreak: 0, completedTurns: 0 }
    ],
    currentPlayer: 0,
    gamePhase: 'waiting',
    notes: [],
    gameStartTime: 0,
    turnStartTime: 0,
    currentTurn: 0,
    maxTurns: GAME_CONFIG.maxTurns,
    noteSpeed: GAME_CONFIG.noteSpeed,
    perfectWindow: GAME_CONFIG.perfectWindow,
    goodWindow: GAME_CONFIG.goodWindow,
  }));

  const generateNotes = useCallback((turnNumber: number, startTime: number): RhythmNote[] => {
    const notes: RhythmNote[] = [];
    const notesPerTurn = GAME_CONFIG.notesPerTurn;
    const noteInterval = 1000; // 1 second between notes
    const noteSpeed = GAME_CONFIG.noteSpeed;
    
    for (let i = 0; i < notesPerTurn; i++) {
      const note: RhythmNote = {
        id: `turn-${turnNumber}-note-${i}`,
        key: GAME_KEYS[Math.floor(Math.random() * GAME_KEYS.length)],
        position: Math.floor(Math.random() * KEY_POSITIONS.length),
        timestamp: startTime + (i * noteInterval) + noteSpeed, // Note should hit target at this time
        hit: false,
        perfect: false,
      };
      notes.push(note);
    }
    
    return notes;
  }, []);

  const startGame = useCallback(() => {
    const now = Date.now();
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing',
      gameStartTime: now,
      turnStartTime: now,
      currentTurn: 1,
      notes: generateNotes(1, now),
    }));
  }, [generateNotes]);

  const startTurn = useCallback((playerIndex: number) => {
    const now = Date.now();
    
    setGameState(prev => {
      // Check if game is already complete
      if (prev.gamePhase === 'gameComplete') {
        console.log('Cannot start new turn - game is already complete');
        return prev;
      }
      
      // Increment turn counter at the start of each turn
      const newTurn = prev.currentTurn + 1;
      console.log('Starting turn for player:', playerIndex, 'Turn number:', newTurn);
      
      // Check if this would be the 11th turn (game complete)
      const isGameComplete = newTurn > prev.maxTurns;
      
      if (isGameComplete) {
        console.log('🎯 GAME COMPLETE! Turn', newTurn, 'would exceed max turns', prev.maxTurns);
        return {
          ...prev,
          gamePhase: 'gameComplete',
        };
      }
      
      return {
        ...prev,
        currentPlayer: playerIndex,
        turnStartTime: now,
        gamePhase: 'playing',
        currentTurn: newTurn,
        notes: generateNotes(newTurn, now),
      };
    });
  }, [generateNotes]);

  const completeTurn = useCallback(() => {
    setGameState(prev => {
      console.log('Turn completed. Current turn:', prev.currentTurn, 'Max turns:', prev.maxTurns);
      
      return {
        ...prev,
        gamePhase: 'turnComplete',
        // Don't increment currentTurn here - let startTurn do it
      };
    });
  }, []);

  const hitNote = useCallback((key: string, timestamp: number) => {
    setGameState(prev => {
      const currentTime = Date.now();
      const activeNotes = prev.notes.filter(note => 
        !note.hit && 
        note.key === key && 
        Math.abs(currentTime - note.timestamp) <= prev.goodWindow
      );

      if (activeNotes.length === 0) {
        // Miss - reset streak
        return {
          ...prev,
          players: prev.players.map((player, index) => 
            index === prev.currentPlayer 
              ? { ...player, currentStreak: 0 }
              : player
          ),
        };
      }

      // Hit the closest note
      const closestNote = activeNotes.reduce((closest, note) => 
        Math.abs(currentTime - note.timestamp) < Math.abs(currentTime - closest.timestamp) 
          ? note 
          : closest
      );

      const timeDiff = Math.abs(currentTime - closestNote.timestamp);
      const isPerfect = timeDiff <= prev.perfectWindow;
      const score = isPerfect ? 100 : 50;
      const newStreak = prev.players[prev.currentPlayer].currentStreak + 1;

      const updatedNotes = prev.notes.map(note => 
        note.id === closestNote.id 
          ? { ...note, hit: true, perfect: isPerfect }
          : note
      );

      const updatedPlayers = prev.players.map((player, index) => 
        index === prev.currentPlayer 
          ? { 
              ...player, 
              score: player.score + score,
              currentStreak: newStreak,
              bestStreak: Math.max(player.bestStreak, newStreak)
            }
          : player
      );

      // Check if turn is complete
      const remainingNotes = updatedNotes.filter(note => !note.hit);
      const shouldCompleteTurn = remainingNotes.length === 0;

      return {
        ...prev,
        notes: updatedNotes,
        players: updatedPlayers,
        gamePhase: shouldCompleteTurn ? 'turnComplete' : 'playing',
      };
    });
  }, []);

  const missNote = useCallback((noteId: string) => {
    setGameState(prev => {
      const updatedNotes = prev.notes.map(note => 
        note.id === noteId && !note.hit
          ? { ...note, hit: true } // Mark as hit to remove from active notes
          : note
      );

      // Reset current player's streak on miss
      const updatedPlayers = prev.players.map((player, index) => 
        index === prev.currentPlayer 
          ? { ...player, currentStreak: 0 }
          : player
      );

      return {
        ...prev,
        notes: updatedNotes,
        players: updatedPlayers,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    console.log('🔄 RESET GAME CALLED - This will reset turn counter to 0');
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => ({
        ...player,
        score: 0,
        currentStreak: 0,
        bestStreak: 0,
        completedTurns: 0,
      })),
      currentPlayer: 0,
      gamePhase: 'waiting',
      notes: [],
      gameStartTime: 0,
      turnStartTime: 0,
      currentTurn: 0,
    }));
  }, []);

  return {
    gameState,
    startGame,
    startTurn,
    completeTurn,
    hitNote,
    missNote,
    resetGame,
  };
};
