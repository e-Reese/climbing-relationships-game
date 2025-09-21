'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '@/hooks/useSocket';

interface KeyPress {
  key: string;
  timing: number;
}

interface Score {
  points: number;
  grade: string;
  accuracy: number;
  correctKeys: number;
}

interface GameContextType {
  gameId: string | null;
  playerNumber: number | null;
  isYourTurn: boolean;
  keySequence: KeyPress[];
  lastScore: Score | null;
  totalScore: number;
  isGameStarted: boolean;
  isGameOver: boolean;
  socket: Socket | null;
  isConnected: boolean;
  keyPresses: KeyPress[];
  sequenceStartTime: number | null;
  isSequenceActive: boolean;
  joinGame: (gameId: string) => void;
  createGame: () => void;
  recordKeyPress: (key: string) => void;
  startSequence: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [isYourTurn, setIsYourTurn] = useState<boolean>(false);
  const [keySequence, setKeySequence] = useState<KeyPress[]>([]);
  const [lastScore, setLastScore] = useState<Score | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [keyPresses, setKeyPresses] = useState<KeyPress[]>([]);
  const [sequenceStartTime, setSequenceStartTime] = useState<number | null>(null);
  const [isSequenceActive, setIsSequenceActive] = useState<boolean>(false);

  // Debug logging for state changes
  useEffect(() => {
    console.log("GameContext state updated:", {
      isYourTurn,
      isSequenceActive,
      sequenceStartTime,
      keySequence: keySequence.length
    });
  }, [isYourTurn, isSequenceActive, sequenceStartTime, keySequence]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Game joined successfully
    socket.on('game-joined', ({ gameId, playerNumber, isYourTurn }) => {
      console.log('Game joined:', gameId, playerNumber, isYourTurn);
      setGameId(gameId);
      setPlayerNumber(playerNumber);
      setIsYourTurn(isYourTurn);
    });

    // Game created successfully
    socket.on('game-created', ({ gameId }) => {
      console.log('Game created:', gameId);
      setGameId(gameId);
    });

    // Game is full
    socket.on('game-full', () => {
      alert('Game is full. Please try another game ID.');
    });

    // Game starts
    socket.on('game-start', ({ keySequence, currentPlayer }) => {
      console.log('Game started, received key sequence:', keySequence);
      setIsGameStarted(true);
      setKeySequence(keySequence);
      setIsYourTurn(socket.id === currentPlayer);
    });

    // Turn result
    socket.on('turn-result', ({ player, score, totalScore, nextPlayer, keySequence }) => {
      console.log('Turn result:', player, score, nextPlayer);
      if (socket.id === player) {
        setLastScore(score);
        setTotalScore(totalScore);
      }
      
      // Reset sequence state
      setIsSequenceActive(false);
      setSequenceStartTime(null);
      setKeyPresses([]);
      
      // Update turn and key sequence
      setIsYourTurn(socket.id === nextPlayer);
      setKeySequence(keySequence);
    });

    // Player disconnected
    socket.on('player-disconnected', () => {
      setIsGameOver(true);
      alert('The other player has disconnected.');
    });

    return () => {
      socket.off('game-joined');
      socket.off('game-created');
      socket.off('game-full');
      socket.off('game-start');
      socket.off('turn-result');
      socket.off('player-disconnected');
    };
  }, [socket]);

  // Check if sequence is complete
  useEffect(() => {
    if (isSequenceActive && keyPresses.length === keySequence.length && keySequence.length > 0) {
      console.log('Sequence complete, sending to server');
      // Sequence is complete, send to server
      if (socket && gameId) {
        socket.emit('sequence-complete', { gameId, keyPresses });
      }
    }
  }, [keyPresses, keySequence, isSequenceActive, socket, gameId]);

  // Join an existing game
  const joinGame = (gameId: string) => {
    if (socket && isConnected) {
      socket.emit('join-game', gameId);
    }
  };

  // Create a new game
  const createGame = () => {
    if (socket && isConnected) {
      socket.emit('create-game');
    }
  };

  // Start the sequence - simplified for the Begin button
  const startSequence = () => {
    console.log('Starting sequence manually');
    if (isYourTurn && !isSequenceActive) {
      // Force state update in a single batch
      const now = Date.now();
      setKeyPresses([]);
      setSequenceStartTime(now);
      setIsSequenceActive(true);
      
      console.log('Sequence started at:', now);
    }
  };

  // Record a key press during the sequence
  const recordKeyPress = (key: string) => {
    if (isSequenceActive && sequenceStartTime && keyPresses.length < keySequence.length) {
      const timing = Date.now() - sequenceStartTime;
      console.log('Recording key press:', key, 'at timing:', timing);
      const newKeyPress: KeyPress = { key, timing };
      setKeyPresses((prev) => [...prev, newKeyPress]);
    }
  };

  const contextValue = {
    gameId,
    playerNumber,
    isYourTurn,
    keySequence,
    lastScore,
    totalScore,
    isGameStarted,
    isGameOver,
    socket,
    isConnected,
    keyPresses,
    sequenceStartTime,
    isSequenceActive,
    joinGame,
    createGame,
    recordKeyPress,
    startSequence,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};