// Game state manager
// In a production app, this would use Vercel KV, Redis, or a database
// For simplicity, we're using in-memory storage here

import { v4 as uuidv4 } from 'uuid';
import { sendEventToGame, sendEventToPlayer, games } from '../app/api/sse/route';

// Game state types
export interface ClimberPosition {
  x: number;
  y: number;
}

export interface KeySequence {
  keys: string[];
  timing: number[];
}

export interface Game {
  id: string;
  players: string[];
  currentPlayerIndex: number;
  keySequence: KeySequence;
  scores: number[];
  climber1Position: ClimberPosition;
  climber2Position: ClimberPosition;
  turnCount: number;
  moveCount: number;
  isGameOver: boolean;
}

// Helper functions
export function generateKeySequence(): KeySequence {
  const keys = [];
  const timing = [];
  const possibleKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  
  // Generate 5 random keys
  for (let i = 0; i < 5; i++) {
    const randomKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
    keys.push(randomKey);
    
    // Random timing between 500ms and 1500ms
    timing.push(500 + Math.floor(Math.random() * 1000));
  }
  
  return { keys, timing };
}

export function calculateScore(keySequence: KeySequence, keyPresses: number[]): { points: number; accuracy: number[] } {
  let totalPoints = 0;
  const accuracy: number[] = [];
  
  // Calculate score based on timing accuracy
  for (let i = 0; i < keyPresses.length && i < keySequence.timing.length; i++) {
    const expectedTiming = keySequence.timing[i];
    const actualTiming = keyPresses[i];
    const timingDiff = Math.abs(expectedTiming - actualTiming);
    
    // Calculate accuracy percentage (100% = perfect timing)
    const accuracyPct = Math.max(0, 100 - (timingDiff / expectedTiming) * 100);
    accuracy.push(accuracyPct);
    
    // Award points based on accuracy
    if (accuracyPct > 90) {
      totalPoints += 100; // Perfect
    } else if (accuracyPct > 70) {
      totalPoints += 75; // Great
    } else if (accuracyPct > 50) {
      totalPoints += 50; // Good
    } else {
      totalPoints += 25; // OK
    }
  }
  
  return { points: totalPoints, accuracy };
}

// Game actions
export function createGame(): string {
  const gameId = uuidv4().substring(0, 8);
  const keySequence = generateKeySequence();
  
  const newGame: Game = {
    id: gameId,
    players: [],
    currentPlayerIndex: 0,
    keySequence,
    scores: [0, 0],
    climber1Position: { x: 25, y: 90 }, // Start at bottom left of mountain (90% from top)
    climber2Position: { x: 75, y: 90 }, // Start at bottom right of mountain (90% from top)
    turnCount: 0, // Game turns (increments after both players have moved)
    moveCount: 0, // Total moves by both players (increments after each player's move)
    isGameOver: false
  };
  
  games.set(gameId, newGame);
  return gameId;
}

export function joinGame(gameId: string, playerId: string): boolean {
  const game = games.get(gameId);
  
  if (!game) {
    return false;
  }
  
  // If player is already in the game, just return true
  if (game.players.includes(playerId)) {
    return true;
  }
  
  // Only allow 2 players
  if (game.players.length >= 2) {
    return false;
  }
  
  // Add player to the game
  game.players.push(playerId);
  
  // If we now have 2 players, start the game
  if (game.players.length === 2) {
    // Notify all players that the game has started
    sendEventToGame(gameId, 'game-start', {
      players: game.players,
      currentPlayer: game.players[game.currentPlayerIndex],
      keySequence: game.keySequence
    });
  }
  
  return true;
}

export function completeSequence(gameId: string, playerId: string, keyPresses: number[]): boolean {
  const game = games.get(gameId);
  
  if (!game || game.isGameOver) {
    return false;
  }
  
  // Find player index
  const playerIndex = game.players.indexOf(playerId);
  
  if (playerIndex === -1) {
    return false;
  }
  
  // Check if it's this player's turn
  if (playerIndex === game.currentPlayerIndex) {
    // Calculate score based on timing accuracy
    const score = calculateScore(game.keySequence, keyPresses);
    
    // Store the score
    game.scores[playerIndex] += score.points;
    
    // Track individual moves for each player
    game.moveCount = (game.moveCount || 0) + 1;
    
    // Increment turn count - but only when player 2 completes their turn (a full game turn)
    if (playerIndex === 1) { // Player 2 (index 1) just completed their turn
      game.turnCount = (game.turnCount || 0) + 1;
      console.log(`Game turn ${game.turnCount}/5 completed - both players have moved. Total moves: ${game.moveCount}/10`);
    } else {
      console.log(`Player 1 completed their move. Total moves: ${game.moveCount}/10`);
    }
    
    // Move climber based on player number (0 = player 1, 1 = player 2)
    // Fixed movement of exactly 10% per turn for a total of 10 turns
    const moveAmount = 10; // Move exactly 10% each turn
    
    if (playerIndex === 0) {
      // Move player 1's climber
      const oldY = game.climber1Position.y;
      // Create a new object to ensure changes are detected
      game.climber1Position = {
        x: game.climber1Position.x,
        y: Math.max(0, oldY - moveAmount) // Allow reaching 0% (top of mountain)
      };
      console.log(`Moving climber 1 from y=${oldY} to y=${game.climber1Position.y}, moveAmount=${moveAmount}%`);
    } else {
      // Move player 2's climber
      const oldY = game.climber2Position.y;
      // Create a new object to ensure changes are detected
      game.climber2Position = {
        x: game.climber2Position.x,
        y: Math.max(0, oldY - moveAmount) // Allow reaching 0% (top of mountain)
      };
      console.log(`Moving climber 2 from y=${oldY} to y=${game.climber2Position.y}, moveAmount=${moveAmount}%`);
    }
    
    // Check if both climbers reached the top (0% is the top of the mountain) or if we've completed all 10 moves
    const bothReachedTop = game.climber1Position.y <= 0 && game.climber2Position.y <= 0;
    const completedAllMoves = game.moveCount >= 10; // 10 total moves (5 per player)
    
    game.isGameOver = bothReachedTop || completedAllMoves;
    
    if (completedAllMoves && !bothReachedTop) {
      console.log(`Game over: All ${game.moveCount} moves completed`);
    } else if (bothReachedTop) {
      console.log(`Game over: Both climbers reached the top after ${game.moveCount} moves`);
    }
    
    // Switch turns if game not over
    if (!game.isGameOver) {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % 2;
      // Generate new key sequence
      game.keySequence = generateKeySequence();
    }
    
    // Create result object with climber positions
    const resultData = {
      player: playerId,
      score: score,
      totalScore: game.scores[playerIndex],
      nextPlayer: game.isGameOver ? null : game.players[game.currentPlayerIndex],
      keySequence: game.keySequence,
      climber1Pos: game.climber1Position,
      climber2Pos: game.climber2Position,
      turnCount: game.turnCount,
      moveCount: game.moveCount,
      isGameOver: game.isGameOver
    };
    
    // Send turn result to all players in the game
    sendEventToGame(gameId, 'turn-result', resultData);
    
    return true;
  } else {
    console.log('Not player\'s turn:', playerId);
    return false;
  }
}
