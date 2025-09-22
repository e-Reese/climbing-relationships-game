'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGameEvents } from '@/hooks/useGameEvents';

interface KeyPress {
  key: string;
  timing: number;
}

interface Score {
  points: number;
  grade?: string;
  accuracy?: number[];
  correctKeys?: number;
}

interface ClimberPosition {
  x: number;
  y: number;
}

interface KeySequence {
  keys: string[];
  timing: number[];
}

interface GameContextType {
  gameId: string | null;
  playerNumber: number | null;
  isYourTurn: boolean;
  keySequence: KeySequence | null;
  lastScore: Score | null;
  totalScore: number;
  isGameStarted: boolean;
  isGameOver: boolean;
  isConnected: boolean;
  connectionError: string | null;
  keyPresses: number[];
  sequenceStartTime: number | null;
  isSequenceActive: boolean;
  climber1Position: ClimberPosition;
  climber2Position: ClimberPosition;
  turnCount: number;
  joinGame: (gameId: string) => Promise<boolean>;
  createGame: () => Promise<string | null>;
  recordKeyPress: (key: string) => void;
  startSequence: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Game state
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [isYourTurn, setIsYourTurn] = useState<boolean>(false);
  const [keySequence, setKeySequence] = useState<KeySequence | null>(null);
  const [lastScore, setLastScore] = useState<Score | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [keyPresses, setKeyPresses] = useState<number[]>([]);
  const [sequenceStartTime, setSequenceStartTime] = useState<number | null>(null);
  const [isSequenceActive, setIsSequenceActive] = useState<boolean>(false);
  const [climber1Position, setClimber1Position] = useState<ClimberPosition>({ x: 25, y: 90 });
  const [climber2Position, setClimber2Position] = useState<ClimberPosition>({ x: 75, y: 90 });
  const [turnCount, setTurnCount] = useState<number>(0);

  // Set up event handlers
  const handleConnected = (data: any) => {
    console.log('Connected to SSE:', data);
  };

  const handleGameStart = (data: any) => {
    console.log('Game started, received key sequence:', data.keySequence);
    setIsGameStarted(true);
    setKeySequence(data.keySequence);
    setIsYourTurn(data.playerId === data.currentPlayer);
    
    // Determine player number based on the players array
    const playerIndex = data.players.indexOf(data.playerId);
    setPlayerNumber(playerIndex + 1); // 1-based player number (1 or 2)
  };

  const handleTurnResult = (data: any) => {
    const { 
      player, 
      score, 
      totalScore, 
      nextPlayer, 
      keySequence, 
      climber1Pos, 
      climber2Pos, 
      turnCount: serverTurnCount, 
      moveCount, 
      isGameOver: gameOver 
    } = data;
    
    console.log('Turn result:', player, score, nextPlayer, `Move: ${moveCount}/10`);
    
    if (player === gameEvents.playerId) {
      setLastScore(score);
      setTotalScore(totalScore);
    }
    
    // Reset sequence state
    setIsSequenceActive(false);
    setSequenceStartTime(null);
    setKeyPresses([]);
    
    // Update turn and key sequence
    setIsYourTurn(gameEvents.playerId === nextPlayer);
    setKeySequence(keySequence);
    
    // Update move count
    if (moveCount !== undefined) {
      console.log(`%c UPDATING MOVE COUNT: ${moveCount}/10`, 
                'background: yellow; color: black; padding: 3px; font-weight: bold;');
      setTurnCount(moveCount);
    } else if (serverTurnCount !== undefined) {
      const estimatedMoveCount = serverTurnCount * 2;
      console.log(`%c ESTIMATING MOVE COUNT: ${estimatedMoveCount}/10 (from game turn: ${serverTurnCount}/5)`, 
                'background: orange; color: black; padding: 3px; font-weight: bold;');
      setTurnCount(estimatedMoveCount);
    }
    
    // Update climber positions
    if (climber1Pos) {
      const oldY = climber1Position.y;
      const newY = climber1Pos.y;
      const hasChanged = oldY !== newY;
      
      console.log('%c UPDATING CLIMBER 1 POSITION:', 'background: blue; color: white; padding: 3px;', {
        from: oldY,
        to: newY,
        changed: hasChanged,
        moveAmount: hasChanged ? Math.abs(oldY - newY) : 0
      });
      
      setClimber1Position(() => ({
        x: climber1Pos.x,
        y: newY
      }));
    }
    
    if (climber2Pos) {
      const oldY = climber2Position.y;
      const newY = climber2Pos.y;
      const hasChanged = oldY !== newY;
      
      console.log('%c UPDATING CLIMBER 2 POSITION:', 'background: purple; color: white; padding: 3px;', {
        from: oldY,
        to: newY,
        changed: hasChanged,
        moveAmount: hasChanged ? Math.abs(oldY - newY) : 0
      });
      
      setClimber2Position(() => ({
        x: climber2Pos.x,
        y: newY
      }));
    }
    
    // Check if game is over
    if (gameOver) {
      setIsGameOver(true);
    }
  };

  // Initialize game events
  const gameEvents = useGameEvents({
    onConnected: handleConnected,
    onGameStart: handleGameStart,
    onTurnResult: handleTurnResult,
    onError: (error) => console.error('Game event error:', error)
  });

  // Debug logging for state changes
  useEffect(() => {
    console.log("GameContext state updated:", {
      isYourTurn,
      isSequenceActive,
      sequenceStartTime,
      keySequence: keySequence ? keySequence.keys.length : 0
    });
  }, [isYourTurn, isSequenceActive, sequenceStartTime, keySequence]);

  // Check if sequence is complete
  useEffect(() => {
    if (isSequenceActive && keySequence && keyPresses.length === keySequence.keys.length && keySequence.keys.length > 0) {
      console.log('Sequence complete, sending to server');
      // Sequence is complete, send to server
      if (gameEvents.gameId) {
        gameEvents.completeSequence(keyPresses);
      }
    }
  }, [keyPresses, keySequence, isSequenceActive, gameEvents]);

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
    if (isSequenceActive && sequenceStartTime && keySequence && keyPresses.length < keySequence.keys.length) {
      const timing = Date.now() - sequenceStartTime;
      console.log('Recording key press:', key, 'at timing:', timing);
      setKeyPresses((prev) => [...prev, timing]);
    }
  };

  const contextValue: GameContextType = {
    gameId: gameEvents.gameId,
    playerNumber,
    isYourTurn,
    keySequence,
    lastScore,
    totalScore,
    isGameStarted,
    isGameOver,
    isConnected: gameEvents.isConnected,
    connectionError: gameEvents.connectionError,
    keyPresses,
    sequenceStartTime,
    isSequenceActive,
    climber1Position,
    climber2Position,
    turnCount,
    joinGame: gameEvents.joinGame,
    createGame: gameEvents.createGame,
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